#!/usr/bin/env node
/**
 * Synthetisches Beispiel: Asset-Risiko-Confidence prüfen.
 *
 * Keine Produktivdaten, keine Betreiberbewertung und keine
 * Investitions- oder Sicherheitsentscheidung. Das Script trennt
 * Datenqualität, Hypothese und nächsten sicheren Prüfschritt.
 */

const assets = [
  {
    id: "ASSET-101",
    typ: "Ortsnetzstation",
    datenstand: "synthetisch-2026-09",
    confidence: 0.92,
    hinweise: []
  },
  {
    id: "ASSET-204",
    typ: "Niederspannungsleitung",
    datenstand: "synthetisch-2026-09",
    confidence: 0.58,
    hinweise: ["baujahr-fehlt", "letzte-pruefung-unklar"]
  },
  {
    id: "ASSET-317",
    typ: "Kabelverteiler",
    datenstand: "synthetisch-2026-09",
    confidence: 0.74,
    hinweise: ["geo-referenz-pruefen"]
  }
];

function classifyConfidence(score) {
  if (score >= 0.85) return "plausibel";
  if (score >= 0.7) return "review";
  return "klaerbedarf";
}

function nextSafeStep(asset, status) {
  if (status === "plausibel") {
    return "als Arbeitsannahme dokumentieren, nicht automatisch entscheiden";
  }

  if (asset.hinweise.length > 1) {
    return "Datenlücken bündeln und fachliche Klärung priorisieren";
  }

  return "Hinweis prüfen, bevor ein Risiko abgeleitet wird";
}

const dossier = assets.map((asset) => {
  const status = classifyConfidence(asset.confidence);
  return {
    assetId: asset.id,
    typ: asset.typ,
    datenstand: asset.datenstand,
    confidence: asset.confidence,
    status,
    hinweise: asset.hinweise,
    risikoAussage: status === "klaerbedarf" ? "nicht belastbar ohne Prüfung" : "nur Arbeitsannahme",
    nextSafeStep: nextSafeStep(asset, status)
  };
});

const summary = dossier.reduce(
  (acc, item) => {
    acc.total += 1;
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  },
  { total: 0 }
);

console.log(JSON.stringify({ mode: "asset-risk-confidence-dry-run", summary, dossier }, null, 2));
