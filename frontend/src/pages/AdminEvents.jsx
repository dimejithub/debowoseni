import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ImageIcon, Plus, Save, Trash2, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { adminEvents, adminUpload } from "@/lib/api";

const EMPTY = {
  title: "", slug: "", description: "", cover_url: "",
  gallery: [], location: "", location_type: "in_person",
  event_date: "", start_time: "", end_time: "",
  is_free: true, price: "", currency: "GBP",
  register_url: "", registration_open: false, capacity: "",
  status: "published", sort_order: 0,
};

export default function AdminEvents() {
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
    try { setItems(await adminEvents.list()); }
    catch (err) { toast.error("Couldn't load", { description: err?.message || "" }); }
    finally { setBusy(false); }
  }

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const save = async () => {
    if (!draft.title.trim()) { toast.error("Title required"); return; }
    const payload = {
      ...draft,
      event_date: draft.event_date || null,
      start_time: draft.start_time || null,
      end_time: draft.end_time || null,
      // On-site sign-ups and an external link are mutually exclusive, so only
      // one of them is ever persisted.
      register_url: draft.registration_open
        ? null
        : (draft.register_url || "").trim() || null,
      registration_open: Boolean(draft.registration_open),
      capacity:
        draft.registration_open && draft.capacity !== "" && draft.capacity != null
          ? Number(draft.capacity)
          : null,
      price: draft.is_free ? null : (draft.price === "" || draft.price == null ? null : Number(draft.price)),
      currency: draft.currency || "GBP",
    };
    try {
      if (editingId) { await adminEvents.update(editingId, payload); toast.success("Updated."); }
      else { await adminEvents.create(payload); toast.success("Added."); }
      setDraft(EMPTY); setEditingId(null); refresh();
    } catch (err) { toast.error("Couldn't save", { description: err?.message || "" }); }
  };

  const edit = (ev) => {
    setEditingId(ev.id);
    setDraft({
      ...EMPTY, ...ev,
      gallery: Array.isArray(ev.gallery) ? ev.gallery : [],
      event_date: ev.event_date ? ev.event_date.slice(0, 10) : "",
      location_type: ev.location_type || "in_person",
      is_free: ev.is_free ?? true,
      price: ev.price ?? "",
      currency: ev.currency || "GBP",
      start_time: ev.start_time || "",
      end_time: ev.end_time || "",
      registration_open: ev.registration_open ?? false,
      capacity: ev.capacity ?? "",
    });
    window.scrollTo(0, 0);
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try { await adminEvents.remove(id); toast.success("Deleted."); refresh(); }
    catch (err) { toast.error("Couldn't delete", { description: err?.message || "" }); }
  };

  const uploadCover = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const { url } = await adminUpload(file, "events/covers"); setDraft((d) => ({ ...d, cover_url: url })); toast.success("Cover uploaded."); }
    catch (err) { toast.error("Upload failed", { description: err?.message || "" }); }
    finally { e.target.value = ""; }
  };

  const addToGallery = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const urls = [];
      for (const f of files) {
        const { url } = await adminUpload(f, "events/gallery");
        urls.push(url);
      }
      setDraft((d) => ({ ...d, gallery: [...(d.gallery || []), ...urls] }));
      toast.success(`${urls.length} image${urls.length === 1 ? "" : "s"} added.`);
    } catch (err) { toast.error("Upload failed", { description: err?.message || "" }); }
    finally { e.target.value = ""; }
  };

  const removeFromGallery = (idx) => {
    setDraft((d) => ({ ...d, gallery: d.gallery.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-events">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> CMS
          </Link>
          <p className="font-display text-sm tracking-tight">Events</p>
          <span />
        </div>
      </header>

      <main className="container-page grid grid-cols-1 gap-8 py-12 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <h2 className="text-2xl">{editingId ? "Edit event" : "New event"}</h2>
          <div className="mt-6 space-y-4 rounded-[20px] border border-line bg-surface p-6">
            <Field label="Title">
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="event-title" />
            </Field>
            <Field label="Slug (optional)">
              <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime" />
            </Field>
            <Field label="Description">
              <textarea rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="w-full resize-y rounded-[14px] border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-lime" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input type="date" value={draft.event_date} onChange={(e) => setDraft({ ...draft, event_date: e.target.value })}
                  className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                  data-testid="event-date" />
              </Field>
              <Field label="Venue / address (or platform)">
                <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                  data-testid="event-location" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start time">
                <input type="time" value={draft.start_time} onChange={(e) => setDraft({ ...draft, start_time: e.target.value })}
                  className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                  data-testid="event-start-time" />
              </Field>
              <Field label="End time (optional)">
                <input type="time" value={draft.end_time} onChange={(e) => setDraft({ ...draft, end_time: e.target.value })}
                  className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                  data-testid="event-end-time" />
              </Field>
            </div>

            <Field label="Location type">
              <select value={draft.location_type} onChange={(e) => setDraft({ ...draft, location_type: e.target.value })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="event-location-type">
                <option value="in_person">In-person</option>
                <option value="online">Online</option>
              </select>
            </Field>

            <Field label="Admission">
              <select value={draft.is_free ? "free" : "paid"} onChange={(e) => setDraft({ ...draft, is_free: e.target.value === "free" })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="event-admission">
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </Field>

            {!draft.is_free && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price">
                  <input type="number" min="0" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                    data-testid="event-price" />
                </Field>
                <Field label="Currency">
                  <select value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
                    className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                    data-testid="event-currency">
                    <option value="GBP">GBP (£)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="NGN">NGN (₦)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="ZAR">ZAR (R)</option>
                    <option value="GHS">GHS (₵)</option>
                  </select>
                </Field>
              </div>
            )}

            <Field label="Registration">
              <select
                value={draft.registration_open ? "site" : "link"}
                onChange={(e) => setDraft({ ...draft, registration_open: e.target.value === "site" })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="event-registration-mode">
                <option value="site">Take sign-ups on this site</option>
                <option value="link">Send people to an external link</option>
              </select>
            </Field>

            {draft.registration_open ? (
              <Field label="Capacity (optional — extra sign-ups go to a waitlist)">
                <input type="number" min="1" step="1" value={draft.capacity}
                  onChange={(e) => setDraft({ ...draft, capacity: e.target.value })}
                  placeholder="e.g. 10"
                  className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                  data-testid="event-capacity" />
              </Field>
            ) : (
              <Field label="Registration link (any external URL)">
                <input value={draft.register_url} onChange={(e) => setDraft({ ...draft, register_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                  data-testid="event-register-url" />
              </Field>
            )}

            <Field label="Cover image">
              {draft.cover_url && (
                <div className="mb-2 overflow-hidden rounded-[14px] border border-line">
                  <img src={draft.cover_url} alt="" className="aspect-[16/10] w-full object-cover" />
                </div>
              )}
              <label className="btn-ghost cursor-pointer text-xs inline-flex">
                <ImageIcon className="h-3.5 w-3.5" /> Upload cover
                <input type="file" accept="image/*" className="hidden" onChange={uploadCover} data-testid="event-cover-upload" />
              </label>
            </Field>

            <Field label={`Gallery (${(draft.gallery || []).length})`}>
              <label className="btn-ghost cursor-pointer text-xs inline-flex">
                <Plus className="h-3.5 w-3.5" /> Add images
                <input type="file" accept="image/*" multiple className="hidden" onChange={addToGallery} data-testid="event-gallery-upload" />
              </label>
              {draft.gallery && draft.gallery.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {draft.gallery.map((src, i) => (
                    <div key={src + i} className="group relative overflow-hidden rounded-[10px] border border-line">
                      <img src={src} alt="" className="aspect-square w-full object-cover" />
                      <button onClick={() => removeFromGallery(i)} type="button"
                        className="absolute right-1 top-1 hidden h-7 w-7 items-center justify-center rounded-full bg-bg/80 text-destructive group-hover:flex"
                        aria-label="Remove">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Sort">
                <input type="number" value={draft.sort_order}
                  onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value || "0", 10) })}
                  className="w-full rounded-full border border-line bg-bg px-3 py-2 text-sm" />
              </Field>
              <Field label="Status">
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                  className="w-full rounded-full border border-line bg-bg px-3 py-2 text-sm">
                  <option value="published">Published</option><option value="draft">Draft</option>
                </select>
              </Field>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button onClick={save} className="btn-lime" data-testid="save-event">
                {editingId ? <><Save className="h-4 w-4" /> Update</> : <><Plus className="h-4 w-4" /> Add</>}
              </button>
              {editingId && (<button onClick={() => { setEditingId(null); setDraft(EMPTY); }} className="btn-ghost">Cancel</button>)}
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <h2 className="text-2xl">Current</h2>
          {busy ? (
            <div className="mt-6 space-y-3">{[1,2,3].map(i => (<div key={i} className="h-28 animate-pulse rounded-[20px] border border-line bg-surface" />))}</div>
          ) : items.length === 0 ? (
            <p className="mt-6 text-muted">None yet.</p>
          ) : (
            <ul className="mt-6 space-y-3" data-testid="event-list">
              {items.map((ev) => (
                <li key={ev.id} className="overflow-hidden rounded-[16px] border border-line bg-surface" data-testid={`event-row-${ev.id}`}>
                  {ev.cover_url && (<img src={ev.cover_url} alt="" className="aspect-[16/8] w-full object-cover" />)}
                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                        ev.status === "published" ? "bg-lime text-bg" : "border border-line text-muted"
                      }`}>{ev.status}</span>
                      {ev.location && (<span className="text-xs text-muted">· {ev.location}</span>)}
                    </div>
                    <p className="font-display text-xl tracking-tight">{ev.title}</p>
                    <p className="text-xs text-muted">{(ev.gallery || []).length} image{(ev.gallery || []).length === 1 ? "" : "s"}</p>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => edit(ev)} className="btn-ghost text-xs">Edit</button>
                      <button onClick={() => remove(ev.id)} className="inline-flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-2 text-xs hover:border-destructive hover:text-destructive">
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
