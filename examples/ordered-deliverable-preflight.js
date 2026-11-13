#!/usr/bin/env node
/**
 * Public-safe Beispiel: ein synthetisches technisches Lieferobjekt lokal auf
 * bestellte Abschnitte, Reihenfolge, Evidenzhinweise und Review-Grenze prüfen.
 * Kein Netzwerkzugriff, keine Kunden-, Vertrags- oder Betriebsdaten.
 */

const request = {
  deliverableId: "synthetic-integration-note",
  requiredSections: [
    "Ziel",
    "Voraussetzungen",
    "Vorgehen",
    "Prüfergebnis",
    "Offene Punkte"
  ]
};

const markdown = `# Synthetische Integrationsnotiz

## Ziel
Einen lokalen Formtest für ein technisches Lieferobjekt demonstrieren.

## Voraussetzungen
- Node.js ist lokal verfügbar.
- Es werden ausschließlich synthetische Fixtures verwendet.

## Vorgehen
1. Bestellte Abschnitte in ihrer Reihenfolge erfassen.
2. Evidenzhinweise als lokale Referenzen notieren.
3. Offene Punkte ausdrücklich stehen lassen.

## Prüfergebnis
Der Formtest meldet Strukturtreue getrennt von fachlicher Richtigkeit.

Evidenz: fixture://synthetic-deliverable-v1

## Offene Punkte
Die fachliche Einordnung bleibt menschlicher Review.

Grenze: keine Freigabe, keine Ausführung, keine verbindliche Aussage.
`;

function inspectDeliverable(spec, text) {
  const headingPattern = /^##\s+(.+)$/gm;
  const headings = [...text.matchAll(headingPattern)].map((match) => match[1].trim());
  const missingSections = spec.requiredSections.filter((section) => !headings.includes(section));
  const actualRequiredOrder = headings.filter((heading) => spec.requiredSections.includes(heading));
  const orderMatches = JSON.stringify(actualRequiredOrder) === JSON.stringify(spec.requiredSections);
  const evidenceReferences = [...text.matchAll(/fixture:\/\/[a-z0-9-]+/gi)].map((match) => match[0]);
  const hasReviewBoundary = /Grenze:\s*.+/i.test(text);
  const hasOpenPoint = /## Offene Punkte\s+[^#]+/i.test(text);

  const findings = [];
  if (missingSections.length) findings.push("required_section_missing");
  if (!orderMatches) findings.push("required_order_changed");
  if (!evidenceReferences.length) findings.push("evidence_reference_missing");
  if (!hasReviewBoundary) findings.push("review_boundary_missing");
  if (!hasOpenPoint) findings.push("open_points_not_explicit");

  return {
    deliverableId: spec.deliverableId,
    requiredSections: spec.requiredSections,
    detectedSections: headings,
    missingSections,
    orderMatches,
    evidenceReferences,
    hasReviewBoundary,
    hasOpenPoint,
    findings,
    formReadyForHumanReview: findings.length === 0
  };
}

const inspection = inspectDeliverable(request, markdown);
console.log(JSON.stringify({
  mode: "ordered-deliverable-preflight",
  sourceClass: "synthetic-local-fixture",
  networkCalls: 0,
  inspection,
  nextHumanCheck: inspection.formReadyForHumanReview
    ? "Inhalt, Quellenqualität und fachliche Schlussfolgerungen prüfen"
    : "Bestellte Form, Evidenzhinweise und Review-Grenze vervollständigen",
  boundary: "Der Preflight prüft Formmerkmale. Er bestätigt weder fachliche Richtigkeit noch eine Freigabe."
}, null, 2));
