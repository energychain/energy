#!/usr/bin/env node
/**
 * Synthetisches Beispiel: CET Decision-Frame Preflight.
 *
 * Das Script ruft keine Cernion-API auf. Es sortiert nur eine öffentliche,
 * synthetische Anfrage in ein Decision-Frame-Envelope: Ziel, Evidenz,
 * Lücken, Wirkungsgrenze und nächster sicherer Gate.
 */

const safeEvidenceClasses = new Set(["synthetic", "public_reference", "anonymized_methodology"]);
const allowedEffects = new Set(["orientation", "evidence", "review_preparation", "read_only_status"]);
const hardStopEffects = new Set([
  "contract_commitment",
  "tariff_mutation",
  "billing_execution",
  "grid_connection_commitment",
  "system_write"
]);

const requests = [
  {
    id: "DF-001",
    objective: "Synthetischen Netzanschluss-Klärfall vorsortieren",
    requestedEffect: "review_preparation",
    evidence: [
      { label: "synthetisches Formular", class: "synthetic" },
      { label: "öffentliche Capability-Beschreibung", class: "public_reference" }
    ],
    assumptions: ["keine echten Netzstammdaten", "keine Anschlusszusage"],
    gaps: ["zuständige Rolle noch offen", "Prüfdatum fehlt"]
  },
  {
    id: "DF-002",
    objective: "Echten Tarif automatisch umstellen",
    requestedEffect: "tariff_mutation",
    evidence: [
      { label: "Kundenvertrag", class: "real_customer_data" }
    ],
    assumptions: [],
    gaps: ["keine Freigabe", "produktive Systemwirkung"]
  },
  {
    id: "DF-003",
    objective: "Öffentliche Report-Begriffe in ein Dossier-Statusschema übertragen",
    requestedEffect: "evidence",
    evidence: [
      { label: "öffentlicher Cernion-Report", class: "public_reference" },
      { label: "synthetisches Statusschema", class: "synthetic" }
    ],
    assumptions: ["nur Methodik, keine reale Anlage"],
    gaps: []
  }
];

function buildDecisionFrame(request) {
  const unsafeEvidence = request.evidence.filter((item) => !safeEvidenceClasses.has(item.class));
  const reasons = [];

  if (!allowedEffects.has(request.requestedEffect)) reasons.push(`effect:${request.requestedEffect}`);
  if (hardStopEffects.has(request.requestedEffect)) reasons.push(`hard-stop:${request.requestedEffect}`);
  if (unsafeEvidence.length) reasons.push(`unsafe-evidence:${unsafeEvidence.map((item) => item.class).join(',')}`);

  const status = reasons.length ? "no_call_or_human_review" : "public_safe_preflight";

  return {
    requestId: request.id,
    status,
    objective: request.objective,
    evidenceLabels: request.evidence.map((item) => item.label),
    assumptions: request.assumptions,
    gaps: request.gaps,
    reasons,
    nextGate: status === "public_safe_preflight"
      ? (request.gaps.length ? "human_review_preparation" : "documented_read_only_orientation")
      : "stop_before_effect; document boundary and request explicit review"
  };
}

console.log(JSON.stringify({
  mode: "cet-decision-frame-preflight",
  boundary: "Nur synthetische Decision-Frame-Orientierung; keine API-Aufrufe, keine Kundendaten, keine fachlich bindende Entscheidung.",
  frames: requests.map(buildDecisionFrame)
}, null, 2));
