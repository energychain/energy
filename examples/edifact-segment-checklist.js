#!/usr/bin/env node
const syntheticMessage = process.argv[2] || "UNH+1+UTILMD:D:11A:UN:2.6'BGM+E01+SYNTHETIC-CASE-2+9'DTM+137:20260901:102'RFF+Z13:44001'IDE+24+12345678901'UNT+6+1'";

function parseSegments(message) {
  return message
    .split("'")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((raw, index) => ({ index: index + 1, tag: raw.slice(0, 3), raw }));
}

function checklist(message) {
  const segments = parseSegments(message);
  const findings = [];
  const first = segments[0]?.tag;
  const last = segments.at(-1)?.tag;
  const unt = segments.find((segment) => segment.tag === 'UNT');
  const declaredCount = Number((unt?.raw.split('+')[1] || '').trim());
  const references = segments
    .filter((segment) => segment.tag === 'RFF')
    .map((segment) => segment.raw.split('+')[1] || '')
    .filter(Boolean);

  if (!segments.length) findings.push({ level: 'error', code: 'NO_SEGMENTS', note: 'Keine Segmente gefunden.' });
  if (first !== 'UNH') findings.push({ level: 'warning', code: 'MISSING_UNH_FIRST', note: `Erstes Segment ist ${first || 'unbekannt'}, erwartet UNH.` });
  if (last !== 'UNT') findings.push({ level: 'warning', code: 'MISSING_UNT_LAST', note: `Letztes Segment ist ${last || 'unbekannt'}, erwartet UNT.` });
  if (!Number.isFinite(declaredCount)) findings.push({ level: 'warning', code: 'UNT_COUNT_MISSING', note: 'UNT enthält keine maschinenlesbare Segmentanzahl.' });
  if (Number.isFinite(declaredCount) && declaredCount !== segments.length) findings.push({ level: 'warning', code: 'UNT_COUNT_MISMATCH', note: `UNT meldet ${declaredCount}, gezählt wurden ${segments.length}.` });
  for (const ref of references.filter((ref, index, all) => all.indexOf(ref) !== index)) {
    findings.push({ level: 'info', code: 'DUPLICATE_REFERENCE', note: `Referenz ${ref} kommt mehrfach vor.` });
  }

  return { ok: findings.every((finding) => finding.level !== 'error'), segment_count: segments.length, tags: segments.map((segment) => segment.tag), findings };
}

console.log(JSON.stringify(checklist(syntheticMessage), null, 2));
