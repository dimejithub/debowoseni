/* Navbar uses minimal state — scroll behaviour is class-toggled via a ref. */
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { SYSTEME_BOOKING_URL } from "../../lib/data";

const NAV_LINKS = [
  { to: "/about", label: "About" },
  { to: "/books", label: "Books" },
  { to: "/publications", label: "Publications" },
  { to: "/events", label: "Events" },
  { to: "/journal", label: "Journal" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const { pathname } = useLocation();
  const lastPath = useRef(pathname);

  // Close the menu whenever the route changes — done during render with a ref guard so
  // we never call setState from inside an effect.
  if (lastPath.current !== pathname) {
    lastPath.current = pathname;
    if (open) setOpen(false);
  }

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (window.scrollY > 8) el.classList.add("is-scrolled");
      else el.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      data-testid="site-navbar"
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-300 bg-transparent
        [&.is-scrolled]:bg-bg/75 [&.is-scrolled]:backdrop-blur-xl [&.is-scrolled]:border-b [&.is-scrolled]:border-line"
    >
      <div className="container-page flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="group inline-flex items-center gap-2" data-testid="nav-logo">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface font-display text-sm font-bold tracking-tight text-ink">
            do
          </span>
          <span className="hidden font-display text-base font-bold tracking-tight text-ink md:inline">
            debowoseni
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-lime" : "text-ink/85 hover:text-ink"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={SYSTEME_BOOKING_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden btn-lime md:inline-flex"
            data-testid="book-appointment-cta"
          >
            Book Appointment
            <ArrowUpRight className="h-4 w-4" />
          </a>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink lg:hidden"
            data-testid="nav-menu-button"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-bg/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-testid="mobile-menu"
          >
            <div className="container-page flex h-16 items-center justify-between md:h-20">
              <span className="font-display text-sm tracking-tight text-ink">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink"
                data-testid="nav-menu-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <motion.ul
              className="container-page mt-6 flex flex-col gap-5"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
              }}
            >
              {NAV_LINKS.map((l) => (
                <motion.li
                  key={l.to}
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                >
                  <Link
                    to={l.to}
                    className="block font-display text-4xl tracking-tight text-ink hover:text-lime"
                    data-testid={`mobile-link-${l.label.toLowerCase()}`}
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="mt-4"
              >
                <a
                  href={SYSTEME_BOOKING_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-lime"
                  data-testid="mobile-book-appointment"
                >
                  Book Appointment <ArrowUpRight className="h-4 w-4" />
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
