import { useEffect, useMemo, useState } from "react";
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

// An event is "past" once its date has gone by. Undated events are treated as
// upcoming (still being planned) rather than past.
function isPast(ev) {
  if (!ev.event_date) return false;
  const d = new Date(ev.event_date);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

// Turn a YouTube/Vimeo watch URL into an embeddable one. Returns null for
// anything that isn't a recognised embed (e.g. a direct .mp4 link).
function videoEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch { /* not a URL */ }
  return null;
}

function EventTeaser({ ev }) {
  const embed = videoEmbedUrl(ev.video_url);
  if (embed) {
    return (
      <div className="mt-10 overflow-hidden rounded-[18px] border border-line">
        <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
          <iframe
            src={embed}
            title={`${ev.title} teaser`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }
  if (ev.video_url && /\.(mp4|webm|mov)(\?|$)/i.test(ev.video_url)) {
    return (
      <div className="mt-10 overflow-hidden rounded-[18px] border border-line">
        <video src={ev.video_url} controls playsInline poster={ev.cover_url || undefined} className="w-full" />
      </div>
    );
  }
  if (ev.cover_url) {
    return (
      <div className="mt-10 overflow-hidden rounded-[18px] border border-line">
        <img src={ev.cover_url} alt={ev.title} className="w-full object-cover" loading="lazy" />
      </div>
    );
  }
  return null;
}

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

export default function Events() {
  const [events, setEvents] = useState(FALLBACK_EVENTS);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    let active = true;
    getPublishedEvents().then((e) => active && e.length && setEvents(e)).catch(() => {});
    return () => { active = false; };
  }, []);

  const { upcoming, past } = useMemo(() => {
    const up = [], pa = [];
    for (const ev of events) (isPast(ev) ? pa : up).push(ev);
    const ts = (d) => (d ? new Date(d).getTime() || 0 : 0);
    up.sort((a, b) => ts(a.event_date) - ts(b.event_date)); // soonest first
    pa.sort((a, b) => ts(b.event_date) - ts(a.event_date)); // most recent first
    return { upcoming: up, past: pa };
  }, [events]);

  // Land on whichever tab actually has events, preferring upcoming.
  useEffect(() => {
    if (tab === "upcoming" && upcoming.length === 0 && past.length > 0) setTab("past");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcoming.length, past.length]);

  const shown = tab === "upcoming" ? upcoming : past;
  const counts = { upcoming: upcoming.length, past: past.length };

  return (
    <div data-testid="events-page">
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal><p className="text-xs uppercase tracking-[0.28em] text-muted">Live &amp; Past Events</p></Reveal>
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

            <Reveal delay={0.24}>
              <div className="mt-10 inline-flex rounded-full border border-line bg-surface p-1" role="tablist" data-testid="events-tabs">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={`press rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                      tab === t.key ? "bg-lime text-bg" : "text-muted hover:text-ink"
                    }`}
                    data-testid={`events-tab-${t.key}`}
                  >
                    {t.label}
                    <span className={`ml-2 text-xs ${tab === t.key ? "text-bg/70" : "text-muted/70"}`}>
                      {counts[t.key]}
                    </span>
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="lime-corner-glow container-page pb-24 pt-4 space-y-20">
        {shown.map((ev, idx) => {
          const past = tab === "past";
          const hasGallery = ev.gallery && ev.gallery.length > 0;
          return (
            <Reveal key={ev.id || ev.slug}>
              <article
                className={`rounded-[24px] border p-6 md:p-12 ${
                  idx % 2 === 0 ? "border-line bg-surface" : "cream-section border-cream-line"
                }`}
                data-testid={`event-${ev.slug || idx}`}
              >
                <div className="container-narrow !text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      past ? "border border-line text-muted" : "bg-lime text-bg"
                    }`}
                  >
                    {past ? "Past event" : "Upcoming"}
                  </span>
                  <h2 className="mt-5">{ev.title}</h2>
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
                    {!past && priceLabel(ev) && (
                      <span className="inline-flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" /> {priceLabel(ev)}
                      </span>
                    )}
                  </div>
                  {ev.description && (
                    <p className="mx-auto mt-7 max-w-2xl text-lg">{ev.description}</p>
                  )}

                  {/* Registration only makes sense for events that haven't happened yet.
                      In-house registration takes priority; register_url is the escape
                      hatch for events ticketed somewhere else. */}
                  {!past && ev.registration_open ? (
                    <div className="mt-8">
                      <EventRegisterDialog event={ev} />
                    </div>
                  ) : !past && ev.register_url ? (
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

                {/* Past events show the memories gallery; upcoming events show the
                    teaser (video or cover) until the photos exist. */}
                {past ? (
                  hasGallery ? (
                    <div className="mt-12">
                      <ImageMarquee
                        images={ev.gallery}
                        duration={80}
                        width={280}
                        testId={`event-marquee-${ev.slug || idx}`}
                      />
                    </div>
                  ) : ev.cover_url ? (
                    <div className="mt-10 overflow-hidden rounded-[18px] border border-line">
                      <img src={ev.cover_url} alt={ev.title} className="w-full object-cover" loading="lazy" />
                    </div>
                  ) : null
                ) : hasGallery ? (
                  <div className="mt-12">
                    <ImageMarquee
                      images={ev.gallery}
                      duration={80}
                      width={280}
                      testId={`event-marquee-${ev.slug || idx}`}
                    />
                  </div>
                ) : (
                  <EventTeaser ev={ev} />
                )}
              </article>
            </Reveal>
          );
        })}

        {shown.length === 0 && (
          <div className="rounded-[20px] border border-line bg-surface px-8 py-16 text-center" data-testid="events-empty">
            <span className="font-script text-5xl text-lime">{tab === "past" ? "soon" : "soon"}</span>
            <p className="mt-3 text-muted">
              {tab === "past"
                ? "Past events and their photos will live here."
                : "No upcoming events right now — new dates will appear here as they're scheduled."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
