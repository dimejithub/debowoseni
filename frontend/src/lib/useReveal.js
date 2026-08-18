import { useEffect, useRef } from "react";

/**
 * Reveal-on-scroll. Attach the returned ref to a container; every child marked
 * with `data-reveal` fades and rises in as it scrolls into view, on any device
 * (it's scroll-driven, not hover-driven). Elements already in view on load
 * reveal immediately. Honours prefers-reduced-motion via the CSS in index.css,
 * and no-ops gracefully where IntersectionObserver is unavailable.
 *
 *   const ref = useReveal();
 *   <ul ref={ref}>{items.map((x, i) =>
 *     <li key={x.id} data-reveal style={{ "--reveal-delay": `${i * 60}ms` }}>…</li>
 *   )}</ul>
 */
export function useReveal(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.setAttribute("data-reveal", "in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
