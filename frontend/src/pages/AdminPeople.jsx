import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Download, MessageCircle, Search, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useReveal } from "@/lib/useReveal";
import { adminListPeople } from "@/lib/api";

const FILTERS = [
  { key: "all", label: "Everyone" },
  { key: "customers", label: "Enrolled" },
  { key: "attendees", label: "Attended an event" },
  { key: "community", label: "In the community" },
  { key: "cold", label: "Never engaged" },
];

function matches(person, filter) {
  switch (filter) {
    case "customers":
      return person.enrolments > 0;
    case "attendees":
      return person.attended > 0;
    case "community":
      return person.in_community;
    case "cold":
      return !person.enrolments && !person.registrations && !person.in_community;
    default:
      return true;
  }
}

export default function AdminPeople() {
  const { user, loading } = useAuth();
  const [people, setPeople] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const listRef = useReveal([people]);

  useEffect(() => {
    if (loading || !user) return;
    adminListPeople()
      .then(setPeople)
      .catch((err) => {
        toast.error("Couldn't load people", { description: err?.message || "" });
        setPeople([]);
      });
  }, [loading, user]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (people || []).filter((p) => {
      if (!matches(p, filter)) return false;
      if (!q) return true;
      return (
        (p.email || "").toLowerCase().includes(q) ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [people, query, filter]);

  if (!loading && !user) return <Navigate to="/admin/login" replace />;

  const exportCsv = () => {
    const rows = [
      ["name", "email", "status", "source", "tags", "registrations", "attended", "enrolments", "community"],
      ...visible.map((p) => [
        p.name,
        p.email,
        p.status,
        p.source,
        (p.tags || []).join(" "),
        p.registrations,
        p.attended,
        p.enrolments,
        p.in_community ? "yes" : "no",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `people-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported.");
  };

  return (
    <div className="grain relative min-h-screen bg-bg text-ink" data-testid="admin-people">
      <header className="border-b border-line bg-surface/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime">
            <ArrowLeft className="h-4 w-4" /> CMS
          </Link>
          <p className="font-display text-sm tracking-tight">People</p>
          <span />
        </div>
      </header>

      <main className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h1>People</h1>
              {people && visible.length > 0 && (
                <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                  {visible.length} people
                </span>
              )}
            </div>
            <p className="mt-3 max-w-2xl text-muted">
              Everyone the site knows about, merged by email — subscribers, event
              registrants, community members and programme enrolments in one place.
              Open anyone to see their full history.
            </p>
          </div>
          <button
            onClick={exportCsv}
            disabled={!visible.length}
            className="btn-lime disabled:opacity-50"
            data-testid="people-export-csv"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or tag"
              className="w-full rounded-full border border-line bg-surface py-2.5 pl-11 pr-4 text-sm outline-none focus:border-lime"
              data-testid="people-search"
            />
          </div>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-4 py-2 text-xs ${
                filter === f.key ? "border-lime text-lime" : "border-line text-muted hover:text-ink"
              }`}
              data-testid={`people-filter-${f.key}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {people === null ? (
          <div className="mt-10 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-[14px] border border-line bg-surface" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-10 rounded-[20px] border border-line bg-surface px-8 py-16 text-center" data-testid="people-empty">
            <Users className="mx-auto h-8 w-8 text-lime" />
            <p className="mt-4 text-muted">
              {query || filter !== "all"
                ? "Nobody matches that filter."
                : "Nobody yet — captures from the site will appear here."}
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[20px] border border-line">
            <div className="border-b border-line bg-surface px-6 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {visible.length} {visible.length === 1 ? "person" : "people"}
              </p>
            </div>
            <ul ref={listRef} data-testid="people-list">
              {visible.map((p, i) => (
                <li
                  key={p.email}
                  data-reveal
                  style={{ "--reveal-delay": `${Math.min(i, 8) * 55}ms` }}
                  className="press border-b border-line/60 bg-bg last:border-b-0"
                >
                  <Link
                    to={`/admin/people/${encodeURIComponent(p.email)}`}
                    className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-surface"
                    data-testid={`person-row-${p.email}`}
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm text-ink">
                        {p.name || p.email}
                        {p.in_community && <MessageCircle className="h-3.5 w-3.5 text-lime" />}
                        {p.status === "unsubscribed" && (
                          <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase text-muted">
                            unsubscribed
                          </span>
                        )}
                      </p>
                      {p.name && <p className="mt-1 text-xs text-muted">{p.email}</p>}
                      {(p.tags || []).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {p.tags.slice(0, 5).map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-line px-2 py-0.5 text-[10px] text-muted"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-5 text-xs text-muted">
                      {p.enrolments > 0 && (
                        <span className="text-lime">
                          {p.enrolments} programme{p.enrolments === 1 ? "" : "s"}
                        </span>
                      )}
                      {p.registrations > 0 && (
                        <span>
                          {p.registrations} event{p.registrations === 1 ? "" : "s"}
                          {p.attended > 0 && ` · ${p.attended} attended`}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
