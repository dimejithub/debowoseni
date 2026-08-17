import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowUpRight, Check, Heart, Loader2, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { MagneticButton } from "@/components/site/MagneticButton";
import { Seo } from "@/components/site/Seo";
import { getCommunityInfo, joinCommunity } from "@/lib/api";

/**
 * The LTE Community.
 *
 * The site owns joining — the form captures the person, records the
 * membership and tags them for segmentation. The conversation itself happens
 * in WhatsApp, which is where the audience already is and what the LTE
 * programmes already promise. Debo keeps the membership record either way.
 */

const PROMISES = [
  {
    icon: MessageCircle,
    title: "A room that answers",
    body: "Ask the thing you have been circling. People doing the same work answer, and Debo is in the room.",
  },
  {
    icon: Heart,
    title: "Check-ins that continue",
    body: "The bootcamp ends; the recalibration does not. Ongoing check-ins keep the Life-Map in motion.",
  },
  {
    icon: Users,
    title: "People further along",
    body: "Not a broadcast channel. A small group of high-capacity people, honest about where they actually are.",
  },
];

const GUIDELINES = [
  "What is shared here stays here.",
  "Bring the real question, not the polished one.",
  "No selling, no pitching, no link-dropping.",
  "Disagree with the idea, never the person.",
];

export default function Community() {
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [pending, setPending] = useState(false);
  const [joined, setJoined] = useState(null);

  useEffect(() => {
    let active = true;
    getCommunityInfo("lte")
      .then((i) => active && setInfo(i))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setPending(true);
    try {
      const res = await joinCommunity({
        name: form.name.trim(),
        email: form.email.trim(),
        group_key: "lte",
      });
      setJoined(res);
      if (res.invite_url) window.open(res.invite_url, "_blank", "noopener");
    } catch (err) {
      toast.error("Couldn't complete your join", {
        description: err?.response?.data?.detail || err?.message || "Please try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div data-testid="community-page">
      <Seo
        title="The LTE Community"
        description="A small room of high-capacity people doing the work of recalibration together, with ongoing check-ins from Dr. Debo' Owoseni."
      />

      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">The LTE Community</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6">
                You were never meant to do this{" "}
                <span className="font-display-italic text-lime">on your own.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-2xl text-lg text-muted">
                A small, private room of people doing the same work — with ongoing
                check-ins from Debo. Free to join, and it lives on WhatsApp, where
                conversations actually happen.
              </p>
            </Reveal>
            {info?.member_count > 0 && (
              <Reveal delay={0.22}>
                <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs text-ink/80">
                  <Users className="h-3.5 w-3.5 text-lime" />
                  {info.member_count} member{info.member_count === 1 ? "" : "s"} and counting
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <section className="container-page pb-8">
        <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PROMISES.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <div className="h-full rounded-[24px] border border-line bg-surface p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bg">
                  <Icon className="h-4 w-4 text-lime" />
                </span>
                <h3 className="mt-7 text-2xl">{title}</h3>
                <p className="mt-3 text-muted">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Join */}
      <section className="container-page py-20 md:py-28">
        <div className="container-narrow">
          <div className="rounded-[28px] border border-line bg-surface p-8 md:p-12">
            {joined ? (
              <div className="text-center" data-testid="community-joined">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line bg-bg">
                  <Check className="h-6 w-6 text-lime" />
                </span>
                <h2 className="mt-7">You're in.</h2>
                {joined.invite_url ? (
                  <>
                    <p className="mt-4 text-muted">
                      The WhatsApp group should have opened in a new tab. If it didn't, use
                      the button below.
                    </p>
                    <MagneticButton
                      as="a"
                      href={joined.invite_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-lime mt-8"
                      data-testid="community-invite-link"
                    >
                      Open the group <ArrowUpRight className="h-4 w-4" />
                    </MagneticButton>
                  </>
                ) : (
                  <p className="mt-4 text-muted">
                    Your place is recorded — Debo will send the group link by email shortly.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted">Join free</p>
                  <h2 className="mt-5">Come and sit in the room.</h2>
                </div>
                <form
                  onSubmit={submit}
                  className="mx-auto mt-9 max-w-md space-y-4"
                  data-testid="community-join-form"
                >
                  <div>
                    <label
                      htmlFor="cm-name"
                      className="text-xs uppercase tracking-[0.2em] text-muted"
                    >
                      Your name
                    </label>
                    <input
                      id="cm-name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-2 w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-ink outline-none focus:border-lime"
                      data-testid="community-name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cm-email"
                      className="text-xs uppercase tracking-[0.2em] text-muted"
                    >
                      Email
                    </label>
                    <input
                      id="cm-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-2 w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-ink outline-none focus:border-lime"
                      data-testid="community-email"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pending}
                    className="btn-lime w-full justify-center disabled:opacity-60"
                    data-testid="community-submit"
                  >
                    {pending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" /> Join the community
                      </>
                    )}
                  </button>
                  <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-lime/80" />
                    You'll also receive occasional insights. Unsubscribe any time.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* House rules */}
      <section className="border-t border-line bg-surface/40">
        <div className="container-page py-20 md:py-28">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">How we hold it</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-6">
                Four rules.{" "}
                <span className="font-display-italic text-lime">That's the whole constitution.</span>
              </h2>
            </Reveal>
            <Stagger className="mt-10 space-y-4">
              {GUIDELINES.map((g) => (
                <StaggerItem key={g}>
                  <p className="flex items-start gap-3 text-lg text-ink/85">
                    <Check className="mt-1.5 h-4 w-4 shrink-0 text-lime" />
                    {g}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.1}>
              <div className="mt-12 flex flex-wrap items-center gap-3">
                <Link to="/programmes" className="btn-lime">
                  See the programmes <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link to="/events" className="btn-ghost">
                  Upcoming events
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
