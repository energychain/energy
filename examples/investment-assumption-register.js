#!/usr/bin/env node
/**
 * Public-safe Beispiel: ein versioniertes Annahmenregister für zwei
 * synthetische Investitionsvarianten prüfen. Kein Netzwerkzugriff,
 * keine Kunden-, Preis- oder Vertragsdaten.
 */

const allowedStatuses = new Set(["measured", "confirmed", "estimated", "scenario"]);
const snapshot = {
  registerVersion: "2026-11-06T09:00:00Z",
  decisionQuestion: "Welche synthetische Netzvariante bleibt im Annahmenkorridor nachvollziehbar vergleichbar?",
  variants: ["variant-a", "variant-b"],
  assumptions: [
    {
      id: "annual-demand-growth",
      label: "Jährliche Lastentwicklung",
      value: 2.1,
      unit: "%/a",
      source: "synthetic-planning-fixture",
      qualityStatus: "scenario",
      validFor: ["variant-a", "variant-b"],
      ownerRole: "grid-planning",
      sensitivity: { low: 0.8, high: 3.4 },
      resultImpact: "ranking_may_change"
    },
    {
      id: "delivery-window",
      label: "Lieferfenster Hauptkomponente",
      value: 15,
      unit: "months",
      source: "synthetic-supplier-note",
      qualityStatus: "estimated",
      validFor: ["variant-b"],
      ownerRole: "procurement",
      sensitivity: { low: 12, high: 22 },
      resultImpact: "ranking_stable"
    },
    {
      id: "existing-capacity",
      label: "Nutzbare Bestandskapazität",
      value: 8.4,
      unit: "MVA",
      source: "synthetic-measurement-series",
      qualityStatus: "measured",
      validFor: ["variant-a"],
      ownerRole: "asset-management",
      sensitivity: { low: 8.1, high: 8.7 },
      resultImpact: "ranking_stable"
    },
    {
      id: "construction-duration",
      label: "Bauzeit",
      value: 18,
      unit: "months",
      source: "",
      qualityStatus: "estimated",
      validFor: ["variant-a", "variant-c"],
      ownerRole: "",
      sensitivity: { low: 20, high: 14 },
      resultImpact: "not_checked"
    }
  ]
};

function reviewAssumption(item, variants) {
  const findings = [];
  if (!item.label || !item.unit) findings.push("missing_label_or_unit");
  if (!item.source) findings.push("missing_source");
  if (!allowedStatuses.has(item.qualityStatus)) findings.push("unknown_quality_status");
  if (!item.ownerRole) findings.push("missing_owner_role");
  if (!Array.isArray(item.validFor) || item.validFor.length === 0) findings.push("missing_variant_scope");

  const unknownVariants = (item.validFor || []).filter((variant) => !variants.includes(variant));
  if (unknownVariants.length) findings.push("unknown_variant_scope");

  const { low, high } = item.sensitivity || {};
  if (!Number.isFinite(low) || !Number.isFinite(high) || low > item.value || high < item.value) {
    findings.push("invalid_sensitivity_corridor");
  }

  const priority = item.resultImpact === "ranking_may_change"
    ? "clarify_first"
    : item.resultImpact === "ranking_stable"
      ? "monitor"
      : "sensitivity_check_required";

  return {
    id: item.id,
    qualityStatus: item.qualityStatus,
    priority,
    findings,
    readyForComparison: findings.length === 0
  };
}

const reviews = snapshot.assumptions.map((item) => reviewAssumption(item, snapshot.variants));
console.log(JSON.stringify({
  mode: "investment-assumption-register-preflight",
  sourceClass: "synthetic-local-fixture",
  registerVersion: snapshot.registerVersion,
  decisionQuestion: snapshot.decisionQuestion,
  networkCalls: 0,
  summary: {
    assumptions: reviews.length,
    ready: reviews.filter((item) => item.readyForComparison).length,
    clarifyFirst: reviews.filter((item) => item.priority === "clarify_first").length
  },
  reviews,
  boundary: "Der Formtest dokumentiert Annahmen und Sensitivitäten. Er priorisiert oder genehmigt keine reale Investition."
}, null, 2));
