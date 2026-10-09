#!/usr/bin/env node
/**
 * Public-safe Beispiel: MaKo-, §14a- und LFW24-Fragen lokal triagieren.
 *
 * Das Script nutzt nur synthetische Signale. Es ruft keine Cernion-, Willi-Mako-,
 * Marktkommunikations- oder Kundensystem-API auf. Ziel ist eine kleine JSON-
 * Arbeitslage: Rollen, Themencluster, Evidenz, Datenkante, No-Action-Grenzen
 * und nächster sicherer menschlicher Gate.
 */

const syntheticSignal = {
  id: "synthetic-mako-14a-lfw24-001",
  requesterRole: "VNB Fachbereich",
  situation: "MaKo-Rückfragen, §14a-Rollout und LFW24-Vorbereitung werden parallel diskutiert.",
  topics: ["MaKo / GPKE / WiM", "§14a EnWG", "LFW24 / 24-Stunden-Lieferantenwechsel"],
  inputData: {
    containsRealCustomerData: false,
    containsMaloOrMelo: false,
    containsEdifactPayload: false,
    containsSystemExport: false
  },
  evidence: [
    { label: "öffentliche Themenbeschreibung", status: "present", source: "public web" },
    { label: "betroffene interne Rollen", status: "open", source: "human workshop" },
    { label: "synthetischer Klärfall", status: "missing", source: "to prepare" },
    { label: "echte Prozessdaten", status: "excluded", source: "not allowed in dry-run" }
  ]
};

const NO_ACTION = [
  "keine produktive Marktkommunikation auslösen",
  "keine echten Kunden-, MaLo-, MeLo-, EDIFACT- oder Systemexportdaten verarbeiten",
  "keine Rechts-, Compliance-, Fristen-, Preis-, Vertrags-, Integrations- oder SLA-Zusage ableiten",
  "keine Marktpartner-, Kunden- oder Gerätekommunikation automatisch versenden",
  "keinen vertraulichen oder gemischt-sensitiven Kontext in öffentliche Beispiele übernehmen"
];

function classifyDataBoundary(inputData) {
  const blockedReasons = [];
  if (inputData.containsRealCustomerData) blockedReasons.push("Kundendaten");
  if (inputData.containsMaloOrMelo) blockedReasons.push("MaLo/MeLo");
  if (inputData.containsEdifactPayload) blockedReasons.push("EDIFACT-Rohdaten");
  if (inputData.containsSystemExport) blockedReasons.push("Systemexport");
  return {
    publicSafe: blockedReasons.length === 0,
    blockedReasons
  };
}

function statusCounts(evidence) {
  return evidence.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
}

function buildTriage(signal) {
  const boundary = classifyDataBoundary(signal.inputData);
  const openItems = signal.evidence.filter((item) => item.status === "open" || item.status === "missing");
  return {
    mode: "mako-14a-lfw24-triage-dry-run",
    publicSafe: boundary.publicSafe,
    blockedReasons: boundary.blockedReasons,
    triage: {
      id: signal.id,
      requesterRole: signal.requesterRole,
      situation: signal.situation,
      topics: signal.topics,
      evidenceStatus: statusCounts(signal.evidence),
      openQuestions: openItems.map((item) => `Bitte ${item.label} klären (${item.source}).`),
      noActionBoundaries: NO_ACTION,
      suggestedHumanNextStep: boundary.publicSafe
        ? "interne Arbeitsliste oder 20-Minuten-Erstdiagnose mit synthetischem Klärfall vorbereiten"
        : "Daten entfernen/sanitisieren, bevor ein Tool-, Gesprächs- oder Testpfad startet"
    }
  };
}

console.log(JSON.stringify(buildTriage(syntheticSignal), null, 2));
