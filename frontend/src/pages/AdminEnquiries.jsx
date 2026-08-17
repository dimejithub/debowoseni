import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Download, Inbox, Mail, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { adminDeleteEnquiry, adminListEnquiries } from "@/lib/api";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function AdminEnquiries() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (loading || !user) return;
    adminListEnquiries()
      .then(setItems)
      .catch((err) => {
        toast.error("Couldn't load enquiries", { description: err?.message || "" });
        setItems([]);
      });
  }, [loading, user]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const remove = async (e) => {
    if (!window.confirm(`Delete the message from ${e.name}?`)) return;
    const snapshot = items;
    setItems((cur) => cur.filter((x) => x.id !== e.id));
    try {
      await adminDeleteEnquiry(e.id);
      toast.success("Deleted.");
    } catch (err) {
      setItems(snapshot);
      toast.error("Couldn't delete", { description: err?.message || "" });
    }
  };

  const exportCsv = () => {
    const rows = [
      ["name", "email", "message", "received"],
      ...items.map((e) => [e.name, e.email, e.message, e.created_at]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported.");
  };

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-enquiries">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> CMS
          </Link>
          <p className="font-display text-sm tracking-tight">Enquiries</p>
          <span />
        </div>
      </header>

      <main className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1>Enquiries</h1>
            <p className="mt-3 max-w-2xl text-muted">
              Messages sent through the contact form. Reply from your own inbox — each one
              shows the sender's email.
            </p>
          </div>
          <button
            onClick={exportCsv}
            disabled={!items || items.length === 0}
            className="btn-lime disabled:opacity-50"
            data-testid="enquiries-export-csv"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {items === null ? (
          <div className="mt-10 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-[16px] border border-line bg-surface" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-[20px] border border-line bg-surface px-8 py-16 text-center" data-testid="enquiries-empty">
            <Inbox className="mx-auto h-8 w-8 text-lime" />
            <p className="mt-4 text-muted">No enquiries yet. Contact-form messages will appear here.</p>
          </div>
        ) : (
          <div className="mt-10 space-y-4" data-testid="enquiries-list">
            {items.map((e) => (
              <div
                key={e.id}
                className="rounded-[16px] border border-line bg-surface p-6"
                data-testid={`enquiry-${e.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-ink">{e.name}</p>
                    <a
                      href={`mailto:${e.email}?subject=Re: your message to debowoseni.com`}
                      className="inline-flex items-center gap-1.5 text-sm text-lime hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5" /> {e.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{formatDate(e.created_at)}</span>
                    <button
                      onClick={() => remove(e)}
                      className="rounded-full border border-line p-2 text-muted hover:border-red-500/50 hover:text-red-400"
                      aria-label={`Delete message from ${e.name}`}
                      data-testid={`enquiry-delete-${e.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap border-t border-line/60 pt-4 text-sm text-ink/85">
                  {e.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
