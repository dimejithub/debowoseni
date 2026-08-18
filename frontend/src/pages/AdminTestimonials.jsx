import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useReveal } from "@/lib/useReveal";
import { adminTestimonials } from "@/lib/api";

const EMPTY = { quote: "", attribution: "", role: "", avatar_url: "", status: "published", sort_order: 0 };

export default function AdminTestimonials() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const listRef = useReveal([items]);
  const [draft, setDraft] = useState(EMPTY);
  const [busy, setBusy] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (loading || !user) return;
    refresh();
    // eslint-disable-next-line
  }, [loading, user]);

  async function refresh() {
    setBusy(true);
    try { setItems(await adminTestimonials.list()); }
    catch (err) { toast.error("Couldn't load", { description: err?.message || "" }); }
    finally { setBusy(false); }
  }

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const save = async () => {
    if (!draft.quote.trim() || !draft.attribution.trim()) {
      toast.error("Quote and attribution required"); return;
    }
    try {
      if (editingId) {
        await adminTestimonials.update(editingId, draft);
        toast.success("Updated.");
      } else {
        await adminTestimonials.create(draft);
        toast.success("Added.");
      }
      setDraft(EMPTY); setEditingId(null); refresh();
    } catch (err) { toast.error("Couldn't save", { description: err?.message || "" }); }
  };

  const edit = (t) => { setEditingId(t.id); setDraft({ ...EMPTY, ...t }); window.scrollTo(0, 0); };
  const remove = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try { await adminTestimonials.remove(id); toast.success("Deleted."); refresh(); }
    catch (err) { toast.error("Couldn't delete", { description: err?.message || "" }); }
  };

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-testimonials">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> CMS
          </Link>
          <p className="font-display text-sm tracking-tight">Testimonials</p>
          <span />
        </div>
      </header>

      <main className="container-page grid grid-cols-1 gap-8 py-12 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <h2 className="text-2xl">{editingId ? "Edit testimonial" : "New testimonial"}</h2>
          <div className="mt-6 space-y-4 rounded-[20px] border border-line bg-surface p-6">
            <Field label="Quote">
              <textarea
                rows={5}
                value={draft.quote}
                onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
                className="w-full resize-y rounded-[14px] border border-line bg-bg px-4 py-3 text-ink focus:border-lime focus:outline-none"
                data-testid="testimonial-quote"
              />
            </Field>
            <Field label="Attribution (name)">
              <input value={draft.attribution} onChange={(e) => setDraft({ ...draft, attribution: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="testimonial-attribution" />
            </Field>
            <Field label="Role / location (optional)">
              <input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="testimonial-role" />
            </Field>
            <Field label="Avatar URL (optional)">
              <input value={draft.avatar_url} onChange={(e) => setDraft({ ...draft, avatar_url: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime" />
            </Field>
            <Field label="Sort order (lower shows first)">
              <input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value || "0", 10) })}
                className="w-32 rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime" />
            </Field>
            <Field label="Status">
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                className="rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
            <div className="flex items-center gap-2 pt-2">
              <button onClick={save} className="btn-lime" data-testid="save-testimonial">
                {editingId ? <><Save className="h-4 w-4" /> Update</> : <><Plus className="h-4 w-4" /> Add</>}
              </button>
              {editingId && (
                <button onClick={() => { setEditingId(null); setDraft(EMPTY); }} className="btn-ghost">Cancel</button>
              )}
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl">Current</h2>
            {!busy && items.length > 0 && (
              <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                {items.length} testimonial{items.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {busy ? (
            <div className="mt-6 space-y-3">{[1,2,3].map(i => (<div key={i} className="h-28 animate-pulse rounded-[20px] border border-line bg-surface" />))}</div>
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-[20px] border border-dashed border-line bg-surface/50 px-8 py-16 text-center"><p className="text-muted">No testimonials yet.</p></div>
          ) : (
            <ul ref={listRef} className="mt-6 space-y-3" data-testid="testimonial-list">
              {items.map((t, i) => (
                <li key={t.id} data-reveal style={{ "--reveal-delay": `${Math.min(i, 8) * 55}ms` }} className="press rounded-[16px] border border-line bg-surface p-5" data-testid={`testimonial-row-${t.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-lg leading-snug">&ldquo;{t.quote}&rdquo;</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      t.status === "published" ? "bg-lime text-bg" : "border border-line text-muted"
                    }`}>{t.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">— {t.attribution}{t.role ? ` · ${t.role}` : ""}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => edit(t)} className="btn-ghost text-xs">Edit</button>
                    <button onClick={() => remove(t.id)} className="inline-flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-2 text-xs hover:border-destructive hover:text-destructive">
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
