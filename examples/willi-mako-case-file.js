#!/usr/bin/env node
/**
 * Public-safe Beispiel: Willi-Mako-Klärfallakte lokal vorbereiten.
 *
 * Das Script nutzt nur synthetische Daten. Es ruft keinen Fachcoach, keine API
 * und keinen Marktpartner auf. Ziel ist eine prüfbare Struktur: Ausgangsfrage,
 * Evidenz, Annahmen, Rückfragen, No-Action-Grenzen und nächster sicherer Gate.
 */

const syntheticCase = {
  id: "synthetic-mako-case-001",
  role: "Lieferant",
  processContext: "GPKE Klärfall / Stammdatenrückfrage",
  question: "Welche Rückfrage sollte vor einer Prozessantwort fachlich geklärt werden?",
  incomingSignal: {
    type: "synthetische Nachricht",
    summary: "Marktpartner meldet widersprüchliche Stammdaten zu einer Lieferstelle.",
    containsRealCustomerData: false,
    containsEdifactPayload: false
  },
  evidence: [
    { label: "Fallbeschreibung", status: "present", source: "synthetic fixture" },
    { label: "Marktrolle", status: "present", source: "synthetic fixture" },
    { label: "Originalnachricht", status: "missing", source: "not used in public example" },
    { label: "interne Freigabe", status: "open", source: "human review" }
  ],
  assumptions: [
    "Der Klärfall ist bewusst künstlich und enthält keine Lieferstellen-, Kunden- oder Marktpartnerdaten.",
    "Die fachliche Antwort wird nicht automatisiert gesendet.",
    "Rechts-, Compliance- und Prozessverantwortung bleiben beim Fachteam."
  ]
};

const NO_ACTION = [
  "keine produktive Marktkommunikation auslösen",
  "keine echte EDIFACT-Nachricht oder Kundendaten verarbeiten",
  "keine Rechts-, Frist-, Preis-, Vertrags- oder SLA-Zusage ableiten",
  "keine Marktpartner-Rückfrage automatisch versenden",
  "kein vertraulicher oder gemischt-sensitiver Kontext in öffentliche Beispiele übernehmen"
];

function statusCounts(evidence) {
  return evidence.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
}

function buildCaseFile(input) {
  const missing = input.evidence.filter((item) => item.status === "missing" || item.status === "open");
  return {
    mode: "willi-mako-case-file-dry-run",
    publicSafe: !input.incomingSignal.containsRealCustomerData && !input.incomingSignal.containsEdifactPayload,
    caseFile: {
      id: input.id,
      role: input.role,
      processContext: input.processContext,
      question: input.question,
      incomingSignal: input.incomingSignal.summary,
      evidenceStatus: statusCounts(input.evidence),
      evidence: input.evidence,
      assumptions: input.assumptions,
      openQuestions: missing.map((item) => `Bitte ${item.label} fachlich klären (${item.source}).`),
      noActionBoundaries: NO_ACTION,
      suggestedHumanNextStep: "synthetische Fallakte intern prüfen und erst danach entscheiden, ob Willi Mako, Sanitizer oder CET-Token der sichere Testpfad ist"
    }
  };
}

console.log(JSON.stringify(buildCaseFile(syntheticCase), null, 2));
