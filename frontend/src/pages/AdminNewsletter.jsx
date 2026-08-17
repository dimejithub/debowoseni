import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, Eye, Loader2, Save, Send } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { adminGetNewsletter, adminSendNewsletterNow, adminUpdateNewsletter } from "@/lib/api";

const FREQUENCIES = [
  { value: "off", label: "Off", hint: "No automatic newsletter." },
  { value: "weekly", label: "Weekly", hint: "One issue every week." },
  { value: "biweekly", label: "Fortnightly", hint: "One issue every two weeks." },
  { value: "monthly", label: "Monthly", hint: "One issue every four weeks." },
];

// Backend stores 0 = Monday … 6 = Sunday (Python's numbering).
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatDate(iso) {
  if (!iso) return "never";
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export default function AdminNewsletter() {
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const load = useCallback(() => {
    adminGetNewsletter()
      .then((d) => {
        setData(d);
        setDraft({
          frequency: d.settings.frequency || "off",
          send_weekday: d.settings.send_weekday ?? 3,
          send_hour: d.settings.send_hour ?? 9,
          min_posts: d.settings.min_posts ?? 1,
          intro: d.settings.intro || "",
        });
      })
      .catch((err) => {
        toast.error("Couldn't load newsletter settings", { description: err?.message || "" });
        setData(false);
      });
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    load();
  }, [loading, user, load]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const set = (key) => (e) => setDraft({ ...draft, [key]: e.target.value });

  const save = async () => {
    setBusy(true);
    try {
      await adminUpdateNewsletter({
        ...draft,
        send_weekday: Number(draft.send_weekday),
        send_hour: Number(draft.send_hour),
        min_posts: Number(draft.min_posts),
        intro: draft.intro.trim() || null,
      });
      toast.success("Newsletter schedule saved.");
      load();
    } catch (err) {
      toast.error("Couldn't save", { description: err?.response?.data?.detail || err?.message || "" });
    } finally {
      setBusy(false);
    }
  };

  const sendNow = async () => {
    if (!window.confirm(`Send an issue to ${data?.recipients ?? "the"} subscribers right now?`)) return;
    setBusy(true);
    try {
      const res = await adminSendNewsletterNow();
      toast.success(`Issue queued — ${res.posts} post${res.posts === 1 ? "" : "s"} to ${data?.recipients} subscribers.`);
      load();
    } catch (err) {
      toast.error("Couldn't send", { description: err?.response?.data?.detail || err?.message || "" });
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-[12px] border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-lime";
  const isOff = draft?.frequency === "off";

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-newsletter">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> CMS
          </Link>
          <p className="font-display text-sm tracking-tight">Newsletter</p>
          <span />
        </div>
      </header>

      <main className="container-page py-12">
        <div className="max-w-2xl">
          <h1>Newsletter</h1>
          <p className="mt-3 text-muted">
            A digest of new journal posts, sent automatically on the schedule you choose.
            Publish posts as usual — the system gathers what is new since the last issue and
            mails the list. It never sends an empty one.
          </p>
        </div>

        {data === null ? (
          <div className="mt-10 h-64 max-w-2xl animate-pulse rounded-[20px] border border-line bg-surface" />
        ) : data === false ? (
          <p className="mt-10 text-muted">Couldn't load settings.</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-8">
              {/* Cadence */}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">How often</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setDraft({ ...draft, frequency: f.value })}
                      className={`rounded-[14px] border p-4 text-left transition-colors ${
                        draft.frequency === f.value
                          ? "border-lime bg-lime/5 text-ink"
                          : "border-line bg-surface text-muted hover:border-lime/40"
                      }`}
                      data-testid={`freq-${f.value}`}
                    >
                      <span className="block text-sm font-medium">{f.label}</span>
                      <span className="mt-1 block text-xs text-muted">{f.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* When */}
              {!isOff && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2" data-testid="newsletter-timing">
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted">Send on</label>
                    <select value={draft.send_weekday} onChange={set("send_weekday")} className={inputClass}>
                      {WEEKDAYS.map((d, i) => (
                        <option key={d} value={i} className="bg-surface">{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted">At (UTC)</label>
                    <select value={draft.send_hour} onChange={set("send_hour")} className={inputClass}>
                      {Array.from({ length: 24 }, (_, h) => (
                        <option key={h} value={h} className="bg-surface">
                          {String(h).padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {!isOff && (
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted">
                    Standing intro line <span className="normal-case tracking-normal text-muted/70">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={draft.intro}
                    onChange={set("intro")}
                    placeholder="Appears at the top of every issue. Leave blank for the default."
                    className={`${inputClass} resize-none`}
                    data-testid="newsletter-intro"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button onClick={save} disabled={busy} className="btn-lime" data-testid="newsletter-save">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save schedule
                </button>
                {data.preview && (
                  <button onClick={() => setShowPreview((v) => !v)} className="btn-ghost">
                    <Eye className="h-4 w-4" /> {showPreview ? "Hide" : "Preview"} next issue
                  </button>
                )}
              </div>

              {showPreview && data.preview && (
                <div className="rounded-[16px] border border-line bg-surface p-6" data-testid="newsletter-preview">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Subject</p>
                  <p className="mt-1 text-lg text-ink">{data.preview.subject}</p>
                  <pre className="mt-4 whitespace-pre-wrap border-t border-line pt-4 font-sans text-sm text-ink/80">
                    {data.preview.body}
                  </pre>
                </div>
              )}
            </div>

            {/* Status rail */}
            <aside className="space-y-4">
              <div className="rounded-[20px] border border-line bg-surface p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Status</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-ink">
                  <CalendarClock className="h-4 w-4 text-lime" />
                  {isOff ? "Paused" : `${FREQUENCIES.find((f) => f.value === draft.frequency)?.label}, ${WEEKDAYS[draft.send_weekday]}s`}
                </p>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">New posts waiting</dt>
                    <dd className="text-ink">{data.new_posts}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Recipients</dt>
                    <dd className="text-ink">{data.recipients}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Last issue</dt>
                    <dd className="text-ink">{formatDate(data.settings.last_sent_at)}</dd>
                  </div>
                </dl>
              </div>

              <button
                onClick={sendNow}
                disabled={busy || data.new_posts === 0}
                className="btn-ghost w-full justify-center disabled:opacity-50"
                data-testid="newsletter-send-now"
              >
                <Send className="h-4 w-4" /> Send an issue now
              </button>
              <p className="text-center text-xs text-muted">
                {data.new_posts === 0
                  ? "No new posts since the last issue."
                  : `Sends the ${data.new_posts} new post${data.new_posts === 1 ? "" : "s"} to everyone, now.`}
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
