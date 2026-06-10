import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";

/**
 * Smart Watch Debo' modal:
 * - If url is a YouTube watch/embed URL → embed
 * - Otherwise show a styled card linking out to the YouTube channel
 */
function toEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.pathname === "/watch" && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return url;
    }
    if (u.hostname.includes("vimeo.com") && /^\/\d+/.test(u.pathname)) {
      return `https://player.vimeo.com/video/${u.pathname.slice(1)}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function VideoModal({ open, onClose, url, channelUrl }) {
  const embed = toEmbed(url);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-bg/85 backdrop-blur-md p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-testid="video-modal"
        >
          <motion.div
            className="relative w-full max-w-4xl"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-12 right-0 inline-flex items-center gap-2 text-muted hover:text-lime transition"
              data-testid="video-modal-close"
            >
              <X className="h-5 w-5" /> Close
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-[20px] border border-line bg-surface">
              {embed ? (
                <iframe
                  title="Watch Debo'"
                  src={embed}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 p-10 text-center">
                  <div className="lime-glow-soft absolute inset-0" aria-hidden />
                  <span className="relative font-script text-7xl text-lime">live</span>
                  <p className="relative max-w-md text-muted">
                    Catch the latest streams &amp; keynotes on Debo&apos;s YouTube channel.
                  </p>
                  <a
                    href={channelUrl || url || "https://www.youtube.com"}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-lime relative"
                    data-testid="video-modal-channel-link"
                  >
                    Watch on YouTube <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
