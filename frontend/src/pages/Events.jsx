import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { FALLBACK_EVENTS } from "@/lib/data";
import { getPublishedEvents } from "@/lib/api";

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { return ""; }
}

export default function Events() {
  const [events, setEvents] = useState(FALLBACK_EVENTS);

  useEffect(() => {
    let active = true;
    getPublishedEvents().then((e) => active && e.length && setEvents(e)).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <div data-testid="events-page">
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[40vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <Reveal><p className="text-xs uppercase tracking-[0.24em] text-muted">Past &amp; Live Events</p></Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-4xl">
              Rooms where <span className="font-display-italic text-lime">transformation</span> happens.
            </h1>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-6 max-w-2xl text-lg text-ink/85">
              Keynotes, LTE Live cohorts, and workshops — moments where the work moves from
              page to person.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page pb-24 space-y-20">
        {events.map((ev, idx) => (
          <Reveal key={ev.id || ev.slug}>
            <article
              className="rounded-[20px] border border-line bg-surface p-6 md:p-10"
              data-testid={`event-${ev.slug || idx}`}
            >
              <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
                <div className="md:col-span-5">
                  <h2 className="text-3xl md:text-4xl">{ev.title}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                    {ev.event_date && <span>{formatDate(ev.event_date)}</span>}
                    {ev.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {ev.location}
                      </span>
                    )}
                  </div>
                  {ev.description && (
                    <p className="mt-6 text-ink/85">{ev.description}</p>
                  )}
                </div>
                <div className="md:col-span-7">
                  <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {(ev.gallery || []).slice(0, 6).map((src, i) => (
                      <StaggerItem key={src + i}>
                        <div className="card-lift overflow-hidden rounded-[14px] border border-line">
                          <img src={src} alt="" loading="lazy"
                            className="aspect-square w-full object-cover transition duration-700 hover:scale-105" />
                        </div>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              </div>
            </article>
          </Reveal>
        ))}

        {events.length === 0 && (
          <div className="rounded-[20px] border border-line bg-surface px-8 py-16 text-center" data-testid="events-empty">
            <span className="font-script text-5xl text-lime">soon</span>
            <p className="mt-3 text-muted">New events will appear here as they are scheduled.</p>
          </div>
        )}
      </section>
    </div>
  );
}
