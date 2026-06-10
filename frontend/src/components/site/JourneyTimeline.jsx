import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Reveal } from "@/components/site/Reveal";

/**
 * JourneyTimeline — scroll-driven life timeline. A serpentine SVG line draws
 * itself as you scroll, crossing the centre at each milestone dot. On mobile
 * it collapses to a classic left-rail timeline.
 */

const MILESTONES = [
  {
    n: "01",
    year: "2007",
    text: "Started as a software engineer in Lagos, Nigeria — building systems for banks, learning how institutions really work from the inside out.",
  },
  {
    n: "02",
    year: "2014",
    text: "Rose to Lead Digital Transformation Manager at Union Bank of Nigeria — automating 200+ processes and generating $15M+ in measurable savings.",
  },
  {
    n: "03",
    year: "2019",
    text: "Completed a PhD in Information Systems. Relocated to the UK. Joined De Montfort University and secured £3M+ in research funding across EU Horizon and UK national programmes.",
  },
  {
    n: "04",
    year: "2024",
    text: "Published two Springer books on Generative AI. Launched LTE™ to 600+ participants. One mission in focus — one million lives transformed by 2035.",
  },
];

// The curve crosses x=50 at each milestone's vertical centre (12.5% + i*25%).
const CURVE =
  "M50,0 C68,4 68,9 50,12.5 C32,16 32,33 50,37.5 C68,42 68,58 50,62.5 C32,67 32,83 50,87.5 C61,90.5 61,96 50,100";

export function JourneyTimeline() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 65%"],
  });
  const drawn = useSpring(scrollYProgress, { stiffness: 70, damping: 22 });

  return (
    <section
      className="lime-corner-glow relative overflow-hidden border-t border-line py-24 md:py-32"
      data-testid="journey-timeline"
    >
      <div className="container-page">
        {/* Heading */}
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <span className="mx-auto block h-3 w-3 bg-lime" aria-hidden />
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-5 max-w-[200px] text-sm leading-relaxed text-ink/80">
              The Journey That Built the Framework
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <span className="mx-auto mt-5 block h-14 w-px bg-lime/70" aria-hidden />
          </Reveal>
          <Reveal delay={0.18}>
            <h2 className="mt-10 max-w-3xl">
              Two decades. Three continents.{" "}
              <span className="font-display-italic text-lime">One consistent mission.</span>
            </h2>
          </Reveal>
        </div>

        {/* Timeline */}
        <div ref={ref} className="relative mx-auto mt-20 max-w-4xl">
          {/* Serpentine line — desktop */}
          <svg
            className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d={CURVE}
              fill="none"
              stroke="rgba(188, 234, 62, 0.12)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <motion.path
              d={CURVE}
              fill="none"
              stroke="rgba(188, 234, 62, 0.7)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              style={{ pathLength: drawn }}
            />
          </svg>

          {/* Milestone dots on the curve — desktop */}
          {MILESTONES.map((m, i) => (
            <motion.span
              key={m.year}
              className="absolute left-1/2 z-10 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime shadow-[0_0_18px_rgba(188,234,62,0.65)] md:block"
              style={{ top: `${12.5 + i * 25}%` }}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden
            />
          ))}

          {/* Mobile rail */}
          <span
            className="absolute left-[5px] top-0 h-full w-px bg-gradient-to-b from-lime/70 via-lime/25 to-transparent md:hidden"
            aria-hidden
          />

          {/* Rows */}
          {MILESTONES.map((m, i) => {
            const contentRight = i % 2 === 0;
            return (
              <div
                key={m.year}
                className="relative grid grid-cols-1 pb-14 pl-8 last:pb-0 md:min-h-[260px] md:grid-cols-2 md:items-center md:gap-24 md:pb-0 md:pl-0"
                data-testid={`journey-milestone-${m.year}`}
              >
                {/* Mobile dot */}
                <span
                  className="absolute left-0 top-2 h-[11px] w-[11px] rounded-full bg-lime shadow-[0_0_14px_rgba(188,234,62,0.6)] md:hidden"
                  aria-hidden
                />

                {/* Faint index number — opposite side (desktop only) */}
                <div
                  className={`hidden md:flex ${
                    contentRight ? "justify-end pr-16 md:order-1" : "justify-start pl-16 md:order-2"
                  }`}
                  aria-hidden
                >
                  <span className="font-display text-5xl font-bold tracking-tight text-ink/10">
                    {m.n}
                  </span>
                </div>

                {/* Content */}
                <Reveal
                  className={
                    contentRight
                      ? "md:order-2 md:pl-16"
                      : "md:order-1 md:pr-16 md:text-right"
                  }
                >
                  <h3 className="font-display text-4xl font-bold tracking-tight text-ink/85 md:text-5xl">
                    {m.year}
                  </h3>
                  <p className={`mt-4 max-w-sm text-muted ${contentRight ? "" : "md:ml-auto"}`}>
                    {m.text}
                  </p>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
