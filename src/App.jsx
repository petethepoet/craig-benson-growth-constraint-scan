import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Download,
  ExternalLink,
  Factory,
  LineChart,
  Mail,
  Phone,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

const diagnosticName = "The Industrial Growth Constraint Scan";
const headshotUrl = "/craig-benson.png";

const qualifiedTimings = ["0-90 days"];
const qualifiedTriggers = [
  "Succession",
  "PE value creation",
  "Underperformance",
  "Acquisition / integration",
  "Leadership search",
  "Commercial reset",
];
const qualifiedRoles = [
  "Owner/founder",
  "PE partner/sponsor",
  "Board member",
  "CEO/president",
  "Recruiter/search partner",
];

const questions = [
  {
    id: "customer_quality",
    label: "Customer Quality & Concentration",
    prompt:
      "Look past revenue size. How durable is the customer base, and how much enterprise value is exposed to a few relationships?",
    operatorLens:
      "Test concentration by revenue, margin, relationship owner, contract strength, switching cost, and end-market exposure.",
    evidence: [
      "Top 20 customer revenue and margin",
      "Contract terms and renewal risk",
      "Retention / churn",
      "Relationship owner map",
    ],
    options: [
      {
        score: 0,
        label: "Reactive",
        text: "Top accounts drive too much revenue or margin; key relationships are founder-held; switching costs are unclear.",
      },
      {
        score: 1,
        label: "Partially managed",
        text: "Concentration is known, but margin exposure, relationship ownership, contract quality, and end-market risk are not reviewed together.",
      },
      {
        score: 2,
        label: "Repeatable",
        text: "Revenue, margin, retention, contract quality, and relationship ownership are visible and actively managed.",
      },
    ],
  },
  {
    id: "commercial_cadence",
    label: "Commercial Cadence & Sales Management",
    prompt:
      "Is growth managed through repeatable sales leadership, or does the company still depend on heroic selling and reactive quoting?",
    operatorLens:
      "Inspect sales roles, weekly cadence, funnel stages, account planning, quote discipline, win/loss learning, and follow-through.",
    evidence: ["Sales coverage map", "Pipeline review cadence", "Win/loss notes", "Key account plans"],
    options: [
      {
        score: 0,
        label: "Reactive",
        text: "The owner or a few legacy sellers carry growth; pipeline review is informal; roles are blurry.",
      },
      {
        score: 1,
        label: "Partially managed",
        text: "Sales roles and pipeline reviews exist, but cadence, accountability, and follow-up quality vary.",
      },
      {
        score: 2,
        label: "Repeatable",
        text: "Sales coverage, account plans, win/loss review, quote discipline, and weekly cadence are defined and measured.",
      },
    ],
  },
  {
    id: "pipeline_truth",
    label: "Pipeline Truth & Forecast Quality",
    prompt:
      "Can leadership trust the pipeline enough to make hiring, inventory, capacity, and cash decisions?",
    operatorLens:
      "Separate pipeline theater from forecast-grade information by checking stage definitions, next actions, aging, and forecast history.",
    evidence: ["CRM pipeline export", "Stage definitions", "Forecast history", "Opportunity aging"],
    options: [
      {
        score: 0,
        label: "Reactive",
        text: "CRM is stale, ignored, or shadowed by spreadsheets; opportunities lack next steps.",
      },
      {
        score: 1,
        label: "Partially managed",
        text: "CRM is used, but definitions, hygiene, forecast discipline, and owner accountability are inconsistent.",
      },
      {
        score: 2,
        label: "Repeatable",
        text: "CRM drives operating decisions; stage quality, aging, owner actions, and forecast accuracy are reviewed.",
      },
    ],
  },
  {
    id: "quote_to_cash",
    label: "Quote-to-Cash & Handoff Discipline",
    prompt:
      "Where does value leak between quote, pricing, order entry, production, delivery, billing, and collections?",
    operatorLens:
      "Map the full handoff chain and look for cycle-time drag, rework, pricing exceptions, margin leakage, billing errors, and AR friction.",
    evidence: ["Quote cycle time", "Quote-hit rate", "Order accuracy", "AR aging and dispute log"],
    options: [
      {
        score: 0,
        label: "Reactive",
        text: "Slow quotes, quote errors, pricing exceptions, order rework, billing delays, and handoff problems are common.",
      },
      {
        score: 1,
        label: "Partially managed",
        text: "The process is mapped in pieces, but cycle time, quote accuracy, margin protection, and AR discipline are uneven.",
      },
      {
        score: 2,
        label: "Repeatable",
        text: "Quote-to-cash is mapped end-to-end, measured, owned, and reviewed for margin, speed, quality, and cash impact.",
      },
    ],
  },
  {
    id: "margin_architecture",
    label: "Margin Architecture & Pricing Discipline",
    prompt:
      "Can the company explain where gross margin is created, where it leaks, and who owns pricing exceptions?",
    operatorLens:
      "Pressure-test margin by customer, product, job, channel, cost-to-serve, surcharge discipline, mix, and pricing authority.",
    evidence: ["Customer profitability", "Product/job margin bridge", "Pricing exception log", "Cost-to-serve view"],
    options: [
      {
        score: 0,
        label: "Reactive",
        text: "Pricing is by feel; discounts and exceptions are hidden; profitability reporting is late or not trusted.",
      },
      {
        score: 1,
        label: "Partially managed",
        text: "Margins are reviewed, but the bridge by customer, product, job, channel, and cost-to-serve is incomplete.",
      },
      {
        score: 2,
        label: "Repeatable",
        text: "Margin drivers, leakage points, pricing authority, exceptions, mix, and customer profitability are visible and managed.",
      },
    ],
  },
  {
    id: "innovation_commercialization",
    label: "Innovation & Commercialization Cadence",
    prompt:
      "Can the business turn market insight into launched products without starving the core business?",
    operatorLens:
      "Inspect roadmap discipline, project ownership, customer validation, launch gates, engineering constraints, and revenue from recent launches.",
    evidence: ["Product roadmap", "Launch calendar", "Project owners", "Revenue from new products"],
    options: [
      {
        score: 0,
        label: "Reactive",
        text: "New products are ad hoc, engineering-led, customer-reactive, or stuck behind unclear priorities.",
      },
      {
        score: 1,
        label: "Partially managed",
        text: "A roadmap exists, but timelines, launch gates, resource tradeoffs, and accountability are inconsistent.",
      },
      {
        score: 2,
        label: "Repeatable",
        text: "Customer insight, roadmap, launch gates, owners, revenue targets, and post-launch learning are managed as a cadence.",
      },
    ],
  },
  {
    id: "leadership_system",
    label: "Leadership System & Accountability",
    prompt:
      "Does the leadership team run the business, or does the business still run through one or two people?",
    operatorLens:
      "Test decision rights, KPI ownership, meeting rhythm, talent depth, accountability, and founder dependency.",
    evidence: ["Accountability chart", "KPI owner list", "Meeting cadence", "Decision-rights map"],
    options: [
      {
        score: 0,
        label: "Reactive",
        text: "The founder or one strong operator is the system; leaders escalate too much; follow-through is weak.",
      },
      {
        score: 1,
        label: "Partially managed",
        text: "Some leaders own pieces of the business, but accountability, decision rights, and follow-through are uneven.",
      },
      {
        score: 2,
        label: "Repeatable",
        text: "Seats, KPIs, decision rights, meeting rhythm, and follow-through are clear enough to scale.",
      },
    ],
  },
  {
    id: "operating_constraints",
    label: "Operating Constraints & Delivery Reliability",
    prompt:
      "Are the real constraints visible, or is the company managing operations through expediting and tribal knowledge?",
    operatorLens:
      "Look at OTIF, backlog aging, capacity, scrap, rework, quality escapes, labor constraints, bottleneck map, and recovery cadence.",
    evidence: ["OTIF trend", "Backlog aging", "Scrap/rework data", "Constraint analysis"],
    options: [
      {
        score: 0,
        label: "Reactive",
        text: "Chronic expediting, missed ship dates, hidden bottlenecks, quality escapes, and unclear capacity are normal.",
      },
      {
        score: 1,
        label: "Partially managed",
        text: "Operating metrics exist, but root constraints, recovery ownership, and weekly improvement cadence are inconsistent.",
      },
      {
        score: 2,
        label: "Repeatable",
        text: "OTIF, backlog, scrap, rework, throughput, quality, and constraints are visible, owned, and tied to action.",
      },
    ],
  },
  {
    id: "data_decision_quality",
    label: "ERP, Data Hygiene & Decision Quality",
    prompt:
      "Can the management team get timely, trusted data without building a second business in spreadsheets?",
    operatorLens:
      "Inspect ERP trust, master data, close cadence, KPI definitions, dashboard quality, and whether reports drive decisions.",
    evidence: ["KPI dashboard", "ERP data map", "Close calendar", "Data dictionary"],
    options: [
      {
        score: 0,
        label: "Reactive",
        text: "Spreadsheet chaos, conflicting numbers, weak master data, slow close, and reporting debates slow decisions.",
      },
      {
        score: 1,
        label: "Partially managed",
        text: "ERP and dashboards exist, but leaders still question data quality, timing, definitions, or usefulness.",
      },
      {
        score: 2,
        label: "Repeatable",
        text: "ERP, KPI definitions, dashboards, close cadence, and data ownership support fast operating decisions.",
      },
    ],
  },
  {
    id: "customer_experience",
    label: "Customer Experience & Retention Signals",
    prompt:
      "Does the company know what customers experience before churn, price pressure, or service failures show up in the numbers?",
    operatorLens:
      "Inspect response time, quote accuracy, complaint trends, returns, retention, repeat orders, service recovery, and feedback loops.",
    evidence: ["Quote accuracy", "Complaint trend", "Retention / repeat order data", "Customer feedback loop"],
    options: [
      {
        score: 0,
        label: "Reactive",
        text: "Customer issues are handled reactively; complaints, service failures, and quote problems are not visible to leadership.",
      },
      {
        score: 1,
        label: "Partially managed",
        text: "Some feedback exists, but it does not consistently drive operating reviews, account strategy, or process fixes.",
      },
      {
        score: 2,
        label: "Repeatable",
        text: "Response time, quote accuracy, complaint trends, retention, and repeat-order strength are tracked and acted on.",
      },
    ],
  },
  {
    id: "integration_capacity",
    label: "Acquisition & Integration Capacity",
    prompt:
      "Could the company absorb an add-on, new site, product line, or team without breaking execution?",
    operatorLens:
      "Test process standardization, data standards, integration owner, operating cadence, customer continuity, and bandwidth.",
    evidence: ["Integration checklist", "Process map", "Master-data standards", "Org/capacity plan"],
    options: [
      {
        score: 0,
        label: "Reactive",
        text: "Processes are tribal or one-off; data is inconsistent; no one owns integration; the team is already stretched.",
      },
      {
        score: 1,
        label: "Partially managed",
        text: "Some scalable processes exist, but integration playbooks, data standards, and bandwidth are not ready.",
      },
      {
        score: 2,
        label: "Repeatable",
        text: "Integration owner, process map, data standards, communication cadence, and capacity plan are ready for add-ons.",
      },
    ],
  },
  {
    id: "value_creation_mandate",
    label: "Value-Creation Mandate & First 100 Days",
    prompt:
      "Are the top value levers, operating mandate, board expectations, and first 100-day priorities clear enough to execute?",
    operatorLens:
      "Test whether the owner or investment thesis has been translated into an operating plan with owners, metrics, cadence, and tradeoffs.",
    evidence: ["100-day plan", "Value-creation memo", "Board dashboard", "Mandate summary"],
    options: [
      {
        score: 0,
        label: "Reactive",
        text: "The mandate is vague; owners disagree on priorities; no scoreboard exists; the first 100 days are undefined.",
      },
      {
        score: 1,
        label: "Partially managed",
        text: "Value levers are named, but the operating plan, owner accountability, board rhythm, and tradeoffs are loose.",
      },
      {
        score: 2,
        label: "Repeatable",
        text: "Value levers, 100-day plan, board dashboard, decision rights, and operating cadence are clear enough to execute.",
      },
    ],
  },
];

