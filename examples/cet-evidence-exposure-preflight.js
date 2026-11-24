#!/usr/bin/env node
/**
 * Public-safe Beispiel: synthetische Evidenz in zitierbare Fundstellen und
 * interne Arbeitsbelege trennen, bevor ein Fallback-Text erzeugt wird.
 * Kein Netzwerkzugriff, keine echten Vorgänge und keine Datenschutzgarantie.
 */

const evidence = [
  {
    evidenceId: "EV-SYN-001",
    source: "public-catalog",
    title: "Öffentliche technische Fundstelle",
    value: "Der synthetische Datensatz beschreibt drei Prüffelder.",
    exposure: "citable"
  },
  {
    evidenceId: "EV-SYN-002",
    source: "local-rulebook",
    title: "Freigegebene lokale Regelnotiz",
    value: "Offene Zuordnungen bleiben als Prüffrage markiert.",
    exposure: "citable"
  },
  {
    evidenceId: "EV-SYN-003",
    source: "micro-agent.synthetic",
    title: "Interner Arbeitsbefund",
    value: "Zwischenschritt: Kandidat B wurde wegen geringer Relevanz verworfen.",
    exposure: "working-only"
  },
  {
    evidenceId: "EV-SYN-004",
    source: "search-log.synthetic",
    title: "Interner Suchlauf",
    value: "Suchprotokoll: 4 Treffer geprüft, 2 verworfen.",
    exposure: "working-only"
  }
];

const allowedExposure = new Set(["citable", "working-only"]);

function validateEvidenceContract(items) {
  const findings = [];
  const ids = new Set();

  for (const item of items) {
    if (!item.evidenceId) findings.push("missing_evidence_id");
    else if (ids.has(item.evidenceId)) findings.push(`${item.evidenceId}: duplicate_id`);
    ids.add(item.evidenceId);

    if (!item.source) findings.push(`${item.evidenceId || "unknown"}: missing_source`);
    if (!item.title) findings.push(`${item.evidenceId || "unknown"}: missing_title`);
    if (!item.value) findings.push(`${item.evidenceId || "unknown"}: missing_value`);
    if (!allowedExposure.has(item.exposure)) {
      findings.push(`${item.evidenceId || "unknown"}: unknown_exposure`);
    }
  }

  return findings;
}

function buildHumanFallback(items) {
  return items
    .filter((item) => item.exposure === "citable")
    .map((item) => `- ${item.title} [${item.source}]: ${item.value}`)
    .join("\n");
}

function reviewExposure(items, renderedText) {
  return items.map((item) => ({
    evidenceId: item.evidenceId,
    exposure: item.exposure,
    appearsInFallback: renderedText.includes(item.value),
    accepted:
      item.exposure === "citable"
        ? renderedText.includes(item.value)
        : !renderedText.includes(item.value)
  }));
}

const findings = validateEvidenceContract(evidence);
const humanFallback = buildHumanFallback(evidence);
const exposureReview = reviewExposure(evidence, humanFallback);
const leakingEvidence = exposureReview
  .filter((item) => !item.accepted)
  .map((item) => item.evidenceId);

console.log(JSON.stringify({
  mode: "cet-evidence-exposure-local-preflight",
  sourceClass: "synthetic-local-fixture",
  networkCalls: 0,
  contractValid: findings.length === 0,
  findings,
  counts: evidence.reduce((result, item) => {
    result[item.exposure] = (result[item.exposure] || 0) + 1;
    return result;
  }, {}),
  humanFallback,
  exposureReview,
  leakingEvidence,
  fallbackSafeByContract: findings.length === 0 && leakingEvidence.length === 0,
  boundary: "Der lokale Formtest prüft nur Kennzeichnung und Ausgabegrenze synthetischer Evidenz. Er beweist weder fachliche Richtigkeit noch Datenschutz, Berechtigung, Compliance oder Produktivreife."
}, null, 2));
