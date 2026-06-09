import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function VideoModal({ open, onClose, url }) {
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
              {url ? (
                <iframe
                  title="Watch Debo'"
                  src={url}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-10 text-center">
                  <span className="font-script text-5xl text-lime">soon</span>
                  <p className="text-muted">
                    The video will live here. [Debo to supply URL — replace
                    REACT_APP_VIDEO_URL]
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