const proof = [
  { value: "75%", label: "Revenue growth" },
  { value: "3x", label: "EBITDA growth" },
  { value: "$10M", label: "New product revenue" },
  { value: "$170M", label: "Global organization unified" },
];

const experience = [
  {
    eyebrow: "Global industrial P&L",
    title: "Johnson Screens",
    copy:
      "Led full P&L, sales, customer support, engineering, and product development for a $75M global industrial division across eight countries.",
  },
  {
    eyebrow: "Owner / president",
    title: "Micra Manufacturing",
    copy:
      "Rebuilt the operating system, led two strategic acquisitions, improved on-time delivery, reduced turnover, and diversified a concentrated customer base.",
  },
  {
    eyebrow: "Commercial transformation",
    title: "Minnesota Wire",
    copy:
      "Directed worldwide sales and marketing for an engineered wire, cable, and interconnect manufacturer while building a dedicated growth function.",
  },
  {
    eyebrow: "Discipline under pressure",
    title: "U.S. Navy",
    copy:
      "Served as a submarine officer and nuclear engineer, leading teams responsible for complex, high-consequence systems.",
  },
];

function Button({ children, className = "", variant = "solid", type = "button", ...props }) {
  const variants = {
    solid: "bg-amber-400 text-slate-950 hover:bg-amber-300",
    dark: "bg-slate-950 text-white hover:bg-slate-800",
    outline: "border border-white/25 bg-white/5 text-white hover:bg-white/10",
    ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
  };

  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-lg ${className}`}>{children}</div>;
}

function getBand(score) {
  if (score <= 8) {
    return {
      name: "Stabilize",
      color: "border-amber-300 bg-amber-100 text-amber-900",
      line:
        "The business is likely still too founder-dependent, reactive, or evidence-light to scale safely.",
      actionTitle: "First 100-day priority: build the operating foundation before bigger bets.",
      actions: [
        "Map founder-held customer, pricing, hiring, and capex decisions.",
        "Install a weekly KPI cockpit covering sales, margin, OTIF, cash, and customer risk.",
        "Clean up quote-to-cash handoffs where margin, speed, or cash leaks are visible.",
        "Review top customer concentration, retention risk, and relationship ownership.",
      ],
      avoid: [
        "Big ERP promises",
        "Add-on M&A before cadence exists",
        "Org redesign without mandate",
        "Hiring before decision rights are clear",
      ],
    };
  }

  if (score <= 16) {
    return {
      name: "Professionalize",
      color: "border-blue-300 bg-blue-100 text-blue-900",
      line:
        "The business has useful pieces, but the operating model is uneven, person-dependent, or not yet institutional.",
      actionTitle: "First 100-day priority: convert partial systems into repeatable management discipline.",
      actions: [
        "Assign named KPI owners and tighten the weekly sales, operations, and cash cadence.",
        "Build margin visibility by customer, product, job, channel, and cost-to-serve.",
        "Turn CRM, ERP, and board reporting into decision tools, not historical summaries.",
        "Clarify leadership accountability and the first talent moves needed to scale.",
      ],
      avoid: [
        "Mistaking dashboards for discipline",
        "Letting every initiative become priority one",
        "Launching add-ons before core process is repeatable",
        "Treating symptoms as root constraints",
      ],
    };
  }

  return {
    name: "Scale",
    color: "border-emerald-300 bg-emerald-100 text-emerald-900",
    line:
      "The business has credible platform traits and can focus on second-wave value creation.",
    actionTitle: "First 100-day priority: turn operating strength into enterprise-value expansion.",
    actions: [
      "Build an add-on screen tied to integration capacity and value creation logic.",
      "Create an integration kit covering data standards, process map, owners, and cadence.",
      "Identify pricing, aftermarket, channel, and customer experience upside.",
      "Upgrade board-caliber reporting around value levers, risks, owners, and milestones.",
    ],
    avoid: [
      "Complacency",
      "Assuming yesterday's operating model will scale",
      "Buying complexity without integration capacity",
      "Board reporting that hides tradeoffs",
    ],
  };
}

function scoreLabel(score) {
  return score === 0 ? "Reactive" : score === 1 ? "Partially managed" : "Repeatable";
}

function areaInsight(question, score) {
  if (score === 0) {
    return {
      interpretation: `${question.label} may be limiting enterprise value because the area is not yet supported by trusted evidence, clear ownership, or repeatable cadence.`,
      nextMove:
        "Use this as a first-30-day operating review item. Confirm the facts, identify the owner, and define the weekly metric.",
    };
  }

  if (score === 1) {
    return {
      interpretation: `${question.label} has usable pieces, but may still be too inconsistent or person-dependent to support scale with confidence.`,
      nextMove:
        "Turn the partial process into a repeatable management rhythm with evidence, owner, cadence, and decision rule.",
    };
  }

  return {
    interpretation:
      "This area appears strong enough to support more ambitious growth, margin, acquisition, or value-creation work.",
    nextMove:
      "Protect the discipline and use it as a platform for second-wave value creation.",
  };
}

function buildReportRows(answers) {
  return questions.map((question) => {
    const score = Number(answers[question.id] ?? 0);
    return { ...question, score, ...areaInsight(question, score) };
  });
}

function getQualificationStatus(lead) {
  const qualified =
    qualifiedTimings.includes(lead.timing) &&
    qualifiedTriggers.includes(lead.trigger) &&
    qualifiedRoles.includes(lead.involvement);

  return qualified ? "qualified" : "not-qualified";
}

function buildAutomatedSummary(score, band, weakAreas) {
  const constraints = weakAreas.map((area) => area.label).join(", ");
  return `Based on the answers provided, the business appears to be in the ${band.name} band with likely pressure around ${constraints}. A practical next step is to validate the evidence behind those areas before committing to a major hire, acquisition, recapitalization, or operating reset. This is an automated summary and has not been reviewed or vetted by Craig Benson.`;
}

function submitDiagnosticPayload(payload) {
  // Connect Supabase here if you want durable storage for contacts, answers, reports, and routing decisions.
  // Connect a GoHighLevel webhook here if this should create/update a CRM contact and opportunity.
  // Connect Airtable or Google Sheets here if the first production workflow should be a review queue.
  console.info("Industrial Growth Constraint Scan submission", payload);
  return Promise.resolve({ ok: true });
}

export default function App() {
  const [step, setStep] = useState("landing");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submittedPayload, setSubmittedPayload] = useState(null);
  const [lead, setLead] = useState({
    name: "",
    email: "",
    company: "",
    title: "",
    phone: "",
    revenue: "",
    ownership: "",
    trigger: "",
    timing: "",
    involvement: "",
    notes: "",
  });

  const score = useMemo(
    () => Object.values(answers).reduce((sum, value) => sum + Number(value || 0), 0),
    [answers],
  );
  const band = getBand(score);
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);
  const reportRows = useMemo(() => buildReportRows(answers), [answers]);
  const weakAreas = useMemo(
    () => [...reportRows].sort((a, b) => a.score - b.score).slice(0, 3),
    [reportRows],
  );
  const evidenceGaps = useMemo(
    () =>
      reportRows
        .filter((row) => row.score < 2)
        .flatMap((row) => row.evidence.map((item) => ({ area: row.label, item })))
        .slice(0, 10),
    [reportRows],
  );
  const routingStatus = getQualificationStatus(lead);
  const automatedSummary = buildAutomatedSummary(score, band, weakAreas);
  const currentQuestion = questions[index];

  function startScan() {
    setStep("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function answerQuestion(value) {
    const nextAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(nextAnswers);

    if (index < questions.length - 1) {
      setTimeout(() => setIndex((current) => current + 1), 120);
      return;
    }

    setTimeout(() => setStep("lead"), 120);
  }

  function resetQuiz() {
    setAnswers({});
    setIndex(0);
    setSubmittedPayload(null);
    setStep("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLeadSubmit(event) {
    event.preventDefault();
    const payload = {
      contact: lead,
      qualification: {
        timing: lead.timing,
        trigger: lead.trigger,
        role: lead.involvement,
      },
      answers,
      score,
      band: band.name,
      weakAreas: weakAreas.map((area) => ({
        id: area.id,
        label: area.label,
        score: area.score,
      })),
      evidenceGaps,
      routingStatus,
      submittedAt: new Date().toISOString(),
    };

    await submitDiagnosticPayload(payload);
    setSubmittedPayload(payload);
    setStep("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header startScan={startScan} />
      {step === "landing" && <Landing startScan={startScan} />}
      {step === "quiz" && (
        <Quiz
          answerQuestion={answerQuestion}
          currentQuestion={currentQuestion}
          index={index}
          progress={progress}
          setStep={setStep}
        />
      )}
      {step === "lead" && (
        <LeadCapture
          band={band}
          handleLeadSubmit={handleLeadSubmit}
          lead={lead}
          score={score}
          setLead={setLead}
        />
      )}
      {step === "result" && (
        <Report
          automatedSummary={automatedSummary}
          band={band}
          evidenceGaps={evidenceGaps}
          lead={lead}
          reportRows={reportRows}
          resetQuiz={resetQuiz}
          routingStatus={routingStatus}
          score={score}
          submittedPayload={submittedPayload}
          weakAreas={weakAreas}
        />
      )}
    </div>
  );
}

function Header({ startScan }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/92 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300 sm:text-sm">
            Craig Benson
          </div>
          <div className="hidden text-xs text-slate-400 sm:block">
            Industrial Growth Operator
          </div>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
          <a href="#craig" className="hover:text-white">
            Craig
          </a>
          <a href="#diagnostic" className="hover:text-white">
            Diagnostic
          </a>
          <a href="#fit" className="hover:text-white">
            Best fit
          </a>
        </nav>
        <Button onClick={startScan} className="shrink-0">
          Run the scan
        </Button>
      </div>
    </header>
  );
}

function Landing({ startScan }) {
  return (
    <main id="top">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_420px] lg:items-center lg:py-20">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
              Founder-owned and PE-backed manufacturers
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Craig Benson helps industrial companies turn growth pressure into operating discipline.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              When a manufacturer is facing succession, value creation, underperformance, acquisition integration, leadership search, or a commercial reset, the constraint is rarely one spreadsheet or one hire. Craig brings operator judgment to the places where sales, margin, execution, data, and leadership accountability meet.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={startScan} className="gap-2">
                Start the diagnostic <ArrowRight className="h-4 w-4" />
              </Button>
              <a
                href="#craig"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/5"
              >
                See Craig's background
              </a>
            </div>
          </div>
          <Card className="overflow-hidden border border-white/10 bg-white text-slate-950 shadow-2xl">
            <img
              src={headshotUrl}
              alt="Craig Benson"
              className="h-72 w-full object-cover object-center sm:h-96"
            />
            <div className="p-6">
              <div className="text-2xl font-semibold">Craig Benson</div>
              <p className="mt-2 text-slate-700">
                Industrial growth operator with P&L, owner-president, commercial transformation, and Navy nuclear leadership experience.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {proof.map((item) => (
                  <div key={item.label} className="rounded-lg bg-slate-100 p-4">
                    <div className="text-2xl font-semibold">{item.value}</div>
                    <div className="text-xs text-slate-600">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>
      <About />
      <Diagnostic startScan={startScan} />
    </main>
  );
}

function About() {
  return (
    <section id="craig" className="bg-white py-16 text-slate-950 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden border border-slate-200 bg-slate-50 shadow-xl">
            <img src={headshotUrl} alt="Craig Benson" className="h-80 w-full object-cover object-center" />
            <div className="p-6">
              <h2 className="text-3xl font-semibold">Craig Benson</h2>
              <p className="mt-2 text-slate-700">
                Industrial Growth Operator for Founder-Owned and PE-Backed Manufacturers
              </p>
              <div className="mt-5 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-700" /> 612.203.4280
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-700" /> CraigBenson0848@gmail.com
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-amber-700" /> linkedin.com/in/bensoncraig
                </div>
              </div>
            </div>
          </Card>
        </aside>
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            About Craig
          </div>
          <h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">
            A manufacturing operator who has already done the hard parts.
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-700 sm:text-xl">
            Craig has led industrial businesses through the practical work that decides whether growth becomes enterprise value: leadership cadence, sales discipline, customer diversification, margin visibility, product commercialization, ERP/CRM adoption, and operating accountability.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {proof.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="text-3xl font-semibold text-slate-950">{item.value}</div>
                <div className="mt-1 text-sm text-slate-600">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {experience.map((item) => (
              <Card key={item.title} className="border border-slate-200 bg-slate-50 p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                  {item.eyebrow}
                </div>
                <h3 className="mt-3 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-700">{item.copy}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Diagnostic({ startScan }) {
  const fitCards = [
    {
      icon: Users,
      title: "Founder transition",
      copy: "Move relationships, decisions, and operating rhythm out of the founder's head without breaking what made the company work.",
    },
    {
      icon: LineChart,
      title: "Commercial reset",
      copy: "Turn sales from reactive quoting and heroic effort into cadence, coverage, pipeline truth, and margin-aware growth.",
    },
    {
      icon: Wrench,
      title: "Operating cadence",
      copy: "Create the weekly rhythm, decision rights, and scoreboards that make execution visible and owned.",
    },
    {
      icon: ShieldCheck,
      title: "Value creation readiness",
      copy: "Translate the mandate into first-100-day priorities, board-ready reporting, and practical operating moves.",
    },
  ];

  return (
    <>
      <section id="diagnostic" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-3xl">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            {diagnosticName}
          </div>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Most growth problems are not growth problems.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            They show up as stalled sales, margin noise, missed ship dates, founder bottlenecks, weak pipeline visibility, or too many urgent meetings. The scan helps separate symptoms from the operating constraints underneath them.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {questions.map((question, index) => (
            <Card key={question.id} className="border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-300/15 text-sm font-semibold text-amber-300">
                {index + 1}
              </div>
              <div className="font-semibold text-white">{question.label}</div>
            </Card>
          ))}
        </div>
      </section>
      <section id="fit" className="bg-slate-100 py-16 text-slate-950 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              Where this fits
            </div>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Built for the uncomfortable middle stage.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              The best fit is a real industrial business with market demand, useful capabilities, and enough complexity that founder instinct, heroic sales, and spreadsheet management are no longer enough.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fitCards.map(({ icon: Icon, title, copy }) => (
              <Card key={title} className="border border-slate-200 bg-white p-6">
                <Icon className="h-7 w-7 text-amber-700" />
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-slate-600">{copy}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <Card className="border border-white/10 bg-slate-900 p-6 sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                Private diagnostic report
              </div>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                See what is probably holding the business back before the next big hire, acquisition, recap, or reset.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                The scan gives owners, sponsors, boards, and search partners a structured first read on where the business is constrained, what evidence would confirm it, and whether the situation merits a fit conversation with Craig.
              </p>
            </div>
            <Card className="border border-white/10 bg-white/5 p-6">
              <div className="space-y-4">
                {[
                  "12 evidence-based operating questions",
                  "0-24 value-creation readiness score",
                  "Top 3 constraints and evidence gaps",
                  "Recommended first 100-day moves",
                  "Qualified opportunities can request a fit conversation",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-amber-300" />
                    <span className="text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
              <Button onClick={startScan} className="mt-8 w-full">
                Start the scan
              </Button>
            </Card>
          </div>
        </Card>
      </section>
    </>
  );
}

function Quiz({ currentQuestion, index, progress, answerQuestion, setStep }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Button variant="ghost" onClick={() => setStep("landing")} className="mb-6">
        Back to landing page
      </Button>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <Card className="border border-white/10 bg-white/5 p-5 shadow-2xl sm:p-8 lg:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
              Question {index + 1} of {questions.length}
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              {currentQuestion.label}
            </h1>
            <p className="mt-3 text-lg text-slate-300">{currentQuestion.prompt}</p>
          </div>
          <BarChart3 className="hidden h-10 w-10 shrink-0 text-amber-300 sm:block" />
        </div>
        <div className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
          <div className="font-semibold text-amber-200">Operator lens</div>
          <div className="mt-1">{currentQuestion.operatorLens}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {currentQuestion.evidence.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
            >
              Evidence: {item}
            </span>
          ))}
        </div>
        <div className="mt-8 space-y-4">
          {currentQuestion.options.map((option) => (
            <button
              key={option.score}
              onClick={() => answerQuestion(option.score)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 p-5 text-left transition hover:border-amber-300/60 hover:bg-slate-800"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold text-amber-300">
                  {option.score}
                </div>
                <div>
                  <div className="font-semibold text-white">{option.label}</div>
                  <div className="mt-1 text-slate-300">{option.text}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </main>
  );
}

function LeadCapture({ lead, setLead, score, band, handleLeadSubmit }) {
  const update = (key, value) => setLead({ ...lead, [key]: value });

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
        <Card className="border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Gated private report
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Your diagnostic report is ready.
          </h1>
          <p className="mt-4 text-slate-300">
            The scan is a qualified-opportunity filter, not free consulting. If the situation appears active and aligned, you will be routed toward a fit conversation. Otherwise you will receive an automated summary that has not been reviewed or vetted by Craig Benson.
          </p>
          <div className="mt-8 rounded-lg border border-white/10 bg-slate-900 p-6">
            <div className="text-sm text-slate-400">Current score</div>
            <div className="mt-2 text-5xl font-semibold text-amber-300">{score} / 24</div>
            <div className={`mt-4 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${band.color}`}>
              {band.name}
            </div>
          </div>
        </Card>
        <Card className="border border-white/10 bg-white p-6 text-slate-950 sm:p-8">
          <h2 className="text-2xl font-semibold">Unlock the full report</h2>
          <form onSubmit={handleLeadSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input required label="Name" value={lead.name} onChange={(value) => update("name", value)} />
              <Input
                required
                label="Email"
                type="email"
                value={lead.email}
                onChange={(value) => update("email", value)}
              />
              <Input label="Company" value={lead.company} onChange={(value) => update("company", value)} />
              <Input label="Title" value={lead.title} onChange={(value) => update("title", value)} />
              <Input label="Phone" value={lead.phone} onChange={(value) => update("phone", value)} />
              <Select
                label="Revenue range"
                value={lead.revenue}
                onChange={(value) => update("revenue", value)}
                options={["$5M-$25M", "$25M-$50M", "$50M-$100M", "$100M-$250M", "$250M+"]}
              />
            </div>
            <Select
              required
              label="Ownership type"
              value={lead.ownership}
              onChange={(value) => update("ownership", value)}
              options={["Founder-owned", "Family-owned", "PE-backed", "Independent sponsor", "Board / advisor", "Other"]}
            />
            <Select
              required
              label="What triggered this?"
              value={lead.trigger}
              onChange={(value) => update("trigger", value)}
              options={[...qualifiedTriggers, "General research"]}
            />
            <Select
              required
              label="Timing of operating need"
              value={lead.timing}
              onChange={(value) => update("timing", value)}
              options={["0-90 days", "3-6 months", "6+ months", "General research"]}
            />
            <Select
              required
              label="Your role in the situation"
              value={lead.involvement}
              onChange={(value) => update("involvement", value)}
              options={[...qualifiedRoles, "Advisor/consultant", "Other"]}
            />
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Optional context
              <textarea
                value={lead.notes}
                onChange={(event) => update("notes", event.target.value)}
                className="min-h-28 rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
              />
            </label>
            <Button type="submit" variant="dark" className="mt-2">
              Show my report
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
      />
    </label>
  );
}

function Select({ label, value, onChange, options, required = false }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Report({
  automatedSummary,
  band,
  evidenceGaps,
  lead,
  reportRows,
  resetQuiz,
  routingStatus,
  score,
  submittedPayload,
  weakAreas,
}) {
  const isQualified = routingStatus === "qualified";

  return (
    <main className="report-page mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300 print:text-amber-700">
            Private growth constraint report
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white print:text-slate-950 sm:text-4xl">
            Industrial Growth Constraint Report
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300 print:text-slate-700">
            This report summarizes likely operating constraints based on the answers provided. It is meant to frame a sharper conversation, not replace diligence.
          </p>
        </div>
        <div className="flex flex-col gap-3 print:hidden sm:flex-row">
          <Button onClick={() => window.print()} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Print / Save as PDF
          </Button>
          <Button onClick={resetQuiz} variant="ghost">
            Retake
          </Button>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <Card className="report-card border border-white/10 bg-white/5 p-6 print:border-slate-200 print:bg-white sm:p-8">
          <div className="text-sm text-slate-400 print:text-slate-500">Total readiness score</div>
          <div className="mt-2 text-6xl font-semibold text-white print:text-slate-950 sm:text-7xl">
            {score}
            <span className="text-2xl text-slate-400 sm:text-3xl"> / 24</span>
          </div>
          <div className={`mt-5 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${band.color}`}>
            {band.name}
          </div>
          <p className="mt-5 leading-7 text-slate-300 print:text-slate-700">{band.line}</p>
          <div className="mt-8 rounded-lg border border-white/10 bg-slate-900 p-5 print:border-slate-200 print:bg-slate-50">
            <div className="text-sm font-semibold text-amber-300 print:text-amber-700">Submitted context</div>
            <div className="mt-3 space-y-2 text-sm text-slate-300 print:text-slate-700">
              {["name", "company", "title", "revenue", "ownership", "trigger", "timing", "involvement"].map((key) => (
                <div key={key}>
                  <span className="text-slate-500">{key}:</span> {lead[key] || "Not provided"}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="report-card border border-white/10 bg-white p-6 text-slate-950 sm:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Operator readout
          </div>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{band.actionTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            The score is not the answer. It is the starting point. The next step is to validate evidence, separate symptoms from root constraints, and decide what should happen in the first 100 days.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ReportPanel title="Top constraint areas">
              {weakAreas.map((area, index) => (
                <div key={area.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-amber-700">
                    #{index + 1} | {scoreLabel(area.score)}
                  </div>
                  <div className="mt-1 font-semibold">{area.label}</div>
                  <div className="mt-2 text-sm text-slate-600">{area.interpretation}</div>
                </div>
              ))}
            </ReportPanel>
            <ReportPanel title="Likely first priorities">
              {band.actions.map((action) => (
                <div key={action} className="flex gap-3 rounded-lg bg-white p-4 text-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <div>{action}</div>
                </div>
              ))}
            </ReportPanel>
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="report-card border border-white/10 bg-white p-6 text-slate-950 sm:p-8 lg:col-span-2">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Area-by-area scorecard
          </div>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">What the answers suggest</h2>
          <div className="mt-6 space-y-4">
            {reportRows.map((row, index) => (
              <div key={row.id} className="report-row rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-1 text-xl font-semibold">{row.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{row.prompt}</p>
                  </div>
                  <div className="w-24 rounded-lg bg-white px-4 py-3 text-center shadow-sm">
                    <div className="text-2xl font-semibold text-slate-950">{row.score}</div>
                    <div className="text-xs text-slate-500">{scoreLabel(row.score)}</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <Info title="Operator lens" text={row.operatorLens} />
                  <Info title="Interpretation" text={row.interpretation} />
                  <Info title="What this may indicate" text={row.nextMove} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <aside className="space-y-6">
          <Card className="report-card border border-white/10 bg-white p-6 text-slate-950 sm:p-8">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              What to review next
            </div>
            <h2 className="mt-3 text-2xl font-semibold">Useful diligence areas</h2>
            <div className="mt-5 space-y-3">
              {evidenceGaps.map((gap, index) => (
                <div key={`${gap.area}-${gap.item}-${index}`} className="rounded-lg bg-slate-50 p-4 text-sm">
                  <div className="font-semibold">{gap.item}</div>
                  <div className="mt-1 text-xs text-slate-500">Related constraint: {gap.area}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="report-card border border-white/10 bg-white p-6 text-slate-950 sm:p-8">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              What to avoid
            </div>
            <h2 className="mt-3 text-2xl font-semibold">Common wrong moves</h2>
            <div className="mt-5 space-y-3">
              {band.avoid.map((item) => (
                <div key={item} className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="report-card border border-amber-300/30 bg-amber-300/10 p-6 text-amber-50 print:border-slate-200 print:bg-slate-50 print:text-slate-950 sm:p-8">
            {isQualified ? (
              <>
                <h2 className="text-2xl font-semibold">Request a fit conversation</h2>
                <p className="mt-3 leading-7 text-amber-100 print:text-slate-700">
                  This appears to involve an active operating need and a role connected to the decision. If there is a serious mandate behind the situation, request a fit conversation with Craig.
                </p>
                <a
                  href={`mailto:CraigBenson0848@gmail.com?subject=${encodeURIComponent(
                    "Fit conversation request - Industrial Growth Constraint Scan",
                  )}&body=${encodeURIComponent(
                    `Name: ${lead.name}\nCompany: ${lead.company}\nScore: ${score}/24\nBand: ${band.name}\nTrigger: ${lead.trigger}\nTiming: ${lead.timing}\nRole: ${lead.involvement}`,
                  )}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 print:hidden"
                >
                  Request a fit conversation
                </a>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold">Automated summary</h2>
                <p className="mt-3 leading-7 text-amber-100 print:text-slate-700">{automatedSummary}</p>
                <p className="mt-4 text-sm text-amber-100 print:text-slate-700">
                  This response is automated and has not been reviewed or vetted by Craig Benson.
                </p>
              </>
            )}
            <div className="mt-4 text-sm text-amber-100 print:text-slate-700">
              Craig Benson | 612.203.4280 | CraigBenson0848@gmail.com
            </div>
          </Card>
        </aside>
      </section>
      {submittedPayload ? (
        <div className="sr-only" aria-live="polite">
          Submission routed as {submittedPayload.routingStatus}
        </div>
      ) : null}
    </main>
  );
}

function ReportPanel({ title, children }) {
  return (
    <div className="rounded-lg bg-slate-50 p-5">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Info({ title, text }) {
  return (
    <div className="rounded-lg bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}
