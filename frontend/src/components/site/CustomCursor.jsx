import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * CustomCursor — minimal lime dot + soft outer ring that follows the mouse.
 *
 * Behaviour:
 *  • Dot follows pointer 1:1, ring trails with spring physics for a "tail".
 *  • Ring grows + tints lime when hovering interactive elements
 *    (anchor, button, [role="button"], [data-cursor="hover"], inputs).
 *  • Hidden on touch / coarse-pointer devices (CSS media query).
 *  • Hides while the OS cursor leaves the window.
 *
 * Mounted once at the app shell. The native cursor is also hidden via CSS
 * (`body { cursor: none }`) so this becomes the cursor itself.
 */
export function CustomCursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 320, damping: 28, mass: 0.4 });
  const ringY = useSpring(dotY, { stiffness: 320, damping: 28, mass: 0.4 });

  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [supportsFine] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(pointer: fine)").matches;
  });

  useEffect(() => {
    if (!supportsFine) return undefined;

    const move = (e) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      setVisible(true);
    };
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    // Detect interactive targets at the current mouse position
    const over = (e) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      const interactive = el.closest(
        'a, button, [role="button"], [data-cursor="hover"], input, textarea, select, label'
      );
      setHover(Boolean(interactive));
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseleave", leave);
    window.addEventListener("mouseenter", enter);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    document.body.classList.add("has-custom-cursor");
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseleave", leave);
      window.removeEventListener("mouseenter", enter);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [dotX, dotY, supportsFine]);

  if (!supportsFine) return null;

  return (
    <>
      {/* outer ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-5 -mt-5 hidden h-10 w-10 rounded-full border md:block"
        style={{
          x: ringX,
          y: ringY,
          borderColor: hover ? "rgba(188,234,62,0.95)" : "rgba(255,255,255,0.55)",
          backgroundColor: hover ? "rgba(188,234,62,0.10)" : "transparent",
          opacity: visible ? 1 : 0,
          transition: "border-color 220ms ease, background-color 220ms ease, opacity 200ms ease",
          mixBlendMode: hover ? "normal" : "difference",
        }}
        animate={{
          scale: hover ? 1.7 : pressed ? 0.75 : 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
      />
      {/* inner dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-1 -mt-1 hidden h-2 w-2 rounded-full bg-lime md:block"
        style={{
          x: dotX,
          y: dotY,
          opacity: visible ? 1 : 0,
          boxShadow: "0 0 18px rgba(188,234,62,0.55)",
        }}
        animate={{ scale: hover ? 0 : pressed ? 0.6 : 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 24 }}
      />
    </>
  );
}
