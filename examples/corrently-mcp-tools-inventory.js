#!/usr/bin/env node
/**
 * Public-safe Beispiel: Corrently MCP Toolliste inventarisieren.
 *
 * Das Script liest nur das öffentliche MCP-Toolmanifest. Es sendet keinen Token,
 * ruft keine Fachfunktion aus dem Manifest auf und verarbeitet keine Kunden-,
 * Vertrags- oder Messdaten. Ergebnis ist ein kleines Orientierungsprotokoll.
 */

const MANIFEST_URL = "https://api.corrently.io/v2.0/mcp/tools";

async function loadManifest(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`MCP manifest fetch failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function summarizeTool(tool) {
  const properties = tool.inputSchema?.properties || {};
  const required = tool.inputSchema?.required || [];
  const propertyNames = Object.keys(properties);
  return {
    name: tool.name,
    description: tool.description,
    required,
    optional: propertyNames.filter((name) => !required.includes(name)),
    hasOptionalToken: Boolean(properties.token),
    inputPatterns: Object.fromEntries(
      propertyNames
        .filter((name) => properties[name]?.pattern)
        .map((name) => [name, properties[name].pattern])
    ),
    boundary: "Manifest-Metadaten; kein Tool-Aufruf, keine Fachentscheidung."
  };
}

function summarize(manifest) {
  const tools = (manifest.tools || []).map(summarizeTool);
  return {
    mode: "corrently-mcp-tools-inventory",
    source: MANIFEST_URL,
    generatedAt: new Date().toISOString(),
    totals: {
      tools: tools.length,
      toolsWithOptionalToken: tools.filter((tool) => tool.hasOptionalToken).length,
      toolsWithZipInput: tools.filter((tool) => tool.required.includes("zip") || tool.optional.includes("zip")).length
    },
    tools,
    provisioning: manifest.provisioning
      ? {
          warning: manifest.provisioning.warning || null,
          license: manifest.provisioning.license || null,
          tier: manifest.provisioning.tier || null
        }
      : null,
    noActionBoundary: [
      "kein Token senden",
      "keine Tool-Fachfunktion aufrufen",
      "keine Kunden-, Vertrags- oder Messdaten verarbeiten",
      "keine Preis-, Lizenz-, Rechts- oder Integrationszusage ableiten"
    ]
  };
}

loadManifest(MANIFEST_URL)
  .then((manifest) => console.log(JSON.stringify(summarize(manifest), null, 2)))
  .catch((error) => {
    console.error(JSON.stringify({ mode: "corrently-mcp-tools-inventory", error: error.message }, null, 2));
    process.exit(1);
  });
