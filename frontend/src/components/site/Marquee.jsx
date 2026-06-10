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

/**
 * ImageMarquee — slow horizontal scroll of images, perfect for event galleries.
 * Pauses on hover so visitors can catch a glimpse.
 */
export function ImageMarquee({
  images = [],
  duration = 60,
  width = 320,
  aspect = "aspect-[4/5]",
  testId = "image-marquee",
}) {
  if (!images.length) return null;
  // Duplicate the stream so the loop is seamless (50% translate completes one set)
  const stream = [...images, ...images];
  return (
    <div
      className="marquee-mask group relative overflow-hidden"
      data-testid={testId}
    >
      <div
        className="flex w-max items-center gap-5 py-4 group-hover:[animation-play-state:paused]"
        style={{ animation: `marquee-x ${duration}s linear infinite` }}
      >
        {stream.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`card-lift relative ${aspect} overflow-hidden rounded-[18px] border border-line bg-surface`}
            style={{ width }}
            data-testid={`marquee-tile-${i}`}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
