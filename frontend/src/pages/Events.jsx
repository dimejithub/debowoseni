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

// Combine an event's date with a time string into a single Date. When the time
// is missing we anchor to the start (00:00) or the very end (23:59:59) of the
// day, so an all-day event still has a sensible window.
function toDateTime(dateStr, timeStr, endOfDay) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  if (timeStr) {
    const [h, m] = String(timeStr).split(":");
    d.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
  } else {
    d.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  }
  return d;
}

// Classify an event as "live" (happening now), "upcoming" (scheduled but not
// started) or "past" (already finished). Undated events are still being planned,
// so they count as upcoming. An event moves from live to past automatically once
// its end time — or the end of its day, if no end time — has gone by.
function phaseOf(ev) {
  if (!ev.event_date) return "upcoming";
  const start = toDateTime(ev.event_date, ev.start_time, false);
  if (!start) return "upcoming";
  const end = toDateTime(ev.event_date, ev.end_time, true);
  const now = new Date();
  if (now > end) return "past";
  if (now >= start) return "live";
  return "upcoming";
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
        <div className="relative w-full" style={{ aspectRatio: "16 / 6" }}>
          <img src={ev.cover_url} alt={ev.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        </div>
      </div>
    );
  }
  return null;
}

const TABS = [
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

const EMPTY_COPY = {
  live: "No events are happening right now — check Upcoming for what's next.",
  upcoming: "No upcoming events scheduled yet — new dates will appear here as they're planned.",
  past: "Past events and their photos will live here.",
};

export default function Events() {
  const [events, setEvents] = useState(FALLBACK_EVENTS);
  const [tab, setTab] = useState("live");
  const [userPicked, setUserPicked] = useState(false);

  useEffect(() => {
    let active = true;
    getPublishedEvents().then((e) => active && e.length && setEvents(e)).catch(() => {});
    return () => { active = false; };
  }, []);

  const { live, upcoming, past } = useMemo(() => {
    const groups = { live: [], upcoming: [], past: [] };
    for (const ev of events) groups[phaseOf(ev)].push(ev);
    const ts = (d) => (d ? new Date(d).getTime() || 0 : 0);
    groups.live.sort((a, b) => ts(a.event_date) - ts(b.event_date)); // started soonest first
    groups.upcoming.sort((a, b) => ts(a.event_date) - ts(b.event_date)); // next up first
    groups.past.sort((a, b) => ts(b.event_date) - ts(a.event_date)); // most recent first
    return groups;
  }, [events]);

  const counts = { live: live.length, upcoming: upcoming.length, past: past.length };

  // Until the visitor picks a tab themselves, land on the first one that has
  // events — Live, then Upcoming, then Past — so the page never opens empty.
  useEffect(() => {
    if (userPicked) return;
    const first = TABS.find((t) => counts[t.key] > 0);
    if (first && first.key !== tab) setTab(first.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.length, upcoming.length, past.length, userPicked]);

  const shown = { live, upcoming, past }[tab];

  return (
    <div data-testid="events-page">
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal><p className="text-xs uppercase tracking-[0.28em] text-muted">Live · Upcoming · Past</p></Reveal>
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
              <div className="mt-10 inline-flex flex-wrap justify-center rounded-full border border-line bg-surface p-1" role="tablist" data-testid="events-tabs">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => { setUserPicked(true); setTab(t.key); }}
                    className={`press inline-flex items-center rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                      tab === t.key ? "bg-lime text-bg" : "text-muted hover:text-ink"
                    }`}
                    data-testid={`events-tab-${t.key}`}
                  >
                    {t.key === "live" && counts.live > 0 && (
                      <span className="relative mr-2 flex h-2 w-2">
                        <span className={`live-ping absolute inline-flex h-full w-full rounded-full ${tab === t.key ? "bg-bg/70" : "bg-lime/70"}`} />
                        <span className={`relative inline-flex h-2 w-2 rounded-full ${tab === t.key ? "bg-bg" : "bg-lime"}`} />
                      </span>
                    )}
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
          const isPast = tab === "past";
          const isLive = tab === "live";
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
                      isLive ? "bg-lime text-bg"
                        : isPast ? "border border-line text-muted"
                        : "border border-lime/50 text-lime"
                    }`}
                  >
                    {isLive && (
                      <span className="relative flex h-2 w-2">
                        <span className="live-ping absolute inline-flex h-full w-full rounded-full bg-bg/70" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-bg" />
                      </span>
                    )}
                    {isLive ? "Live now" : isPast ? "Past event" : "Upcoming"}
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
                    {!isPast && priceLabel(ev) && (
                      <span className="inline-flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" /> {priceLabel(ev)}
                      </span>
                    )}
                  </div>
                  {ev.description && (
                    <p className="mx-auto mt-7 max-w-2xl text-lg">{ev.description}</p>
                  )}

                  {/* Registration stays open for live and upcoming events; a past
                      event can no longer be joined. In-house registration takes
                      priority; register_url is the escape hatch for events
                      ticketed somewhere else. */}
                  {!isPast && ev.registration_open ? (
                    <div className="mt-8">
                      <EventRegisterDialog event={ev} />
                    </div>
                  ) : !isPast && ev.register_url ? (
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

                {/* Past events show the memories gallery; live and upcoming events
                    show the teaser (video or cover) until the photos exist. */}
                {isPast ? (
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
                      <div className="relative w-full" style={{ aspectRatio: "16 / 6" }}>
                        <img src={ev.cover_url} alt={ev.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                      </div>
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
            <span className="font-script text-5xl text-lime">soon</span>
            <p className="mt-3 text-muted">{EMPTY_COPY[tab]}</p>
          </div>
        )}
      </section>
    </div>
  );
}
