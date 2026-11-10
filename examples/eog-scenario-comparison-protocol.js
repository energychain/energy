#!/usr/bin/env node
/**
 * Public-safe Beispiel: zwei synthetische EOG-Szenario-Snapshots als
 * Vergleichsprotokoll prüfen. Kein Netzwerkzugriff, keine Kunden-, Preis-
 * oder Vertragsdaten und keine fachliche Investitionsentscheidung.
 */

const baseline = {
  scenarioId: "synthetic-grid-option",
  version: "v1",
  recordedAt: "2026-11-09T09:00:00Z",
  assumptions: {
    annualDemandGrowthPct: 1.4,
    capexIndex: 100,
    implementationYears: 4
  },
  result: {
    indicator: "synthetic-comparison-score",
    value: 62,
    unit: "points"
  }
};

const variant = {
  scenarioId: "synthetic-grid-option",
  version: "v2",
  basedOn: "v1",
  recordedAt: "2026-11-10T09:00:00Z",
  assumptions: {
    annualDemandGrowthPct: 2.1,
    capexIndex: 100,
    implementationYears: 5
  },
  changeReasons: {
    annualDemandGrowthPct: "synthetic-sensitivity-step",
    implementationYears: "synthetic-schedule-test"
  },
  result: {
    indicator: "synthetic-comparison-score",
    value: 55,
    unit: "points"
  }
};

function compareSnapshots(base, next) {
  const findings = [];
  if (base.scenarioId !== next.scenarioId) findings.push("scenario_id_mismatch");
  if (next.basedOn !== base.version) findings.push("baseline_reference_missing_or_wrong");
  if (Date.parse(next.recordedAt) <= Date.parse(base.recordedAt)) findings.push("version_time_not_increasing");
  if (base.result.indicator !== next.result.indicator || base.result.unit !== next.result.unit) {
    findings.push("result_contract_changed");
  }

  const changedAssumptions = Object.keys(next.assumptions).filter(
    (key) => base.assumptions[key] !== next.assumptions[key]
  );
  const undocumentedChanges = changedAssumptions.filter(
    (key) => !next.changeReasons || !next.changeReasons[key]
  );
  if (undocumentedChanges.length) findings.push("undocumented_assumption_change");

  const resultDelta = next.result.value - base.result.value;
  return {
    scenarioId: next.scenarioId,
    comparison: `${base.version}->${next.version}`,
    changedAssumptions,
    changeReasons: changedAssumptions.map((key) => ({ key, reason: next.changeReasons?.[key] || null })),
    resultDelta: { value: resultDelta, unit: next.result.unit },
    findings,
    reproducibleComparison: findings.length === 0
  };
}

const protocol = compareSnapshots(baseline, variant);
console.log(JSON.stringify({
  mode: "eog-scenario-comparison-protocol",
  sourceClass: "synthetic-local-fixture",
  networkCalls: 0,
  protocol,
  nextHumanCheck: protocol.reproducibleComparison
    ? "Wirkung der dokumentierten Änderungen fachlich einordnen"
    : "Snapshot-Vertrag und Änderungsgründe vervollständigen",
  boundary: "Das Protokoll macht Versionen und Änderungen sichtbar. Es bewertet keine reale EOG-Methode und empfiehlt keine Investition."
}, null, 2));
