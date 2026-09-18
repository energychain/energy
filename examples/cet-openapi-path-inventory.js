#!/usr/bin/env node
/**
 * Public-safe Beispiel: Cernion OpenAPI als Pfad-Inventar vorsortieren.
 *
 * Das Script liest nur die öffentliche OpenAPI-Schema-Datei. Es sendet keinen
 * Bearer Token, ruft keine geschützten Fachendpunkte auf und verarbeitet keine
 * Kundendaten. Ergebnis ist ein kleines Orientierungsprotokoll für Entwickler.
 */

const SPEC_URL = "https://api.cernion.de/api/openapi.json";
const METHODS = new Set(["get", "post", "put", "patch", "delete", "options", "head"]);

async function loadSpec(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`OpenAPI fetch failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function collectOperations(spec) {
  return Object.entries(spec.paths || {}).flatMap(([path, methods]) =>
    Object.entries(methods || {})
      .filter(([method]) => METHODS.has(method))
      .map(([method, operation]) => ({
        method: method.toUpperCase(),
        path,
        operationId: operation.operationId || null,
        tags: operation.tags && operation.tags.length ? operation.tags : ["untagged"],
        summary: operation.summary || ""
      }))
  );
}

function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function summarize(spec) {
  const operations = collectOperations(spec);
  const topTags = countBy(
    operations.flatMap((operation) => operation.tags.map((tag) => ({ tag }))),
    (item) => item.tag
  ).slice(0, 12);

  const methodCounts = countBy(operations, (operation) => operation.method);
  const readOnlyCandidates = operations
    .filter((operation) => operation.method === "GET")
    .slice(0, 10)
    .map((operation) => ({ path: operation.path, tags: operation.tags, summary: operation.summary }));

  return {
    mode: "cet-openapi-path-inventory",
    source: SPEC_URL,
    info: {
      title: spec.info?.title || null,
      version: spec.info?.version || null
    },
    totals: {
      paths: Object.keys(spec.paths || {}).length,
      operations: operations.length,
      readOnlyMethodCandidates: operations.filter((operation) => operation.method === "GET").length
    },
    methodCounts,
    topTags,
    sampleReadOnlyCandidates: readOnlyCandidates,
    boundary: "Nur öffentliche Schema-Orientierung; kein Token, keine geschützten Fachaufrufe, keine produktive Freigabe."
  };
}

loadSpec(SPEC_URL)
  .then((spec) => console.log(JSON.stringify(summarize(spec), null, 2)))
  .catch((error) => {
    console.error(JSON.stringify({ mode: "cet-openapi-path-inventory", error: error.message }, null, 2));
    process.exit(1);
  });
