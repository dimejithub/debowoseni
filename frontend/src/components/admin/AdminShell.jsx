import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

/**
 * Shared chrome for every authenticated admin page: a persistent left sidebar
 * (slide-in on mobile) plus a content column offset to clear it. Each page
 * renders its own body into the <Outlet/>, so pages keep their existing headers
 * and actions — this only adds the navigation around them.
 */
export function AdminShell() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-bg">
      <AdminSidebar open={open} onClose={() => setOpen(false)} pathname={pathname} />

      {/* Mobile menu button. A floating control in the corner keeps it clear of
          each page's own header (which sits at the top edge). Hidden on desktop,
          where the sidebar is always visible. */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed bottom-5 left-5 z-[60] grid h-12 w-12 place-items-center rounded-full border border-line bg-surface text-ink shadow-lg md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="md:pl-64">
        <Outlet />
      </div>
    </div>
  );
}
