/* Navbar uses minimal state — scroll behaviour is class-toggled via a ref. */

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight, ChevronDown, Instagram, Linkedin, Youtube } from "lucide-react";
import { LOGO, SOCIALS } from "../../lib/data";

/**
 * Nav items. Items with `children` render as a dropdown. Children use either
 * `to` (internal route) or `href` (external link). For Expressions, the
 * destination URLs are placeholders (`#`) until Debo provides the real
 * landing pages or external programme URLs.
 */
const NAV_LINKS = [
  { to: "/about", label: "About" },
  {
    label: "Expressions",
    children: [
      { label: "Life Transformation Enquiry™", to: "/expressions/life-transformation-enquiry" },
      { label: "Academic Research Insight™", to: "/expressions/academic-research-insight" },
      { label: "Marriage 101: Back2Basics", to: "/expressions/marriage-101" },
      { label: "The Enquiry", to: "/expressions/the-enquiry" },
    ],
  },
  {
    label: "Resources",
    children: [
      { label: "Books", to: "/books" },
      { label: "Publications", to: "/publications" },
      { label: "Blogs", to: "/articles" },
    ],
  },
  { to: "/events", label: "Events" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [openKey, setOpenKey] = useState(null);
  const headerRef = useRef(null);
  const { pathname } = useLocation();
  const close = () => {
    setOpen(false);
    setOpenKey(null);
  };

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

        <nav className="hidden items-center gap-5 lg:flex xl:gap-7" data-testid="nav-links">
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
            className="fixed inset-0 z-[60] flex flex-col bg-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            data-testid="mobile-menu"
          >
            <div className="lime-corner-glow pointer-events-none absolute inset-x-0 top-0 h-44" aria-hidden />

            {/* Header — mirrors the navbar */}
            <div className="container-page relative flex h-16 shrink-0 items-center justify-between md:h-20">
              <Link to="/" onClick={close} className="inline-flex items-center gap-2.5" data-testid="mobile-menu-logo">
                <img src={LOGO.primary} alt="debowoseni" className="h-8 w-8 rounded-md" />
                <span className="font-display text-base font-bold tracking-tight text-ink">debowoseni</span>
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink"
                data-testid="nav-menu-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links */}
            <motion.nav
              className="container-page relative mt-2 flex-1 overflow-y-auto"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
              }}
            >
              <ul className="flex flex-col">
                {NAV_LINKS.map((l, i) => {
                  const idx = String(i + 1).padStart(2, "0");
                  const rowVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
                  if (!l.children) {
                    return (
                      <motion.li key={l.to} variants={rowVariants} className="border-b border-line/70">
                        <Link
                          to={l.to}
                          onClick={close}
                          className="flex items-center justify-between py-4"
                          data-testid={`mobile-link-${l.label.toLowerCase()}`}
                        >
                          <span className="font-display text-2xl tracking-tight text-ink">{l.label}</span>
                          <span className="font-display text-xs text-muted">{idx}</span>
                        </Link>
                      </motion.li>
                    );
                  }
                  const isOpen = openKey === l.label;
                  const key = slug(l.label);
                  return (
                    <motion.li key={l.label} variants={rowVariants} className="border-b border-line/70">
                      <button
                        type="button"
                        onClick={() => setOpenKey((k) => (k === l.label ? null : l.label))}
                        className="flex w-full items-center justify-between py-4 text-left"
                        aria-expanded={isOpen}
                        data-testid={`mobile-${key}-toggle`}
                      >
                        <span className="font-display text-2xl tracking-tight text-ink">{l.label}</span>
                        <span className="flex items-center gap-3">
                          <span className="font-display text-xs text-muted">{idx}</span>
                          <ChevronDown
                            className={`h-5 w-5 text-lime transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                          />
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                            data-testid={`mobile-${key}-list`}
                          >
                            {l.children.map((c) => (
                              <li key={c.label} className="pb-1 last:pb-4">
                                {c.to ? (
                                  <Link
                                    to={c.to}
                                    onClick={close}
                                    className="flex items-center gap-3 py-2 text-base text-ink/85 hover:text-lime"
                                    data-testid={`mobile-${key}-${slug(c.label)}`}
                                  >
                                    <span className="h-4 w-[2px] rounded bg-lime/70" aria-hidden />
                                    {c.label}
                                  </Link>
                                ) : (
                                  <a
                                    href={c.href || "#"}
                                    onClick={close}
                                    className="flex items-center gap-3 py-2 text-base text-ink/85 hover:text-lime"
                                    data-testid={`mobile-${key}-${slug(c.label)}`}
                                  >
                                    <span className="h-4 w-[2px] rounded bg-lime/70" aria-hidden />
                                    {c.label}
                                  </a>
                                )}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.nav>

            {/* Footer — CTA + socials */}
            <motion.div
              className="container-page relative shrink-0 border-t border-line py-5 pb-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <Link
                to="/contact"
                onClick={close}
                className="btn-lime w-full justify-center"
                data-testid="mobile-book-appointment"
              >
                Book Appointment <ArrowUpRight className="h-4 w-4" />
              </Link>
              <div className="mt-5 flex items-center justify-center gap-6">
                <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" className="text-muted hover:text-lime" data-testid="mobile-social-linkedin">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href={SOCIALS.instagram} target="_blank" rel="noreferrer noopener" aria-label="Instagram" className="text-muted hover:text-lime" data-testid="mobile-social-instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href={SOCIALS.youtube} target="_blank" rel="noreferrer noopener" aria-label="YouTube" className="text-muted hover:text-lime" data-testid="mobile-social-youtube">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
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
