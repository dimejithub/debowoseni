import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

/**
 * Shared chrome for every authenticated admin page. On desktop: a persistent
 * left sidebar and a content column offset to clear it. On phones: the sidebar
 * collapses behind a single, consistent top app bar (hamburger + brand) that
 * every page shares, so navigation is the same everywhere. Pages still render
 * their own body and headers into the <Outlet/>; on mobile those per-page
 * headers scroll with the content (see `.admin-content header` in index.css) so
 * they don't fight the sticky app bar.
 */
export function AdminShell() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-bg">
      <AdminSidebar open={open} onClose={() => setOpen(false)} pathname={pathname} />

      {/* Mobile top app bar — the one consistent way to reach navigation on
          phones. Hidden on desktop, where the sidebar is always visible. Brand
          on the left, menu button on the right, mirroring the public site's
          navbar so the two feel like one product. */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur md:hidden">
        <span className="font-display text-sm tracking-tight text-ink">
          debo owoseni<span className="text-lime">.</span>
        </span>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="admin-content md:pl-64">
        <Outlet />
      </div>
    </div>
  );
}
