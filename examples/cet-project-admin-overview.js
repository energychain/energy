#!/usr/bin/env node
/**
 * Public-safe Beispiel: eine synthetische CET-Projektakten-
 * Verwaltungsübersicht lokal prüfen.
 *
 * Das Skript ruft keine API auf, verwendet keinen Token und führt weder
 * Löschung noch Archivierung oder eine andere schreibende Aktion aus.
 */

const overview = {
  safetyClass: "read_only_governance_projection",
  advisory: true,
  projects: [
    {
      projectId: "synthetic-ready",
      title: "Synthetische Prüfakte",
      lifecycle: "ready",
      updatedAt: "2026-10-23T08:00:00.000Z",
      responsibility: {
        projection: "legacy_responsibility_projection",
        grantsAuthority: false,
        createdBy: "demo-editor",
        members: ["demo-reviewer"]
      },
      stats: { files: 2, bytes: 4096, datasets: 1, nodes: 4, edges: 3 },
      requiredClearance: ["internal"],
      linkedCaseCount: 1,
      linkedConversationCount: 0,
      deletionState: "none",
      failedCleanupCount: 0,
      deletionEligibility: "policy_definition_required",
      blockers: ["responsibility_model_missing", "legal_hold_model_missing"],
      nextGate: "human_policy_design_review"
    },
    {
      projectId: "synthetic-cleanup",
      title: "Synthetische Altakte",
      lifecycle: "archived",
      updatedAt: "2026-10-22T12:00:00.000Z",
      responsibility: {
        projection: "legacy_responsibility_projection",
        grantsAuthority: false,
        createdBy: "demo-editor",
        members: []
      },
      stats: { files: 1, bytes: 1024, datasets: 0, nodes: 1, edges: 0 },
      requiredClearance: [],
      linkedCaseCount: 0,
      linkedConversationCount: 1,
      deletionState: "incomplete",
      failedCleanupCount: 1,
      deletionEligibility: "blocked_incomplete_cleanup",
      blockers: ["cleanup_incomplete", "responsibility_model_missing", "legal_hold_model_missing"],
      nextGate: "human_policy_design_review"
    }
  ]
};

const allowedEligibility = new Set([
  "not_eligible",
  "policy_definition_required",
  "blocked_incomplete_cleanup",
  "human_review_required"
]);

function reviewAdministrationOverview(input) {
  const findings = [];
  const eligibilityCounts = {};

  for (const project of input.projects || []) {
    const issues = [];
    if (!allowedEligibility.has(project.deletionEligibility)) issues.push("unknown_deletion_eligibility");
    if (project.responsibility?.grantsAuthority !== false) issues.push("responsibility_projection_must_not_grant_authority");
    if (project.nextGate !== "human_policy_design_review") issues.push("human_gate_missing");
    if (!Array.isArray(project.blockers) || project.blockers.length === 0) issues.push("blockers_missing");

    eligibilityCounts[project.deletionEligibility] =
      (eligibilityCounts[project.deletionEligibility] || 0) + 1;

    if (issues.length || project.deletionEligibility !== "not_eligible") {
      findings.push({
        projectId: project.projectId,
        lifecycle: project.lifecycle,
        deletionEligibility: project.deletionEligibility,
        blockers: project.blockers,
        issues,
        nextGate: project.nextGate
      });
    }
  }

  return {
    mode: "cet-project-admin-overview-review",
    sourceClass: "synthetic-local-snapshot",
    acceptedSafetyClass: input.safetyClass === "read_only_governance_projection",
    advisoryOnly: input.advisory === true,
    totals: {
      visibleProjects: (input.projects || []).length,
      linkedCases: (input.projects || []).reduce((sum, item) => sum + item.linkedCaseCount, 0),
      linkedConversations: (input.projects || []).reduce((sum, item) => sum + item.linkedConversationCount, 0),
      failedCleanupCount: (input.projects || []).reduce((sum, item) => sum + item.failedCleanupCount, 0)
    },
    eligibilityCounts,
    reviewQueue: findings,
    noActionBoundary: [
      "Eine Verwaltungsübersicht ist eine beratende Sicht, keine Löschfreigabe.",
      "Verantwortungsprojektionen begründen keine Berechtigung oder Zuständigkeit.",
      "Dieses lokale Beispiel ruft keine API auf und verändert keine Projektakte."
    ]
  };
}

console.log(JSON.stringify(reviewAdministrationOverview(overview), null, 2));
