import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import { submitContact } from "@/lib/api";
import { CONTACT_EMAIL, SOCIALS } from "@/lib/data";

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
      toast.success("Message sent.", { description: "Debo' will be in touch soon." });
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
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal><p className="text-xs uppercase tracking-[0.28em] text-muted">Let&apos;s talk</p></Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-7 max-w-4xl">
                Start where you are. <span className="font-display-italic text-lime">Send a note</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                For programmes, speaking, partnerships, or a personal hello — this inbox is read by a human.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="cream-section py-20 md:py-24" data-testid="contact-form-section">
        <div className="container-page">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <form
              onSubmit={onSubmit}
              className="card-lift rounded-[24px] border border-line bg-white p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] md:p-10"
              data-testid="contact-form"
            >
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted">Name</span>
                <input required value={form.name} onChange={onChange("name")}
                  className="mt-2 w-full rounded-full border border-line bg-white px-5 py-3 text-cream-ink placeholder:text-muted focus:border-lime focus:outline-none focus:ring-2 focus:ring-lime/30"
                  placeholder="Your name" data-testid="contact-name" />
              </label>
              <label className="mt-6 block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted">Email</span>
                <input type="email" required value={form.email} onChange={onChange("email")}
                  className="mt-2 w-full rounded-full border border-line bg-white px-5 py-3 text-cream-ink placeholder:text-muted focus:border-lime focus:outline-none focus:ring-2 focus:ring-lime/30"
                  placeholder="you@email.com" data-testid="contact-email" />
              </label>
              <label className="mt-6 block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted">Message</span>
                <textarea required rows={6} value={form.message} onChange={onChange("message")}
                  className="mt-2 w-full resize-y rounded-[18px] border border-line bg-white px-5 py-4 text-cream-ink placeholder:text-muted focus:border-lime focus:outline-none focus:ring-2 focus:ring-lime/30"
                  placeholder="What's on your mind?" data-testid="contact-message" />
              </label>
              <button type="submit" disabled={pending} className="btn-lime mt-8 disabled:opacity-60" data-testid="contact-submit">
                {pending ? "Sending…" : "Send message"}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <aside className="space-y-6 md:col-span-5">
            <div className="card-lift rounded-[20px] border border-line bg-white p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Direct email</p>
              <a href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 inline-flex items-center gap-2 font-display text-xl tracking-tight text-cream-ink hover:text-lime"
                data-testid="contact-direct-email">
                <Mail className="h-5 w-5" /> {CONTACT_EMAIL}
              </a>
            </div>

            <div className="card-lift rounded-[20px] border border-line bg-white p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Programmes</p>
              <p className="mt-3 text-muted">Ready to go deeper? Explore the Life Transformation Enquiry™ pathways.</p>
              <Link to="/expressions/life-transformation-enquiry"
                className="btn-lime mt-5" data-testid="contact-book-appointment">
                Explore programmes <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="card-lift rounded-[20px] border border-line bg-white p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Social</p>
              <ul className="mt-3 space-y-2 text-cream-ink/85">
                <li><a className="lime-link" href={SOCIALS.linkedin} target="_blank" rel="noreferrer">LinkedIn →</a></li>
                <li><a className="lime-link" href={SOCIALS.twitter} target="_blank" rel="noreferrer">X / Twitter →</a></li>
                <li><a className="lime-link" href={SOCIALS.instagram} target="_blank" rel="noreferrer">Instagram →</a></li>
                <li><a className="lime-link" href={SOCIALS.facebook} target="_blank" rel="noreferrer">Facebook →</a></li>
              </ul>
            </div>
          </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
