/* ==========================================================================
   KINETIC TYPOGRAPHY — reusable primitives
   --------------------------------------------------------------------------
   Composable building blocks for the Kinetic aesthetic. All styling lives in
   kinetic.css under the `.kt` scope; these components just apply the helper
   classes so pages stay declarative and free of one-off styles.
   ========================================================================== */
import { forwardRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";

/* --- Button --------------------------------------------------------------
   Variants map 1:1 to the .kt-btn-- classes. Renders <a>, <button>, or any
   `as` element (e.g. react-router Link) so it drops into existing routing. */
export const KtButton = forwardRef(function KtButton(
  { as: Comp = "button", variant = "accent", size = "md", className, children, ...props },
  ref
) {
  return (
    <Comp
      ref={ref}
      className={cn(
        "kt-btn",
        variant === "accent" && "kt-btn--accent",
        variant === "outline" && "kt-btn--outline",
        variant === "ghost" && "kt-btn--ghost",
        size === "lg" && "kt-btn--lg",
        size === "sm" && "kt-btn--sm",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
});

/* --- Hover-inversion card ------------------------------------------------ */
export function KtCard({ className, children, ...props }) {
  return (
    <div className={cn("kt-card", className)} {...props}>
      {children}
    </div>
  );
}

/* --- Marquee -------------------------------------------------------------
   Infinite horizontal scroll. Content is duplicated so a -50% translate loops
   seamlessly. `speed` is a Tailwind-free seconds value; lower = faster. The
   duplicated set is aria-hidden so screen readers announce the items once. */
export function KtMarquee({
  children,
  speed = 24,
  className,
  reverse = false,
  accent = false,
}) {
  const items = Array.isArray(children) ? children : [children];
  const renderSet = (hidden) =>
    items.map((item, i) => (
      <span key={`${hidden ? "b" : "a"}-${i}`} aria-hidden={hidden || undefined} className="flex items-center">
        {item}
      </span>
    ));
  return (
    <div
      className={cn("overflow-hidden", accent && "bg-[var(--kt-accent)] text-[var(--kt-accent-fg)]", className)}
    >
      <div
        className="kt-marquee-track"
        style={{
          "--kt-marquee-duration": `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <div className="flex shrink-0">{renderSet(false)}</div>
        <div className="flex shrink-0">{renderSet(true)}</div>
      </div>
    </div>
  );
}

/* --- Noise overlay ------------------------------------------------------- */
export function KtNoise() {
  return <div aria-hidden className="kt-noise" />;
}

/* --- Massive decorative number ------------------------------------------
   Oversized numerals used as graphic shapes, not read as content. */
export function KtGiantNumber({ children, className, ...props }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "kt-display block text-[6rem] leading-[0.75] md:text-[8rem] lg:text-[12rem] text-[var(--kt-muted)] select-none",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* --- Scroll/entrance reveal ---------------------------------------------
   Thin framer-motion wrapper matching the site's Reveal ergonomics but tuned
   for Kinetic (snappier, larger travel). Respects reduced-motion. */
export function KtReveal({ children, className, delay = 0, y = 40 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <MotionDiv className={className} delay={delay} y={y}>
      {children}
    </MotionDiv>
  );
}

function MotionDiv({ children, className, delay, y }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
