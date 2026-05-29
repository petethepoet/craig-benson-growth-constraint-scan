const DEFAULT_TO = "CraigBenson0848@gmail.com";
const DEFAULT_FROM = "Craig Benson Scan <scan@craigbenson.us>";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestPost({ request, env }) {
  try {
    const payload = await request.json();
    const validationError = validatePayload(payload);

    if (validationError) {
      return json({ ok: false, error: validationError }, 400);
    }

    const resendApiKey = env.RESEND_API_KEY?.replace(/\s+/g, "");

    if (!resendApiKey) {
      return json(
        {
          ok: false,
          error: "Email delivery is not configured yet. Missing RESEND_API_KEY.",
        },
        500,
      );
    }

    const to = env.EMAIL_TO?.trim() || DEFAULT_TO;
    const from = env.EMAIL_FROM?.trim() || DEFAULT_FROM;
    const subject = buildSubject(payload);
    const email = {
      from,
      to,
      reply_to: payload.contact.email,
      subject,
      text: buildTextEmail(payload),
      html: buildHtmlEmail(payload),
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(email),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Email provider rejected submission", {
        status: response.status,
        message: result.message || "Unknown provider error.",
      });
      return json(
        {
          ok: false,
          error: "Email delivery is not available right now.",
        },
        500,
      );
    }

    return json({ ok: true, emailId: result.id || null });
  } catch (error) {
    console.error("Submission processing failed", error);
    return json(
      {
        ok: false,
        error: "Could not process the submission.",
      },
      500,
    );
  }
}

export async function onRequestGet() {
  return json({ ok: true, endpoint: "Industrial Growth Constraint Scan submission" });
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") return "Missing submission payload.";
  if (!payload.contact?.name) return "Name is required.";
  if (!payload.contact?.email) return "Email is required.";
  if (!payload.contact?.company) return "Company is required.";
  if (!payload.answers || typeof payload.answers !== "object") return "Diagnostic answers are missing.";
  if (!payload.report || typeof payload.report !== "object") return "Diagnostic report is missing.";
  return "";
}

function buildSubject(payload) {
  const route = payload.routingStatus === "qualified" ? "Qualified" : "Automated";
  const company = payload.contact.company || "Unknown company";
  return `[${route}] Craig Benson scan - ${company}`;
}

function buildTextEmail(payload) {
  const weakAreas = Array.isArray(payload.report.weakAreas) ? payload.report.weakAreas : [];
  const evidenceGaps = Array.isArray(payload.report.evidenceGaps) ? payload.report.evidenceGaps : [];
  const firstPriorities = Array.isArray(payload.report.firstPriorities) ? payload.report.firstPriorities : [];
  const lines = [
    "Industrial Growth Constraint Scan submission",
    "",
    "CONTACT",
    `Name: ${payload.contact.name || ""}`,
    `Email: ${payload.contact.email || ""}`,
    `Company: ${payload.contact.company || ""}`,
    `Title: ${payload.contact.title || ""}`,
    `Phone: ${payload.contact.phone || ""}`,
    "",
    "QUALIFICATION",
    `Routing: ${payload.routingStatus}`,
    `Trigger: ${payload.qualification?.trigger || ""}`,
    `Timing: ${payload.qualification?.timing || ""}`,
    `Role: ${payload.qualification?.role || ""}`,
    `Ownership: ${payload.contact.ownership || ""}`,
    `Revenue: ${payload.contact.revenue || ""}`,
    `Decision: ${payload.contact.decision || ""}`,
    `Notes: ${payload.contact.notes || ""}`,
    "",
    "REPORT",
    `Score: ${payload.report.score}/24`,
    `Band: ${payload.report.band}`,
    `Constraint pattern: ${payload.report.constraintPattern}`,
    `Commercial implication: ${payload.report.commercialImplication}`,
    "",
    "TOP WEAK AREAS",
    ...weakAreas.map(
      (area, index) => `${index + 1}. ${area.label} (${area.score}) - ${area.interpretation}`,
    ),
    "",
    "EVIDENCE GAPS",
    ...evidenceGaps.map((gap) => `- ${gap.item} (${gap.area})`),
    "",
    "FIRST PRIORITIES",
    ...firstPriorities.map((item) => `- ${item}`),
    "",
    "ANSWERS",
    ...Object.entries(payload.answers).map(([key, value]) => `${key}: ${value}`),
    "",
    `Submitted: ${payload.submittedAt}`,
  ];

  if (payload.routingStatus !== "qualified") {
    lines.splice(
      lines.indexOf("ANSWERS"),
      0,
      "AUTOMATED SUMMARY",
      payload.report.automatedSummary || "",
      "",
    );
  }

  return lines.join("\n");
}

