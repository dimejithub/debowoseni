import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BellRing,
  GraduationCap,
  Inbox,
  LogOut,
  Mail,
  MessageCircle,
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

/** Rolls a number up to its target the first time a real value arrives. */
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

// The frontend and backend deploy independently, so a missing key degrades to
// "—" instead of blanking the panel.
const num = (value, fallback = "—") => (typeof value === "number" ? value : fallback);

// Icon-badge gradients drawn from the debowoseni palette — lime (primary),
// warm ink, and the brand violet — so the dashboard stays on-brand in either
// theme. White icons read on all three.
const G_LIME = "from-[#7bc11a] to-[#4f8a0f]";
const G_INK = "from-[#3a352b] to-[#1c1916]";
const G_VIOLET = "from-[#8079ff] to-[#5a51df]";

function MaterialStat({ label, value, foot, footAccent, Icon, gradient, to }) {
  const shown = useCountUp(value);
  const body = (
    <>
      <div className="flex items-start justify-between">
        <span className={`-mt-9 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr ${gradient} shadow-lg shadow-black/15`}>
          <Icon className="h-7 w-7 text-white" />
        </span>
        <div className="pt-1 text-right">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
          <p className="font-display text-[2rem] leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums]">
            {shown}
          </p>
        </div>
      </div>
      <div className="my-3.5 border-t border-line" />
      <p className="text-xs leading-relaxed text-muted">
        {footAccent && <span className="font-semibold text-emerald-500">{footAccent} </span>}
        {foot}
      </p>
    </>
  );
  const cls =
    "block rounded-2xl border border-line bg-surface p-4 pt-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";
  return to ? <Link to={to} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}

// 30-day subscriber growth as a filled area + line, sized for a full card.
function GrowthChart({ points }) {
  if (!points || points.length < 2) {
    return <div className="grid h-[200px] place-items-center text-sm text-muted">No sign-up data yet.</div>;
  }
  const w = 720;
  const h = 200;
  const pad = 8;
  const max = Math.max(...points.map((p) => p.count), 1);
  const step = w / (points.length - 1);
  const xy = points.map((p, i) => [i * step, h - pad - (p.count / max) * (h - pad * 2)]);
  const line = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const [lastX, lastY] = xy[xy.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 200 }} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="grow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7bc11a" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#7bc11a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#grow)" />
      <path d={line} fill="none" stroke="#78be1f" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lastX} cy={lastY} r="3.5" fill="#78be1f" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function fmtShortDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
