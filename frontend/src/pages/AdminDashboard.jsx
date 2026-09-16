import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BellRing,
  Calendar,
  CalendarCheck,
  CalendarPlus,
  Inbox,
  LogOut,
  Mail,
  MailOpen,
  MessageCircle,
  MessageSquare,
  MousePointerClick,
  PenLine,
  Send,
  Sparkles,
  UserPlus,
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
function useCountUp(value, duration = 900) {
  const [display, setDisplay] = useState(typeof value === "number" ? 0 : value);
  const fromRef = useRef(0);
  const rafRef = useRef(0);
  useEffect(() => {
    if (typeof value !== "number") { setDisplay(value); return; }
    if (prefersReducedMotion()) { setDisplay(value); fromRef.current = value; return; }
    const from = fromRef.current;
    const delta = value - from;
    if (delta === 0) { setDisplay(value); return; }
    let start = null;
    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const tick = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setDisplay(Math.round(from + delta * easeOutExpo(p)));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);
  return typeof display === "number" ? display.toLocaleString() : display;
}

const num = (value, fallback = "—") => (typeof value === "number" ? value : fallback);

function greeting(h) {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function fmtShortDate(iso) {
  if (!iso) return "";
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
function relDays(days) {
  if (typeof days !== "number") return "";
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}
function relTime(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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

// A lime badge with a dark glyph — matches the brand buttons, reads in both themes.
function StatCard({ label, value, foot, footAccent, Icon, to }) {
  const shown = useCountUp(value);
  const body = (
    <>
      <div className="flex items-start justify-between">
        <span className="-mt-9 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr from-[#cbef5a] to-[#9ad11e] shadow-lg shadow-lime-900/20">
          <Icon className="h-7 w-7 text-[#16210a]" strokeWidth={2.25} />
        </span>
        <div className="pt-1 text-right">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
          <p className="font-display text-[2rem] leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums]">{shown}</p>
        </div>
      </div>
      <div className="my-3.5 border-t border-line" />
      <p className="text-xs leading-relaxed text-muted">
        {footAccent && <span className="font-semibold text-emerald-500">{footAccent} </span>}
        {foot}
      </p>
    </>
  );
  const cls = "block rounded-2xl border border-line bg-surface p-4 pt-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";
  return to ? <Link to={to} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}

function MiniStat({ label, value, Icon, to }) {
  const shown = useCountUp(value);
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-lime/10">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-lime/15 text-lime">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-lg leading-none text-ink [font-variant-numeric:tabular-nums]">{shown}</p>
        <p className="truncate text-[0.7rem] text-muted">{label}</p>
      </div>
    </Link>
  );
}

// 30-day subscriber growth as a filled area + line with a soft baseline.
function GrowthChart({ points }) {
  if (!points || points.length < 2) {
    return <div className="grid h-[210px] place-items-center text-sm text-muted">No sign-up data yet.</div>;
  }
  const w = 720, h = 210, pad = 10;
  const max = Math.max(...points.map((p) => p.count), 1);
  const step = w / (points.length - 1);
  const xy = points.map((p, i) => [i * step, h - pad - (p.count / max) * (h - pad * 2)]);
  const line = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const [lastX, lastY] = xy[xy.length - 1];
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 210 }} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="grow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7bc11a" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#7bc11a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="currentColor" strokeWidth="1" className="text-line" opacity="0.5" />
        ))}
        <path d={area} fill="url(#grow)" />
        <path d={line} fill="none" stroke="#78be1f" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <circle cx={lastX} cy={lastY} r="3.5" fill="#78be1f" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-2 flex justify-between text-[0.68rem] text-muted">
        <span>{fmtShortDate(points[0].date)}</span>
        <span>peak {max}/day</span>
        <span>{fmtShortDate(points[points.length - 1].date)}</span>
      </div>
    </div>
  );
}

function EngagementBar({ label, value, max, Icon }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-2 text-ink/85">
          <Icon className="h-4 w-4 text-lime" /> {label}
        </span>
        <span className="text-muted [font-variant-numeric:tabular-nums]">{value.toLocaleString()}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
        <div className="bar-grow h-full rounded-full bg-gradient-to-r from-lime/70 to-lime" style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
    </div>
  );
}

const ACTIVITY_META = {
  subscriber: { Icon: UserPlus },
  registration: { Icon: CalendarCheck },
  enquiry: { Icon: MessageSquare },
};

