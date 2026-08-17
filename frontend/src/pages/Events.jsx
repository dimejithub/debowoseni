import { useEffect, useState } from "react";
import { MapPin, ArrowUpRight, Clock, Globe, Tag } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ImageMarquee } from "@/components/site/Marquee";
import { EventRegisterDialog } from "@/components/site/EventRegisterDialog";
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

function formatTime(t) {
  if (!t) return "";
  const parts = String(t).split(":");
  const h = Number(parts[0]);
  if (Number.isNaN(h)) return t;
  const m = Number(parts[1] || 0);
  const ap = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${String(m).padStart(2, "0")} ${ap}`;
}

function timeLabel(ev) {
  const s = formatTime(ev.start_time), e = formatTime(ev.end_time);
  if (s && e) return `${s} – ${e}`;
  return s || "";
}

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", NGN: "₦", CAD: "$", AUD: "$", ZAR: "R", GHS: "₵" };

function priceLabel(ev) {
  if (ev.is_free) return "Free";
  if (ev.price == null || ev.price === "") return "";
  const sym = CURRENCY_SYMBOLS[ev.currency] || (ev.currency ? ev.currency + " " : "");
  const amt = Number(ev.price);
  if (Number.isNaN(amt)) return "";
  return `${sym}${Number.isInteger(amt) ? amt : amt.toFixed(2)}`;
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
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal><p className="text-xs uppercase tracking-[0.28em] text-muted">Past &amp; Live Events</p></Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-7 max-w-4xl">
                Rooms where <span className="font-display-italic text-lime">transformation</span> happens.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                Keynotes, LTE Live cohorts, and workshops — moments where the work moves from
                page to person.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="lime-corner-glow container-page pb-24 pt-10 space-y-20">
        {events.map((ev, idx) => (
          <Reveal key={ev.id || ev.slug}>
            <article
              className={`rounded-[24px] border p-6 md:p-12 ${
                idx % 2 === 0 ? "border-line bg-surface" : "cream-section border-cream-line"
              }`}
              data-testid={`event-${ev.slug || idx}`}
            >
              <div className="container-narrow !text-center">
                <h2>{ev.title}</h2>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-muted">
                  {ev.event_date && <span>{formatDate(ev.event_date)}</span>}
                  {timeLabel(ev) && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {timeLabel(ev)}
                    </span>
                  )}
                  {(ev.location_type === "online" || ev.location) && (
                    <span className="inline-flex items-center gap-1">
                      {ev.location_type === "online"
                        ? <><Globe className="h-3.5 w-3.5" /> {ev.location || "Online"}</>
                        : <><MapPin className="h-3.5 w-3.5" /> {ev.location}</>}
                    </span>
                  )}
                  {priceLabel(ev) && (
                    <span className="inline-flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" /> {priceLabel(ev)}
                    </span>
                  )}
                </div>
                {ev.description && (
                  <p className="mx-auto mt-7 max-w-2xl text-lg">{ev.description}</p>
                )}
                {/* In-house registration takes priority; register_url stays as an
                    escape hatch for events ticketed somewhere else entirely. */}
                {ev.registration_open ? (
                  <div className="mt-8">
                    <EventRegisterDialog event={ev} />
                  </div>
                ) : ev.register_url ? (
                  <div className="mt-8">
                    <a
                      href={ev.register_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-lime"
                      data-testid={`event-register-${ev.slug || idx}`}
                    >
                      Register <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                ) : null}
              </div>

              {ev.gallery && ev.gallery.length > 0 && (
                <div className="mt-12">
                  <ImageMarquee
                    images={ev.gallery}
                    duration={80}
                    width={280}
                    testId={`event-marquee-${ev.slug || idx}`}
                  />
                </div>
              )}
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
