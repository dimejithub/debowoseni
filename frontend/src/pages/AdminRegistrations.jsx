import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Download, Trash2, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useReveal } from "@/lib/useReveal";
import {
  adminDeleteRegistration,
  adminListRegistrations,
  adminUpdateRegistration,
} from "@/lib/api";

const STATUSES = ["registered", "waitlisted", "attended", "no_show", "cancelled"];

const STATUS_STYLES = {
  registered: "border-lime/40 text-lime",
  waitlisted: "border-amber-400/40 text-amber-300",
  attended: "border-lime/60 text-lime",
  no_show: "border-line text-muted",
  cancelled: "border-line text-muted line-through",
};

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

export default function AdminRegistrations() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState(null);
  const listRef = useReveal([items]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (loading || !user) return;
    adminListRegistrations()
      .then(setItems)
      .catch((err) => {
        toast.error("Couldn't load registrations", { description: err?.message || "" });
        setItems([]);
      });
  }, [loading, user]);

  const events = useMemo(() => {
    if (!items) return [];
    const seen = new Map();
    for (const r of items) {
      if (r.event_id && !seen.has(r.event_id)) {
        seen.set(r.event_id, r.event_title || "Untitled event");
      }
    }
    return [...seen.entries()].map(([id, title]) => ({ id, title }));
  }, [items]);

  const visible = useMemo(
    () => (items || []).filter((r) => filter === "all" || r.event_id === filter),
    [items, filter]
  );

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const setStatus = async (reg, status) => {
    const previous = reg.status;
    setItems((cur) => cur.map((r) => (r.id === reg.id ? { ...r, status } : r)));
    try {
      await adminUpdateRegistration(reg.id, { status });
    } catch (err) {
      setItems((cur) => cur.map((r) => (r.id === reg.id ? { ...r, status: previous } : r)));
      toast.error("Couldn't update", { description: err?.message || "" });
    }
  };

  const remove = async (reg) => {
    if (!window.confirm(`Remove ${reg.name}'s registration? This cannot be undone.`)) return;
    const snapshot = items;
    setItems((cur) => cur.filter((r) => r.id !== reg.id));
    try {
      await adminDeleteRegistration(reg.id);
      toast.success("Registration removed.");
    } catch (err) {
      setItems(snapshot);
      toast.error("Couldn't remove", { description: err?.message || "" });
    }
  };

  const exportCsv = () => {
    const rows = [
      ["event", "name", "email", "phone", "status", "notes", "registered_at"],
      ...visible.map((r) => [
        r.event_title,
        r.name,
        r.email,
        r.phone,
        r.status,
        r.notes,
        r.created_at,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported.");
  };

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-registrations">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> CMS
          </Link>
          <p className="font-display text-sm tracking-tight">Registrations</p>
          <span />
        </div>
      </header>

      <main className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h1>Registrations</h1>
              {items && visible.length > 0 && (
                <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                  {visible.length} registration{visible.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <p className="mt-3 max-w-2xl text-muted">
              Everyone who has signed up for an event on the site. Mark people attended
              after the event — that record is what makes the follow-up email worth sending.
            </p>
          </div>
          <button
            onClick={exportCsv}
            disabled={!visible.length}
            className="btn-lime disabled:opacity-50"
            data-testid="registrations-export-csv"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {events.length > 1 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full border px-4 py-2 text-xs ${
                filter === "all" ? "border-lime text-lime" : "border-line text-muted hover:text-ink"
              }`}
            >
              All events
            </button>
            {events.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setFilter(ev.id)}
                className={`rounded-full border px-4 py-2 text-xs ${
                  filter === ev.id ? "border-lime text-lime" : "border-line text-muted hover:text-ink"
                }`}
              >
                {ev.title}
              </button>
            ))}
          </div>
        )}

        {items === null ? (
          <div className="mt-10 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-[14px] border border-line bg-surface" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div
            className="mt-10 rounded-[20px] border border-line bg-surface px-8 py-16 text-center"
            data-testid="registrations-empty"
          >
            <Users className="mx-auto h-8 w-8 text-lime" />
            <p className="mt-4 text-muted">
              No registrations yet. Turn on "Accept registrations" for an event and sign-ups
              will land here.
            </p>
          </div>
        ) : (
          <div className="mt-10 overflow-hidden rounded-[20px] border border-line">
            <div className="border-b border-line bg-surface px-6 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {visible.length} registration{visible.length === 1 ? "" : "s"}
              </p>
            </div>
            <ul ref={listRef} data-testid="registrations-list">
              {visible.map((r, i) => (
                <li
                  key={r.id}
                  data-reveal
                  style={{ "--reveal-delay": `${Math.min(i, 8) * 55}ms` }}
                  className="press flex flex-wrap items-center justify-between gap-4 border-b border-line/60 bg-bg px-6 py-4 last:border-b-0"
                  data-testid={`registration-row-${r.id}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink">
                      {r.name} <span className="text-muted">· {r.email}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {r.event_title}
                      {r.phone ? ` · ${r.phone}` : ""} · {formatDate(r.created_at)}
                    </p>
                    {r.notes && <p className="mt-2 max-w-xl text-xs text-muted">“{r.notes}”</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={r.status}
                      onChange={(e) => setStatus(r, e.target.value)}
                      className={`rounded-full border bg-surface px-3 py-1.5 text-xs outline-none ${
                        STATUS_STYLES[r.status] || "border-line text-muted"
                      }`}
                      data-testid={`registration-status-${r.id}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-surface text-ink">
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => remove(r)}
                      className="rounded-full border border-line p-2 text-muted hover:border-red-500/50 hover:text-red-400"
                      aria-label={`Remove ${r.name}`}
                      data-testid={`registration-delete-${r.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
