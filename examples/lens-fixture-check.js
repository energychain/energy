#!/usr/bin/env node
/**
 * CernionLENS synthetic fixture check
 *
 * Local, public-safe preflight: no network, no token, no real documents.
 * It checks whether a fixture is marked synthetic and reviewable before a
 * document-analysis example is shown in public documentation.
 */
const fs = require('fs');
const path = require('path');

const fixturePath = path.join(__dirname, 'lens-synthetic-doc.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

const riskPatterns = [
  { label: 'customer_number', pattern: /Kundennummer|Customer[- ]?ID/i },
  { label: 'metering_point', pattern: /Zählpunkt|Marktlokation|Messlokation|MaLo|MeLo/i },
  { label: 'bank_or_contract', pattern: /IBAN|Vertragsnummer|Rechnung/i },
  { label: 'direct_contact', pattern: /@[a-z0-9.-]+\.[a-z]{2,}|\+\d{2,}/i }
];

function checkFixture(doc) {
  const text = [doc.text, ...(doc.questions || []), ...(doc.expected_observations || [])].join('\n');
  const riskTermHits = riskPatterns
    .filter((entry) => entry.pattern.test(text))
    .map((entry) => entry.label);

  return {
    fixture: path.basename(fixturePath),
    documentType: doc.document_type,
    syntheticFlag: doc.contains_real_customer_data === false,
    hasSourceLabel: typeof doc.source === 'string' && doc.source.includes('energy.js.org'),
    questionCount: Array.isArray(doc.questions) ? doc.questions.length : 0,
    expectedObservationCount: Array.isArray(doc.expected_observations) ? doc.expected_observations.length : 0,
    riskTermHits,
    readyForPublicDemo:
      doc.contains_real_customer_data === false &&
      riskTermHits.length === 0 &&
      Array.isArray(doc.questions) &&
      doc.questions.length > 0 &&
      Array.isArray(doc.expected_observations) &&
      doc.expected_observations.length > 0,
    boundary: 'Only use synthetic fixtures in public examples; real documents need a separate reviewed data room.'
  };
}

console.log(JSON.stringify(checkFixture(fixture), null, 2));
