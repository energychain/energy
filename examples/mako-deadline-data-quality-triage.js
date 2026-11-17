#!/usr/bin/env node
/**
 * Public-safe Beispiel: synthetische MaKo-Fälle nach Zeit- und
 * Datenqualitätssignal vorsortieren. Kein Netzwerkzugriff, keine echten
 * EDIFACT-, Kunden- oder Vertragsdaten und keine Fristberechnung.
 */

const cases = [
  {
    caseId: "SYN-MAKO-001",
    messageType: "UTILMD",
    submittedAt: "2026-11-16T08:00:00Z",
    syntheticDueAt: "2026-11-16T10:00:00Z",
    transportAcknowledgedAt: "2026-11-16T08:02:00Z",
    businessResponseAt: "2026-11-16T10:20:00Z",
    sourceChecks: [
      { field: "marketLocationState", values: ["active", "pending"], status: "conflict" },
      { field: "roleAssignment", values: ["synthetic-role-a"], status: "consistent" }
    ]
  },
  {
    caseId: "SYN-MAKO-002",
    messageType: "MSCONS",
    submittedAt: "2026-11-16T09:00:00Z",
    syntheticDueAt: "2026-11-16T10:00:00Z",
    transportAcknowledgedAt: "2026-11-16T10:08:00Z",
    businessResponseAt: "2026-11-16T10:10:00Z",
    sourceChecks: [
      { field: "readingPeriod", values: ["synthetic-period-01"], status: "consistent" }
    ]
  }
];

function onOrBefore(value, boundary) {
  return Date.parse(value) <= Date.parse(boundary);
}

function triage(item) {
  const dataConflicts = item.sourceChecks
    .filter((check) => check.status === "conflict")
    .map((check) => check.field);
  const transportOnTime = onOrBefore(item.transportAcknowledgedAt, item.syntheticDueAt);
  const businessResponseOnTime = onOrBefore(item.businessResponseAt, item.syntheticDueAt);

  let reviewLane = "no_timing_or_data_signal";
  if (dataConflicts.length) reviewLane = "data_quality_clarification";
  else if (!transportOnTime) reviewLane = "transport_or_process_timing";
  else if (!businessResponseOnTime) reviewLane = "business_response_timing";

  return {
    caseId: item.caseId,
    messageType: item.messageType,
    transportOnTime,
    businessResponseOnTime,
    dataConflicts,
    reviewLane,
    nextHumanCheck: dataConflicts.length
      ? "Quellenstand und fachlich gültigen Wert klären"
      : "synthetischen Zeitverlauf und Prozessschritt prüfen"
  };
}

const result = cases.map(triage);
console.log(JSON.stringify({
  mode: "mako-deadline-data-quality-triage",
  sourceClass: "synthetic-local-fixture",
  networkCalls: 0,
  result,
  boundary: "Die Triage verwendet vorgegebene synthetische Zeitpunkte. Sie berechnet oder bewertet keine regulatorische Frist und löst keine MaKo-Aktion aus."
}, null, 2));
