import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Instagram, Linkedin, Youtube } from "lucide-react";
import { CONTACT_EMAIL, LOGO, SOCIALS } from "../../lib/data";
import { subscribeNewsletter } from "../../lib/api";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setPending(true);
    try {
      await subscribeNewsletter(email);
      toast.success("You're on the list.", {
        description: "Thoughts at the intersection of faith, knowledge and purpose.",
      });
      setEmail("");
    } catch (err) {
      toast.error("Couldn't subscribe", {
        description: "Please try again in a moment.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <footer
      data-testid="site-footer"
      className="relative border-t border-line bg-bg pt-20 pb-10"
    >
      <div className="container-page">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5" data-testid="footer-logo">
              <img
                src={LOGO.primary}
                alt="debowoseni"
                className="h-9 w-9 rounded-md"
                loading="lazy"
              />
              <span className="font-display text-base font-bold tracking-tight text-ink">
                debowoseni
              </span>
            </Link>
            <p className="mt-5 max-w-md italic text-ink/85">
              A mission to catalyse transformation in{" "}
              <span className="text-lime">one million lives</span> by 2035.
            </p>

            <form
              onSubmit={onSubmit}
              className="mt-8 flex w-full max-w-md items-center gap-2 rounded-full border border-line bg-surface px-2 py-2"
              data-testid="newsletter-form"
            >
              <input
                type="email"
                required
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent px-4 text-sm text-ink placeholder:text-muted focus:outline-none"
                data-testid="newsletter-email-input"
              />
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-bg transition-all disabled:opacity-60"
                data-testid="newsletter-submit"
              >
                {pending ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          </div>

          <div className="md:col-span-3">
            <h4 className="mb-4 text-xs uppercase tracking-[0.18em] text-muted">Explore</h4>
            <ul className="space-y-3 text-ink/85">
              <li><Link to="/about" className="lime-link">About</Link></li>
              <li><Link to="/books" className="lime-link">Books</Link></li>
              <li><Link to="/publications" className="lime-link">Publications</Link></li>
              <li><Link to="/articles" className="lime-link">Blogs</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="mb-4 text-xs uppercase tracking-[0.18em] text-muted">Connect</h4>
            <ul className="space-y-3 text-ink/85">
              <li><Link to="/contact" className="lime-link">Contact</Link></li>
              <li>
                <Link
                  to="/contact"
                  className="lime-link inline-flex items-center gap-1"
                  data-testid="footer-book-appointment"
                >
                  Book Appointment <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="lime-link">
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <SocialIcon href={SOCIALS.linkedin} label="LinkedIn"><Linkedin className="h-4 w-4" /></SocialIcon>
              <SocialIcon href={SOCIALS.instagram} label="Instagram"><Instagram className="h-4 w-4" /></SocialIcon>
              <SocialIcon href={SOCIALS.youtube} label="YouTube"><Youtube className="h-4 w-4" /></SocialIcon>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-line pt-8 text-sm text-muted md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Debo&apos; Owoseni. All rights reserved.</p>
          <p className="text-xs">
            Built with Care by Dimedia
          </p>
        </div>
      </div>

      {/* Oversized wordmark — brand presence across the foot of the page */}
      <div
        className="pointer-events-none mt-12 select-none overflow-hidden"
        aria-hidden
        data-testid="footer-wordmark"
      >
        <p className="font-display block w-full whitespace-nowrap text-center text-[19vw] leading-[0.85] tracking-[-0.06em] text-ink/90">
          debowoseni<span className="text-lime">.</span>
        </p>
      </div>
    </footer>
  );
}

function SocialIcon({ href, children, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-lime hover:text-lime"
    >
      {children}
    </a>
  );
}
