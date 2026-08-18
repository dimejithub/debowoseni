import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Pause, Play, Plus, Trash2, Workflow } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useReveal } from "@/lib/useReveal";
import { adminSequences } from "@/lib/api";
import { TRIGGERS, triggerLabel } from "@/lib/sequences";

export default function AdminSequences() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState(null);
  const listRef = useReveal([items]);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", trigger_type: "subscriber_created", trigger_value: "" });

  const refresh = () =>
    adminSequences
      .list()
      .then(setItems)
      .catch((err) => {
        toast.error("Couldn't load automations", { description: err?.message || "" });
        setItems([]);
      });

  useEffect(() => {
    if (loading || !user) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const create = async (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    try {
      await adminSequences.create({ ...draft, trigger_value: draft.trigger_value || null });
      toast.success("Automation created. Add its emails next.");
      setCreating(false);
      setDraft({ name: "", trigger_type: "subscriber_created", trigger_value: "" });
      refresh();
    } catch (err) {
      toast.error("Couldn't create", {
        description: err?.response?.data?.detail || err?.message || "",
      });
    }
  };

  const toggle = async (seq) => {
    const status = seq.status === "active" ? "paused" : "active";
    try {
      await adminSequences.update(seq.id, { status });
      refresh();
    } catch (err) {
      toast.error("Couldn't update", { description: err?.message || "" });
    }
  };

  const remove = async (seq) => {
    if (!window.confirm(`Delete "${seq.name}"? Anyone part-way through it stops receiving it.`))
      return;
    try {
      await adminSequences.remove(seq.id);
      toast.success("Deleted.");
      refresh();
    } catch (err) {
      toast.error("Couldn't delete", { description: err?.message || "" });
    }
  };

  const selected = TRIGGERS.find((t) => t.value === draft.trigger_type);
  const inputClass =
    "mt-2 w-full rounded-[12px] border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-lime";

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-sequences">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> CMS
          </Link>
          <p className="font-display text-sm tracking-tight">Automations</p>
          <span />
        </div>
      </header>

      <main className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h1>Automations</h1>
              {items && items.length > 0 && (
                <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                  {items.length} automations
                </span>
              )}
            </div>
            <p className="mt-3 max-w-2xl text-muted">
              A trigger, then a series of emails on a delay. Someone takes the quiz,
              registers for an event or joins the list, and the right sequence starts
              on its own.
            </p>
          </div>
          <button onClick={() => setCreating((v) => !v)} className="btn-lime" data-testid="sequence-new">
            <Plus className="h-4 w-4" /> New automation
          </button>
        </div>

        {creating && (
          <form
            onSubmit={create}
            className="mt-8 max-w-xl rounded-[20px] border border-line bg-surface p-7"
            data-testid="sequence-create-form"
          >
            <label className="text-xs uppercase tracking-[0.2em] text-muted">Name</label>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="LTE welcome series"
              className={inputClass}
              data-testid="sequence-name"
            />

            <label className="mt-5 block text-xs uppercase tracking-[0.2em] text-muted">
              Start it when…
            </label>
            <select
              value={draft.trigger_type}
              onChange={(e) => setDraft({ ...draft, trigger_type: e.target.value })}
              className={inputClass}
              data-testid="sequence-trigger"
            >
              {TRIGGERS.map((t) => (
                <option key={t.value} value={t.value} className="bg-surface">
                  {t.label}
                </option>
              ))}
            </select>

            {selected?.needsValue && (
              <>
                <label className="mt-5 block text-xs uppercase tracking-[0.2em] text-muted">
                  Which one?
                </label>
                <input
                  value={draft.trigger_value}
                  onChange={(e) => setDraft({ ...draft, trigger_value: e.target.value })}
                  placeholder={selected.hint}
                  className={inputClass}
                  data-testid="sequence-trigger-value"
                />
                <p className="mt-2 text-xs text-muted">{selected.hint}</p>
              </>
            )}

            <button type="submit" className="btn-lime mt-6 w-full justify-center">
              Create
            </button>
          </form>
        )}

        {items === null ? (
          <div className="mt-10 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-[14px] border border-line bg-surface" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-[20px] border border-line bg-surface px-8 py-16 text-center" data-testid="sequences-empty">
            <Workflow className="mx-auto h-8 w-8 text-lime" />
            <p className="mt-4 text-muted">
              No automations yet. A welcome series for new subscribers is the one worth
              building first.
            </p>
          </div>
        ) : (
          <div ref={listRef} className="mt-10 space-y-3" data-testid="sequences-list">
            {items.map((s, i) => (
              <div
                key={s.id}
                data-reveal
                style={{ "--reveal-delay": `${Math.min(i, 8) * 55}ms` }}
                className="press flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-line bg-surface px-6 py-5"
                data-testid={`sequence-row-${s.id}`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link to={`/admin/automations/${s.id}`} className="text-lg text-ink hover:text-lime">
                      {s.name}
                    </Link>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider ${
                        s.status === "active" ? "border-lime/50 text-lime" : "border-line text-muted"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {triggerLabel(s)} · {s.step_count} email{s.step_count === 1 ? "" : "s"} ·{" "}
                    {s.active_count} in progress · {s.completed_count} completed
                  </p>
                  {s.step_count === 0 && (
                    <p className="mt-2 text-xs text-amber-300">
                      No emails yet — this will not send anything until you add one.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggle(s)}
                    className="rounded-full border border-line p-2 text-muted hover:border-lime hover:text-lime"
                    aria-label={s.status === "active" ? "Pause" : "Activate"}
                    data-testid={`sequence-toggle-${s.id}`}
                  >
                    {s.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => remove(s)}
                    className="rounded-full border border-line p-2 text-muted hover:border-red-500/50 hover:text-red-400"
                    aria-label="Delete"
                    data-testid={`sequence-delete-${s.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