function NextEventBanner({ ev }) {
  if (!ev) return null;
  const n = ev.next_nudge;
  let nudge;
  if (!n) nudge = (ev.days_until ?? 1) <= 0 ? "Happening today" : "All countdown reminders sent";
  else if (n.when === "today") nudge = `Sending the ${n.days_before}-day reminder today — ${n.sent} sent${n.pending ? `, ${n.pending} pending` : ""}`;
  else nudge = `Next reminder: ${n.days_before}-day nudge on ${fmtShortDate(n.date)}`;
  return (
    <Link
      to="/admin/events"
      className="group flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-lime/40 bg-lime/10 px-5 py-4 transition hover:bg-lime/15"
      data-testid="next-event-line"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime/25"><BellRing className="h-4 w-4 text-lime" /></span>
      <span className="font-display text-base tracking-tight text-ink">{ev.title}</span>
      <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-muted">
        {relDays(ev.days_until)}{ev.event_date ? ` · ${fmtShortDate(ev.event_date)}` : ""}
      </span>
      <span className="text-xs text-muted">{ev.registrant_count ?? 0} registrant{(ev.registrant_count ?? 0) === 1 ? "" : "s"}</span>
      <span className="text-xs font-medium text-lime">· {nudge}</span>
      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted/50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-lime" />
    </Link>
  );
}

const QUICK_ACTIONS = [
  { label: "New post", to: "/admin/new", Icon: PenLine },
  { label: "New event", to: "/admin/events", Icon: CalendarPlus },
  { label: "Send email", to: "/admin/emails/new", Icon: Send },
];

