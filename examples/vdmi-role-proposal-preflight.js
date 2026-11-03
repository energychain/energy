#!/usr/bin/env node
/**
 * Public-safe Beispiel: synthetische VDMI-Rollenvorschläge vor einer
 * fachlichen Bestätigung prüfen. Kein Netzwerkzugriff, keine Personendaten.
 */

const roleCodes = new Set(["V", "D", "M", "I"]);
const syntheticProposals = [
  {
    functionId: "meter-data-quality",
    need: "Messwertauffälligkeiten fachlich einordnen",
    proposedRole: "D",
    basis: ["coverage:meter-data", "statement:performs-check"],
    confidence: 0.86,
    confirmed: false
  },
  {
    functionId: "exception-approval",
    need: "Abweichung zur weiteren Bearbeitung freigeben",
    proposedRole: "V",
    basis: ["coverage:exception-review"],
    confidence: 0.58,
    confirmed: false
  },
  {
    functionId: "status-notice",
    need: "Bearbeitungsstatus erhalten",
    proposedRole: "I",
    basis: [],
    confidence: 0.72,
    confirmed: true
  },
  {
    functionId: "source-correction",
    need: "Quellsystem technisch korrigieren",
    proposedRole: "X",
    basis: ["coverage:source-system"],
    confidence: 0.91,
    confirmed: false
  }
];

function preflight(proposal) {
  const findings = [];

  if (!roleCodes.has(proposal.proposedRole)) findings.push("unknown_role_code");
  if (!Array.isArray(proposal.basis) || proposal.basis.length === 0) findings.push("missing_basis");
  if (!Number.isFinite(proposal.confidence) || proposal.confidence < 0 || proposal.confidence > 1) {
    findings.push("invalid_confidence");
  }

  const status = findings.length
    ? "clarification_required"
    : proposal.confirmed
      ? "confirmed_for_separate_governance_review"
      : "proposal_requires_human_confirmation";

  return {
    functionId: proposal.functionId,
    proposedRole: proposal.proposedRole,
    status,
    basisCount: proposal.basis.length,
    confidence: proposal.confidence,
    findings,
    grantsAccess: false,
    triggersExecution: false
  };
}

console.log(JSON.stringify({
  mode: "vdmi-role-proposal-preflight",
  sourceClass: "synthetic-local-fixture",
  networkCalls: 0,
  boundary: "Rollenvorschläge sind Darstellungen zur Prüfung; sie vergeben keine Rechte und lösen keine Fachaktion aus.",
  results: syntheticProposals.map(preflight)
}, null, 2));
