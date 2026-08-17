import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  Check,
  Globe2,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { MagneticButton } from "@/components/site/MagneticButton";
import { Seo } from "@/components/site/Seo";
import { TIERS, WHATSAPP_URL, tierPricing } from "@/lib/programmes";

/**
 * Programmes — the offer + checkout page.
 *
 * This replaces the Systeme.io funnel that used to live on
 * lte.debowoseni.com/programmes. The narrative warm-up still happens on the
 * LTE Expression page; this is where the investment is revealed and the
 * booking is taken, via a Stripe Payment Link per tier.
 */

const ASSURANCES = [
  { icon: BookOpen, label: "Free copy of Taking Your Day with every programme" },
  { icon: UserRound, label: "Direct access to Dr. Debo'" },
  { icon: MessageCircle, label: "LTE community included" },
  { icon: Globe2, label: "UK & Nigeria welcome" },
];

const FAQS = [
  {
    q: "What happens after I book?",
    a: "You will receive a confirmation email straight away, followed by a short intake note from Debo so the first session starts with context rather than introductions.",
  },
  {
    q: "I am not sure which pathway is right for me.",
    a: "Take the Enquiry on the LTE page — three questions and it points you at the pathway that matches where you actually are. Or simply ask; a short message is often faster than a form.",
  },
  {
    q: "Can I pay in instalments, or in naira?",
    a: "Yes to both, but not through this page. Send a message and it will be arranged directly.",
  },
  {
    q: "What if I need to reschedule?",
    a: "Reply to your confirmation email. Sessions move freely with reasonable notice — life happens, and the work matters more than the calendar.",
  },
];

function CheckoutCta({ tier }) {
  const pricing = tierPricing(tier.id);

  // No Stripe link configured and nothing to book: the tier still converts,
  // it just routes the enquiry to Debo rather than rendering a dead button.
  if (pricing.ctaType === "enquiry") {
    return (
      <>
        <MagneticButton
          as={Link}
          to={`/contact?programme=${tier.id}`}
          className="btn-lime mt-8 w-full justify-center"
          data-testid={`programmes-${tier.id}-enquire`}
        >
          Enquire about this pathway <ArrowUpRight className="h-4 w-4" />
        </MagneticButton>
        <p className="mt-4 text-center text-xs text-muted">
          Dates and investment confirmed directly with Debo.
        </p>
      </>
    );
  }

  const isBooking = pricing.ctaType === "booking";
  return (
    <>
      <MagneticButton
        as="a"
        href={pricing.url}
        target="_blank"
        rel="noreferrer noopener"
        className="btn-lime mt-8 w-full justify-center"
        data-testid={`programmes-${tier.id}-${isBooking ? "booking" : "checkout"}`}
      >
        {isBooking ? "Book a free call" : tier.cta} <ArrowUpRight className="h-4 w-4" />
      </MagneticButton>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        {isBooking ? (
          <>
            <CalendarCheck className="h-3.5 w-3.5 text-lime/80" />
            {pricing.note || "Book a time that suits you."}
          </>
        ) : (
          <>
            <ShieldCheck className="h-3.5 w-3.5 text-lime/80" /> Secure checkout by Stripe
          </>
        )}
      </p>
    </>
  );
}

export default function Programmes() {
  return (
    <div data-testid="programmes-page">
      <Seo
        title="Programmes — Life Transformation Enquiry"
        description="The three LTE pathways: 1-to-1 coaching, the in-person Leicester bootcamp, and the live online intensive. Full details and booking."
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                Life Transformation Enquiry™
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6">
                Three pathways.{" "}
                <span className="font-display-italic text-lime">One coherent direction.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-2xl text-lg text-muted">
                Choose the depth and the format that fits your life. Every pathway ends
                in the same place — a Life-Map you can act on, and a plan for the chapter
                in front of you.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <Stagger className="mt-10 flex flex-wrap gap-2.5">
                {ASSURANCES.map(({ icon: Icon, label }) => (
                  <StaggerItem key={label}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs text-ink/80">
                      <Icon className="h-3.5 w-3.5 text-lime" /> {label}
                    </span>
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="container-page pb-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TIERS.map((tier, i) => {
            const pricing = tierPricing(tier.id);
            return (
              <Reveal key={tier.id} delay={i * 0.08}>
                <div
                  id={tier.id}
                  className="flex h-full scroll-mt-28 flex-col rounded-[24px] border border-line bg-surface p-8"
                  data-testid={`programmes-${tier.id}`}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-lime">{tier.badge}</p>
                  <h2 className="mt-4 text-3xl">{tier.name}</h2>
                  <p className="mt-2 text-sm text-muted">{tier.meta}</p>

                  <div className="mt-6 border-y border-line py-6">
                    {pricing.label ? (
                      <p className="font-display text-4xl text-ink">
                        {pricing.label}
                        <span className="ml-2 text-sm font-normal text-muted">
                          one-off investment
                        </span>
                      </p>
                    ) : pricing.ctaType === "booking" ? (
                      <p className="font-display text-2xl text-ink">
                        Scoped on a free call
                        <span className="ml-2 text-sm font-normal text-muted">
                          30 minutes, no obligation
                        </span>
                      </p>
                    ) : (
                      <p className="font-display text-2xl text-ink">Investment on enquiry</p>
                    )}
                  </div>

                  <p className="mt-6 text-ink/85">{tier.intro}</p>
                  <p className="mt-4 text-sm text-muted">{tier.body}</p>

                  <div className="mt-6 space-y-2.5">
                    {tier.facts.map(({ icon: Icon, label }) => (
                      <p key={label} className="flex items-start gap-2.5 text-sm text-ink/80">
                        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime/80" />
                        {label}
                      </p>
                    ))}
                  </div>

                  <div className="mt-7">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">Included</p>
                    <ul className="mt-4 space-y-2.5">
                      {tier.included.map((inc) => (
                        <li key={inc} className="flex items-start gap-2.5 text-sm text-ink/80">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime/80" />
                          {inc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-7 font-display-italic text-lime">{tier.closing}</p>

                  <div className="mt-auto">
                    <CheckoutCta tier={tier} />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* What you walk away with */}
      <section className="container-page py-20 md:py-28">
        <div className="container-narrow">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">What changes</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-6">
              You do not leave with notes.{" "}
              <span className="font-display-italic text-lime">You leave with a map.</span>
            </h2>
          </Reveal>
          <Stagger className="mt-10 grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
            {TIERS[0].gains.map((gain) => (
              <StaggerItem key={gain}>
                <p className="flex items-start gap-3 text-ink/85">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-lime" />
                  {gain}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-surface/40">
        <div className="container-page py-20 md:py-28">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Before you book</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-6">Questions people actually ask.</h2>
            </Reveal>
            <div className="mt-10 divide-y divide-line border-y border-line">
              {FAQS.map((faq) => (
                <Reveal key={faq.q}>
                  <div className="py-7">
                    <h3 className="text-xl">{faq.q}</h3>
                    <p className="mt-3 text-muted">{faq.a}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.1}>
              <div className="mt-12 text-center">
                <p className="text-muted">Still deciding?</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Link to="/expressions/life-transformation-enquiry" className="btn-ghost">
                    Read the full LTE story
                  </Link>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-ghost"
                    data-testid="programmes-whatsapp"
                  >
                    <MessageCircle className="h-4 w-4" /> Message on WhatsApp
                  </a>
                  <Link to="/contact" className="btn-lime" data-testid="programmes-contact">
                    Ask a question first <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
