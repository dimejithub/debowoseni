/* Navbar uses minimal state — scroll behaviour is class-toggled via a ref. */

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import { LOGO, SYSTEME_BOOKING_URL } from "../../lib/data";

/**
 * Nav items. Items with `children` render as a dropdown. Children use either
 * `to` (internal route) or `href` (external link). For Expressions, the
 * destination URLs are placeholders (`#`) until Debo provides the real
 * landing pages or external programme URLs.
 */
const NAV_LINKS = [
  { to: "/about", label: "About" },
  { to: "/books", label: "Books" },
  {
    label: "Expressions",
    children: [
      { label: "Life Transformation Enquiry™", to: "/expressions/life-transformation-enquiry" },
      { label: "Academic Research Insight™", href: "#" },
      { label: "Marriage 101: Back2Basics", href: "#" },
      { label: "The Enquiry", href: "#" },
    ],
  },
  { to: "/publications", label: "Publications" },
  { to: "/events", label: "Events" },
  { to: "/journal", label: "Resources" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const { pathname } = useLocation();
  const close = () => setOpen(false);

  void pathname;

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
        <Link to="/" className="group inline-flex items-center gap-2.5" data-testid="nav-logo">
          <img
            src={LOGO.primary}
            alt="debowoseni"
            className="h-9 w-9 rounded-md transition-transform group-hover:scale-105"
            loading="eager"
          />
          <span className="hidden font-display text-base font-bold tracking-tight text-ink md:inline">
            debowoseni
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex xl:gap-3" data-testid="nav-links">
          {NAV_LINKS.map((l) =>
            l.children ? (
              <NavDropdown key={l.label} item={l} />
            ) : (
              <NavItem key={l.to} item={l} />
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/contact"
            className="!hidden btn-lime lg:!inline-flex"
            data-testid="book-appointment-cta"
          >
            Book Appointment
            <ArrowUpRight className="h-4 w-4" />
          </Link>

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
              className="container-page mt-6 flex flex-col gap-5 overflow-y-auto pb-12"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
              }}
            >
              {NAV_LINKS.map((l) =>
                l.children ? (
                  <motion.li
                    key={l.label}
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  >
                    <span className="block font-display text-4xl tracking-tight text-ink/60">
                      {l.label}
                    </span>
                    <ul className="mt-3 ml-5 flex flex-col gap-3 border-l border-line pl-5">
                      {l.children.map((c) => (
                        <li key={c.label}>
                          {c.to ? (
                            <Link
                              to={c.to}
                              onClick={close}
                              className="block font-display text-2xl tracking-tight text-ink hover:text-lime"
                              data-testid={`mobile-expression-${slug(c.label)}`}
                            >
                              {c.label}
                            </Link>
                          ) : (
                            <a
                              href={c.href || "#"}
                              target={c.href && c.href.startsWith("http") ? "_blank" : undefined}
                              rel={c.href && c.href.startsWith("http") ? "noreferrer noopener" : undefined}
                              onClick={close}
                              className="block font-display text-2xl tracking-tight text-ink hover:text-lime"
                              data-testid={`mobile-expression-${slug(c.label)}`}
                            >
                              {c.label}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </motion.li>
                ) : (
                  <motion.li
                    key={l.to}
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  >
                    <Link
                      to={l.to}
                      onClick={close}
                      className="block font-display text-4xl tracking-tight text-ink hover:text-lime"
                      data-testid={`mobile-link-${l.label.toLowerCase()}`}
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                )
              )}
              <motion.li
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="mt-4"
              >
                <Link
                  to="/contact"
                  onClick={close}
                  className="btn-lime"
                  data-testid="mobile-book-appointment"
                >
                  Book Appointment <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function NavItem({ item }) {
  return (
    <NavLink
      to={item.to}
      data-testid={`nav-link-${item.label.toLowerCase()}`}
      data-cursor="hover"
      className={({ isActive }) =>
        `nav-link group relative inline-flex items-center px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? "is-active text-lime" : "text-ink/85 hover:text-ink"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative overflow-hidden">
            <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
              {item.label}
            </span>
            <span
              aria-hidden
              className="absolute inset-0 inline-block translate-y-full text-lime transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
            >
              {item.label}
            </span>
          </span>
          {isActive && (
            <motion.span
              layoutId="nav-active-dot"
              className="ml-1.5 h-1.5 w-1.5 rounded-full bg-lime"
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
            />
          )}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-lime transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
          />
        </>
      )}
    </NavLink>
  );
}

function NavDropdown({ item }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid={`nav-dropdown-${item.label.toLowerCase()}`}
    >
      <button
        type="button"
        data-cursor="hover"
        className="nav-link group relative inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-ink/85 transition-colors hover:text-ink"
        aria-expanded={hovered}
        aria-haspopup="true"
      >
        <span className="relative overflow-hidden">
          <span
            className={`inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              hovered ? "-translate-y-full" : ""
            }`}
          >
            {item.label}
          </span>
          <span
            aria-hidden
            className={`absolute inset-0 inline-block text-lime transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              hovered ? "translate-y-0" : "translate-y-full"
            }`}
          >
            {item.label}
          </span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-300 ${
            hovered ? "rotate-180 text-lime" : ""
          }`}
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute bottom-1 left-3 right-6 h-px origin-left bg-lime transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            hovered ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </button>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
            data-testid="nav-dropdown-panel"
          >
            <div className="w-[340px] overflow-hidden rounded-2xl border border-line bg-black p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)]">
              {item.children.map((c) => {
                const rowClass =
                  "group/item relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm text-ink/85 transition-colors duration-300 hover:text-bg";
                const inner = (
                  <>
                    {/* sliding lime background fill */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-lime transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:scale-x-100"
                    />
                    {/* leading lime bar indicator (always visible at low opacity) */}
                    <span
                      aria-hidden
                      className="relative z-10 h-4 w-[2px] origin-center rounded bg-lime/60 transition-all duration-300 group-hover/item:bg-bg group-hover/item:h-5"
                    />
                    <span className="relative z-10 flex-1">{c.label}</span>
                    <ArrowUpRight className="relative z-10 h-4 w-4 opacity-50 transition-all duration-300 group-hover/item:opacity-100 group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5" />
                  </>
                );
                return c.to ? (
                  <Link
                    key={c.label}
                    to={c.to}
                    data-cursor="hover"
                    className={rowClass}
                    data-testid={`nav-expression-${slug(c.label)}`}
                  >
                    {inner}
                  </Link>
                ) : (
                  <a
                    key={c.label}
                    href={c.href || "#"}
                    data-cursor="hover"
                    className={rowClass}
                    data-testid={`nav-expression-${slug(c.label)}`}
                  >
                    {inner}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
