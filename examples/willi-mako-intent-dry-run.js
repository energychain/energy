#!/usr/bin/env node
/**
 * Willi-Mako Intent Dry-Run
 *
 * This local example does not call willi.cernion.de and does not need a token.
 * It turns a synthetic market-communication question into a reviewable intent
 * envelope before any SDK/API call is considered.
 */
const question = 'Welche Prüfpunkte helfen bei einer unklaren UTILMD-Antwort?';

const vocabulary = [
  { tag: 'message_type', match: /UTILMD|MSCONS|APERAK|ORDERS/i },
  { tag: 'clearing', match: /unklar|Klärfall|Antwort|Fehler|Abweichung/i },
  { tag: 'master_data', match: /Marktlokation|Messlokation|Stammdaten|MaLo|MeLo/i },
  { tag: 'deadline', match: /Frist|Termin|24[- ]?Stunden|Lieferantenwechsel/i }
];

function classifyIntent(text) {
  const tags = vocabulary.filter((item) => item.match.test(text)).map((item) => item.tag);
  const missing = [];
  if (!tags.includes('message_type')) missing.push('Nachrichtentyp synthetisch benennen');
  if (!tags.includes('clearing')) missing.push('Klärziel als Frage formulieren');

  return {
    surface: 'willi-mako',
    mode: 'dry-run',
    intent: tags.includes('clearing') ? 'mako_clearing_question' : 'mako_general_question',
    tags,
    confidence: tags.length >= 2 ? 'medium' : 'low',
    noCallReasons: missing,
    safeQuestion: text,
    boundaries: [
      'synthetische oder generische Angaben verwenden',
      'keine echten Kundennamen, Lieferstellen, Vertragsdaten oder Mandantenfälle',
      'Antworten als fachliche Orientierung prüfen, nicht als Rechtsberatung behandeln'
    ],
    nextReviewStep: missing.length ? 'Frage vor API/SDK-Aufruf präzisieren' : 'Payload kann mit Review-Hinweis dokumentiert werden'
  };
}

console.log(JSON.stringify(classifyIntent(question), null, 2));
