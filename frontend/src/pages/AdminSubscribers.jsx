import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Download, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { adminListSubscribers } from "@/lib/api";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
}

export default function AdminSubscribers() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (loading || !user) return;
    adminListSubscribers()
      .then(setItems)
      .catch((err) => {
        toast.error("Couldn't load subscribers", { description: err?.message || "" });
        setItems([]);
      });
  }, [loading, user]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const exportCsv = () => {
    const rows = [["email", "subscribed_at"], ...items.map((s) => [s.email, s.created_at])];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported.", { description: "Ready to import into Systeme.io." });
  };

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-subscribers">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> CMS
          </Link>
          <p className="font-display text-sm tracking-tight">Subscribers</p>
          <span />
        </div>
      </header>

      <main className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1>Subscribers</h1>
            <p className="mt-3 max-w-2xl text-muted">
              Emails captured by the Enquiry quizzes and the newsletter form. Export as
              CSV to import into Systeme.io.
            </p>
          </div>
          <button
            onClick={exportCsv}
            disabled={!items || items.length === 0}
            className="btn-lime disabled:opacity-50"
            data-testid="subscribers-export-csv"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {items === null ? (
          <div className="mt-10 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-[14px] border border-line bg-surface" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-[20px] border border-line bg-surface px-8 py-16 text-center" data-testid="subscribers-empty">
            <Mail className="mx-auto h-8 w-8 text-lime" />
            <p className="mt-4 text-muted">No subscribers yet — they'll appear here as the quizzes and newsletter capture emails.</p>
          </div>
        ) : (
          <div className="mt-10 overflow-hidden rounded-[20px] border border-line">
            <div className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {items.length} subscriber{items.length === 1 ? "" : "s"}
              </p>
            </div>
            <ul data-testid="subscribers-list">
              {items.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 bg-bg px-6 py-4 last:border-b-0"
                  data-testid={`subscriber-row-${s.id}`}
                >
                  <span className="flex items-center gap-3 text-sm text-ink">
                    <Mail className="h-3.5 w-3.5 text-lime" /> {s.email}
                  </span>
                  <span className="text-xs text-muted">{formatDate(s.created_at)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
