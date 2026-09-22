#!/usr/bin/env node
/**
 * Synthetisches Beispiel: CET Capability Boundary Matrix vorbereiten.
 *
 * Das Script ruft keine Cernion-API auf. Es übersetzt nur öffentliche
 * Integrationsgrenzen in ein prüfbares JSON-Envelope: Was ist als Demo/Read-only
 * denkbar, was bleibt No-Call oder Human Review?
 */

const publicCapabilityGroups = [
  {
    id: "ask",
    label: "Frage strukturieren",
    allowedModes: ["ask", "plan"],
    examples: ["synthetischen Klärfall sortieren", "fehlende Evidenz benennen"]
  },
  {
    id: "evidence",
    label: "Evidenz sammeln",
    allowedModes: ["evidence", "read_only_status"],
    examples: ["öffentliche Quelle referenzieren", "Dossier-Status vorbereiten"]
  },
  {
    id: "capability_lookup",
    label: "Capability finden",
    allowedModes: ["capability_lookup"],
    examples: ["passenden API-/Tool-Bereich identifizieren"]
  }
];

const requests = [
  {
    id: "CAP-001",
    goal: "Welche öffentlichen CET-Fähigkeiten passen zu einer synthetischen MaKo-Prüffrage?",
    requestedMode: "capability_lookup",
    dataClass: "synthetic",
    consequence: "orientation"
  },
  {
    id: "CAP-002",
    goal: "Kann ein echter Lieferantenvertrag automatisch entschieden werden?",
    requestedMode: "binding_decision",
    dataClass: "real_customer_contract",
    consequence: "contractual"
  },
  {
    id: "CAP-003",
    goal: "Welche Nachweise fehlen in einem anonymisierten Evidenz-Dossier?",
    requestedMode: "evidence",
    dataClass: "anonymized",
    consequence: "review_preparation"
  },
  {
    id: "CAP-004",
    goal: "Darf ein Status im Zielsystem geschrieben werden?",
    requestedMode: "write_access",
    dataClass: "synthetic",
    consequence: "system_mutation"
  }
];

const safeDataClasses = new Set(["synthetic", "anonymized"]);
const hardStopModes = new Set(["binding_decision", "write_access", "tariff_mutation", "billing_execution"]);
const hardStopConsequences = new Set(["contractual", "system_mutation", "billing", "grid_commitment"]);

function evaluate(request) {
  const matchingGroups = publicCapabilityGroups.filter((group) => group.allowedModes.includes(request.requestedMode));
  const reasons = [];

  if (!safeDataClasses.has(request.dataClass)) reasons.push(`data-class:${request.dataClass}`);
  if (hardStopModes.has(request.requestedMode)) reasons.push(`mode:${request.requestedMode}`);
  if (hardStopConsequences.has(request.consequence)) reasons.push(`consequence:${request.consequence}`);
  if (!matchingGroups.length && !hardStopModes.has(request.requestedMode)) reasons.push(`no-public-capability-group:${request.requestedMode}`);

  const status = reasons.length === 0 ? "public_safe_candidate" : "no_call_or_human_review";

  return {
    requestId: request.id,
    status,
    requestedMode: request.requestedMode,
    matchingGroups: matchingGroups.map((group) => group.id),
    reasons,
    nextSafeStep: status === "public_safe_candidate"
      ? "Mit synthetischem Beispiel und dokumentierter Grenze weiterarbeiten"
      : "Grenze dokumentieren; vor Fach-, Vertrags- oder Systemwirkung Human Review"
  };
}

console.log(JSON.stringify({
  mode: "cet-capability-boundary-matrix",
  boundary: "Nur synthetische Capability-Orientierung; keine API-Aufrufe, keine Kundendaten, keine fachlich bindende Entscheidung.",
  groups: publicCapabilityGroups,
  decisions: requests.map(evaluate)
}, null, 2));
