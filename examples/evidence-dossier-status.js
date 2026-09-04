#!/usr/bin/env node
/**
 * Synthetisches Beispiel: Evidence-Dossier-Status vorbereiten.
 *
 * Keine Produktivdaten, keine Rechts- oder Prozessentscheidung.
 * Das Script macht nur sichtbar, ob Evidenz, Annahmen und offene
 * Prüfpunkte als reviewbarer JSON-Status zusammenpassen.
 */

const dossier = {
  id: "ED-001",
  thema: "Synthetische Netzanschluss-Prüffrage",
  datenstand: "synthetisch-2026-09",
  ziel: "Arbeitslage vor einer fachlichen Bewertung strukturieren",
  evidenzen: [
    { id: "EV-1", quelle: "synthetisches-formular", status: "vorhanden" },
    { id: "EV-2", quelle: "synthetische-stammdaten", status: "vorhanden" },
    { id: "EV-3", quelle: "annahmen-notiz", status: "offen" }
  ],
  annahmen: [
    { id: "A-1", text: "Lastannahme wurde als Beispielwert gesetzt", status: "prüfen" },
    { id: "A-2", text: "Fristbezug ist noch nicht fachlich bestätigt", status: "offen" }
  ],
  grenzen: [
    "nur synthetische Daten verwenden",
    "keine automatische Zusage oder Ablehnung ableiten",
    "fachliche Prüfung vor Außenkommunikation dokumentieren"
  ]
};

function summarizeEvidence(items) {
  return items.reduce(
    (acc, item) => {
      acc.total += 1;
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { total: 0 }
  );
}

function readiness(state) {
  const evidence = summarizeEvidence(state.evidenzen);
  const openAssumptions = state.annahmen.filter((item) => item.status !== "bestätigt");
  const openEvidence = state.evidenzen.filter((item) => item.status !== "vorhanden");

  return {
    dossierId: state.id,
    mode: "evidence-dossier-dry-run",
    thema: state.thema,
    datenstand: state.datenstand,
    evidence,
    openEvidence: openEvidence.map((item) => item.id),
    openAssumptions: openAssumptions.map((item) => item.id),
    decisionReadiness: openEvidence.length || openAssumptions.length ? "nicht-entscheidungsreif" : "reviewbereit",
    nextSafeStep: openEvidence.length
      ? "fehlende Evidenz beschaffen oder Lücke sichtbar lassen"
      : "Annahmen fachlich bestätigen lassen",
    boundaries: state.grenzen
  };
}

console.log(JSON.stringify(readiness(dossier), null, 2));
