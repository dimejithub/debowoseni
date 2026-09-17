import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, BellRing, ChevronDown, Copy, ImageIcon, Plus, Save, Send, Trash2, Users, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useReveal } from "@/lib/useReveal";
import { GroupHeading } from "@/components/admin/GroupHeading";
import { adminEvents, adminUpload, adminSendEventLink, adminEventReminderStatus, adminSendTestReminder } from "@/lib/api";

const EMPTY = {
  title: "", slug: "", description: "", cover_url: "", video_url: "",
  gallery: [], location: "", location_type: "in_person",
  online_url: "", online_details: "",
  event_date: "", start_time: "", end_time: "",
  is_free: true, price: "", currency: "GBP",
  register_url: "", registration_open: false, capacity: "",
  status: "draft", sort_order: 0,
};

export default function AdminEvents() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(true);
  const [linkAudience, setLinkAudience] = useState("all");
  const [sendingLink, setSendingLink] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(null); // event id whose panel is open
  const [reminderData, setReminderData] = useState({}); // id -> status
  const [reminderBusy, setReminderBusy] = useState(null); // id currently loading
  const listRef = useReveal([items]);

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
      online_url: (draft.online_url || "").trim() || null,
      online_details: (draft.online_details || "").trim() || null,
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
      online_url: ev.online_url || "",
      online_details: ev.online_details || "",
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

  // Clone an existing event into a fresh draft — ideal for recurring events.
  // Reusable details carry over; the date, slug, gallery and status reset so it's
  // a clean new draft that won't announce until deliberately published.
  const duplicate = (ev) => {
    setEditingId(null);
    setDraft({
      ...EMPTY,
      title: ev.title || "",
      description: ev.description || "",
      cover_url: ev.cover_url || "",
      video_url: ev.video_url || "",
      location: ev.location || "",
      location_type: ev.location_type || "in_person",
      online_url: ev.online_url || "",
      online_details: ev.online_details || "",
      start_time: ev.start_time || "",
      end_time: ev.end_time || "",
      is_free: ev.is_free ?? true,
      price: ev.price ?? "",
      currency: ev.currency || "GBP",
      register_url: ev.register_url || "",
      registration_open: ev.registration_open ?? false,
      capacity: ev.capacity ?? "",
      sort_order: ev.sort_order ?? 0,
      // reset on purpose: slug (regenerates), event_date (pick the new date),
      // gallery (photos are per-event), status (stays Draft until published)
    });
    window.scrollTo(0, 0);
    toast.success("Duplicated into a new draft", {
      description: "Set the new date, then click Add event.",
    });
  };

  // Persist the joining link/details, then broadcast them to the chosen audience.
  const sendLink = async () => {
    if (!editingId) return;
    const url = (draft.online_url || "").trim();
    if (!url) { toast.error("Add the joining link first"); return; }
    const who = linkAudience === "all" ? "all subscribers" : "this event's registrants";
    if (!window.confirm(`Save and email the joining link to ${who}?`)) return;
    setSendingLink(true);
    try {
      await adminEvents.update(editingId, {
        online_url: url,
        online_details: (draft.online_details || "").trim() || null,
      });
      const res = await adminSendEventLink(editingId, linkAudience);
      const n = res.recipient_count;
      toast.success("Joining link is sending", {
        description: `Going to ${n} ${n === 1 ? "person" : "people"}.`,
      });
      refresh();
    } catch (err) {
      toast.error("Couldn't send link", {
        description: err?.response?.data?.detail || err?.message || "",
      });
    } finally { setSendingLink(false); }
  };

  // Show/refresh the countdown-reminder readout for one event. Fetches on first
  // open (and re-fetches on an explicit refresh) so the list stays cheap to load.
  const toggleReminders = async (id, { force = false } = {}) => {
    const willOpen = force || reminderOpen !== id;
    setReminderOpen(willOpen ? id : null);
    if (!willOpen) return;
    if (reminderData[id] && !force) return;
    setReminderBusy(id);
    try {
      const data = await adminEventReminderStatus(id);
      setReminderData((m) => ({ ...m, [id]: data }));
    } catch (err) {
      toast.error("Couldn't load reminder status", { description: err?.message || "" });
    } finally {
      setReminderBusy(null);
    }
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
            <ArrowLeft className="h-4 w-4" /> Admin Panel
          </Link>
          <p className="font-display text-sm tracking-tight">Events</p>
          <span />
        </div>
      </header>

      <main className="container-page grid grid-cols-1 gap-8 py-12 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <h2 className="text-2xl">{editingId ? "Edit event" : "New event"}</h2>
          <div className="mt-6 space-y-4 rounded-[20px] border border-line bg-surface p-6">
            <GroupHeading first>Details</GroupHeading>
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
            <GroupHeading>When &amp; where</GroupHeading>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            <GroupHeading>Online joining details</GroupHeading>
            <Field label="Video call / webinar link (Zoom, Google Meet, Teams…)">
              <input value={draft.online_url} onChange={(e) => setDraft({ ...draft, online_url: e.target.value })}
                placeholder="https://meet.google.com/…"
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="event-online-url" />
            </Field>
            <Field label="Other joining details (optional) — dial-in number, PIN, etc.">
              <textarea rows={3} value={draft.online_details} onChange={(e) => setDraft({ ...draft, online_details: e.target.value })}
                placeholder={"Or dial: (GB) +44 20 3956 7090  PIN: 709 442 341#"}
                className="w-full resize-y rounded-[14px] border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-lime"
                data-testid="event-online-details" />
              <p className="mt-2 text-xs text-muted">
                Add these a few days before an online event, then broadcast them from the
                &ldquo;Broadcast joining link&rdquo; button below so contacts can plan ahead.
              </p>
            </Field>

            <GroupHeading>Tickets &amp; registration</GroupHeading>
            <Field label="Admission">
              <select value={draft.is_free ? "free" : "paid"} onChange={(e) => setDraft({ ...draft, is_free: e.target.value === "free" })}
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="event-admission">
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </Field>

            {!draft.is_free && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            <GroupHeading>Media</GroupHeading>
            <Field label="Teaser video (optional) — YouTube, Vimeo or an .mp4 link">
              <input value={draft.video_url} onChange={(e) => setDraft({ ...draft, video_url: e.target.value })}
                placeholder="https://youtu.be/…  or  https://…/teaser.mp4"
                className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                data-testid="event-video-url" />
              <p className="mt-2 text-xs text-muted">
                Shows on the event while it's still upcoming. After the event, add photos below
                and they take over as the memories gallery.
              </p>
            </Field>
            <Field label="Cover image — a wide banner (like a Facebook/LinkedIn cover)">
              {draft.cover_url && (
                <div className="mb-2 overflow-hidden rounded-[14px] border border-line">
                  <div className="relative w-full" style={{ aspectRatio: "16 / 6" }}>
                    <img src={draft.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                </div>
              )}
              <label className="btn-ghost cursor-pointer text-xs inline-flex">
                <ImageIcon className="h-3.5 w-3.5" /> Upload cover
                <input type="file" accept="image/*,.heic,.heif" className="hidden" onChange={uploadCover} data-testid="event-cover-upload" />
              </label>
              <p className="mt-2 text-xs text-muted">
                Landscape works best — around 1600×600. It's shown as a wide banner and
                centre-cropped, so keep the key subject near the middle.
              </p>
            </Field>

            <Field label={`Gallery (${(draft.gallery || []).length})`}>
              <label className="btn-ghost cursor-pointer text-xs inline-flex">
                <Plus className="h-3.5 w-3.5" /> Add images
                <input type="file" accept="image/*,.heic,.heif" multiple className="hidden" onChange={addToGallery} data-testid="event-gallery-upload" />
              </label>
              <p className="mt-2 text-xs text-muted">
                Upload photos straight from your phone — they're resized and compressed for
                the web automatically. iPhone (HEIC) photos are fine. Up to 25&nbsp;MB each.
              </p>
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

            <GroupHeading>Publishing</GroupHeading>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <p className="mt-2 text-xs text-muted/80">
              Keep it a <span className="text-ink/80">Draft</span> while you're still writing.
              The first time you set an event to <span className="text-lime">Published</span>,
              your mailing list is emailed the invite automatically — once. Later edits never re-send.
            </p>
            {editingId && (
              <>
                <GroupHeading>Broadcast joining link</GroupHeading>
                <p className="text-xs text-muted">
                  Email the joining link above to your contacts so they can plan ahead. Registrants
                  also receive it automatically in their 7/3/2/1-day reminders once it's set.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Send to">
                    <select value={linkAudience} onChange={(e) => setLinkAudience(e.target.value)}
                      className="w-full rounded-full border border-line bg-bg px-4 py-2 text-sm outline-none focus:border-lime"
                      data-testid="event-link-audience">
                      <option value="all">All subscribers</option>
                      <option value="registrants">This event&apos;s registrants</option>
                    </select>
                  </Field>
                  <div className="flex items-end">
                    <button onClick={sendLink}
                      disabled={sendingLink || !(draft.online_url || "").trim() || draft.status !== "published"}
                      className="btn-lime w-full justify-center disabled:opacity-50"
                      data-testid="send-event-link">
                      {sendingLink ? "Sending…" : "Send joining link"}
                    </button>
                  </div>
                </div>
                {draft.status !== "published" && (
                  <p className="text-xs text-muted/70">Publish the event to enable sending.</p>
                )}
              </>
            )}

            <div className="flex items-center gap-2 border-t border-line pt-5">
              <button onClick={save} className="btn-lime" data-testid="save-event">
                {editingId ? <><Save className="h-4 w-4" /> Update event</> : <><Plus className="h-4 w-4" /> Add event</>}
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
                {items.length} event{items.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {busy ? (
            <div className="mt-6 space-y-3">{[1,2,3].map(i => (<div key={i} className="h-28 animate-pulse rounded-[20px] border border-line bg-surface" />))}</div>
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-[20px] border border-dashed border-line bg-surface/50 px-8 py-16 text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-muted/50" />
              <p className="mt-4 text-muted">No events yet. Fill in the form to publish your first one.</p>
            </div>
          ) : (
            <ul ref={listRef} className="mt-6 space-y-3" data-testid="event-list">
              {items.map((ev, i) => (
                <li
                  key={ev.id}
                  data-reveal
                  style={{ "--reveal-delay": `${Math.min(i, 8) * 60}ms` }}
                  className="press card-lift overflow-hidden rounded-[16px] border border-line bg-surface"
                  data-testid={`event-row-${ev.id}`}
                >
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
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => edit(ev)} className="btn-ghost text-xs">Edit</button>
                      <button onClick={() => duplicate(ev)} className="press inline-flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-2 text-xs hover:border-lime hover:text-lime" data-testid={`duplicate-event-${ev.id}`}>
                        <Copy className="h-3.5 w-3.5" /> Duplicate
                      </button>
                      <button
                        onClick={() => toggleReminders(ev.id)}
                        className="press inline-flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-2 text-xs hover:border-lime hover:text-lime"
                        data-testid={`reminders-toggle-${ev.id}`}
                        aria-expanded={reminderOpen === ev.id}
                      >
                        <BellRing className="h-3.5 w-3.5" /> Reminders
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${reminderOpen === ev.id ? "rotate-180" : ""}`} />
                      </button>
                      <button onClick={() => remove(ev.id)} className="press inline-flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-2 text-xs hover:border-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                    {reminderOpen === ev.id && (
                      <ReminderPanel
                        data={reminderData[ev.id]}
                        busy={reminderBusy === ev.id}
                        onRefresh={() => toggleReminders(ev.id, { force: true })}
                      />
                    )}
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

// e.g. "Fri 11 Sep"
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// The 7/3/2/1-day countdown readout for a single event.
function ReminderPanel({ data, busy, onRefresh }) {
  const [testing, setTesting] = useState(false);
  const [testTo, setTestTo] = useState("");

  const sendTest = async () => {
    if (!data?.event_id) return;
    setTesting(true);
    try {
      const res = await adminSendTestReminder(data.event_id, testTo.trim() || undefined);
      if (res.dry_run) {
        toast.info("Email isn't configured", {
          description: "The test was logged, not delivered. Set RESEND_API_KEY on the backend to send for real.",
        });
      } else {
        toast.success("Test sent", {
          description: `Check ${res.to} — it's the ${res.days_before}-day reminder for this event.`,
        });
      }
    } catch (err) {
      toast.error("Couldn't send test", {
        description: err?.response?.data?.detail || err?.message || "",
      });
    } finally {
      setTesting(false);
    }
  };

  if (busy && !data) {
    return (
      <div className="mt-4 h-32 animate-pulse rounded-[14px] border border-line bg-bg" data-testid="reminder-panel" />
    );
  }
  if (!data) return null;

  const {
    registrant_count: regs = 0,
    has_join_link: hasLink,
    days_until: daysUntil,
    published,
    event_date: eventDate,
    milestones = [],
  } = data;

  const notReady = !published || !eventDate;

  return (
    <div className="mt-4 rounded-[14px] border border-line bg-bg p-4" data-testid="reminder-panel">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5 text-ink">
            <Users className="h-3.5 w-3.5 text-lime" />
            {regs} registrant{regs === 1 ? "" : "s"}
          </span>
          {typeof daysUntil === "number" && (
            <span className="rounded-full border border-line px-2 py-0.5">
              {daysUntil > 0 ? `${daysUntil} day${daysUntil === 1 ? "" : "s"} to go`
                : daysUntil === 0 ? "Today" : "Past event"}
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 ${hasLink ? "text-lime border border-lime/40" : "border border-line"}`}>
            {hasLink ? "Join link set" : "No join link"}
          </span>
        </div>
        <button onClick={onRefresh} className="press text-xs text-muted hover:text-lime" data-testid="reminder-refresh">
          {busy ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {notReady ? (
        <p className="mt-3 text-xs text-muted/80">
          Countdown reminders begin once the event is <span className="text-ink/80">published</span> with a date.
          Each registrant then gets a 7 / 3 / 2 / 1-day nudge automatically.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line/70">
          {milestones.map((m) => (
            <li key={m.days_before} className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-baseline gap-2">
                <span className="w-14 text-sm text-ink">{m.days_before} day{m.days_before === 1 ? "" : "s"}</span>
                <span className="text-xs text-muted">{fmtDate(m.date)}</span>
              </div>
              <MilestoneStatus m={m} />
            </li>
          ))}
        </ul>
      )}
      {!notReady && (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] leading-relaxed text-muted/70">
            &ldquo;Sent&rdquo; means handed to the mailer without error. Send yourself a test to see
            the real email — or enter any address to test deliverability there.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="Leave blank for your inbox, or any email…"
              className="min-w-0 flex-1 rounded-full border border-line bg-bg px-3 py-1.5 text-xs outline-none focus:border-lime"
              data-testid="test-reminder-to"
            />
            <button
              onClick={sendTest}
              disabled={testing}
              className="press inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs hover:border-lime hover:text-lime disabled:opacity-50"
              data-testid="send-test-reminder"
            >
              <Send className="h-3.5 w-3.5" /> {testing ? "Sending…" : "Send test"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MilestoneStatus({ m }) {
  const pill = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium";
  if (m.when === "past") {
    if (m.sent === 0 && m.failed === 0) {
      return <span className={`${pill} border border-line text-muted`}>None sent</span>;
    }
    return (
      <span className="flex items-center gap-1.5">
        <span className={`${pill} bg-lime/15 text-lime`}>{m.sent} sent</span>
        {m.failed > 0 && <span className={`${pill} bg-destructive/15 text-destructive`}>{m.failed} failed</span>}
      </span>
    );
  }
  if (m.when === "today") {
    return (
      <span className="flex items-center gap-1.5">
        <span className={`${pill} bg-amber-400/15 text-amber-400`}>Due today</span>
        <span className="text-[11px] text-muted">{m.sent} sent · {m.pending} pending</span>
        {m.failed > 0 && <span className={`${pill} bg-destructive/15 text-destructive`}>{m.failed} failed</span>}
      </span>
    );
  }
  // upcoming
  return (
    <span className="flex items-center gap-1.5">
      <span className={`${pill} border border-line text-muted`}>Scheduled</span>
      <span className="text-[11px] text-muted">{m.pending} to send</span>
    </span>
  );
}
