#!/usr/bin/env node
/**
 * Synthetisches Beispiel: MCP-Tool-Manifest vor Agentenaufrufen prüfen.
 *
 * Kein Tool-Aufruf, keine Zugangsdaten, keine echten Kundendaten und keine
 * produktive Systemanbindung. Das Script prüft nur Zweck, Datenklasse,
 * No-Call-Regeln und nächsten sicheren Schritt.
 */

const toolManifest = {
  tool: "synthetic.grid.asset.lookup",
  version: "demo-2026-09",
  purpose: "read_only_asset_context",
  allowedDataClasses: ["synthetic", "anonymized"],
  forbiddenFlags: [
    "contains_personal_data",
    "contains_customer_contract",
    "asks_for_binding_decision",
    "requires_write_access"
  ],
  requiredHumanReviewFor: ["real_operator_data", "legal_or_contractual_claim"]
};

const dryRunRequests = [
  {
    id: "REQ-001",
    question: "Welche synthetischen Asset-Hinweise brauchen Klärung?",
    purpose: "read_only_asset_context",
    dataClass: "synthetic",
    flags: ["demo"]
  },
  {
    id: "REQ-002",
    question: "Kann dieses echte Kundendokument automatisch entschieden werden?",
    purpose: "binding_decision",
    dataClass: "real_operator_data",
    flags: ["contains_customer_contract", "asks_for_binding_decision"]
  },
  {
    id: "REQ-003",
    question: "Darf das Tool den Status im Zielsystem schreiben?",
    purpose: "read_only_asset_context",
    dataClass: "anonymized",
    flags: ["requires_write_access"]
  }
];

function evaluateRequest(manifest, request) {
  const reasons = [];

  if (request.purpose !== manifest.purpose) {
    reasons.push(`purpose-mismatch:${request.purpose}`);
  }

  if (!manifest.allowedDataClasses.includes(request.dataClass)) {
    reasons.push(`data-class-not-allowed:${request.dataClass}`);
  }

  const forbidden = request.flags.filter((flag) => manifest.forbiddenFlags.includes(flag));
  if (forbidden.length) {
    reasons.push(`forbidden-flags:${forbidden.join(",")}`);
  }

  const humanReview = request.flags.some((flag) => manifest.requiredHumanReviewFor.includes(flag))
    || manifest.requiredHumanReviewFor.includes(request.dataClass);

  return {
    requestId: request.id,
    tool: manifest.tool,
    status: reasons.length === 0 && !humanReview ? "call_allowed_for_demo" : "no_call",
    reasons,
    humanReview,
    nextSafeStep: reasons.length === 0 && !humanReview
      ? "Demo-Toolaufruf könnte mit synthetischen Daten vorbereitet werden"
      : "Grenze dokumentieren und vor Toolaufruf fachlich prüfen"
  };
}

const result = dryRunRequests.map((request) => evaluateRequest(toolManifest, request));

console.log(JSON.stringify({ mode: "mcp-tool-manifest-dry-run", manifest: toolManifest.tool, result }, null, 2));
