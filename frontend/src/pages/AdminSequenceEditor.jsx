import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Clock, Play, Plus, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  adminCreateStep,
  adminDeleteStep,
  adminGetSequence,
  adminRunSequences,
  adminUpdateStep,
} from "@/lib/api";
import { triggerLabel } from "@/lib/sequences";

const BLANK_STEP = { delay_days: 0, subject: "", preheader: "", body: "" };

function delayLabel(step, index) {
  const d = step.delay_days;
  if (index === 0) return d === 0 ? "Sends immediately" : `Sends ${d} day${d === 1 ? "" : "s"} after the trigger`;
  return d === 0 ? "Sends straight after the previous email" : `${d} day${d === 1 ? "" : "s"} after the previous email`;
}

export default function AdminSequenceEditor() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [sequence, setSequence] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(BLANK_STEP);
  const [editing, setEditing] = useState({});

  const load = useCallback(() => {
    adminGetSequence(id)
      .then(setSequence)
      .catch((err) => {
        toast.error("Couldn't load", { description: err?.message || "" });
        setSequence(false);
      });
  }, [id]);

  useEffect(() => {
    if (loading || !user) return;
    load();
  }, [loading, user, load]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const addStep = async (e) => {
    e.preventDefault();
    if (!draft.subject.trim()) {
      toast.error("Give the email a subject line.");
      return;
    }
    const position = (sequence.steps?.length || 0) + 1;
    try {
      await adminCreateStep(id, { ...draft, position, delay_days: Number(draft.delay_days) || 0 });
      toast.success("Email added.");
      setDraft(BLANK_STEP);
      setAdding(false);
      load();
    } catch (err) {
      toast.error("Couldn't add", {
        description: err?.response?.data?.detail || err?.message || "",
      });
    }
  };

  const saveStep = async (step) => {
    const changes = editing[step.id];
    if (!changes) return;
    try {
      await adminUpdateStep(step.id, {
        ...changes,
        delay_days: changes.delay_days != null ? Number(changes.delay_days) : undefined,
      });
      toast.success("Saved.");
      setEditing((cur) => {
        const next = { ...cur };
        delete next[step.id];
        return next;
      });
      load();
    } catch (err) {
      toast.error("Couldn't save", { description: err?.message || "" });
    }
  };

  const removeStep = async (step) => {
    if (!window.confirm(`Delete email ${step.position}?`)) return;
    try {
      await adminDeleteStep(step.id);
      toast.success("Deleted.");
      load();
    } catch (err) {
      toast.error("Couldn't delete", { description: err?.message || "" });
    }
  };

  const runNow = async () => {
    try {
      const res = await adminRunSequences(id);
      toast.success(`Run complete — ${res.sent} sent, ${res.failed} failed.`, {
        description: res.due === 0 ? "Nothing was due yet." : undefined,
      });
      load();
    } catch (err) {
      toast.error("Run failed", { description: err?.message || "" });
    }
  };

  const track = (stepId, key, value) =>
    setEditing((cur) => ({ ...cur, [stepId]: { ...(cur[stepId] || {}), [key]: value } }));

  const inputClass =
    "mt-2 w-full rounded-[12px] border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-lime";

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-sequence-editor">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin/automations" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> Automations
          </Link>
          <p className="font-display text-sm tracking-tight">Automation</p>
          <span />
        </div>
      </header>

      <main className="container-page py-12">
        {sequence === null ? (
          <div className="h-40 animate-pulse rounded-[20px] border border-line bg-surface" />
        ) : sequence === false ? (
          <p className="text-muted">Couldn't load this automation.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1>{sequence.name}</h1>
                <p className="mt-3 text-muted">
                  {triggerLabel(sequence)} · {sequence.active_count} people part-way through
                </p>
              </div>
              <button onClick={runNow} className="btn-ghost" data-testid="sequence-run-now">
                <Play className="h-4 w-4" /> Send anything due now
              </button>
            </div>

            <p className="mt-6 max-w-2xl text-sm text-muted">
              Emails send in order. Each delay counts from the previous email, so 0 → 2 → 5
              means: immediately, two days later, then five days after that.
            </p>

            <div className="mt-10 space-y-4" data-testid="sequence-steps">
              {(sequence.steps || []).map((step, i) => {
                const changes = editing[step.id] || {};
                const dirty = Object.keys(changes).length > 0;
                return (
                  <div
                    key={step.id}
                    className="rounded-[20px] border border-line bg-surface p-7"
                    data-testid={`step-${step.position}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-bg text-xs text-lime">
                          {step.position}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                          <Clock className="h-3.5 w-3.5" /> {delayLabel(step, i)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {dirty && (
                          <button
                            onClick={() => saveStep(step)}
                            className="btn-lime px-4 py-1.5 text-xs"
                            data-testid={`step-save-${step.position}`}
                          >
                            <Save className="h-3.5 w-3.5" /> Save
                          </button>
                        )}
                        <button
                          onClick={() => removeStep(step)}
                          className="rounded-full border border-line p-2 text-muted hover:border-red-500/50 hover:text-red-400"
                          aria-label={`Delete email ${step.position}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[120px_1fr]">
                      <div>
                        <label className="text-xs uppercase tracking-[0.2em] text-muted">
                          Wait (days)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={changes.delay_days ?? step.delay_days}
                          onChange={(e) => track(step.id, "delay_days", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-[0.2em] text-muted">Subject</label>
                        <input
                          value={changes.subject ?? step.subject}
                          onChange={(e) => track(step.id, "subject", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <label className="mt-4 block text-xs uppercase tracking-[0.2em] text-muted">
                      Preview text
                    </label>
                    <input
                      value={changes.preheader ?? step.preheader ?? ""}
                      onChange={(e) => track(step.id, "preheader", e.target.value)}
                      className={inputClass}
                    />

                    <label className="mt-4 block text-xs uppercase tracking-[0.2em] text-muted">
                      Email
                    </label>
                    <textarea
                      rows={10}
                      value={changes.body ?? step.body}
                      onChange={(e) => track(step.id, "body", e.target.value)}
                      className={`${inputClass} resize-y font-mono text-sm leading-relaxed`}
                    />
                  </div>
                );
              })}
            </div>

            {adding ? (
              <form
                onSubmit={addStep}
                className="mt-6 rounded-[20px] border border-lime/40 bg-surface p-7"
                data-testid="step-add-form"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-lime">
                  Email {(sequence.steps?.length || 0) + 1}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[120px_1fr]">
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted">
                      Wait (days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={draft.delay_days}
                      onChange={(e) => setDraft({ ...draft, delay_days: e.target.value })}
                      className={inputClass}
                      data-testid="step-delay"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted">Subject</label>
                    <input
                      value={draft.subject}
                      onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                      className={inputClass}
                      data-testid="step-subject"
                    />
                  </div>
                </div>

                <label className="mt-4 block text-xs uppercase tracking-[0.2em] text-muted">
                  Preview text
                </label>
                <input
                  value={draft.preheader}
                  onChange={(e) => setDraft({ ...draft, preheader: e.target.value })}
                  className={inputClass}
                />

                <label className="mt-4 block text-xs uppercase tracking-[0.2em] text-muted">
                  Email
                </label>
                <textarea
                  rows={10}
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  placeholder={"# Welcome\n\nWrite normally. **Bold**, *italic*, [links](https://debowoseni.com)."}
                  className={`${inputClass} resize-y font-mono text-sm leading-relaxed`}
                  data-testid="step-body"
                />

                <div className="mt-5 flex gap-3">
                  <button type="submit" className="btn-lime" data-testid="step-add-submit">
                    Add email
                  </button>
                  <button type="button" onClick={() => setAdding(false)} className="btn-ghost">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="btn-ghost mt-6"
                data-testid="step-add"
              >
                <Plus className="h-4 w-4" /> Add another email
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
