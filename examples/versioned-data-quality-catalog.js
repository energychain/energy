#!/usr/bin/env node
/**
 * Public-safe Beispiel: versionierte Datenqualitätsregeln auf synthetische
 * Energiedaten anwenden. Kein Netzwerkzugriff, keine echten Kundendaten.
 */

const ruleCatalog = {
  id: "meter-reading-intake",
  version: "2026-10-30.1",
  validFrom: "2026-10-30",
  rules: [
    {
      id: "series-id-present",
      severity: "error",
      test: (record) => typeof record.seriesId === "string" && record.seriesId.trim().length > 0,
      message: "seriesId fehlt"
    },
    {
      id: "timestamp-has-offset",
      severity: "error",
      test: (record) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(record.timestamp ?? ""),
      message: "timestamp braucht Zeitzone oder Offset"
    },
    {
      id: "value-is-finite",
      severity: "error",
      test: (record) => Number.isFinite(record.value),
      message: "value ist keine endliche Zahl"
    },
    {
      id: "unit-known",
      severity: "warning",
      test: (record) => ["kWh", "kW"].includes(record.unit),
      message: "unit ist nicht kWh oder kW"
    }
  ]
};

const records = [
  { seriesId: "synthetic-meter-01", timestamp: "2026-10-30T08:00:00+01:00", value: 1.25, unit: "kWh" },
  { seriesId: "synthetic-meter-02", timestamp: "2026-10-30T08:15:00", value: 0, unit: "kWh" },
  { seriesId: "", timestamp: "2026-10-30T08:30:00+01:00", value: null, unit: "Wh" }
];

function reviewRecord(record, catalog) {
  const findings = catalog.rules
    .filter((rule) => !rule.test(record))
    .map(({ id, severity, message }) => ({ ruleId: id, severity, message }));

  return {
    seriesId: record.seriesId || "(missing)",
    status: findings.some((item) => item.severity === "error")
      ? "clarification_required"
      : findings.length
        ? "review_warning"
        : "accepted_for_next_check",
    findings
  };
}

const result = {
  catalog: {
    id: ruleCatalog.id,
    version: ruleCatalog.version,
    validFrom: ruleCatalog.validFrom,
    ruleCount: ruleCatalog.rules.length
  },
  sourceClass: "synthetic-local-fixture",
  networkCalls: 0,
  results: records.map((record) => reviewRecord(record, ruleCatalog)),
  boundary: "Technische Vorprüfung; keine fachliche Freigabe oder automatische Korrektur."
};

console.log(JSON.stringify(result, null, 2));
