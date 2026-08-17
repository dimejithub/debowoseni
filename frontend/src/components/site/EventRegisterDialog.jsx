import { useState } from "react";
import { toast } from "sonner";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { registerForEvent } from "@/lib/api";

/**
 * Event sign-up, taken on the site itself.
 *
 * Replaces the old hand-off to an external funnel: the registration lands in
 * Supabase, the person joins the mailing list tagged with the event, and a
 * confirmation email goes out immediately.
 */
export function EventRegisterDialog({ event, triggerLabel = "Register", triggerClassName = "btn-lime" }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setPending(true);
    try {
      const res = await registerForEvent(event.slug, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
      });
      setDone(res.status || "registered");
      toast.success(
        res.status === "waitlisted" ? "You're on the waitlist." : "You're registered.",
        { description: "Check your inbox for the confirmation." }
      );
    } catch (err) {
      toast.error("Could not complete your registration", {
        description: err?.response?.data?.detail || err?.message || "Please try again.",
      });
    } finally {
      setPending(false);
    }
  };

  const reset = (next) => {
    setOpen(next);
    if (!next) {
      setDone(null);
      setForm({ name: "", email: "", phone: "", notes: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <button className={triggerClassName} data-testid={`event-register-${event.slug}`}>
          {triggerLabel} <ArrowUpRight className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="border-line bg-surface text-ink sm:max-w-[480px]">
        {done ? (
          <div className="py-6 text-center" data-testid="event-register-success">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-line bg-bg">
              <Check className="h-5 w-5 text-lime" />
            </span>
            <h3 className="mt-5 text-2xl">
              {done === "waitlisted" ? "You're on the waitlist" : "Your place is confirmed"}
            </h3>
            <p className="mt-3 text-sm text-muted">
              {done === "waitlisted"
                ? "The room is full, but places do open up — we'll email you the moment one does."
                : "A confirmation email is on its way with the details."}
            </p>
            <button onClick={() => reset(false)} className="btn-ghost mt-7">
              Close
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{event.title}</DialogTitle>
              <DialogDescription className="text-muted">
                Register your place. We'll email you the details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="mt-2 space-y-4" data-testid="event-register-form">
              <div>
                <label htmlFor="reg-name" className="text-xs uppercase tracking-[0.2em] text-muted">
                  Your name
                </label>
                <input
                  id="reg-name"
                  required
                  value={form.name}
                  onChange={set("name")}
                  className="mt-2 w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-ink outline-none focus:border-lime"
                  data-testid="event-register-name"
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="text-xs uppercase tracking-[0.2em] text-muted">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  className="mt-2 w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-ink outline-none focus:border-lime"
                  data-testid="event-register-email"
                />
              </div>
              <div>
                <label htmlFor="reg-phone" className="text-xs uppercase tracking-[0.2em] text-muted">
                  Phone <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  id="reg-phone"
                  value={form.phone}
                  onChange={set("phone")}
                  className="mt-2 w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-ink outline-none focus:border-lime"
                  data-testid="event-register-phone"
                />
              </div>
              <div>
                <label htmlFor="reg-notes" className="text-xs uppercase tracking-[0.2em] text-muted">
                  Anything we should know? <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  id="reg-notes"
                  rows={3}
                  value={form.notes}
                  onChange={set("notes")}
                  className="mt-2 w-full resize-none rounded-[12px] border border-line bg-bg px-4 py-3 text-ink outline-none focus:border-lime"
                  data-testid="event-register-notes"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="btn-lime w-full justify-center disabled:opacity-60"
                data-testid="event-register-submit"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm my place"}
              </button>
              <p className="text-center text-xs text-muted">
                You'll also receive occasional insights from Debo. Unsubscribe any time.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
