#!/usr/bin/env node
/**
 * Public-safe Beispiel: CET-Clusterköpfe aus einem lokalen llm.txt-Snapshot
 * inventarisieren und passende read-only Auflösungspfade vorbereiten.
 *
 * Das Skript ruft keine API auf, verwendet keinen Token und leitet aus dem
 * Manifest keine fachliche Entscheidung oder schreibende Aktion ab.
 */

const manifest = `# LLM IMPLEMENTATION CONTEXT

## RESOLUTION PROTOCOL
- Vague intent → closest CAPABILITY id → GET /api/_agent/capabilities/<id>
- Known workflow → closest RECIPE id → GET /api/cookbook/<id>
- Raw operation surface for a domain → GET /api/_agent/operations?domain=<d>

## Cluster Manifest

### grid-ops (2 capabilities · 1 recipes · 3 operations)
capabilities: evidence_freshness_guard, grid_operator_identity_resolution
recipes:
  grid-connection-validation "Assess a synthetic connection case"
resolve: GET /api/_agent/operations?domain=grid-ops

### market-data (1 capabilities · 1 recipes · 2 operations)
capabilities: german_grid_market_data
recipes:
  forecast-vs-actual-comparison "Compare synthetic time series"
resolve: GET /api/_agent/operations?domain=market-data`;

function splitIds(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseClusters(text) {
  const lines = text.split(/\r?\n/);
  const clusters = [];
  let current = null;
  let section = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = line.match(/^###\s+([a-z0-9-]+)\s+\(([^)]+)\)$/i);
    if (heading) {
      current = {
        domain: heading[1],
        declared: heading[2],
        capabilities: [],
        recipes: [],
        resolutionPath: null
      };
      clusters.push(current);
      section = null;
      continue;
    }
    if (!current) continue;
    if (line.startsWith("capabilities:")) {
      current.capabilities = splitIds(line.slice("capabilities:".length));
      section = null;
      continue;
    }
    if (line === "recipes:") {
      section = "recipes";
      continue;
    }
    if (line.startsWith("resolve: GET ")) {
      current.resolutionPath = line.slice("resolve: GET ".length).trim();
      section = null;
      continue;
    }
    if (section === "recipes" && line) {
      const recipe = line.match(/^([a-z0-9-]+)\s+"([^"]+)"$/i);
      if (recipe) current.recipes.push({ id: recipe[1], purpose: recipe[2] });
    }
  }

  return clusters;
}

function buildPreflight(text) {
  const clusters = parseClusters(text);
  return {
    mode: "cet-llm-cluster-preflight",
    sourceClass: "synthetic-local-manifest",
    totals: {
      clusters: clusters.length,
      capabilities: clusters.reduce((sum, item) => sum + item.capabilities.length, 0),
      recipes: clusters.reduce((sum, item) => sum + item.recipes.length, 0)
    },
    clusters: clusters.map((item) => ({
      domain: item.domain,
      capabilityHeads: item.capabilities,
      recipeHeads: item.recipes.map((recipe) => recipe.id),
      resolutionPath: item.resolutionPath,
      readyForReadOnlyResolution: Boolean(item.resolutionPath)
    })),
    nextSafeStep: "Einen passenden Clusterkopf auswählen, read-only auflösen und erst danach den vollständigen Vertrag prüfen.",
    noActionBoundary: [
      "Ein Clusterkopf ist Navigation, kein ausführbarer Endpunktvertrag.",
      "Keine Pfade, Parameter oder Berechtigungen aus Namen erraten.",
      "Das lokale Preflight ruft keine API auf und bestätigt keine Produktionsverfügbarkeit."
    ]
  };
}

console.log(JSON.stringify(buildPreflight(manifest), null, 2));
