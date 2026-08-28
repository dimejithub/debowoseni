import { Reveal } from "@/components/site/Reveal";
import { Seo } from "@/components/site/Seo";

// The Professional Practice Statement, paragraph by paragraph. Kept as data so
// the page stays easy to re-typeset without touching prose.
const PRACTICE = [
  "Life Transformation Enquiry (LTE) Coaching provides a structured, reflective and action-oriented space in which individuals can examine important areas of their lives, clarify their aspirations, explore possibilities and take intentional steps towards meaningful and sustainable transformation.",
  "Our approach is grounded in the principle of enquiry.",
  "We believe that meaningful transformation is strengthened when individuals are given the space, structure and appropriate support to examine where they are, understand what may be shaping their present circumstances, clarify where they want to go, and identify practical steps towards that future.",
  "The role of the coach is therefore not to prescribe a particular way of living or to make decisions on behalf of the client. The coach facilitates reflection, asks purposeful questions, appropriately challenges assumptions, supports goal setting and accountability, and helps the client translate insight into meaningful action.",
  "LTE Coaching is committed to professional integrity, respect for human dignity, confidentiality, appropriate professional boundaries, safeguarding, responsible use of information, and continuous professional development.",
];

// The final practice paragraph is the key scope-and-limits notice; it is
// surfaced in a callout below rather than in the running text.
const PRACTICE_LIMITS =
  "Coaching is a developmental service. It is not psychotherapy, counselling, psychiatric or medical treatment, and it does not provide legal or regulated financial advice. Where issues emerge that require expertise beyond the appropriate competence or scope of coaching, the client may be encouraged or supported to seek assistance from an appropriately qualified professional.";

const CODE_OF_ETHICS = [
  ["Respect and dignity", "Every client will be treated with dignity and respect, irrespective of background, beliefs, circumstances or personal choices."],
  ["Client autonomy", "Clients retain responsibility for their own decisions and actions. The coach will support reflection and decision-making without seeking to control, manipulate or impose decisions upon the client."],
  ["Integrity", "The coach will communicate honestly about their qualifications, experience, competence and the nature and limitations of the coaching service."],
  ["Confidentiality", "Information disclosed within coaching will ordinarily be treated as confidential, subject to the limitations explained in the Coaching Agreement, including circumstances involving safeguarding concerns, serious risk of harm, legal obligations or disclosures required by law."],
  ["Professional boundaries", "Appropriate boundaries will be maintained between coaching and other relationships or professional roles. Potential conflicts of interest will be identified and managed transparently."],
  ["Competence", "Coaching will only be provided within areas in which the coach has appropriate knowledge, skills and experience. Where a client's needs extend beyond the competence or appropriate scope of coaching, referral or signposting to another suitably qualified professional will be considered."],
  ["Responsible enquiry", "Questions and interventions will be used to facilitate constructive reflection and development. The coaching relationship will not be used to pressure clients towards particular personal, religious, political, financial or relational decisions."],
  ["Responsible information management", "Personal information and coaching records will be collected, processed, stored and disposed of responsibly and in accordance with applicable UK data-protection requirements."],
  ["Safeguarding", "The safety and welfare of clients will be taken seriously. Appropriate action may be taken where there is a reasonable concern regarding abuse, neglect, exploitation or serious risk of harm."],
  ["Continuous professional development", "The coach will seek opportunities for continued learning, reflective practice, supervision or professional consultation where appropriate, and development of coaching competence."],
  ["Responsible use of technology and AI", "Digital technologies, including artificial intelligence, will only be used in ways consistent with confidentiality, data protection, transparency and the interests of clients. Confidential coaching information will not be entered into external AI systems without an appropriate lawful basis, safeguards and transparency with the client."],
  ["Accountability", "Clients have the right to raise concerns or complaints about the coaching service. Concerns will be considered fairly, respectfully and within a reasonable timeframe."],
];

export default function ProfessionalPractice() {
  return (
    <div data-testid="professional-practice-page">
      <Seo
        title="Professional Practice & Code of Ethics"
        description="Life Transformation Enquiry (LTE) Coaching — our professional practice statement, scope and limits, and code of ethics."
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="lime-glow absolute inset-x-0 top-0 h-[45vh]" aria-hidden />
        <div className="container-page relative py-20 md:py-28">
          <div className="container-narrow">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                Life Transformation Enquiry
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-7 max-w-4xl">
                Professional Practice &amp;{" "}
                <span className="font-display-italic text-lime">Code of Ethics</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-2xl text-lg md:text-xl text-ink/85">
                How LTE Coaching works, what it is — and what it is not — and the commitments
                that hold every conversation.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PROFESSIONAL PRACTICE STATEMENT */}
      <section className="container-page pb-8 pt-4">
        <div className="container-prose">
          <Reveal>
            <h2>Professional Practice Statement</h2>
          </Reveal>
          <div className="mt-8 space-y-6 text-lg leading-relaxed text-ink/85">
            {PRACTICE.map((p, i) => (
              <Reveal key={i} delay={Math.min(i * 0.04, 0.2)}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>

          {/* Scope-and-limits callout — the key disclaimer, given visual weight. */}
          <Reveal delay={0.1}>
            <div className="mt-10 rounded-[20px] border border-lime/40 bg-lime/[0.06] p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-lime/80">
                Scope &amp; limits
              </p>
              <p className="mt-4 text-lg leading-relaxed text-ink/90">
                {PRACTICE_LIMITS}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CODE OF ETHICS */}
      <section className="cream-section py-24 md:py-28">
        <div className="container-prose">
          <Reveal>
            <h2>Code of Ethics</h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-6 text-lg leading-relaxed">
              Life Transformation Enquiry is committed to ethical, respectful and responsible
              coaching or training practice.
            </p>
          </Reveal>

          <ol className="mt-12 space-y-8">
            {CODE_OF_ETHICS.map(([title, body], i) => (
              <Reveal key={title} delay={Math.min(i * 0.03, 0.24)}>
                <li className="flex gap-5">
                  <span
                    aria-hidden
                    className="font-display text-3xl leading-none text-lime md:text-4xl"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xl md:text-2xl">{title}</h3>
                    <p className="mt-2 leading-relaxed text-ink/80">{body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
