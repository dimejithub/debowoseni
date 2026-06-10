import { useEffect, useRef } from "react";

/**
 * MagneticButton — subtle Webflow-style magnetic hover on CTAs.
 * Wraps a button or anchor and translates it toward the cursor.
 */
export function MagneticButton({ as: As = "button", strength = 18, className = "", children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${(x / r.width) * strength}px, ${(y / r.height) * strength}px)`;
    };
    const onLeave = () => { el.style.transform = "translate(0,0)"; };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return (
    <As ref={ref} className={`will-change-transform transition-transform duration-300 ease-out ${className}`} {...rest}>
      {children}
    </As>
  );
}
