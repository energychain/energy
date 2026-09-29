#!/usr/bin/env node
/**
 * Synthetisches Beispiel: kommunalen Energie-Brief vorbereiten.
 *
 * Das Script nutzt keine echten Haushalts-, Kunden-, Vertrags-, Mess- oder
 * Betriebsdaten. Es sortiert nur public-safe Prüffragen in Evidenz, Lücken,
 * Wirkungsgrenze und nächsten sicheren Gate.
 */

const safeEvidenceClasses = new Set(["synthetic", "public_method", "open_reference"]);
const allowedEffects = new Set(["orientation", "evidence", "review_preparation"]);
const hardStopEffects = new Set([
  "budget_decision",
  "legal_assessment",
  "tariff_commitment",
  "grid_connection_commitment",
  "contract_commitment",
  "system_write"
]);

const topics = [
  {
    id: "KOM-001",
    frage: "Welche kommunalen Liegenschaften eignen sich für eine erste Stromlagebild-Prüfung?",
    requestedEffect: "orientation",
    persona: "Kämmerei / Klimaschutzmanagement",
    evidence: [
      { label: "synthetische Liegenschaftsliste", class: "synthetic" },
      { label: "öffentliche Methodiknotiz", class: "public_method" }
    ],
    gaps: ["keine Messwerte", "keine Beschlusslage", "kein Umsetzungsbudget"],
    boundary: "nur Erstsortierung"
  },
  {
    id: "KOM-002",
    frage: "Kann eine Energy-Sharing-Idee als kommunaler Prüfauftrag formuliert werden?",
    requestedEffect: "review_preparation",
    persona: "Stadtwerk / Kommune",
    evidence: [
      { label: "synthetische Erzeugungs-/Verbrauchsskizze", class: "synthetic" },
      { label: "öffentlicher Orientierungsrahmen", class: "open_reference" }
    ],
    gaps: ["keine Teilnehmerdaten", "keine Netzverträglichkeitsprüfung"],
    boundary: "Prüfauftrag, keine Umsetzungsempfehlung"
  },
  {
    id: "KOM-003",
    frage: "Soll ein produktives Budget für eine echte Maßnahme freigegeben werden?",
    requestedEffect: "budget_decision",
    persona: "Gremium",
    evidence: [
      { label: "echte Projektkalkulation", class: "confidential_finance" }
    ],
    gaps: ["keine HITL-Freigabe", "vertrauliche Finanzdaten"],
    boundary: "nicht public-safe"
  }
];

function buildBrief(topic) {
  const unsafeEvidence = topic.evidence.filter((item) => !safeEvidenceClasses.has(item.class));
  const reasons = [];

  if (!allowedEffects.has(topic.requestedEffect)) reasons.push(`effect:${topic.requestedEffect}`);
  if (hardStopEffects.has(topic.requestedEffect)) reasons.push(`hard-stop:${topic.requestedEffect}`);
  if (unsafeEvidence.length) reasons.push(`unsafe-evidence:${unsafeEvidence.map((item) => item.class).join(',')}`);

  const status = reasons.length ? "review_required_or_no_call" : "public_safe_brief";
  const nextGate = status === "public_safe_brief"
    ? (topic.gaps.length ? "fachliche Erstbefassung vorbereiten" : "als Orientierungsnotiz dokumentieren")
    : "stoppen; vertrauliche oder bindende Wirkung gesondert prüfen";

  return {
    id: topic.id,
    status,
    persona: topic.persona,
    frage: topic.frage,
    evidenceLabels: topic.evidence.map((item) => item.label),
    gaps: topic.gaps,
    boundary: topic.boundary,
    reasons,
    nextGate
  };
}

console.log(JSON.stringify({
  mode: "municipal-evidence-brief-dry-run",
  boundary: "Nur synthetische Orientierung; keine Rechts-, Budget-, Beschluss-, Tarif-, Netz- oder Vertragswirkung.",
  briefs: topics.map(buildBrief)
}, null, 2));
