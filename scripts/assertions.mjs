import assert from "node:assert/strict";

const leadRoutes = {
  role: "CEO/Role Opportunity",
  paid: "Paid Advisory Opportunity",
  referral: "Referral / Network",
  nurture: "Nurture / AI Summary",
};

const seriousAudienceTypes = [
  "Founder / owner",
  "PE partner / independent sponsor",
  "Board member",
  "CEO / president",
  "Recruiter / search partner",
];

const paidOpportunityTypes = [
  "Paid advisory review",
  "Interim / transformation mandate",
  "Diligence support",
];

function getBand(score) {
  if (score <= 8) return "Stabilize";
  if (score <= 16) return "Professionalize";
  return "Scale";
}

function getLeadRoute(lead) {
  const lookingFor = lead.lookingFor || "";
  const audience = lead.audienceType || "";
  const seriousAudience = seriousAudienceTypes.includes(audience);

  if (lookingFor === "Hiring Craig as CEO / President / operator" && seriousAudience) {
    return leadRoutes.role;
  }

  if (paidOpportunityTypes.includes(lookingFor)) {
    return leadRoutes.paid;
  }

  if (lookingFor === "Referral / networking") {
    return leadRoutes.referral;
  }

  return leadRoutes.nurture;
}

function getQualificationStatus(lead) {
  const route = getLeadRoute(lead);
  return route === leadRoutes.role || route === leadRoutes.paid ? "qualified" : "not-qualified";
}

assert.equal(getBand(0), "Stabilize");
assert.equal(getBand(8), "Stabilize");
assert.equal(getBand(9), "Professionalize");
assert.equal(getBand(16), "Professionalize");
assert.equal(getBand(17), "Scale");
assert.equal(getBand(24), "Scale");

assert.equal(
  getLeadRoute({
    audienceType: "PE partner / independent sponsor",
    lookingFor: "Hiring Craig as CEO / President / operator",
  }),
  leadRoutes.role,
);
assert.equal(
  getLeadRoute({
    audienceType: "Advisor / consultant",
    lookingFor: "Hiring Craig as CEO / President / operator",
  }),
  leadRoutes.nurture,
);
assert.equal(
  getLeadRoute({
    audienceType: "Founder / owner",
    lookingFor: "Paid advisory review",
  }),
  leadRoutes.paid,
);
assert.equal(
  getLeadRoute({
    audienceType: "CEO / president",
    lookingFor: "Interim / transformation mandate",
  }),
  leadRoutes.paid,
);
assert.equal(
  getLeadRoute({
    audienceType: "Board member",
    lookingFor: "Diligence support",
  }),
  leadRoutes.paid,
);
assert.equal(
  getLeadRoute({
    audienceType: "Founder / owner",
    lookingFor: "Referral / networking",
  }),
  leadRoutes.referral,
);
assert.equal(
  getLeadRoute({
    audienceType: "Other",
    lookingFor: "General research",
  }),
  leadRoutes.nurture,
);

assert.equal(
  getQualificationStatus({
    audienceType: "Board member",
    lookingFor: "Paid advisory review",
  }),
  "qualified",
);
assert.equal(
  getQualificationStatus({
    audienceType: "Founder / owner",
    lookingFor: "Referral / networking",
  }),
  "not-qualified",
);

console.log("Assertions passed.");