function buildHtmlEmail(payload) {
  const reportWeakAreas = Array.isArray(payload.report.weakAreas) ? payload.report.weakAreas : [];
  const reportEvidenceGaps = Array.isArray(payload.report.evidenceGaps) ? payload.report.evidenceGaps : [];
  const reportFirstPriorities = Array.isArray(payload.report.firstPriorities) ? payload.report.firstPriorities : [];
  const weakAreas = reportWeakAreas
    .map(
      (area) =>
        `<li><strong>${escapeHtml(area.label)}</strong> (${area.score})<br />${escapeHtml(area.interpretation)}</li>`,
    )
    .join("");
  const evidenceGaps = reportEvidenceGaps
    .map((gap) => `<li>${escapeHtml(gap.item)} <span style="color:#64748b;">(${escapeHtml(gap.area)})</span></li>`)
    .join("");
  const priorities = reportFirstPriorities.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const answers = Object.entries(payload.answers)
    .map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(String(value))}</td></tr>`)
    .join("");

  return `<!doctype html>
<html>
  <body style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5;">
    <h1>Industrial Growth Constraint Scan submission</h1>
    <p><strong>Routing:</strong> ${escapeHtml(payload.routingStatus)}</p>
    <h2>Contact</h2>
    <p>
      <strong>${escapeHtml(payload.contact.name || "")}</strong><br />
      ${escapeHtml(payload.contact.email || "")}<br />
      ${escapeHtml(payload.contact.company || "")}<br />
      ${escapeHtml(payload.contact.title || "")}<br />
      ${escapeHtml(payload.contact.phone || "")}
    </p>
    <h2>Qualification</h2>
    <ul>
      <li>Trigger: ${escapeHtml(payload.qualification?.trigger || "")}</li>
      <li>Timing: ${escapeHtml(payload.qualification?.timing || "")}</li>
      <li>Role: ${escapeHtml(payload.qualification?.role || "")}</li>
      <li>Ownership: ${escapeHtml(payload.contact.ownership || "")}</li>
      <li>Revenue: ${escapeHtml(payload.contact.revenue || "")}</li>
    </ul>
    <p><strong>Decision:</strong> ${escapeHtml(payload.contact.decision || "")}</p>
    <p><strong>Notes:</strong> ${escapeHtml(payload.contact.notes || "")}</p>
    <h2>Report</h2>
    <p><strong>Score:</strong> ${payload.report.score}/24<br />
    <strong>Band:</strong> ${escapeHtml(payload.report.band)}<br />
    <strong>Constraint pattern:</strong> ${escapeHtml(payload.report.constraintPattern)}<br />
    <strong>Commercial implication:</strong> ${escapeHtml(payload.report.commercialImplication)}</p>
    ${
      payload.routingStatus !== "qualified"
        ? `<h2>Automated summary</h2><p>${escapeHtml(payload.report.automatedSummary || "")}</p>`
        : ""
    }
    <h2>Top weak areas</h2>
    <ol>${weakAreas}</ol>
    <h2>Evidence gaps</h2>
    <ul>${evidenceGaps}</ul>
    <h2>First priorities</h2>
    <ul>${priorities}</ul>
    <h2>Answers</h2>
    <table cellpadding="6" cellspacing="0" border="1">${answers}</table>
    <p style="color:#64748b;">Submitted: ${escapeHtml(payload.submittedAt || "")}</p>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
