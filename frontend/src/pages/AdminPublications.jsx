import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useReveal } from "@/lib/useReveal";
import { adminPublications } from "@/lib/api";

const EMPTY = { title: "", year: "", url: "", sort_order: 0 };

export default function AdminPublications() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const listRef = useReveal([items]);
  const [draft, setDraft] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading || !user) return;
    refresh();
    // eslint-disable-next-line
  }, [loading, user]);

  async function refresh() {
    setBusy(true);
    try { setItems(await adminPublications.list()); }
    catch (err) { toast.error("Couldn't load", { description: err?.message || "" }); }
    finally { setBusy(false); }
  }

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const save = async () => {
    if (!draft.title.trim()) { toast.error("Title required"); return; }
    try {
      if (editingId) { await adminPublications.update(editingId, draft); toast.success("Updated."); }
      else { await adminPublications.create(draft); toast.success("Added."); }
      setDraft(EMPTY); setEditingId(null); refresh();
    } catch (err) { toast.error("Couldn't save", { description: err?.message || "" }); }
  };

  const edit = (p) => { setEditingId(p.id); setDraft({ ...EMPTY, ...p }); window.scrollTo(0, 0); };
  const remove = async (id) => {
    if (!window.confirm("Delete this publication?")) return;
    try { await adminPublications.remove(id); toast.success("Deleted."); refresh(); }
    catch (err) { toast.error("Couldn't delete", { description: err?.message || "" }); }
  };

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-publications">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> CMS
          </Link>
          <p className="font-display text-sm tracking-tight">Publications</p>
          <span />
        </div>
      </header>

      <main className="container-page grid grid-cols-1 gap-8 py-12 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <h2 className="text-2xl">{editingId ? "Edit publication" : "New publication"}</h2>
          <div className="mt-6 space-y-4 rounded-[20px] border border-line bg-surface p-6">
            <Field label="Title">
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="publication-title" />
            </Field>
            <Field label="Year">
              <input value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="publication-year" />
            </Field>
            <Field label="URL (Google Scholar / paper)">
              <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="publication-url" />
            </Field>
            <Field label="Sort (lower shows first)">
              <input type="number" value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value || "0", 10) })}
                className="w-32 rounded-full border border-line bg-bg px-4 py-2 text-sm" />
            </Field>
            <div className="flex items-center gap-2 pt-2">
              <button onClick={save} className="btn-lime" data-testid="save-publication">
                {editingId ? <><Save className="h-4 w-4" /> Update</> : <><Plus className="h-4 w-4" /> Add</>}
              </button>
              {editingId && (<button onClick={() => { setEditingId(null); setDraft(EMPTY); }} className="btn-ghost">Cancel</button>)}
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl">Current</h2>
            {!busy && items.length > 0 && (
              <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                {items.length} publications
              </span>
            )}
          </div>
          {busy ? (
            <div className="mt-6 space-y-3">{[1,2,3].map(i => (<div key={i} className="h-16 animate-pulse rounded-[16px] border border-line bg-surface" />))}</div>
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-[20px] border border-dashed border-line bg-surface/50 px-8 py-16 text-center"><p className="text-muted">No publications yet.</p></div>
          ) : (
            <ul ref={listRef} className="mt-6 space-y-3" data-testid="publication-list">
              {items.map((p, i) => (
                <li
                  key={p.id}
                  data-reveal
                  style={{ "--reveal-delay": `${Math.min(i, 8) * 55}ms` }}
                  className="press flex items-center justify-between gap-4 rounded-[16px] border border-line bg-surface px-5 py-4"
                  data-testid={`publication-row-${p.id}`}
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">{p.year}</p>
                    <p className="font-display text-lg leading-snug">{p.title}</p>
                    {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-lime hover:underline">{p.url}</a>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => edit(p)} className="btn-ghost text-xs">Edit</button>
                    <button onClick={() => remove(p.id)} className="inline-flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-2 text-xs hover:border-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-muted">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
