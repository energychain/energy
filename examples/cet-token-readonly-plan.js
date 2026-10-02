#!/usr/bin/env node
/**
 * Public-safe Beispiel: CET-Token-Start als read-only Request-Plan vorbereiten.
 *
 * Das Script führt bewusst keine API-Anfrage aus. Es prüft nur, ob ein Token
 * lokal als Umgebungsvariable vorhanden wäre, druckt ihn nicht aus und erzeugt
 * einen kleinen Plan für read-only Orientierungspfade.
 */

const BASE_URL = process.env.CET_BASE_URL || "https://api.cernion.de";
const TOKEN_PRESENT = Boolean(process.env.CET_TOKEN || process.env.CERNION_API_TOKEN);

const READ_ONLY_ORIENTATION = [
  {
    method: "GET",
    path: "/api/agent-manifest/capabilities",
    purpose: "Capability-Übersicht vor Fachaufrufen verstehen"
  },
  {
    method: "GET",
    path: "/api/agent-sidecar/tools",
    purpose: "Sidecar-Werkzeuge als öffentliches/technisches Inventar prüfen"
  },
  {
    method: "GET",
    path: "/api/agent-sidecar/mcp/tools",
    purpose: "MCP-Toolliste vor Agentenintegration vorsortieren"
  }
];

const NO_CALL_BOUNDARIES = [
  "keine Token-Ausgabe in Logs oder Chat",
  "keine Kundendaten oder Produktivdaten",
  "keine Schreiboperationen",
  "keine Preis-, Vertrags-, Tarif-, Netzanschluss- oder Abrechnungszusage",
  "fachliche Entscheidung bleibt Human Review"
];

function buildPlan() {
  return {
    mode: "cet-token-readonly-plan",
    baseUrl: BASE_URL,
    token: {
      present: TOKEN_PRESENT,
      printed: false,
      sourceHint: TOKEN_PRESENT ? "environment variable detected" : "set CET_TOKEN in the local shell if needed"
    },
    plannedRequests: READ_ONLY_ORIENTATION.map((entry) => ({
      ...entry,
      url: new URL(entry.path, BASE_URL).toString(),
      authorization: TOKEN_PRESENT ? "Bearer <redacted>" : "not configured"
    })),
    noCallBoundaries: NO_CALL_BOUNDARIES,
    nextSafeGate: TOKEN_PRESENT
      ? "lokal entscheiden, ob ein einzelner read-only Orientierungsaufruf bewusst ausgeführt werden soll"
      : "Token getrennt anfordern/setzen; keinen Token in dieses Script oder Repository schreiben"
  };
}

console.log(JSON.stringify(buildPlan(), null, 2));
