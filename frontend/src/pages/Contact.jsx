import { useState } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import { submitContact } from "@/lib/api";
import {
  CONTACT_EMAIL,
  SOCIALS,
  SYSTEME_BOOKING_URL,
} from "@/lib/data";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [pending, setPending] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setPending(true);
    try {
      await submitContact(form);
      toast.success("Message sent.", {
        description: "Debo' will be in touch soon.",
      });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error("Couldn't send", { description: "Please try again in a moment." });
    } finally {
      setPending(false);
    }
  };

  return (
    <div data-testid="contact-page">
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[40vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Let&apos;s talk</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-4xl font-display italic">
              Start where you are. <span className="text-lime">Send a note</span>.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-lg text-ink/85">
              For programmes, speaking, partnerships, or a personal hello —
              this inbox is read by a human.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <form
              onSubmit={onSubmit}
              className="rounded-[24px] border border-line bg-surface p-6 md:p-10"
              data-testid="contact-form"
            >
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted">
                  Name
                </span>
                <input
                  required
                  value={form.name}
                  onChange={onChange("name")}
                  className="mt-2 w-full rounded-full border border-line bg-bg px-5 py-3 text-ink placeholder:text-muted focus:border-lime focus:outline-none"
                  placeholder="Your name"
                  data-testid="contact-name"
                />
              </label>
              <label className="mt-6 block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={onChange("email")}
                  className="mt-2 w-full rounded-full border border-line bg-bg px-5 py-3 text-ink placeholder:text-muted focus:border-lime focus:outline-none"
                  placeholder="you@email.com"
                  data-testid="contact-email"
                />
              </label>
              <label className="mt-6 block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted">
                  Message
                </span>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={onChange("message")}
                  className="mt-2 w-full resize-y rounded-[18px] border border-line bg-bg px-5 py-4 text-ink placeholder:text-muted focus:border-lime focus:outline-none"
                  placeholder="What's on your mind?"
                  data-testid="contact-message"
                />
              </label>

              <button
                type="submit"
                disabled={pending}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-bg transition-all hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(188,234,62,0.35)] disabled:opacity-60"
                data-testid="contact-submit"
              >
                {pending ? "Sending…" : "Send message"}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <aside className="space-y-6 md:col-span-5">
            <div className="rounded-[20px] border border-line bg-surface p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Direct email</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 inline-flex items-center gap-2 font-display text-2xl tracking-tight text-ink hover:text-lime"
                data-testid="contact-direct-email"
              >
                <Mail className="h-5 w-5" /> {CONTACT_EMAIL}
              </a>
            </div>

            <div className="rounded-[20px] border border-line bg-surface p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Book a session
              </p>
              <p className="mt-3 text-muted">
                Prefer a calendar slot? Choose a window that fits.
              </p>
              <a
                href={SYSTEME_BOOKING_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-semibold text-bg hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(188,234,62,0.35)]"
                data-testid="contact-book-appointment"
              >
                Book Appointment <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="rounded-[20px] border border-line bg-surface p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Social</p>
              <ul className="mt-3 space-y-2 text-ink/85">
                <li><a className="lime-link" href={SOCIALS.linkedin} target="_blank" rel="noreferrer">LinkedIn →</a></li>
                <li><a className="lime-link" href={SOCIALS.twitter} target="_blank" rel="noreferrer">X / Twitter →</a></li>
                <li><a className="lime-link" href={SOCIALS.instagram} target="_blank" rel="noreferrer">Instagram →</a></li>
                <li><a className="lime-link" href={SOCIALS.facebook} target="_blank" rel="noreferrer">Facebook →</a></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
