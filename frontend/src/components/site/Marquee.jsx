import { ArrowRight } from "lucide-react";

function MarqueeItem({ text, dark, icon }) {
  return (
    <span
      className={`flex items-center gap-6 px-6 text-[clamp(1.5rem,2.5vw,2.25rem)] font-display font-medium uppercase tracking-[-0.02em] whitespace-nowrap ${
        dark ? "text-bg" : "text-ink"
      }`}
    >
      <span>{text}</span>
      {icon && <ArrowRight className="h-6 w-6 opacity-80" />}
    </span>
  );
}

export function Marquee({ items = [], speed = "marquee-x", icon = true, dark = false }) {
  const stream = [...items, ...items];
  return (
    <div className={`overflow-hidden ${dark ? "bg-lime" : ""} py-5`}>
      <div className={`flex w-max animate-${speed}`}>
        {stream.map((t, i) => (
          <MarqueeItem key={`${t}-${i}`} text={t} dark={dark} icon={icon} />
        ))}
      </div>
    </div>
  );
}

export function LogoMarquee({ logos }) {
  const stream = [...logos, ...logos];
  return (
    <div className="marquee-mask overflow-hidden">
      <div className="flex w-max animate-marquee-x items-center gap-16 py-2">
        {stream.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            className="h-10 w-auto opacity-50 grayscale transition hover:opacity-90 hover:grayscale-0"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
