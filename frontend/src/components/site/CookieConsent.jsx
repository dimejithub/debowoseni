import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "do-cookie-consent";

// First-visit cookie notice. This site sets only strictly-necessary cookies and
// uses local storage to remember lightweight things (like this acknowledgement);
// there is no analytics, advertising or third-party tracking. So the banner is
// an honest, informational notice with a single acknowledgement — not a fake
// "accept tracking" prompt. If tracking is ever added, this should grow a real
// accept/reject choice before those scripts load.
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let acknowledged = false;
    try {
      acknowledged = localStorage.getItem(STORAGE_KEY) === "acknowledged";
    } catch {
      // Private mode or blocked storage — show the notice; a per-session dismiss
      // still works via component state.
    }
    if (!acknowledged) setVisible(true);
  }, []);

  const acknowledge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "acknowledged");
    } catch {
      /* storage unavailable — dismiss for this session only */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Cookie notice"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6"
          data-testid="cookie-consent"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-[20px] border border-line bg-surface/95 p-5 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:gap-6 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-lime">
                <Cookie className="h-4 w-4" />
              </span>
              <p className="text-sm leading-relaxed text-ink/85">
                We use only <span className="text-ink">essential cookies</span> to make this site
                work — no tracking, advertising or third-party analytics.{" "}
                <Link to="/professional-practice" className="lime-link" data-testid="cookie-learn-more">
                  How we handle your information
                </Link>
                .
              </p>
            </div>
            <button
              onClick={acknowledge}
              className="btn-lime shrink-0 self-stretch sm:self-auto"
              data-testid="cookie-accept"
            >
              Got it
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
