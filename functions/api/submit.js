const DEFAULT_TO = ["CraigBenson0848@gmail.com", "thewriters@gmail.com"];
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

    const to = parseRecipients(env.EMAIL_TO) || DEFAULT_TO;
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

function parseRecipients(value) {
  if (!value?.trim()) return null;
  const recipients = value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  return recipients.length ? recipients : null;
}

function buildSubject(payload) {
  const route = payload.leadRoute || (payload.routingStatus === "qualified" ? "Qualified" : "AI Summary");
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
    `Lead route: ${payload.leadRoute || ""}`,
    `Trigger: ${payload.qualification?.trigger || ""}`,
    `Timing: ${payload.qualification?.timing || ""}`,
    `Audience: ${payload.qualification?.audienceType || payload.qualification?.role || ""}`,
    `Looking for: ${payload.qualification?.lookingFor || ""}`,
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
  const reportRows = Array.isArray(payload.report.reportRows) ? payload.report.reportRows : [];
  const reportWeakAreas = Array.isArray(payload.report.weakAreas) ? payload.report.weakAreas : [];
  const reportEvidenceGaps = Array.isArray(payload.report.evidenceGaps) ? payload.report.evidenceGaps : [];
  const reportFirstPriorities = Array.isArray(payload.report.firstPriorities) ? payload.report.firstPriorities : [];
  const avoid = Array.isArray(payload.report.avoid) ? payload.report.avoid : [];
  const routeIsQualified = payload.routingStatus === "qualified";
  const leadRoute = payload.leadRoute || (routeIsQualified ? "Paid Advisory Opportunity" : "Nurture / AI Summary");
  const score = Number(payload.report.score ?? payload.score ?? 0);
  const band = payload.report.band || payload.band || "";
  const bandLine = payload.report.bandLine || "";
  const constraintPattern = payload.report.constraintPattern || "";
  const commercialImplication = payload.report.commercialImplication || "";
  const actionTitle = payload.report.actionTitle || "First 100-day priority: convert partial systems into repeatable management discipline.";
  const submittedAt = payload.submittedAt ? new Date(payload.submittedAt).toLocaleString("en-US") : "";
  const rowSource = reportRows.length
    ? reportRows
    : reportWeakAreas.map((area) => ({
        label: area.label,
        score: area.score,
        prompt: "",
        operatorLens: area.nextMove || "",
        interpretation: area.interpretation || "",
        nextMove: area.nextMove || "",
      }));
  const areaRows = rowSource
    .map(
      (row, index) => `
        <tr>
          <td style="padding:18px 0;border-top:1px solid #e2e8f0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;padding-right:18px;">
                  <div style="font-size:11px;font-weight:700;color:#64748b;">${String(index + 1).padStart(2, "0")}</div>
                  <div style="font-size:18px;line-height:24px;font-weight:800;color:#0f172a;margin-top:4px;">${escapeHtml(row.label || "")}</div>
                  <div style="font-size:13px;line-height:20px;color:#475569;margin-top:8px;">${escapeHtml(row.prompt || "")}</div>
                </td>
                <td width="82" style="vertical-align:top;">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;text-align:center;padding:10px 8px;">
                    <div style="font-size:24px;font-weight:800;color:#0f172a;">${escapeHtml(row.score ?? "")}</div>
                    <div style="font-size:11px;color:#64748b;">${escapeHtml(scoreLabelForEmail(row.score))}</div>
                  </div>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
              <tr>
                ${emailInfoCell("Operator lens", row.operatorLens)}
                ${emailInfoCell("Interpretation", row.interpretation)}
                ${emailInfoCell("What this may indicate", row.nextMove)}
              </tr>
            </table>
          </td>
        </tr>`,
    )
    .join("");
  const topAreas = reportWeakAreas
    .map(
      (area, index) => `
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-top:10px;">
          <div style="font-size:11px;font-weight:800;color:#b45309;">#${index + 1} | ${escapeHtml(scoreLabelForEmail(area.score))}</div>
          <div style="font-size:14px;font-weight:800;color:#0f172a;margin-top:4px;">${escapeHtml(area.label || "")}</div>
          <div style="font-size:12px;line-height:18px;color:#475569;margin-top:6px;">${escapeHtml(area.interpretation || "")}</div>
        </div>`,
    )
    .join("");
  const priorities = reportFirstPriorities.map((item) => emailListItem(item)).join("");
  const evidenceGaps = reportEvidenceGaps
    .map(
      (gap) => `
        <div style="background:#f8fafc;border-radius:8px;padding:12px;margin-top:8px;">
          <div style="font-size:13px;font-weight:800;color:#0f172a;">${escapeHtml(gap.item || "")}</div>
          <div style="font-size:11px;color:#64748b;margin-top:3px;">Related constraint: ${escapeHtml(gap.area || "")}</div>
        </div>`,
    )
    .join("");
  const avoidItems = avoid.map((item) => emailListItem(item)).join("");
  const submittedContext = [
    ["Name", payload.contact.name],
    ["Email", payload.contact.email],
    ["Company", payload.contact.company],
    ["Title", payload.contact.title],
    ["Phone", payload.contact.phone],
    ["Revenue", payload.contact.revenue],
    ["Ownership", payload.contact.ownership],
    ["Trigger", payload.qualification?.trigger],
    ["Timing", payload.qualification?.timing],
    ["Audience", payload.qualification?.audienceType || payload.qualification?.role],
    ["Looking for", payload.qualification?.lookingFor],
    ["Lead route", leadRoute],
    ["Decision", payload.contact.decision],
    ["Notes", payload.contact.notes],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:4px 0;color:#94a3b8;font-size:12px;width:92px;">${escapeHtml(label)}:</td>
          <td style="padding:4px 0;color:#e2e8f0;font-size:12px;">${escapeHtml(value || "Not provided")}</td>
        </tr>`,
    )
    .join("");
  const routeCard = routeIsQualified
    ? `
      <div style="font-size:22px;line-height:28px;font-weight:800;color:#ffffff;">${leadRoute === "CEO/Role Opportunity" ? "Operating mandate discussion" : "Paid advisory review"}</div>
      <div style="font-size:14px;line-height:22px;color:#fde68a;margin-top:12px;">This appears to involve a serious operating or advisory situation. Craig may review select opportunities where there is a clear mandate and appropriate fit. The diagnostic report is useful, but Craig's direct review is not positioned as free consulting.</div>`
    : `
      <div style="font-size:22px;line-height:28px;font-weight:800;color:#ffffff;">AI-assisted summary</div>
      <div style="font-size:14px;line-height:22px;color:#fde68a;margin-top:12px;">${escapeHtml(payload.report.automatedSummary || "")}</div>
      <div style="font-size:12px;line-height:18px;color:#fde68a;margin-top:12px;">This automated summary has not been reviewed or vetted by Craig Benson. It is not consulting advice.</div>`;

  return `<!doctype html>
<html>
  <body style="margin:0;background:#020617;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;">Industrial Growth Constraint Scan report for ${escapeHtml(payload.contact.company || "submitted company")}.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="760" cellpadding="0" cellspacing="0" style="width:760px;max-width:100%;">
            <tr>
              <td style="padding:0 0 22px;">
                <div style="font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:#fbbf24;font-weight:800;">Craig Benson</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:3px;">Industrial Growth Operator</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 22px;">
                <div style="font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:#fbbf24;font-weight:800;">Private growth constraint report</div>
                <div style="font-size:30px;line-height:36px;font-weight:800;color:#ffffff;margin-top:8px;">Industrial Growth Constraint Report</div>
                <div style="font-size:14px;line-height:22px;color:#cbd5e1;margin-top:10px;max-width:620px;">This private operating memo summarizes likely constraints based on the answers provided. It is meant to frame sharper diligence and conversation, not replace it.</div>
              </td>
            </tr>
            <tr>
              <td style="background:#292524;border:1px solid rgba(251,191,36,0.35);padding:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:top;padding-right:20px;">
                      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#fbbf24;font-weight:800;">Executive summary</div>
                      <div style="font-size:24px;line-height:30px;font-weight:800;color:#ffffff;margin-top:10px;">${escapeHtml(constraintPattern)}</div>
                      <div style="font-size:14px;line-height:22px;color:#fde68a;margin-top:14px;">${escapeHtml(commercialImplication)}</div>
                    </td>
                    <td width="220" style="vertical-align:top;">
                      ${emailMetric("Readiness band", band)}
                      ${emailMetric("Routing", leadRoute)}
                      ${emailMetric("Top area", reportWeakAreas[0]?.label || "Not available")}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-top:16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="255" style="vertical-align:top;padding-right:16px;">
                      <div style="background:#111827;border:1px solid rgba(255,255,255,0.10);border-radius:8px;padding:22px;">
                        <div style="font-size:13px;color:#94a3b8;">Total readiness score</div>
                        <div style="font-size:56px;line-height:58px;font-weight:800;color:#ffffff;margin-top:8px;">${score}<span style="font-size:24px;color:#94a3b8;"> / 24</span></div>
                        <div style="display:inline-block;background:#e0f2fe;border:1px solid #7dd3fc;border-radius:999px;color:#075985;font-size:12px;font-weight:800;padding:7px 12px;margin-top:14px;">${escapeHtml(band)}</div>
                        <div style="font-size:14px;line-height:22px;color:#cbd5e1;margin-top:16px;">${escapeHtml(bandLine)}</div>
                        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.10);border-radius:8px;padding:14px;margin-top:22px;">
                          <div style="font-size:13px;font-weight:800;color:#fbbf24;">Submitted context</div>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">${submittedContext}</table>
                        </div>
                      </div>
                    </td>
                    <td style="vertical-align:top;">
                      <div style="background:#ffffff;border-radius:8px;padding:24px;">
                        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b45309;font-weight:800;">Operator readout</div>
                        <div style="font-size:24px;line-height:30px;font-weight:800;color:#0f172a;margin-top:10px;">${escapeHtml(actionTitle)}</div>
                        <div style="font-size:15px;line-height:24px;color:#475569;margin-top:14px;">The score is not the answer. It is the starting point. The next step is to validate evidence, separate symptoms from root constraints, and decide what should happen in the first 100 days.</div>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                          <tr>
                            <td style="background:#f8fafc;border-radius:8px;padding:14px;vertical-align:top;width:33%;">
                              <div style="font-size:14px;font-weight:800;color:#0f172a;">Likely constraint pattern</div>
                              <div style="font-size:12px;line-height:18px;color:#475569;margin-top:10px;">${escapeHtml(constraintPattern)}</div>
                              <div style="font-size:12px;line-height:18px;color:#475569;margin-top:10px;">${escapeHtml(commercialImplication)}</div>
                            </td>
                            <td width="12"></td>
                            <td style="background:#f8fafc;border-radius:8px;padding:14px;vertical-align:top;width:33%;">
                              <div style="font-size:14px;font-weight:800;color:#0f172a;">Top constraint areas</div>
                              ${topAreas}
                            </td>
                            <td width="12"></td>
                            <td style="background:#f8fafc;border-radius:8px;padding:14px;vertical-align:top;width:33%;">
                              <div style="font-size:14px;font-weight:800;color:#0f172a;">Likely first priorities</div>
                              <div style="margin-top:10px;">${priorities}</div>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-top:16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:top;padding-right:16px;">
                      <div style="background:#ffffff;border-radius:8px;padding:24px;">
                        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b45309;font-weight:800;">Area-by-area scorecard</div>
                        <div style="font-size:24px;line-height:30px;font-weight:800;color:#0f172a;margin-top:10px;">What the answers suggest</div>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">${areaRows}</table>
                      </div>
                    </td>
                    <td width="250" style="vertical-align:top;">
                      <div style="background:#ffffff;border-radius:8px;padding:22px;">
                        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b45309;font-weight:800;">What to review next</div>
                        <div style="font-size:20px;line-height:26px;font-weight:800;color:#0f172a;margin-top:10px;">Useful diligence areas</div>
                        <div style="margin-top:12px;">${evidenceGaps}</div>
                      </div>
                      <div style="background:#ffffff;border-radius:8px;padding:22px;margin-top:16px;">
                        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b45309;font-weight:800;">What to avoid</div>
                        <div style="font-size:20px;line-height:26px;font-weight:800;color:#0f172a;margin-top:10px;">Common wrong moves</div>
                        <div style="margin-top:12px;">${avoidItems}</div>
                      </div>
                      <div style="background:#292524;border:1px solid rgba(251,191,36,0.35);border-radius:8px;padding:22px;margin-top:16px;">
                        ${routeCard}
                        <div style="font-size:12px;color:#fde68a;margin-top:16px;border-top:1px solid rgba(251,191,36,0.25);padding-top:12px;">Craig Benson | 612.203.4280 | CraigBenson0848@gmail.com</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="font-size:11px;color:#64748b;padding:18px 0 0;">Submitted: ${escapeHtml(submittedAt)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function emailMetric(label, value) {
  return `<div style="background:#1c1917;border:1px solid rgba(251,191,36,0.22);padding:12px;margin-bottom:8px;">
    <div style="font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:#fbbf24;font-weight:800;">${escapeHtml(label)}</div>
    <div style="font-size:13px;line-height:18px;color:#ffffff;font-weight:800;margin-top:5px;">${escapeHtml(value || "Not available")}</div>
  </div>`;
}

function emailInfoCell(title, text) {
  return `<td style="background:#ffffff;border:1px solid #eef2f7;border-radius:8px;padding:12px;vertical-align:top;width:33%;">
    <div style="font-size:10px;letter-spacing:0.8px;text-transform:uppercase;color:#b45309;font-weight:800;">${escapeHtml(title)}</div>
    <div style="font-size:12px;line-height:18px;color:#475569;margin-top:6px;">${escapeHtml(text || "Not provided")}</div>
  </td>`;
}

function emailListItem(item) {
  return `<div style="background:#f8fafc;border-radius:8px;padding:12px;margin-top:8px;font-size:13px;line-height:19px;color:#334155;">${escapeHtml(item || "")}</div>`;
}

function scoreLabelForEmail(score) {
  if (Number(score) >= 2) return "Repeatable";
  if (Number(score) === 1) return "Partially managed";
  return "Reactive";
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
