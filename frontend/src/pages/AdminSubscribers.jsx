import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Check, Download, Mail, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useReveal } from "@/lib/useReveal";
import {
  adminCreateSubscriber,
  adminDeleteSubscriber,
  adminListSubscribers,
  adminUpdateSubscriber,
} from "@/lib/api";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return ""; }
}

const inputCls =
  "w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime";
const errDetail = (err) => err?.response?.data?.detail || err?.message || "";

export default function AdminSubscribers() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ email: "", name: "" });
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ email: "", name: "", status: "subscribed" });
  const [saving, setSaving] = useState(false);
  const listRef = useReveal([items]);

  useEffect(() => {
    if (loading || !user) return;
    adminListSubscribers()
      .then(setItems)
      .catch((err) => {
        toast.error("Couldn't load subscribers", { description: errDetail(err) });
        setItems([]);
      });
  }, [loading, user]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const addSubscriber = async () => {
    const email = draft.email.trim().toLowerCase();
    if (!email) { toast.error("An email is required."); return; }
    setSaving(true);
    try {
      const row = await adminCreateSubscriber({ email, name: draft.name.trim() || null });
      setItems((cur) => [row, ...(cur || [])]);
      setDraft({ email: "", name: "" });
      setAdding(false);
      toast.success("Added to the list.");
    } catch (err) {
      toast.error("Couldn't add", { description: errDetail(err) });
    } finally { setSaving(false); }
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditDraft({ email: s.email || "", name: s.name || "", status: s.status || "subscribed" });
  };

  const saveEdit = async (id) => {
    const email = editDraft.email.trim().toLowerCase();
    if (!email) { toast.error("An email is required."); return; }
    setSaving(true);
    try {
      const row = await adminUpdateSubscriber(id, {
        email,
        name: editDraft.name.trim(),
        status: editDraft.status,
      });
      setItems((cur) => cur.map((x) => (x.id === id ? row : x)));
      setEditingId(null);
      toast.success("Saved.");
    } catch (err) {
      toast.error("Couldn't save", { description: errDetail(err) });
    } finally { setSaving(false); }
  };

  const remove = async (s) => {
    if (!window.confirm(`Remove ${s.email} from the list? This can't be undone.`)) return;
    const snapshot = items;
    setItems((cur) => cur.filter((x) => x.id !== s.id));
    try {
      await adminDeleteSubscriber(s.id);
      toast.success("Removed.");
    } catch (err) {
      setItems(snapshot);
      toast.error("Couldn't remove", { description: errDetail(err) });
    }
  };

  const exportCsv = () => {
    const rows = [
      ["email", "name", "status", "source", "joined"],
      ...items.map((s) => [s.email, s.name, s.status, s.source, s.created_at]),
    ];
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
    toast.success("CSV exported.");
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
            <div className="flex items-baseline gap-3">
              <h1>Subscribers</h1>
              {items && items.length > 0 && (
                <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                  {items.length} subscriber{items.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <p className="mt-3 max-w-2xl text-muted">
              Every email on the list. Add someone by hand, fix a typo, or remove a
              wrong entry — sending happens in Emails and Automations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAdding((v) => !v); setEditingId(null); }}
              className="press inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm transition-colors hover:border-lime hover:text-lime"
              data-testid="subscribers-add-toggle"
            >
              <Plus className="h-4 w-4" /> Add subscriber
            </button>
            <button
              onClick={exportCsv}
              disabled={!items || items.length === 0}
              className="btn-lime disabled:opacity-50"
              data-testid="subscribers-export-csv"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        {adding && (
          <div className="mt-6 rounded-[20px] border border-lime/30 bg-surface p-6" data-testid="subscribers-add-form">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-lime/70">Add a subscriber</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input
                type="email"
                placeholder="email@example.com"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className={inputCls}
                data-testid="subscribers-add-email"
                autoFocus
              />
              <input
                placeholder="Name (optional)"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className={inputCls}
                data-testid="subscribers-add-name"
              />
              <div className="flex gap-2">
                <button onClick={addSubscriber} disabled={saving} className="btn-lime disabled:opacity-50" data-testid="subscribers-add-save">
                  <Plus className="h-4 w-4" /> Add
                </button>
                <button onClick={() => { setAdding(false); setDraft({ email: "", name: "" }); }} className="btn-ghost">
                  Cancel
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              Adding here does not send a welcome email — it just puts them on the list.
            </p>
          </div>
        )}

        {items === null ? (
          <div className="mt-10 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-[14px] border border-line bg-surface" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-[20px] border border-line bg-surface px-8 py-16 text-center" data-testid="subscribers-empty">
            <Mail className="mx-auto h-8 w-8 text-lime" />
            <p className="mt-4 text-muted">No subscribers yet — add one above, or they'll appear as the quizzes and newsletter capture emails.</p>
          </div>
        ) : (
          <div className="mt-10 overflow-hidden rounded-[20px] border border-line">
            <ul ref={listRef} data-testid="subscribers-list">
              {items.map((s, i) => (
                <li
                  key={s.id}
                  data-reveal
                  style={{ "--reveal-delay": `${Math.min(i, 8) * 55}ms` }}
                  className="border-b border-line/60 bg-bg px-6 py-4 last:border-b-0"
                  data-testid={`subscriber-row-${s.id}`}
                >
                  {editingId === s.id ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
                      <input
                        type="email"
                        value={editDraft.email}
                        onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })}
                        className={inputCls}
                        data-testid={`subscriber-edit-email-${s.id}`}
                      />
                      <input
                        placeholder="Name"
                        value={editDraft.name}
                        onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                        className={inputCls}
                      />
                      <select
                        value={editDraft.status}
                        onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value })}
                        className={inputCls}
                      >
                        <option value="subscribed">Subscribed</option>
                        <option value="unsubscribed">Unsubscribed</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(s.id)} disabled={saving} className="press inline-flex items-center gap-1 rounded-full bg-lime px-3 py-2 text-xs font-semibold text-bg disabled:opacity-50" data-testid={`subscriber-save-${s.id}`}>
                          <Check className="h-3.5 w-3.5" /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="press inline-flex items-center gap-1 rounded-full border border-line px-3 py-2 text-xs text-muted hover:text-ink" aria-label="Cancel">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="flex items-center gap-2.5 text-sm text-ink">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-lime" />
                          <span className="truncate">{s.email}</span>
                          {s.status === "unsubscribed" && (
                            <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted">
                              Unsubscribed
                            </span>
                          )}
                        </span>
                        {s.name && <p className="mt-1 pl-6 text-xs text-muted">{s.name}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="hidden text-xs text-muted sm:inline">{formatDate(s.created_at)}</span>
                        <button
                          onClick={() => startEdit(s)}
                          className="press rounded-full border border-line p-2 text-muted hover:border-lime hover:text-lime"
                          aria-label={`Edit ${s.email}`}
                          data-testid={`subscriber-edit-${s.id}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => remove(s)}
                          className="press rounded-full border border-line p-2 text-muted hover:border-red-500/50 hover:text-red-400"
                          aria-label={`Delete ${s.email}`}
                          data-testid={`subscriber-delete-${s.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
