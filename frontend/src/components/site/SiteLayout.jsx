import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Grain } from "./Grain";
import { ScrollProgress } from "./ScrollProgress";
import { CustomCursor } from "./CustomCursor";
import { CookieConsent } from "./CookieConsent";

export function SiteLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="relative min-h-screen bg-bg text-ink">
      <Grain />
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <main className="pt-16 md:pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