const STATS_CACHE_KEY = "do-admin-stats-cache";
function readCachedStats() {
  try {
    const raw = localStorage.getItem(STATS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
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
        try { localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(s)); } catch { /* quota */ }
      })
      .catch(() => { /* keep cached */ });
  }, [loading, user]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const probed = health?.tables ? Object.values(health.tables) : [];
  const anyReachable = probed.some(Boolean);
  const missingTables = probed.length > 0 && !anyReachable
    ? Object.entries(health.tables).filter(([, ok]) => !ok).map(([t]) => t) : [];

  const total = stats?.subscribers?.total || 1;
  const rawName = (user?.email || "").split("@")[0].split(".")[0];
  const firstName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : "";
  const eng = stats?.engagement || {};
  const engMax = Math.max(eng.opened || 0, eng.clicked || 0, eng.bounced || 0, 1);

  const primary = [
    { label: "Mailing list", to: "/admin/subscribers", Icon: Mail, value: num(stats?.subscribers?.active),
      footAccent: stats ? `+${stats.subscribers?.last_30_days ?? 0}` : null, foot: "in the last 30 days" },
    { label: "Registrations", to: "/admin/registrations", Icon: Users, value: num(stats?.registrations?.total),
      foot: stats ? `${stats.registrations?.attended ?? 0} attended · ${stats.registrations?.waitlisted ?? 0} waitlisted` : "" },
    { label: "Emails sent", to: "/admin/emails", Icon: Send, value: num(stats?.campaigns?.sent),
      foot: stats ? `${stats.campaigns?.total ?? 0} campaigns created` : "" },
    { label: "Enquiries", to: "/admin/enquiries", Icon: Inbox, value: num(stats?.contact_messages), foot: "via the contact form" },
  ];
  const mini = [
    { label: "Community", to: "/admin/people", Icon: MessageCircle, value: num(stats?.community?.members) },
    { label: "Automations", to: "/admin/automations", Icon: Workflow, value: num(stats?.automations?.sequences) },
    { label: "Attended", to: "/admin/registrations", Icon: CalendarCheck, value: num(stats?.registrations?.attended) },
    { label: "Published", to: "/admin/posts", Icon: Sparkles,
      value: stats?.content ? (stats.content.posts ?? 0) + (stats.content.events ?? 0) + (stats.content.books ?? 0) : "—" },
  ];

  return (
    <div data-testid="admin-dashboard">
      {/* Top bar */}
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
        {(missingTables.length > 0 || (stats && !stats.mail_configured) ||
          (stats?.mail_configured && stats.automation_scheduler_configured === false)) && (
          <div className="mb-6 space-y-4">
            {missingTables.length > 0 && (
              <Warning title="Some Supabase tables are not initialised.">
                Missing: <code className="rounded bg-bg px-1.5 py-0.5 text-ink">{missingTables.join(", ")}</code>. Re-run{" "}
                <code className="rounded bg-bg px-1.5 py-0.5 text-ink">supabase_schema_phase3.sql</code> and{" "}
                <code className="rounded bg-bg px-1.5 py-0.5 text-ink">phase4.sql</code>.
              </Warning>
            )}
            {stats?.mail_configured && stats.automation_scheduler_configured === false && (
              <Warning title="Automations are not being driven.">
                Sequences will enrol people but never send. Enable the internal scheduler or set{" "}
                <code className="rounded bg-bg px-1.5 py-0.5 text-ink">AUTOMATION_TOKEN</code>.
              </Warning>
            )}
            {stats && !stats.mail_configured && (
              <Warning title="Email sending is not configured.">
                Confirmations and broadcasts are logged, not sent. Set{" "}
                <code className="rounded bg-bg px-1.5 py-0.5 text-ink">RESEND_API_KEY</code> and verify the domain in Resend.
              </Warning>
            )}
          </div>
        )}

        {/* Hero + quick actions */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-line bg-gradient-to-br from-[color-mix(in_srgb,var(--lime)_10%,var(--surface))] to-surface p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
              {greeting(new Date().getHours())}{firstName ? `, ${firstName}` : ""}.
            </h2>
            <p className="mt-1 text-sm text-muted">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · here&apos;s how debowoseni.com is doing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map(({ label, to, Icon }) => (
              <Link key={label} to={to}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-lime hover:text-lime">
                <Icon className="h-4 w-4 text-lime" /> {label}
              </Link>
            ))}
          </div>
        </div>

        {stats?.next_event && <div className="mb-6"><NextEventBanner ev={stats.next_event} /></div>}

        {/* Primary stats */}
        <div className="grid grid-cols-1 gap-x-5 gap-y-9 pt-6 sm:grid-cols-2 xl:grid-cols-4" data-testid="admin-stats">
          {primary.map((c) => <StatCard key={c.label} {...c} />)}
        </div>

        {/* Growth + engagement */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card title="Subscriber growth" className="lg:col-span-2"
            action={<span className="text-xs text-muted"><span className="font-semibold text-emerald-500">+{stats?.subscribers?.last_30_days ?? 0}</span> in 30 days</span>}>
            <GrowthChart points={stats?.subscribers?.growth} />
          </Card>
          <Card title="Email engagement">
            {eng.tracking_configured === false && (
              <p className="mb-3 text-xs text-muted">Open/click tracking isn&apos;t configured yet.</p>
            )}
            <div className="space-y-4">
              <EngagementBar label="Opened" value={eng.opened || 0} max={engMax} Icon={MailOpen} />
              <EngagementBar label="Clicked" value={eng.clicked || 0} max={engMax} Icon={MousePointerClick} />
              <EngagementBar label="Bounced" value={eng.bounced || 0} max={engMax} Icon={Mail} />
            </div>
          </Card>
        </div>

        {/* Upcoming events · recent activity · sources */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card title="Upcoming events" action={<Link to="/admin/events" className="text-xs text-muted hover:text-lime">All events</Link>}>
            {stats?.upcoming_events?.length ? (
              <ul className="divide-y divide-line/70">
                {stats.upcoming_events.map((e) => (
                  <li key={e.slug || e.title}>
                    <Link to="/admin/events" className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-lime/10">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-lime/15 text-lime"><Calendar className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                        <p className="text-xs text-muted">{relDays(e.days_until)} · {fmtShortDate(e.event_date)}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-muted"><Users className="h-3.5 w-3.5" />{e.registrant_count ?? 0}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted">No upcoming events scheduled.</p>}
          </Card>

          <Card title="Recent activity">
            {stats?.recent_activity?.length ? (
              <ul className="space-y-3">
                {stats.recent_activity.map((a, i) => {
                  const Icon = (ACTIVITY_META[a.kind] || ACTIVITY_META.subscriber).Icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime/15 text-lime"><Icon className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-ink"><span className="font-medium">{a.name}</span> <span className="text-muted">{a.detail}</span></p>
                        <p className="text-xs text-muted/70">{relTime(a.at)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="text-sm text-muted">Nothing yet — new sign-ups and registrations will show here.</p>}
          </Card>

          <Card title="Where subscribers come from">
            {stats?.subscribers?.by_source?.length ? (
              <div className="space-y-4">
                {stats.subscribers.by_source.slice(0, 6).map(({ source, count }, i) => {
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={source}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate text-ink/85">{source}</span>
                        <span className="text-muted [font-variant-numeric:tabular-nums]">{count} <span className="text-muted/60">· {pct}%</span></span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
                        <div className="bar-grow h-full rounded-full bg-gradient-to-r from-lime/70 to-lime" style={{ width: `${Math.max(pct, 2)}%`, "--bar-delay": `${i * 90}ms` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-muted">No subscribers yet.</p>}
          </Card>
        </div>

        {/* Secondary numbers */}
        <Card className="mt-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {mini.map((m) => <MiniStat key={m.label} {...m} />)}
          </div>
        </Card>
      </main>
    </div>
  );
}
