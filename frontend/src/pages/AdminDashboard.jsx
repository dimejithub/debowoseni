import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Contact,
  FileText,
  GraduationCap,
  Inbox,
  LogOut,
  Mail,
  MessageCircle,
  Newspaper,
  Quote,
  Send,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { adminStats, getHealth } from "@/lib/api";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Rolls a number up to its target the first time a real value arrives, so each
 * metric reads as "counting in" rather than snapping — the live-dashboard feel.
 * Non-numbers (the "—" fallback) pass straight through, and reduced-motion users
 * get the final value immediately.
 */
function useCountUp(value, duration = 1000) {
  const [display, setDisplay] = useState(typeof value === "number" ? 0 : value);
  const fromRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (typeof value !== "number") {
      setDisplay(value);
      return;
    }
    if (prefersReducedMotion()) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    const delta = value - from;
    if (delta === 0) {
      setDisplay(value);
      return;
    }
    let start = null;
    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const tick = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setDisplay(Math.round(from + delta * easeOutExpo(p)));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return typeof display === "number" ? display.toLocaleString() : display;
}

// Nav cards, grouped so the panel reads as two jobs — publishing the site, and
// running the audience — rather than one long undifferentiated list.
const CARD_GROUPS = [
  {
    label: "Content",
    cards: [
      { to: "/admin/posts", title: "Journal posts", desc: "Categories, drafts, publishes.", Icon: FileText, testId: "card-posts" },
      { to: "/admin/testimonials", title: "Testimonials", desc: "Quotes shown on the home page.", Icon: Quote, testId: "card-testimonials" },
      { to: "/admin/books", title: "Books", desc: "Featured book and bookshelf.", Icon: BookOpen, testId: "card-books" },
      { to: "/admin/publications", title: "Publications", desc: "Academic papers and Scholar links.", Icon: GraduationCap, testId: "card-publications" },
      { to: "/admin/events", title: "Events", desc: "Galleries and registration settings.", Icon: Calendar, testId: "card-events" },
    ],
  },
  {
    label: "Audience & mail",
    cards: [
      { to: "/admin/people", title: "People", desc: "Every contact, with their full history.", Icon: Contact, testId: "card-people" },
      { to: "/admin/registrations", title: "Registrations", desc: "Who signed up, who attended.", Icon: Users, testId: "card-registrations" },
      { to: "/admin/enquiries", title: "Enquiries", desc: "Messages from the contact form.", Icon: Inbox, testId: "card-enquiries" },
      { to: "/admin/emails", title: "Emails", desc: "Write and send to the list.", Icon: Send, testId: "card-emails" },
      { to: "/admin/newsletter", title: "Newsletter", desc: "Auto digest of new journal posts.", Icon: Newspaper, testId: "card-newsletter" },
      { to: "/admin/automations", title: "Automations", desc: "Triggered email sequences.", Icon: Workflow, testId: "card-automations" },
      { to: "/admin/subscribers", title: "Subscribers", desc: "The whole mailing list, exportable.", Icon: Mail, testId: "card-subscribers" },
    ],
  },
];

/**
 * The frontend (Cloudflare) and the backend (Render) deploy independently, so
 * the dashboard can briefly receive a stats payload from an older backend that
 * has no community/enrolment/automation keys. Reading through those blind would
 * blank the whole admin panel, so every access goes through this.
 */
const num = (value, fallback = "—") => (typeof value === "number" ? value : fallback);

/**
 * 30-day sign-up sparkline. Area fill plus an emphasised final point, so the
 * card reads as a trend at a glance rather than a bare line.
 */
