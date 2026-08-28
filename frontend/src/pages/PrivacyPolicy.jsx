import { Link } from "react-router-dom";
import { Reveal } from "@/components/site/Reveal";
import { Seo } from "@/components/site/Seo";
import { CONTACT_EMAIL } from "@/lib/data";

const LAST_UPDATED = "28 August 2026";

// Each section is data so the page stays easy to re-typeset. `body` is an array
// of paragraphs; `list` is an optional bulleted list rendered after them.
function Section({ heading, children }) {
  return (
    <Reveal>
      <section className="mt-12 first:mt-0">
        <h2 className="text-2xl md:text-3xl">{heading}</h2>
        <div className="mt-5 space-y-4 leading-relaxed text-ink/85">{children}</div>
      </section>
    </Reveal>
  );
}

export default function PrivacyPolicy() {
  const email = CONTACT_EMAIL;
  return (
    <div data-testid="privacy-policy-page">
      <Seo
        title="Privacy Policy"
        description="How debowoseni.com collects, uses, stores and protects your personal information, and your rights under UK GDPR."
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
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
                How your information is collected, used and protected on this site — and the
                rights you have over it.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 text-sm text-muted">Last updated: {LAST_UPDATED}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="container-page pb-24 pt-4">
        <div className="container-prose">
          <Section heading="Who we are">
            <p>
              This site, <strong>debowoseni.com</strong>, is operated by Debo&apos; Owoseni
              (&ldquo;we&rdquo;, &ldquo;us&rdquo;). We are the data controller responsible for the
              personal information collected through this website. If you have any questions about
              this policy or how your information is handled, contact us at{" "}
              <a href={`mailto:${email}`} className="lime-link">{email}</a>.
            </p>
          </Section>

          <Section heading="What we collect">
            <p>We only collect information you choose to give us. Depending on how you use the site, that may include:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li><strong>Newsletter sign-up</strong> — your email address.</li>
              <li><strong>Contact form</strong> — your name, email address and the message you send.</li>
              <li><strong>Event registration</strong> — your name and email, and optionally a phone number and any notes you add.</li>
              <li><strong>Community or programme sign-ups</strong> — your name and email, and details relevant to that programme.</li>
            </ul>
            <p>
              We do not knowingly collect information from children, and we do not ask for special
              category data (such as health information) through this site.
            </p>
          </Section>

          <Section heading="How we use your information, and our lawful basis">
            <p>We use your information only for the purpose you gave it to us:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>To send you the newsletter and related updates you signed up for — on the basis of your <strong>consent</strong>, which you can withdraw at any time.</li>
              <li>To respond to your enquiry or booking request — on the basis of our <strong>legitimate interest</strong> in replying to people who contact us, or to take steps at your request.</li>
              <li>To register you for an event and send you confirmations, reminders and updates about that event — to <strong>perform that registration</strong> you asked for.</li>
            </ul>
            <p>We do not sell your information, and we do not use it for advertising.</p>
          </Section>

          <Section heading="Email open and click tracking">
            <p>
              The emails we send (newsletters, event confirmations and reminders) may record whether
              a message was delivered, opened, and whether links were clicked. This helps us
              understand whether our emails are useful and reaching people. Every marketing email
              includes an unsubscribe link, and unsubscribing stops all further marketing emails.
            </p>
          </Section>

          <Section heading="Cookies and local storage">
            <p>
              This site uses only <strong>strictly-necessary cookies</strong> needed to make it work,
              and your browser&apos;s local storage to remember lightweight preferences (such as your
              acknowledgement of the cookie notice). We do <strong>not</strong> use analytics,
              advertising, or third-party tracking cookies. Because of this, you do not need to
              accept anything for the site to function — the notice is informational.
            </p>
          </Section>

          <Section heading="Who we share it with">
            <p>
              We do not sell or trade your information. We share it only with the trusted service
              providers that help us run the site and communicate with you, who process it on our
              behalf under appropriate agreements:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li><strong>Supabase</strong> — secure database and storage for the information above.</li>
              <li><strong>Resend</strong> — delivery of our emails, including the open/click information described above.</li>
              <li><strong>Cloudflare</strong> — hosting and delivery of the website.</li>
              <li><strong>Render</strong> — hosting of the application that processes form submissions and emails.</li>
            </ul>
            <p>
              Some of these providers may process data outside the UK/EEA. Where they do, appropriate
              safeguards (such as standard contractual clauses) are relied upon to protect your
              information. We may also disclose information where required by law.
            </p>
          </Section>

          <Section heading="How long we keep it">
            <p>
              We keep your information only for as long as it is needed for the purpose you gave it —
              for example, for as long as you remain subscribed, or as long as needed to handle your
              enquiry or event. If you unsubscribe or ask us to delete your information, we will do so,
              except where we need to keep a limited record to meet a legal obligation.
            </p>
          </Section>

          <Section heading="Your rights">
            <p>Under UK data-protection law you have the right to:</p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Access the personal information we hold about you;</li>
              <li>Ask us to correct anything that is inaccurate;</li>
              <li>Ask us to delete your information;</li>
              <li>Object to, or ask us to restrict, how we use it;</li>
              <li>Ask for a copy of your information in a portable format;</li>
              <li>Withdraw your consent at any time (for example, by unsubscribing).</li>
            </ul>
            <p>
              To exercise any of these, email us at{" "}
              <a href={`mailto:${email}`} className="lime-link">{email}</a>. We will respond within
              the timeframe required by law.
            </p>
          </Section>

          <Section heading="Complaints">
            <p>
              If you are unhappy with how we have handled your information, we would like the chance
              to put it right — please contact us first. You also have the right to complain to the
              UK&apos;s Information Commissioner&apos;s Office (ICO) at{" "}
              <a href="https://ico.org.uk" target="_blank" rel="noreferrer noopener" className="lime-link">ico.org.uk</a>.
            </p>
          </Section>

          <Section heading="Changes to this policy">
            <p>
              We may update this policy from time to time. When we do, we will revise the &ldquo;last
              updated&rdquo; date at the top of this page.
            </p>
          </Section>

          <Section heading="Contact">
            <p>
              For any privacy question or request, email{" "}
              <a href={`mailto:${email}`} className="lime-link">{email}</a>. You can also read our{" "}
              <Link to="/professional-practice" className="lime-link">Professional Practice &amp; Code of Ethics</Link>.
            </p>
          </Section>
        </div>
      </section>
    </div>
  );
}
