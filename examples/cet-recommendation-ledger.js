#!/usr/bin/env node
/**
 * Public-safe Beispiel: einen synthetischen Empfehlungsverlauf mit stabilen IDs,
 * expliziten Statuswechseln und Schutz vor stillem Wiederauftauchen prüfen.
 * Kein Netzwerkzugriff, keine echten Vorgänge und keine fachliche Entscheidung.
 */

const allowedStatuses = new Set(["active", "weakened", "withdrawn", "superseded", "done"]);

const ledger = [
  {
    recommendationId: "REC-SYN-001",
    fingerprint: "attach-scan:case-017",
    text: "Synthetischen Scan an Fall 017 anhängen",
    status: "withdrawn",
    changedAt: "2026-11-16T13:20:00Z",
    reason: "Die Zuordnung ist nicht belegt; zuerst die Kennung klären.",
    boundaryNowInForce: "Kein Anhängen ohne bestätigte Fallzuordnung."
  },
  {
    recommendationId: "REC-SYN-002",
    fingerprint: "compare-register:old-layout",
    text: "Register mit dem alten Spaltensatz vergleichen",
    status: "superseded",
    changedAt: "2026-11-16T13:24:00Z",
    reason: "Ein vollständigerer synthetischer Spaltensatz liegt vor.",
    supersededBy: "REC-SYN-003"
  },
  {
    recommendationId: "REC-SYN-003",
    fingerprint: "compare-register:current-layout",
    text: "Register mit dem aktuellen synthetischen Spaltensatz vergleichen",
    status: "active",
    changedAt: "2026-11-16T13:24:00Z"
  },
  {
    recommendationId: "REC-SYN-004",
    fingerprint: "document-open-question:role",
    text: "Offene Zuständigkeit als Klärpunkt dokumentieren",
    status: "done",
    changedAt: "2026-11-16T13:28:00Z",
    reason: "Klärpunkt wurde im synthetischen Übergabestand sichtbar gemacht."
  }
];

const proposedRecommendations = [
  {
    recommendationId: "REC-SYN-005",
    fingerprint: "attach-scan:case-017",
    text: "Synthetischen Scan an Fall 017 anhängen"
  },
  {
    recommendationId: "REC-SYN-006",
    fingerprint: "request-role-confirmation:case-017",
    text: "Zuständige Rolle für Fall 017 bestätigen lassen"
  }
];

function validateLedger(entries) {
  const findings = [];
  const ids = new Set();
  const byId = new Map(entries.map((entry) => [entry.recommendationId, entry]));

  for (const entry of entries) {
    if (ids.has(entry.recommendationId)) findings.push(`${entry.recommendationId}: duplicate_id`);
    ids.add(entry.recommendationId);

    if (!allowedStatuses.has(entry.status)) findings.push(`${entry.recommendationId}: unknown_status`);
    if (entry.status !== "active" && !entry.reason) findings.push(`${entry.recommendationId}: missing_change_reason`);
    if (["withdrawn", "superseded"].includes(entry.status) && !entry.boundaryNowInForce && !entry.supersededBy) {
      findings.push(`${entry.recommendationId}: missing_next_boundary`);
    }
    if (entry.status === "superseded") {
      const replacement = byId.get(entry.supersededBy);
      if (!replacement) findings.push(`${entry.recommendationId}: missing_replacement`);
      else if (replacement.status !== "active") findings.push(`${entry.recommendationId}: replacement_not_active`);
    }
  }

  return findings;
}

function guardNewRecommendations(entries, proposals) {
  const closedFingerprints = new Map(
    entries
      .filter((entry) => ["withdrawn", "superseded"].includes(entry.status))
      .map((entry) => [entry.fingerprint, entry])
  );

  return proposals.map((proposal) => {
    const prior = closedFingerprints.get(proposal.fingerprint);
    if (!prior) return { ...proposal, accepted: true, reason: "no_closed_match" };
    return {
      ...proposal,
      accepted: false,
      reason: `blocked_resurrection_of_${prior.recommendationId}`,
      priorStatus: prior.status
    };
  });
}

const findings = validateLedger(ledger);
const proposalReview = guardNewRecommendations(ledger, proposedRecommendations);
const activeRecommendations = ledger
  .filter((entry) => entry.status === "active")
  .map((entry) => entry.recommendationId);

console.log(JSON.stringify({
  mode: "cet-recommendation-ledger-local-preflight",
  sourceClass: "synthetic-local-fixture",
  networkCalls: 0,
  ledgerValid: findings.length === 0,
  findings,
  statusCounts: ledger.reduce((counts, entry) => {
    counts[entry.status] = (counts[entry.status] || 0) + 1;
    return counts;
  }, {}),
  activeRecommendations,
  proposalReview,
  boundary: "Der lokale Formtest prüft Status- und Verlaufskonsistenz. Er bewertet weder die fachliche Richtigkeit einer Empfehlung noch Berechtigungen, Freigaben oder produktive Ausführung."
}, null, 2));