function Sparkline({ points }) {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points.map((p) => p.count), 1);
  const w = 260;
  const h = 44;
  const step = w / (points.length - 1);
  const xy = points.map((p, i) => [i * step, h - (p.count / max) * (h - 4) - 2]);
  const line = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const [lastX, lastY] = xy[xy.length - 1];
  // Path length drives the draw-in dash animation, so it starts fully hidden
  // and unspools left-to-right regardless of the actual curve.
  const len = xy.reduce((acc, [x, y], i) => {
    if (i === 0) return 0;
    const [px, py] = xy[i - 1];
    return acc + Math.hypot(x - px, y - py);
  }, 0);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-5 h-11 w-full overflow-visible" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--lime)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="spark-area" d={area} fill="url(#spark)" />
      <path
        className="spark-line"
        style={{ "--spark-len": len.toFixed(1) }}
        d={line}
        fill="none"
        stroke="var(--lime)"
        strokeWidth="1.75"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle className="spark-pulse" cx={lastX} cy={lastY} r="2.6" fill="var(--lime)" vectorEffect="non-scaling-stroke" />
      <circle className="spark-dot" cx={lastX} cy={lastY} r="2.6" fill="var(--lime)" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * A metric tile. `primary` gives the headline stat (the mailing list) a lime
 * wash so the eye lands there first. `to` makes the whole tile a link into the
 * fuller view of that stat, with a hover affordance and a corner arrow.
 */
function trackSpotlight(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
  e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
}

function Stat({ label, value, sub, Icon, primary, to, rise = 0, children }) {
  const shown = useCountUp(value);
  const inner = (
    <div className="relative z-[1] flex flex-1 flex-col">
      <div className="flex items-start justify-between gap-2">
        {/* Reserve two lines so a wrapping label ("Emails sent") never shoves
            its number out of line with the tile beside it. */}
        <p className="flex min-h-[2rem] min-w-0 items-start text-[0.6rem] font-medium uppercase leading-[1.35] tracking-[0.1em] text-muted sm:text-[0.68rem] sm:tracking-[0.18em]">
          {label}
        </p>
        <span className="flex shrink-0 items-center gap-1.5">
          {to && (
            <ArrowUpRight className="h-3.5 w-3.5 text-muted/40 opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-lime group-hover:opacity-100" />
          )}
          {Icon && (
            <Icon className={`h-4 w-4 shrink-0 ${primary ? "text-lime" : "text-muted/60 transition-colors group-hover:text-lime"}`} />
          )}
        </span>
      </div>
      <p className="mt-1 font-display text-[2.15rem] leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums] sm:mt-2 sm:text-[2.6rem]">
        {shown}
      </p>
      {sub && <p className="mt-2.5 text-[0.72rem] leading-relaxed text-muted sm:text-xs">{sub}</p>}
      {children}
    </div>
  );

  const cls = `tile-rise group relative flex flex-col overflow-hidden rounded-[20px] border p-5 transition-colors duration-300 sm:p-6 ${
    primary
      ? "tile-breathe border-lime/30 bg-gradient-to-br from-[color-mix(in_srgb,var(--lime)_9%,var(--surface))] to-surface hover:border-lime/50"
      : "min-h-[8.75rem] border-line bg-surface hover:border-lime/40 sm:min-h-[9.5rem]"
  }`;
  const style = { "--rise-delay": `${rise}ms` };
  const glow = <span className="spotlight-glow" aria-hidden />;

  return to ? (
    <Link to={to} className={cls} style={style} onMouseMove={trackSpotlight}>
      {glow}
      {inner}
    </Link>
  ) : (
    <div className={cls} style={style} onMouseMove={trackSpotlight}>
      {glow}
      {inner}
    </div>
  );
}

/** Small uppercase section marker, reused above each band of the page. */
function Eyebrow({ children }) {
  return (
    <p className="mb-5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted">{children}</p>
  );
}

// Last-known stats are cached in the browser so the dashboard paints its real
// numbers instantly on the next visit — even while a cold Render backend is
// still waking up — then quietly refreshes them. Nothing sensitive here, just
// the same counts already shown on screen.
const STATS_CACHE_KEY = "do-admin-stats-cache";
function readCachedStats() {
  try {
    const raw = localStorage.getItem(STATS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function AdminDashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(readCachedStats);

  useEffect(() => {
    if (loading || !user) return;
    getHealth().then(setHealth).catch(() => setHealth(null));
    adminStats()
      .then((s) => {
        setStats(s);
        try {
          localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(s));
        } catch {
          /* private mode / quota — the dashboard just won't pre-fill next time */
        }
      })
      .catch(() => {
        /* keep whatever cached stats we already painted */
      });
  }, [loading, user]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  // The schema banner is a genuine setup aid, but on a cold backend PostgREST's
  // schema cache lags and briefly reports an existing table as missing — a false
  // alarm. Only treat the schema as broken when NOTHING responds (a truly
  // un-provisioned database); if even one table answers, the rest are just
  // catching up, so we stay quiet.
  const probed = health?.tables ? Object.values(health.tables) : [];
  const anyReachable = probed.some(Boolean);
  const missingTables =
    probed.length > 0 && !anyReachable
      ? Object.entries(health.tables).filter(([, ok]) => !ok).map(([t]) => t)
      : [];

  const total = stats?.subscribers?.total || 1;

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-dashboard">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/70 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> Site
          </Link>
          <p className="font-display text-sm tracking-tight">CMS · Admin</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted md:inline">{user?.email}</span>
            <button
              onClick={async () => { await signOut(); navigate("/admin/login"); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 transition-colors hover:border-lime hover:text-lime"
              data-testid="admin-signout"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-page relative py-10 md:py-12">
        <div className="dash-aurora inset-x-0 top-0 h-[420px]" aria-hidden />
        <div className="relative z-10">
        {missingTables.length > 0 && (
          <div className="mb-6 flex gap-4 rounded-[16px] border border-amber-400/30 bg-amber-400/5 p-5 text-sm" data-testid="schema-warning">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">!</span>
            <div>
              <p className="font-semibold text-amber-300">Some Supabase tables are not initialised.</p>
              <p className="mt-1.5 text-muted">
                Missing: <code className="rounded bg-bg px-1.5 py-0.5 text-ink">{missingTables.join(", ")}</code>. Re-run{" "}
                <code className="rounded bg-bg px-1.5 py-0.5 text-ink">supabase_schema_phase3.sql</code> and{" "}
                <code className="rounded bg-bg px-1.5 py-0.5 text-ink">phase4.sql</code> in the Supabase SQL editor.
              </p>
            </div>
          </div>
        )}

        {stats?.mail_configured && stats.automation_scheduler_configured === false && (
          <div className="mb-6 flex gap-4 rounded-[16px] border border-amber-400/30 bg-amber-400/5 p-5 text-sm" data-testid="scheduler-warning">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">!</span>
            <div>
              <p className="font-semibold text-amber-300">Automations are not being driven.</p>
              <p className="mt-1.5 text-muted">
                Sequences will enrol people but never send. Add the{" "}
                <code className="rounded bg-bg px-1.5 py-0.5 text-ink">AUTOMATION_TOKEN</code> and{" "}
                <code className="rounded bg-bg px-1.5 py-0.5 text-ink">BACKEND_URL</code> repository secrets so the hourly job can run them.
              </p>
            </div>
          </div>
        )}

        {stats && !stats.mail_configured && (
          <div className="mb-6 flex gap-4 rounded-[16px] border border-amber-400/30 bg-amber-400/5 p-5 text-sm" data-testid="mail-warning">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">!</span>
            <div>
              <p className="font-semibold text-amber-300">Email sending is not configured.</p>
              <p className="mt-1.5 text-muted">
                Confirmations and broadcasts are logged instead of sent. Set{" "}
                <code className="rounded bg-bg px-1.5 py-0.5 text-ink">RESEND_API_KEY</code> on the backend and verify the sending domain in Resend.
              </p>
            </div>
          </div>
        )}

        <div className="mb-10 md:mb-12">
          <h1 className="text-5xl md:text-6xl">CMS</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Everything on debowoseni.com — content, events, registrations and the mailing list.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <div className="mb-5 flex items-center gap-2.5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted">Overview</p>
            <span className="relative flex h-1.5 w-1.5" title="Live data">
              <span className="live-ping absolute inline-flex h-full w-full rounded-full bg-lime" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime" />
            </span>
            <span className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-lime/80">Live</span>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="admin-stats">
            <div className="col-span-2 lg:col-span-2 lg:row-span-1">
              <Stat
                label="Mailing list"
                to="/admin/subscribers"
                value={num(stats?.subscribers?.active)}
                sub={stats ? `+${stats.subscribers?.last_30_days ?? 0} in the last 30 days` : "loading…"}
                Icon={Mail}
                primary
                rise={0}
              >
                <Sparkline points={stats?.subscribers?.growth} />
              </Stat>
            </div>
            <Stat
              label="Registrations"
              to="/admin/registrations"
              value={num(stats?.registrations?.total)}
              sub={stats ? `${stats.registrations?.attended ?? 0} attended · ${stats.registrations?.waitlisted ?? 0} waitlisted` : ""}
              Icon={Users}
              rise={70}
            />
            <Stat
              label="Community"
              to="/admin/people"
              value={num(stats?.community?.members)}
              sub={stats ? `${stats.enrolments?.total ?? 0} programme enrolments` : ""}
              Icon={MessageCircle}
              rise={140}
            />
            <Stat
              label="Emails sent"
              to="/admin/emails"
              value={num(stats?.campaigns?.sent)}
              sub={stats ? `${stats.campaigns?.total ?? 0} campaigns created` : ""}
              Icon={Send}
              rise={210}
            />
            <Stat
              label="Automations"
              to="/admin/automations"
              value={num(stats?.automations?.sequences)}
              sub={stats ? `${stats.automations?.enrolled ?? 0} people part-way through` : ""}
              Icon={Workflow}
              rise={280}
            />
            <Stat
              label="Programmes"
              to="/admin/people"
              value={num(stats?.enrolments?.active)}
              sub={stats ? `${stats.enrolments?.completed ?? 0} completed` : ""}
              Icon={GraduationCap}
              rise={350}
            />
            <Stat
              label="Enquiries"
              to="/admin/enquiries"
              value={num(stats?.contact_messages)}
              sub="via the contact form"
              Icon={Inbox}
              rise={420}
            />
            <Stat
              label="Published"
              rise={490}
              value={
                stats?.content
                  ? (stats.content.posts ?? 0) + (stats.content.events ?? 0) + (stats.content.books ?? 0)
                  : "—"
              }
              sub={
                stats?.content ? (
                  <span className="flex flex-wrap gap-x-1.5 gap-y-1">
                    <Link to="/admin/posts" className="rounded px-1 -mx-1 hover:bg-lime/10 hover:text-lime">
                      {stats.content.posts ?? 0} posts
                    </Link>
                    <span className="text-muted/40">·</span>
                    <Link to="/admin/events" className="rounded px-1 -mx-1 hover:bg-lime/10 hover:text-lime">
                      {stats.content.events ?? 0} events
                    </Link>
                    <span className="text-muted/40">·</span>
                    <Link to="/admin/books" className="rounded px-1 -mx-1 hover:bg-lime/10 hover:text-lime">
                      {stats.content.books ?? 0} books
                    </Link>
                  </span>
                ) : (
                  ""
                )
              }
              Icon={Sparkles}
            />
          </div>
        </section>

        {stats?.subscribers?.by_source?.length > 0 && (
          <section className="mb-12">
            <Eyebrow>Where subscribers come from</Eyebrow>
            <div className="rounded-[20px] border border-line bg-surface p-7" data-testid="stats-by-source">
              <div className="space-y-4">
                {stats.subscribers.by_source.slice(0, 6).map(({ source, count }, i) => {
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={source}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink/85">{source}</span>
                        <span className="text-muted [font-variant-numeric:tabular-nums]">
                          {count} <span className="text-muted/60">· {pct}%</span>
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
                        <div
                          className="bar-grow h-full rounded-full bg-gradient-to-r from-lime/70 to-lime"
                          style={{ width: `${Math.max(pct, 2)}%`, "--bar-delay": `${i * 90}ms` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Manage */}
        {CARD_GROUPS.map((group) => (
          <section key={group.label} className="mb-10">
            <Eyebrow>{group.label}</Eyebrow>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.cards.map(({ to, title, desc, Icon, testId }, i) => (
                <Link
                  key={to}
                  to={to}
                  className="tile-rise card-lift group relative flex items-start gap-4 overflow-hidden rounded-[18px] border border-line bg-surface p-5"
                  style={{ "--rise-delay": `${i * 55}ms` }}
                  data-testid={testId}
                  onMouseMove={trackSpotlight}
                >
                  <span className="spotlight-glow" aria-hidden />
                  <span className="relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-line bg-bg transition-all duration-300 group-hover:border-lime/50 group-hover:scale-105">
                    <Icon className="h-[18px] w-[18px] text-lime" />
                  </span>
                  <div className="relative z-[1] min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg leading-tight">{title}</h3>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted/50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-lime" />
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
        </div>
      </main>
    </div>
  );
}