function relDays(days) {
  if (typeof days !== "number") return "";
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

function NextEventLine({ ev }) {
  if (!ev) return null;
  const regs = ev.registrant_count ?? 0;
  const n = ev.next_nudge;
  let nudge;
  if (!n) {
    nudge = (ev.days_until ?? 1) <= 0 ? "Happening today" : "All countdown reminders sent";
  } else if (n.when === "today") {
    nudge = `Sending the ${n.days_before}-day reminder today — ${n.sent} sent${n.pending ? `, ${n.pending} pending` : ""}`;
  } else {
    nudge = `Next reminder: ${n.days_before}-day nudge on ${fmtShortDate(n.date)}`;
  }
  return (
    <Link
      to="/admin/events"
      className="group flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-lime/40 bg-lime/10 px-5 py-4 transition hover:bg-lime/15"
      data-testid="next-event-line"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime/25">
        <BellRing className="h-4 w-4 text-lime" />
      </span>
      <span className="font-display text-base tracking-tight text-ink">{ev.title}</span>
      <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-muted">
        {relDays(ev.days_until)}
        {ev.event_date ? ` · ${fmtShortDate(ev.event_date)}` : ""}
      </span>
      <span className="text-xs text-muted">{regs} registrant{regs === 1 ? "" : "s"}</span>
      <span className="text-xs font-medium text-lime">· {nudge}</span>
      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted/50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-lime" />
    </Link>
  );
}

function Card({ title, action, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="font-display text-lg tracking-tight text-ink">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Amber base tones read on the dark theme; the .cms light theme darkens them for
// contrast on cream (see index.css), so the same warning works in both modes.
function Warning({ title, children }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-5 text-sm">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-400/20 text-amber-300">!</span>
      <div>
        <p className="font-semibold text-amber-300">{title}</p>
        <p className="mt-1.5 text-muted">{children}</p>
      </div>
    </div>
  );
}

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
          /* private mode / quota — just won't pre-fill next time */
        }
      })
      .catch(() => {
        /* keep whatever cached stats we already painted */
      });
  }, [loading, user]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const probed = health?.tables ? Object.values(health.tables) : [];
  const anyReachable = probed.some(Boolean);
  const missingTables =
    probed.length > 0 && !anyReachable
      ? Object.entries(health.tables).filter(([, ok]) => !ok).map(([t]) => t)
      : [];

  const total = stats?.subscribers?.total || 1;

  const cards = [
    {
      label: "Mailing list", to: "/admin/subscribers", Icon: Mail, gradient: G_LIME,
      value: num(stats?.subscribers?.active),
      footAccent: stats ? `+${stats.subscribers?.last_30_days ?? 0}` : null,
      foot: "in the last 30 days",
    },
    {
      label: "Registrations", to: "/admin/registrations", Icon: Users, gradient: G_INK,
      value: num(stats?.registrations?.total),
      foot: stats ? `${stats.registrations?.attended ?? 0} attended · ${stats.registrations?.waitlisted ?? 0} waitlisted` : "",
    },
    {
      label: "Emails sent", to: "/admin/emails", Icon: Send, gradient: G_VIOLET,
      value: num(stats?.campaigns?.sent),
      foot: stats ? `${stats.campaigns?.total ?? 0} campaigns created` : "",
    },
    {
      label: "Community", to: "/admin/people", Icon: MessageCircle, gradient: G_LIME,
      value: num(stats?.community?.members),
      foot: stats ? `${stats.enrolments?.total ?? 0} programme enrolments` : "",
    },
    {
      label: "Automations", to: "/admin/automations", Icon: Workflow, gradient: G_INK,
      value: num(stats?.automations?.sequences),
      foot: stats ? `${stats.automations?.enrolled ?? 0} people mid-sequence` : "",
    },
    {
      label: "Programmes", to: "/admin/people", Icon: GraduationCap, gradient: G_VIOLET,
      value: num(stats?.enrolments?.active),
      foot: stats ? `${stats.enrolments?.completed ?? 0} completed` : "",
    },
    {
      label: "Enquiries", to: "/admin/enquiries", Icon: Inbox, gradient: G_LIME,
      value: num(stats?.contact_messages),
      foot: "via the contact form",
    },
    {
      label: "Published", to: "/admin/posts", Icon: Sparkles, gradient: G_INK,
      value: stats?.content
        ? (stats.content.posts ?? 0) + (stats.content.events ?? 0) + (stats.content.books ?? 0)
        : "—",
      foot: stats?.content
        ? `${stats.content.posts ?? 0} posts · ${stats.content.events ?? 0} events · ${stats.content.books ?? 0} books`
        : "",
    },
  ];

  return (
    <div data-testid="admin-dashboard">
      {/* Page top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted">Admin Panel</p>
            <h1 className="font-display text-lg leading-none tracking-tight sm:text-xl">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted lg:inline">{user?.email}</span>
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-4">
          {missingTables.length > 0 && (
            <Warning title="Some Supabase tables are not initialised.">
              Missing: <code className="rounded bg-bg px-1.5 py-0.5 text-ink">{missingTables.join(", ")}</code>. Re-run{" "}
              <code className="rounded bg-bg px-1.5 py-0.5 text-ink">supabase_schema_phase3.sql</code> and{" "}
              <code className="rounded bg-bg px-1.5 py-0.5 text-ink">phase4.sql</code> in the Supabase SQL editor.
            </Warning>
          )}
          {stats?.mail_configured && stats.automation_scheduler_configured === false && (
            <Warning title="Automations are not being driven.">
              Sequences will enrol people but never send. Enable the internal scheduler or set the{" "}
              <code className="rounded bg-bg px-1.5 py-0.5 text-ink">AUTOMATION_TOKEN</code> so the tick can run.
            </Warning>
          )}
          {stats && !stats.mail_configured && (
            <Warning title="Email sending is not configured.">
              Confirmations and broadcasts are logged instead of sent. Set{" "}
              <code className="rounded bg-bg px-1.5 py-0.5 text-ink">RESEND_API_KEY</code> on the backend and verify the sending domain in Resend.
            </Warning>
          )}
        </div>

        {stats?.next_event && (
          <div className="mb-6">
            <NextEventLine ev={stats.next_event} />
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-x-5 gap-y-9 pt-6 sm:grid-cols-2 xl:grid-cols-4" data-testid="admin-stats">
          {cards.map((c) => (
            <MaterialStat key={c.label} {...c} />
          ))}
        </div>

        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card
            title="Subscriber growth"
            className="lg:col-span-2"
            action={
              <span className="text-xs text-muted">
                <span className="font-semibold text-emerald-500">+{stats?.subscribers?.last_30_days ?? 0}</span> in 30 days
              </span>
            }
          >
            <GrowthChart points={stats?.subscribers?.growth} />
          </Card>

          <Card title="Where subscribers come from">
            {stats?.subscribers?.by_source?.length ? (
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
            ) : (
              <p className="text-sm text-muted">No subscribers yet.</p>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
