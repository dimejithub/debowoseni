import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Mail, Plus, Send, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { adminCampaigns } from "@/lib/api";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const STATUS_STYLES = {
  draft: "border-line text-muted",
  sending: "border-amber-400/40 text-amber-300",
  sent: "border-lime/50 text-lime",
  failed: "border-red-500/40 text-red-400",
};

export default function AdminCampaigns() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (loading || !user) return;
    adminCampaigns
      .list()
      .then(setItems)
      .catch((err) => {
        toast.error("Couldn't load campaigns", { description: err?.message || "" });
        setItems([]);
      });
  }, [loading, user]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.subject}"?`)) return;
    const snapshot = items;
    setItems((cur) => cur.filter((x) => x.id !== c.id));
    try {
      await adminCampaigns.remove(c.id);
      toast.success("Campaign deleted.");
    } catch (err) {
      setItems(snapshot);
      toast.error("Couldn't delete", { description: err?.message || "" });
    }
  };

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-campaigns">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> CMS
          </Link>
          <p className="font-display text-sm tracking-tight">Emails</p>
          <span />
        </div>
      </header>

      <main className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1>Emails</h1>
            <p className="mt-3 max-w-2xl text-muted">
              Write a broadcast, send yourself a test, then send it to a segment of the
              list. Every email carries a working unsubscribe link automatically.
            </p>
          </div>
          <Link to="/admin/emails/new" className="btn-lime" data-testid="campaign-new">
            <Plus className="h-4 w-4" /> New email
          </Link>
        </div>

        {items === null ? (
          <div className="mt-10 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-[14px] border border-line bg-surface" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div
            className="mt-10 rounded-[20px] border border-line bg-surface px-8 py-16 text-center"
            data-testid="campaigns-empty"
          >
            <Mail className="mx-auto h-8 w-8 text-lime" />
            <p className="mt-4 text-muted">No emails yet. Write the first one.</p>
          </div>
        ) : (
          <div className="mt-10 space-y-3" data-testid="campaigns-list">
            {items.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-line bg-surface px-6 py-5"
                data-testid={`campaign-row-${c.id}`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={`/admin/emails/${c.id}`}
                      className="text-lg text-ink hover:text-lime"
                    >
                      {c.subject}
                    </Link>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider ${
                        STATUS_STYLES[c.status] || "border-line text-muted"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Segment: {c.segment}
                    {c.status === "sent" && (
                      <>
                        {" "}
                        · <Send className="inline h-3 w-3" /> {c.sent_count} sent
                        {c.failed_count > 0 && ` · ${c.failed_count} failed`} ·{" "}
                        {formatDate(c.sent_at)}
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => remove(c)}
                  className="rounded-full border border-line p-2 text-muted hover:border-red-500/50 hover:text-red-400"
                  aria-label={`Delete ${c.subject}`}
                  data-testid={`campaign-delete-${c.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
