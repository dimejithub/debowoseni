import { Link } from "react-router-dom";
import { Reveal } from "@/components/site/Reveal";
import { Seo } from "@/components/site/Seo";
import { CONTACT_EMAIL } from "@/lib/data";

const LAST_UPDATED = "28 August 2026";
const EMAIL = CONTACT_EMAIL;

// The policy as data — each section renders statically (no scroll animation, so
// the whole document reads as one tidy sheet) with a shared heading and divider.
const SECTIONS = [
  {
    id: "who-we-are",
    heading: "Who we are",
    body: (
      <p>
        This site, <strong className="text-ink">debowoseni.com</strong>, is operated by Debo&apos;
        Owoseni (&ldquo;we&rdquo;, &ldquo;us&rdquo;). We are the data controller responsible for the
        personal information collected through this website. If you have any questions about this
        policy or how your information is handled, contact us at{" "}
        <a href={`mailto:${EMAIL}`} className="lime-link">{EMAIL}</a>.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    heading: "What we collect",
    body: (
      <>
        <p>We only collect information you choose to give us:</p>
        <ul className="ml-1 space-y-2.5">
          <li className="flex gap-3"><Dot /><span><strong className="text-ink">Newsletter sign-up</strong> — your email address.</span></li>
          <li className="flex gap-3"><Dot /><span><strong className="text-ink">Contact form</strong> — your name, email address and the message you send.</span></li>
          <li className="flex gap-3"><Dot /><span><strong className="text-ink">Event registration</strong> — your name and email, and optionally a phone number and any notes you add.</span></li>
          <li className="flex gap-3"><Dot /><span><strong className="text-ink">Community or programme sign-ups</strong> — your name and email, and details relevant to that programme.</span></li>
        </ul>
        <p>
          We do not knowingly collect information from children, and we do not ask for special
          category data (such as health information) through this site.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    heading: "How we use your information, and our lawful basis",
    body: (
      <>
        <p>We use your information only for the purpose you gave it to us:</p>
        <ul className="ml-1 space-y-2.5">
          <li className="flex gap-3"><Dot /><span>To send you the newsletter and updates you signed up for — on the basis of your <strong className="text-ink">consent</strong>, which you can withdraw at any time.</span></li>
          <li className="flex gap-3"><Dot /><span>To respond to your enquiry or booking request — on the basis of our <strong className="text-ink">legitimate interest</strong> in replying, or to take steps at your request.</span></li>
          <li className="flex gap-3"><Dot /><span>To register you for an event and send confirmations, reminders and updates about it — to <strong className="text-ink">perform that registration</strong> you asked for.</span></li>
        </ul>
        <p>We do not sell your information, and we do not use it for advertising.</p>
      </>
    ),
  },
  {
    id: "email-tracking",
    heading: "Email open and click tracking",
    body: (
      <p>
        The emails we send (newsletters, event confirmations and reminders) may record whether a
        message was delivered, opened, and whether links were clicked. This helps us understand
        whether our emails are useful and reaching people. Every marketing email includes an
        unsubscribe link, and unsubscribing stops all further marketing emails.
      </p>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies and local storage",
    body: (
      <p>
        This site uses only <strong className="text-ink">strictly-necessary cookies</strong> needed
        to make it work, and your browser&apos;s local storage to remember lightweight preferences
        (such as your acknowledgement of the cookie notice). We do <strong className="text-ink">not</strong>{" "}
        use analytics, advertising, or third-party tracking cookies. Because of this, you do not need
        to accept anything for the site to function — the notice is informational.
      </p>
    ),
  },
  {
    id: "who-we-share-with",
    heading: "Who we share it with",
    body: (
      <>
        <p>
          We do not sell or trade your information. We share it only with the trusted service
          providers that help us run the site and communicate with you, who process it on our behalf
          under appropriate agreements:
        </p>
        <ul className="ml-1 space-y-2.5">
          <li className="flex gap-3"><Dot /><span><strong className="text-ink">Supabase</strong> — secure database and storage for the information above.</span></li>
          <li className="flex gap-3"><Dot /><span><strong className="text-ink">Resend</strong> — delivery of our emails, including the open/click information described above.</span></li>
          <li className="flex gap-3"><Dot /><span><strong className="text-ink">Cloudflare</strong> — hosting and delivery of the website.</span></li>
          <li className="flex gap-3"><Dot /><span><strong className="text-ink">Render</strong> — hosting of the application that processes form submissions and emails.</span></li>
        </ul>
        <p>
          Some of these providers may process data outside the UK/EEA. Where they do, appropriate
          safeguards (such as standard contractual clauses) are relied upon to protect your
          information. We may also disclose information where required by law.
        </p>
      </>
    ),
  },
  {
    id: "how-long",
    heading: "How long we keep it",
    body: (
      <p>
        We keep your information only for as long as it is needed for the purpose you gave it — for
        example, for as long as you remain subscribed, or as long as needed to handle your enquiry or
        event. If you unsubscribe or ask us to delete your information, we will do so, except where we
        need to keep a limited record to meet a legal obligation.
      </p>
    ),
  },
  {
    id: "your-rights",
    heading: "Your rights",
    body: (
      <>
        <p>Under UK data-protection law you have the right to:</p>
        <ul className="ml-1 space-y-2.5">
          <li className="flex gap-3"><Dot /><span>Access the personal information we hold about you;</span></li>
          <li className="flex gap-3"><Dot /><span>Ask us to correct anything that is inaccurate;</span></li>
          <li className="flex gap-3"><Dot /><span>Ask us to delete your information;</span></li>
          <li className="flex gap-3"><Dot /><span>Object to, or ask us to restrict, how we use it;</span></li>
          <li className="flex gap-3"><Dot /><span>Ask for a copy of your information in a portable format;</span></li>
          <li className="flex gap-3"><Dot /><span>Withdraw your consent at any time (for example, by unsubscribing).</span></li>
        </ul>
        <p>
          To exercise any of these, email us at{" "}
          <a href={`mailto:${EMAIL}`} className="lime-link">{EMAIL}</a>. We will respond within the
          timeframe required by law.
        </p>
      </>
    ),
  },
  {
    id: "complaints",
    heading: "Complaints",
    body: (
      <p>
        If you are unhappy with how we have handled your information, we would like the chance to put
        it right — please contact us first. You also have the right to complain to the UK&apos;s
        Information Commissioner&apos;s Office (ICO) at{" "}
        <a href="https://ico.org.uk" target="_blank" rel="noreferrer noopener" className="lime-link">ico.org.uk</a>.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: (
      <p>
        We may update this policy from time to time. When we do, we will revise the &ldquo;last
        updated&rdquo; date at the top of this page.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <p>
        For any privacy question or request, email{" "}
        <a href={`mailto:${EMAIL}`} className="lime-link">{EMAIL}</a>. You can also read our{" "}
        <Link to="/professional-practice" className="lime-link">Professional Practice &amp; Code of Ethics</Link>.
      </p>
    ),
  },
];

function Dot() {
  return <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime/70" />;
}

export default function PrivacyPolicy() {
  return (
    <div data-testid="privacy-policy-page">
      <Seo
        title="Privacy Policy"
        description="How debowoseni.com collects, uses, stores and protects your personal information, and your rights under UK GDPR."
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-24">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Data &amp; Privacy</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-7 max-w-4xl">
                Privacy <span className="font-display-italic text-lime">Policy</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                How your information is collected, used and protected on this site — and the rights
                you have over it.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* DOCUMENT SHEET */}
      <section className="container-page pb-24">
        <div className="container-narrow">
          <div className="rounded-[24px] border border-line bg-surface/40 p-6 text-left sm:p-8 md:p-12 lg:p-14">
            {/* meta + contents */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Privacy Policy</p>
              <p className="text-xs text-muted">Last updated: {LAST_UPDATED}</p>
            </div>
            <nav aria-label="Contents" className="mt-6 flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="chip !text-xs">{s.heading}</a>
              ))}
            </nav>

            {/* sections */}
            <div className="mt-10">
              {SECTIONS.map((s, i) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-28 border-t border-line pt-9 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-9"
                >
                  <h2 className="flex items-baseline gap-3 text-xl md:text-2xl">
                    <span className="font-display text-sm text-lime/80">{String(i + 1).padStart(2, "0")}</span>
                    <span>{s.heading}</span>
                  </h2>
                  <div className="mt-4 space-y-4 leading-relaxed text-ink/80">{s.body}</div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
