import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Mail, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { LTE_PROGRAMMES_URL } from "@/lib/data";
import { subscribeNewsletter } from "@/lib/api";

/**
 * EnquiryQuiz — 3-question recommender.
 * mode="lte"    → recommends one of the three LTE pathways (anchors on the LTE page).
 * mode="global" → recommends the right Expression (LTE / Academic / Marriage).
 * currentKey    → when the global quiz sits on an Expression page, pass that page's
 *                 key so a matching result says "you're in the right place".
 */

const QUIZZES = {
  lte: {
    noun: "pathway",
    questions: [
      {
        q: "How do you prefer to do deep work?",
        options: [
          { label: "Privately — one-to-one, over a few weeks", key: "tier-1" },
          { label: "In a room with others — one focused day", key: "tier-2" },
          { label: "Live online — from wherever I am", key: "tier-3" },
        ],
      },
      {
        q: "How much can you commit right now?",
        options: [
          { label: "Three 90-minute sessions across two weeks", key: "tier-1" },
          { label: "One full day, in person", key: "tier-2" },
          { label: "One full day, online", key: "tier-3" },
        ],
      },
      {
        q: "What do you most need?",
        options: [
          { label: "A personalised Life-Map built around my whole life", key: "tier-1" },
          { label: "The energy and accountability of a small group", key: "tier-2" },
          { label: "The full shift — without the travel", key: "tier-3" },
        ],
      },
    ],
    results: {
      "tier-1": {
        title: "1 to 1 Coaching",
        meta: "3 sessions · Online · Flexible dates",
        body: "Private, structured recalibration built entirely around you — delivered over 14 days.",
      },
      "tier-2": {
        title: "Bootcamp — In-Person Intensive",
        meta: "1 day · 6 hours · Leicester, UK",
        body: "One focused day in one room — from foggy to resolved, with a small group doing the same work.",
      },
      "tier-3": {
        title: "Bootcamp — Online Intensive",
        meta: "1 day · 6 hours · Live on Zoom",
        body: "The full LTE process delivered live online — no travel required.",
      },
    },
  },
  global: {
    noun: "expression",
    questions: [
      {
        q: "What's pressing on you most right now?",
        options: [
          { label: "My direction, purpose and next chapter", key: "lte" },
          { label: "My research, thesis or publications", key: "academic" },
          { label: "My marriage — or a relationship heading there", key: "marriage" },
        ],
      },
      {
        q: "Which sounds most like you?",
        options: [
          { label: "Capable and driven — but living in compartments", key: "lte" },
          { label: "A researcher or postgraduate under academic pressure", key: "academic" },
          { label: "A couple or single preparing for covenant", key: "marriage" },
        ],
      },
      {
        q: "What would a win look like in 90 days?",
        options: [
          { label: "One coherent, purposeful direction", key: "lte" },
          { label: "Clarity, structure and momentum in my work", key: "academic" },
          { label: "A relationship rooted in purpose and shared vision", key: "marriage" },
        ],
      },
    ],
    results: {
      lte: {
        title: "Life Transformation Enquiry™",
        body: "Your answers point to the core LTE work — recalibrating your roles, work and purpose into one coherent direction.",
        to: "/expressions/life-transformation-enquiry",
      },
      academic: {
        title: "Academic Research Insight™",
        body: "Your answers point to focused academic support — methodology, structure, writing and publication strategy.",
        to: "/expressions/academic-research-insight",
      },
      marriage: {
        title: "Marriage 101: Back2Basics",
        body: "Your answers point to relationship work — building, or preparing for, a marriage rooted in purpose, clarity and shared vision.",
        to: "/expressions/marriage-101",
      },
    },
  },
};

