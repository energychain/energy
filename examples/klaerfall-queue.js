// Synthetisches Beispiel: Klärfälle als kleine JSON-Queue modellieren.
// Keine Produktivdaten, keine Rechts- oder Fachentscheidung.

const klaerfallQueue = [
  {
    id: "KF-001",
    frage: "Ist der Datensatz vollständig genug für die nächste Prüfung?",
    owner: "Fachteam",
    datenstand: "synthetisch-2026-08",
    evidenzstatus: "offen",
    abhaengigkeiten: ["Stammdatenfeld pruefen", "Quelle dokumentieren"],
    naechsterSchritt: "fehlende Felder markieren"
  },
  {
    id: "KF-002",
    frage: "Sind Annahmen und Berechnungsschritt getrennt dokumentiert?",
    owner: "Controlling",
    datenstand: "synthetisch-2026-08",
    evidenzstatus: "in-pruefung",
    abhaengigkeiten: ["Annahme notieren", "Rechenweg referenzieren"],
    naechsterSchritt: "Review-Termin vorbereiten"
  },
  {
    id: "KF-003",
    frage: "Ist der Export ohne Personen- oder Kundendaten möglich?",
    owner: "IT",
    datenstand: "synthetisch-2026-08",
    evidenzstatus: "geklaert",
    abhaengigkeiten: [],
    naechsterSchritt: "synthetisches Fixture verwenden"
  }
];

const offeneKlaerfaelle = klaerfallQueue
  .filter((fall) => fall.evidenzstatus !== "geklaert")
  .map(({ id, frage, owner, evidenzstatus, naechsterSchritt }) => ({
    id,
    frage,
    owner,
    evidenzstatus,
    naechsterSchritt
  }));

console.table(offeneKlaerfaelle);

if (offeneKlaerfaelle.length > 0) {
  console.log(`Noch ${offeneKlaerfaelle.length} Klärfall(e) vor der nächsten Entscheidung.`);
}
