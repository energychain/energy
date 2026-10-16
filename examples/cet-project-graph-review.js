#!/usr/bin/env node
/**
 * Public-safe Beispiel: einen synthetischen Projektakten-Relationsgraph prüfen.
 *
 * Das Script arbeitet nur mit lokalen Beispieldaten. Es ruft keine API auf,
 * verwendet keinen Token und verarbeitet keine Kunden- oder Projektdaten.
 */

const graph = {
  nodes: [
    { nodeId: "object-demo", kind: "object", label: "synthetic-input.zip" },
    { nodeId: "dataset-meter", kind: "dataset", label: "Messwerte" },
    { nodeId: "dataset-assets", kind: "dataset", label: "Anlagenliste" },
    { nodeId: "section-note", kind: "section", label: "Prüfnotiz" }
  ],
  edges: [
    {
      edgeId: "edge-contains",
      from: "object-demo",
      to: "dataset-meter",
      relation: "contains",
      weight: 1,
      origin: "derived",
      evidence: ["synthetic source structure"]
    },
    {
      edgeId: "edge-join-candidate",
      from: "dataset-meter",
      to: "dataset-assets",
      relation: "joinsOn",
      weight: 0.72,
      origin: "derived",
      evidence: ["two synthetic identifiers overlap"]
    },
    {
      edgeId: "edge-description-open",
      from: "section-note",
      to: "dataset-meter",
      relation: "describes",
      weight: 0.48,
      origin: "derived",
      evidence: ["one synthetic anchor"]
    }
  ],
  truncated: false
};

const knownRelations = new Set([
  "contains",
  "derivedFrom",
  "describes",
  "sameEntity",
  "joinsOn",
  "timeAligned",
  "references",
  "answeredBy"
]);

function reviewProjectGraph(input, threshold = 0.6) {
  const nodeIds = new Set(input.nodes.map((node) => node.nodeId));
  const findings = [];

  for (const edge of input.edges) {
    const issues = [];
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) issues.push("dangling_reference");
    if (!knownRelations.has(edge.relation)) issues.push("unknown_relation");
    if (!Number.isFinite(edge.weight) || edge.weight < 0 || edge.weight > 1) {
      issues.push("invalid_weight");
    } else if (edge.weight < threshold) {
      issues.push("below_review_threshold");
    }
    if (!Array.isArray(edge.evidence) || edge.evidence.length === 0) issues.push("evidence_missing");

    if (issues.length) {
      findings.push({
        edgeId: edge.edgeId,
        relation: edge.relation,
        weight: edge.weight,
        issues,
        nextStep: "Quelle und Evidenz fachlich prüfen; keine Aktion aus der Kante ableiten."
      });
    }
  }

  return {
    mode: "cet-project-graph-review",
    sourceClass: "synthetic-local-snapshot",
    threshold,
    totals: {
      nodes: input.nodes.length,
      edges: input.edges.length,
      findings: findings.length
    },
    truncated: Boolean(input.truncated),
    reviewQueue: findings,
    noActionBoundary: [
      "Graphbeziehungen sind prüfbare Hinweise, keine automatische Fachentscheidung.",
      "Keine echten Projekt-, Kunden- oder Betriebsdaten in öffentliche Beispiele übernehmen.",
      "Ein lokaler Snapshot bestätigt weder API-Verfügbarkeit noch Produktionsreife."
    ]
  };
}

console.log(JSON.stringify(reviewProjectGraph(graph), null, 2));