export function EnquiryQuiz({ mode = "global", currentKey = null }) {
  const quiz = QUIZZES[mode];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pending, setPending] = useState(false);

  const pick = (key) => {
    setAnswers([...answers, key]);
    setStep(step + 1);
  };
  const reset = () => {
    setAnswers([]);
    setStep(0);
    setUnlocked(false);
  };

  // Email gate: capture the visitor before revealing the recommendation.
  // Capture is best-effort — an API hiccup never blocks the result.
  const submitEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    setPending(true);
    try {
      // Tag the capture with the quiz result so the mailing list can be
      // segmented by what each person actually needs (quiz:lte, quiz:tier-2…).
      await subscribeNewsletter(email, {
        source: `quiz:${mode}`,
        tags: ["quiz", `quiz:${mode}`, ...(resultKey ? [`quiz:${resultKey}`] : [])],
      });
      toast.success("You're on the list.", {
        description: "Your recommendation is below — insights will follow by email.",
      });
    } catch {
      // ignore — still reveal the result
    } finally {
      setPending(false);
      setUnlocked(true);
    }
  };

  const answered = step >= quiz.questions.length;
  let resultKey = null;
  if (answered) {
    const counts = {};
    answers.forEach((k) => {
      counts[k] = (counts[k] || 0) + 1;
    });
    resultKey = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  }
  const result = answered ? quiz.results[resultKey] : null;

  return (
    <div
      className="rounded-[24px] border border-line bg-surface p-6 text-left md:p-10"
      data-testid="enquiry-quiz"
    >
      <AnimatePresence mode="wait">
        {!answered ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.24em] text-muted" data-testid="quiz-progress">
                Question {step + 1} / {quiz.questions.length}
              </p>
              <div className="flex gap-1.5" aria-hidden>
                {quiz.questions.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i <= step ? "w-6 bg-lime" : "w-3 bg-line"
                    }`}
                  />
                ))}
              </div>
            </div>
            <h3 className="mt-5 font-display text-2xl tracking-tight text-ink md:text-3xl">
              {quiz.questions[step].q}
            </h3>
            <div className="mt-7 space-y-3">
              {quiz.questions[step].options.map((o, idx) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => pick(o.key)}
                  data-cursor="hover"
                  className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-line bg-bg px-5 py-4 text-left text-ink/85 transition-all duration-300 hover:border-lime hover:text-ink"
                  data-testid={`quiz-option-${idx}`}
                >
                  <span>{o.label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-lime group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </motion.div>
        ) : !unlocked ? (
          <motion.div
            key="gate"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            data-testid="quiz-email-gate"
          >
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted">
              <Sparkles className="h-4 w-4 text-lime" /> Your recommendation is ready
            </p>
            <h3 className="mt-4 font-display text-2xl tracking-tight text-ink md:text-3xl">
              Where should we send it?
            </h3>
            <p className="mt-3 max-w-md text-sm text-muted">
              Enter your email to reveal your result — plus occasional insights from
              Dr. Debo&apos;. Unsubscribe anytime.
            </p>
            <form onSubmit={submitEmail} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <span className="relative flex-1">
                <Mail className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full border border-line bg-bg py-3.5 pl-12 pr-5 text-sm text-ink placeholder:text-muted transition-colors focus:border-lime focus:outline-none"
                  data-testid="quiz-email-input"
                />
              </span>
              <button
                type="submit"
                disabled={pending}
                className="btn-lime justify-center disabled:opacity-60"
                data-testid="quiz-email-submit"
              >
                {pending ? "Unlocking…" : "Reveal my recommendation"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            data-testid="quiz-result"
          >
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted">
              <Sparkles className="h-4 w-4 text-lime" /> Your recommended {quiz.noun}
            </p>
            <h3 className="mt-4 font-display text-3xl tracking-tight md:text-4xl">
              <span className="font-display-italic text-lime">{result.title}</span>
            </h3>
            {result.meta && <p className="mt-2 text-sm text-muted">{result.meta}</p>}
            <p className="mt-4 max-w-xl text-ink/85">{result.body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ResultCta mode={mode} resultKey={resultKey} result={result} currentKey={currentKey} />
              <button type="button" onClick={reset} className="btn-ghost" data-testid="quiz-retake">
                <RotateCcw className="h-4 w-4" /> Retake
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultCta({ mode, resultKey, result, currentKey }) {
  if (mode === "lte") {
    return (
      <>
        <a href={`#${resultKey}`} className="btn-lime" data-testid="quiz-result-cta">
          See this pathway <ArrowRight className="h-4 w-4" />
        </a>
        <Link
          to={`${LTE_PROGRAMMES_URL}#${resultKey}`}
          className="btn-ghost"
          data-testid="quiz-result-book"
        >
          Book on the programmes page <ArrowUpRight className="h-4 w-4" />
        </Link>
      </>
    );
  }
  if (currentKey === resultKey) {
    return (
      <Link to="/contact" className="btn-lime" data-testid="quiz-result-cta">
        You&apos;re in the right place — begin here <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <Link to={result.to} className="btn-lime" data-testid="quiz-result-cta">
      Explore {result.title} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
