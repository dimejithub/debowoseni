import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  GraduationCap,
  Mail,
  MessageCircle,
  MessageSquare,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  adminCreateEnrolment,
  adminDeleteEnrolment,
  adminGetPerson,
  adminUpdateEnrolment,
} from "@/lib/api";

const KIND_ICONS = {
  subscribed: UserPlus,
  unsubscribed: UserMinus,
  registered: Calendar,
  enrolled: GraduationCap,
  community: MessageCircle,
  community_left: MessageCircle,
  message: MessageSquare,
  email: Mail,
  email_auto: Mail,
};

const STAGES = ["enquired", "booked", "paid", "in_progress", "completed", "cancelled"];

const PROGRAMMES = [
  { value: "tier-1", label: "1 to 1 Coaching" },
  { value: "tier-2", label: "Bootcamp — In-Person" },
  { value: "tier-3", label: "Bootcamp — Online" },
  { value: "marriage-101", label: "Marriage 101" },
  { value: "academic", label: "Academic Research Insight" },
  { value: "custom", label: "Custom / other" },
];

function formatDateTime(iso) {
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

export default function AdminPerson() {
  const { email } = useParams();
  const { user, loading } = useAuth();
  const [person, setPerson] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    programme: "tier-1",
    stage: "enquired",
    amount: "",
    currency: "EUR",
    notes: "",
  });

  const load = useCallback(() => {
    adminGetPerson(email)
      .then(setPerson)
      .catch((err) => {
        toast.error("Couldn't load this person", { description: err?.message || "" });
        setPerson(false);
      });
  }, [email]);

  useEffect(() => {
    if (loading || !user) return;
    load();
  }, [loading, user, load]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const addEnrolment = async (e) => {
    e.preventDefault();
    try {
      await adminCreateEnrolment({
        email,
        name: person?.name || null,
        programme: draft.programme,
        programme_label:
          PROGRAMMES.find((p) => p.value === draft.programme)?.label || draft.programme,
        stage: draft.stage,
        amount: draft.amount === "" ? null : Number(draft.amount),
        currency: draft.currency,
        notes: draft.notes || null,
      });
      toast.success("Enrolment added.");
      setAdding(false);
      setDraft({ programme: "tier-1", stage: "enquired", amount: "", currency: "EUR", notes: "" });
      load();
    } catch (err) {
      toast.error("Couldn't add", {
        description: err?.response?.data?.detail || err?.message || "",
      });
    }
  };

  const setStage = async (enrolment, stage) => {
    try {
      await adminUpdateEnrolment(enrolment.id, { stage });
      load();
    } catch (err) {
      toast.error("Couldn't update", { description: err?.message || "" });
    }
  };

  const removeEnrolment = async (enrolment) => {
    if (!window.confirm("Remove this enrolment?")) return;
    try {
      await adminDeleteEnrolment(enrolment.id);
      toast.success("Removed.");
      load();
    } catch (err) {
      toast.error("Couldn't remove", { description: err?.message || "" });
    }
  };

  const inputClass =
    "mt-2 w-full rounded-[12px] border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-lime";

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-person">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin/people" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> People
          </Link>
          <p className="font-display text-sm tracking-tight">Person</p>
          <span />
        </div>
      </header>

      <main className="container-page py-12">
        {person === null ? (
          <div className="h-40 animate-pulse rounded-[20px] border border-line bg-surface" />
        ) : person === false ? (
          <p className="text-muted">Couldn't load this person.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1>{person.name || person.email}</h1>
                <p className="mt-3 text-muted">
                  <a href={`mailto:${person.email}`} className="hover:text-lime">
                    {person.email}
                  </a>
                  {person.subscriber?.status === "unsubscribed" && (
                    <span className="ml-3 rounded-full border border-line px-3 py-1 text-xs uppercase">
                      unsubscribed
                    </span>
                  )}
                </p>
                {(person.subscriber?.tags || []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {person.subscriber.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-line px-3 py-1 text-xs text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Counters */}
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4" data-testid="person-counts">
              {[
                ["Events", person.counts.registrations],
                ["Attended", person.counts.attended],
                ["Programmes", person.counts.enrolments],
                ["Emails received", person.counts.emails],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[16px] border border-line bg-surface p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
                  <p className="mt-2 font-display text-3xl">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
              {/* Timeline */}
              <div>
                <h2 className="text-2xl">History</h2>
                {person.timeline.length === 0 ? (
                  <p className="mt-6 text-muted">Nothing recorded yet.</p>
                ) : (
                  <ol className="mt-6 border-l border-line" data-testid="person-timeline">
                    {person.timeline.map((t, i) => {
                      const Icon = KIND_ICONS[t.kind] || Mail;
                      return (
                        <li key={`${t.at}-${i}`} className="relative pb-8 pl-8 last:pb-0">
                          <span className="absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full border border-line bg-bg">
                            <Icon className="h-3 w-3 text-lime" />
                          </span>
                          <p className="text-sm text-ink">{t.title}</p>
                          <p className="mt-1 text-xs text-muted">
                            {formatDateTime(t.at)}
                            {t.detail ? ` · ${t.detail}` : ""}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>

              {/* Programmes */}
              <aside>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl">Programmes</h2>
                  <button
                    onClick={() => setAdding((v) => !v)}
                    className="rounded-full border border-line p-2 text-muted hover:border-lime hover:text-lime"
                    aria-label="Add enrolment"
                    data-testid="person-add-enrolment"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {adding && (
                  <form
                    onSubmit={addEnrolment}
                    className="mt-5 rounded-[20px] border border-line bg-surface p-6"
                    data-testid="person-enrolment-form"
                  >
                    <label className="text-xs uppercase tracking-[0.2em] text-muted">Programme</label>
                    <select
                      value={draft.programme}
                      onChange={(e) => setDraft({ ...draft, programme: e.target.value })}
                      className={inputClass}
                    >
                      {PROGRAMMES.map((p) => (
                        <option key={p.value} value={p.value} className="bg-surface">
                          {p.label}
                        </option>
                      ))}
                    </select>

                    <label className="mt-4 block text-xs uppercase tracking-[0.2em] text-muted">
                      Stage
                    </label>
                    <select
                      value={draft.stage}
                      onChange={(e) => setDraft({ ...draft, stage: e.target.value })}
                      className={inputClass}
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s} className="bg-surface">
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs uppercase tracking-[0.2em] text-muted">Amount</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.amount}
                          onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-[0.2em] text-muted">Currency</label>
                        <select
                          value={draft.currency}
                          onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
                          className={inputClass}
                        >
                          {["EUR", "GBP", "USD", "NGN"].map((c) => (
                            <option key={c} value={c} className="bg-surface">
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <label className="mt-4 block text-xs uppercase tracking-[0.2em] text-muted">
                      Notes
                    </label>
                    <textarea
                      rows={3}
                      value={draft.notes}
                      onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                      className={`${inputClass} resize-none`}
                    />

                    <button type="submit" className="btn-lime mt-5 w-full justify-center">
                      Add enrolment
                    </button>
                  </form>
                )}

                {person.enrolments.length === 0 && !adding ? (
                  <p className="mt-5 text-sm text-muted">
                    Not enrolled in anything yet. Add one when they book.
                  </p>
                ) : (
                  <div className="mt-5 space-y-3">
                    {person.enrolments.map((en) => (
                      <div
                        key={en.id}
                        className="rounded-[16px] border border-line bg-surface p-5"
                        data-testid={`enrolment-${en.id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-ink">
                            {en.programme_label || en.programme}
                          </p>
                          <button
                            onClick={() => removeEnrolment(en)}
                            className="text-muted hover:text-red-400"
                            aria-label="Remove enrolment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {en.amount != null && (
                          <p className="mt-1 text-xs text-muted">
                            {en.currency} {en.amount}
                          </p>
                        )}
                        <select
                          value={en.stage}
                          onChange={(e) => setStage(en, e.target.value)}
                          className="mt-3 w-full rounded-full border border-line bg-bg px-3 py-1.5 text-xs outline-none focus:border-lime"
                          data-testid={`enrolment-stage-${en.id}`}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s} className="bg-surface">
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                        {en.notes && <p className="mt-3 text-xs text-muted">{en.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
