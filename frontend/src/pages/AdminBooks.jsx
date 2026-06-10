import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ImageIcon, Plus, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { adminBooks, adminUpload } from "@/lib/api";

const EMPTY = {
  title: "", slug: "", one_liner: "", description: "",
  cover_url: "", buy_url: "", is_featured: false, status: "published", sort_order: 0,
};

export default function AdminBooks() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
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
    try { setItems(await adminBooks.list()); }
    catch (err) { toast.error("Couldn't load", { description: err?.message || "" }); }
    finally { setBusy(false); }
  }

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const save = async () => {
    if (!draft.title.trim()) { toast.error("Title required"); return; }
    try {
      if (editingId) { await adminBooks.update(editingId, draft); toast.success("Updated."); }
      else { await adminBooks.create(draft); toast.success("Added."); }
      setDraft(EMPTY); setEditingId(null); refresh();
    } catch (err) { toast.error("Couldn't save", { description: err?.message || "" }); }
  };

  const edit = (b) => { setEditingId(b.id); setDraft({ ...EMPTY, ...b }); window.scrollTo(0, 0); };
  const remove = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try { await adminBooks.remove(id); toast.success("Deleted."); refresh(); }
    catch (err) { toast.error("Couldn't delete", { description: err?.message || "" }); }
  };

  const uploadCover = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const { url } = await adminUpload(file, "books");
      setDraft((d) => ({ ...d, cover_url: url }));
      toast.success("Cover uploaded.");
    } catch (err) { toast.error("Upload failed", { description: err?.message || "" }); }
    finally { e.target.value = ""; }
  };

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-books">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> CMS
          </Link>
          <p className="font-display text-sm tracking-tight">Books</p>
          <span />
        </div>
      </header>

      <main className="container-page grid grid-cols-1 gap-8 py-12 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <h2 className="text-2xl">{editingId ? "Edit book" : "New book"}</h2>
          <div className="mt-6 space-y-4 rounded-[20px] border border-line bg-surface p-6">
            <Field label="Title">
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="book-title" />
            </Field>
            <Field label="Slug (optional, auto from title)">
              <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime" />
            </Field>
            <Field label="One-liner">
              <input value={draft.one_liner} onChange={(e) => setDraft({ ...draft, one_liner: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="book-oneliner" />
            </Field>
            <Field label="Description">
              <textarea rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="w-full resize-y rounded-[14px] border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-lime" />
            </Field>
            <Field label="Buy URL (Amazon / KDP)">
              <input value={draft.buy_url} onChange={(e) => setDraft({ ...draft, buy_url: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="book-buyurl" />
            </Field>
            <Field label="Cover image">
              {draft.cover_url && (
                <div className="mb-2 overflow-hidden rounded-[14px] border border-line">
                  <img src={draft.cover_url} alt="" className="aspect-[4/5] w-full max-w-[160px] object-cover" />
                </div>
              )}
              <label className="btn-ghost cursor-pointer text-xs inline-flex">
                <ImageIcon className="h-3.5 w-3.5" /> Upload cover
                <input type="file" accept="image/*" className="hidden" onChange={uploadCover} data-testid="book-cover-upload" />
              </label>
              {draft.cover_url && (
                <button onClick={() => setDraft({ ...draft, cover_url: "" })} className="ml-2 text-xs text-muted hover:text-destructive">Remove</button>
              )}
            </Field>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!draft.is_featured}
                  onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })}
                  data-testid="book-featured" />
                Featured (shown large on home + books page)
              </label>
            </div>
            <div className="flex items-center gap-3">
              <Field label="Sort">
                <input type="number" value={draft.sort_order}
                  onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value || "0", 10) })}
                  className="w-24 rounded-full border border-line bg-bg px-3 py-2 text-sm" />
              </Field>
              <Field label="Status">
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                  className="rounded-full border border-line bg-bg px-3 py-2 text-sm">
                  <option value="published">Published</option><option value="draft">Draft</option>
                </select>
              </Field>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button onClick={save} className="btn-lime" data-testid="save-book">
                {editingId ? <><Save className="h-4 w-4" /> Update</> : <><Plus className="h-4 w-4" /> Add</>}
              </button>
              {editingId && (<button onClick={() => { setEditingId(null); setDraft(EMPTY); }} className="btn-ghost">Cancel</button>)}
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <h2 className="text-2xl">Current</h2>
          {busy ? (
            <div className="mt-6 grid grid-cols-2 gap-3">{[1,2,3,4].map(i => (<div key={i} className="h-40 animate-pulse rounded-[20px] border border-line bg-surface" />))}</div>
          ) : items.length === 0 ? (
            <p className="mt-6 text-muted">None yet.</p>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="book-list">
              {items.map((b) => (
                <li key={b.id} className="overflow-hidden rounded-[16px] border border-line bg-surface" data-testid={`book-row-${b.id}`}>
                  {b.cover_url && (<img src={b.cover_url} alt="" className="aspect-[16/10] w-full object-cover" />)}
                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                        b.status === "published" ? "bg-lime text-bg" : "border border-line text-muted"
                      }`}>{b.status}</span>
                      {b.is_featured && (<span className="rounded-full bg-lime/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-lime">Featured</span>)}
                    </div>
                    <p className="font-display text-xl tracking-tight">{b.title}</p>
                    <p className="text-xs text-muted">{b.one_liner}</p>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => edit(b)} className="btn-ghost text-xs">Edit</button>
                      <button onClick={() => remove(b.id)} className="inline-flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-2 text-xs hover:border-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
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
