#!/usr/bin/env node
/**
 * Public-safe Beispiel: synthetische EOG-Klärpunkte als versionierten
 * Projektplan vorprüfen. Kein Netzwerkzugriff, keine echten Investitionsdaten
 * und keine fachliche, regulatorische oder kaufmännische Freigabe.
 */

const scenario = {
  scenarioId: "EOG-SYN-2026-BASE",
  version: "2026.11-demo.1",
  assumptions: [
    { assumptionId: "ASM-SYN-01", label: "Aktivierungszeitpunkt", quality: "open" },
    { assumptionId: "ASM-SYN-02", label: "Investitionsbandbreite", quality: "range" },
    { assumptionId: "ASM-SYN-03", label: "Regulatorische Behandlung", quality: "review" }
  ]
};

const clarificationPlan = {
  planId: "PLAN-SYN-001",
  scenarioId: scenario.scenarioId,
  scenarioVersion: scenario.version,
  version: "2026.11-demo.1",
  clarificationPoints: [
    {
      clarificationId: "CLR-SYN-01",
      assumptionId: "ASM-SYN-01",
      trigger: "Aktivierungszeitpunkt ist nur als Korridor dokumentiert.",
      impact: "Zeitliche Einordnung der synthetischen Ergebnisreihe kann sich verschieben.",
      checkStep: "Technischen Meilenstein und frühesten belastbaren Startpunkt dokumentieren.",
      responsibleRole: "technische Projektprüfung",
      neededBy: "vor der nächsten Variantenrunde",
      expectedEvidence: "technische Prüfnotiz",
      priority: "decision-relevant",
      status: "open"
    },
    {
      clarificationId: "CLR-SYN-02",
      assumptionId: "ASM-SYN-02",
      trigger: "Kosten liegen nur als synthetische Bandbreite vor.",
      impact: "Variantenabstand und Rangfolge können sich verändern.",
      checkStep: "Bandbreite mit einer dokumentierten Kostengrundlage aktualisieren.",
      responsibleRole: "kaufmännische Projektprüfung",
      neededBy: "vor einer Budgetbefassung",
      expectedEvidence: "versionierte Kostengrundlage",
      priority: "decision-relevant",
      status: "open"
    },
    {
      clarificationId: "CLR-SYN-03",
      assumptionId: "ASM-SYN-03",
      trigger: "Fachliche Einordnung ist als offen markiert.",
      impact: "Die Ergebnisinterpretation bleibt vorläufig.",
      checkStep: "Annahme gegen den aktuellen öffentlichen Quellenstand prüfen.",
      responsibleRole: "fachliche Methodenprüfung",
      neededBy: "vor dem Projektstart",
      expectedEvidence: "Quellenstand mit Prüfergebnis",
      priority: "implementation-relevant",
      status: "open"
    }
  ]
};

const requiredFields = [
  "trigger",
  "impact",
  "checkStep",
  "responsibleRole",
  "neededBy",
  "expectedEvidence",
  "priority",
  "status"
];
const allowedPriorities = new Set([
  "decision-relevant",
  "implementation-relevant",
  "observation-relevant"
]);
const allowedStatuses = new Set(["open", "in-review", "closed"]);

function validateClarificationPlan(inputScenario, plan) {
  const findings = [];
  const assumptionIds = new Set(inputScenario.assumptions.map((item) => item.assumptionId));
  const clarificationIds = new Set();

  if (plan.scenarioId !== inputScenario.scenarioId) findings.push("scenario_id_mismatch");
  if (plan.scenarioVersion !== inputScenario.version) findings.push("scenario_version_mismatch");
  if (plan.version !== inputScenario.version) findings.push("plan_version_not_aligned");

  for (const point of plan.clarificationPoints) {
    if (!point.clarificationId) findings.push("missing_clarification_id");
    else if (clarificationIds.has(point.clarificationId)) {
      findings.push(`${point.clarificationId}: duplicate_id`);
    }
    clarificationIds.add(point.clarificationId);

    if (!assumptionIds.has(point.assumptionId)) {
      findings.push(`${point.clarificationId}: unknown_assumption`);
    }
    for (const field of requiredFields) {
      if (!String(point[field] || "").trim()) {
        findings.push(`${point.clarificationId}: missing_${field}`);
      }
    }
    if (!allowedPriorities.has(point.priority)) {
      findings.push(`${point.clarificationId}: unknown_priority`);
    }
    if (!allowedStatuses.has(point.status)) {
      findings.push(`${point.clarificationId}: unknown_status`);
    }
  }

  return findings;
}

const findings = validateClarificationPlan(scenario, clarificationPlan);
const countsByPriority = clarificationPlan.clarificationPoints.reduce((result, point) => {
  result[point.priority] = (result[point.priority] || 0) + 1;
  return result;
}, {});
const openAssumptionsWithoutPoint = scenario.assumptions
  .filter((assumption) =>
    !clarificationPlan.clarificationPoints.some((point) => point.assumptionId === assumption.assumptionId)
  )
  .map((assumption) => assumption.assumptionId);

console.log(JSON.stringify({
  mode: "eog-clarification-plan-local-preflight",
  sourceClass: "synthetic-local-fixture",
  networkCalls: 0,
  planValid: findings.length === 0 && openAssumptionsWithoutPoint.length === 0,
  scenarioVersion: scenario.version,
  planVersion: clarificationPlan.version,
  clarificationPointCount: clarificationPlan.clarificationPoints.length,
  countsByPriority,
  openAssumptionsWithoutPoint,
  findings,
  nextReview: clarificationPlan.clarificationPoints.map((point) => ({
    clarificationId: point.clarificationId,
    responsibleRole: point.responsibleRole,
    neededBy: point.neededBy,
    expectedEvidence: point.expectedEvidence
  })),
  boundary: "Der lokale Formtest prüft nur Struktur, Zuordnung und Versionsbezug synthetischer Klärpunkte. Er bewertet weder Investitionen noch Bilanzierung, Regulierung, Zuständigkeit oder Freigabe."
}, null, 2));
