import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Contact,
  FileText,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Moon,
  Newspaper,
  Quote,
  Send,
  Sun,
  SunMoon,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAdminTheme } from "@/components/admin/AdminThemeLayout";

// Day/night control. Cycles Auto → Light → Dark; Auto follows the time of day.
const THEME_CYCLE = { auto: "light", light: "dark", dark: "auto" };
const THEME_META = {
  auto: { Icon: SunMoon, label: "Auto theme" },
  light: { Icon: Sun, label: "Light theme" },
  dark: { Icon: Moon, label: "Dark theme" },
};

// Sidebar navigation, grouped so it reads as two jobs — publishing the site,
// and running the audience.
const NAV_GROUPS = [
  {
    label: "Content",
    items: [
      { to: "/admin/posts", label: "Journal", Icon: FileText },
      { to: "/admin/testimonials", label: "Testimonials", Icon: Quote },
      { to: "/admin/books", label: "Books", Icon: BookOpen },
      { to: "/admin/publications", label: "Publications", Icon: GraduationCap },
      { to: "/admin/events", label: "Events", Icon: Calendar },
    ],
  },
  {
    label: "Audience & mail",
    items: [
      { to: "/admin/people", label: "People", Icon: Contact },
      { to: "/admin/registrations", label: "Registrations", Icon: Users },
      { to: "/admin/enquiries", label: "Enquiries", Icon: Inbox },
      { to: "/admin/emails", label: "Emails", Icon: Send },
      { to: "/admin/newsletter", label: "Newsletter", Icon: Newspaper },
      { to: "/admin/automations", label: "Automations", Icon: Workflow },
      { to: "/admin/subscribers", label: "Subscribers", Icon: Mail },
    ],
  },
];

// A route counts as active for its nav item when it's an exact match, or a
// sub-route of it (so /admin/emails/new keeps "Emails" highlighted).
function isActive(pathname, to) {
  if (to === "/admin") return pathname === "/admin";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavItem({ to, label, Icon, active, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        active
          ? "bg-lime/20 font-semibold text-ink"
          : "text-muted hover:bg-lime/10 hover:text-ink"
      }`}
    >
      <span
        className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
          active ? "bg-lime text-bg" : "bg-bg text-muted group-hover:text-lime"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      {label}
    </Link>
  );
}

export function AdminSidebar({ open, onClose, pathname }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { pref, setPref } = useAdminTheme();
  const theme = THEME_META[pref] || THEME_META.auto;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        data-testid="cms-sidebar"
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Link to="/admin" className="font-display text-base tracking-tight text-ink" onClick={onClose}>
            debo owoseni<span className="text-lime">.</span>
          </Link>
          <button className="text-muted hover:text-ink md:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <NavItem to="/admin" label="Dashboard" Icon={LayoutDashboard} active={isActive(pathname, "/admin")} onNavigate={onClose} />
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted/70">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem key={item.to} {...item} active={isActive(pathname, item.to)} onNavigate={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-line px-3 py-3">
          <button
            onClick={() => setPref(THEME_CYCLE[pref] || "auto")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-lime/10 hover:text-ink"
            data-testid="admin-theme-toggle"
            title="Auto follows the time of day"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-bg text-muted">
              <theme.Icon className="h-4 w-4" />
            </span>
            {theme.label}
          </button>
          <button
            onClick={async () => { await signOut(); navigate("/admin/login"); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-lime/10 hover:text-ink"
            data-testid="admin-signout"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-bg text-muted">
              <LogOut className="h-4 w-4" />
            </span>
            Sign out
          </button>
          <Link to="/" className="block px-3 py-1 text-xs text-muted hover:text-lime">
            ← Back to the public site
          </Link>
        </div>
      </aside>
    </>
  );
}
