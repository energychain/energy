# The Energy Stack for JavaScript

> **Build Energy Apps with Node.js** – Der Open-Source Standard für Marktkommunikation (MaKo), EDIFACT-Transformation und regulatorische Compliance in der deutschen Energiewirtschaft.

🌐 **[energy.js.org](https://energy.js.org)** | 📚 **[Documentation](https://corrently.io)** | 💼 **[Commercial Platform](https://enerchy.de)**

---

## 🚀 Quick Start

```bash
# Installation via npm
npm install @energychain/willi-mako-client

# Oder mit yarn
yarn add @energychain/willi-mako-client
```

```javascript
// Erste Schritte
import { WilliMako } from '@energychain/willi-mako-client';

const client = new WilliMako({
  apiKey: process.env.WILLI_MAKO_API_KEY
});

// EDIFACT Nachricht analysieren
const analysis = await client.analyzeEdifact(edifactMessage);

// Marktkommunikation recherchieren
const info = await client.search('UTILMD Fristen');
```

---

## 🎯 Was ist das Energy Stack?

Unsere Technologie ist **kein Black-Box-System**. Sie basiert auf offenen Standards, die du selbst prüfen und nutzen kannst.

### Der Willi Mako Client

**Core Features:**
- ✅ **Typed TypeScript Client** mit IntelliSense Support
- ✅ **EDIFACT Support** für UTILMD, MSCONS, ORDERS, PRICAT, INVOIC
- ✅ **Regulatorik-Updates "Built-in"** – BNetzA-Regeln automatisch berücksichtigt
- ✅ **Marktkommunikation** gemäß GPKE, WiM, GeLi Gas Standards
- ✅ **Compliance-Ready** für EnWG, StromNZV, StromNEV, EEG, MessEG
- ✅ **Semantic Search** über Energiemarkt-Dokumentation
- ✅ **BDEW MaKo Integration** mit aktuellen Prüfkatalogen
- ✅ **OpenAI-kompatible API** mit automatischer RAG-Enhancement

---

## 🛠️ Build vs. Buy – Du entscheidest

### Option A: Core (Open Source)
- **Für:** Bastler & Deep Tech Integration
- **Tool:** [Willi Mako Client](https://github.com/energychain/willi-mako-client)
- **Kosten:** Free / MIT License
- **Aufwand:** Du hostest, du wartest

### Option B: Managed API (Developer Pro)
- **Für:** App-Entwickler, die SLA brauchen
- **Tool:** [Corrently API](https://corrently.io)
- **Vorteil:** Hosted Infrastructure, Scalable
- **Support:** Professional Support inklusive

### Option C: Zero-Code (Business)
- **Für:** Fachbereiche, die sofort Ergebnisse brauchen
- **Tool:** [Enerchy.de](https://enerchy.de)
- **Vorteil:** Ready-to-use Assistant
- **Setup:** No Integration required

---

## 🌟 Ecosystem & Trust

### Open Source Komponenten

```
@energychain/willi-mako-client
@energychain/edifact-json-transformer
@energychain/mako-semantic-search
@energychain/bdew-codes
@energychain/energy-data-models
```

### ✅ Used in production by STROMDAO

Die kommerzielle Plattform **[enerchy.de](https://enerchy.de)** basiert auf genau diesem Open-Source-Code. Das gibt dir die Sicherheit, dass die Technologie produktionsreif und stabil ist.

---

## 📦 Repositories

- **[Willi Mako Client](https://github.com/energychain/willi-mako-client)** – Core TypeScript Client
- **[STROMDAO EAFs](https://github.com/energychain/STROMDAO_EAFs)** – Energy Application Framework

---

## 🎓 Warum energy.js.org?

Die Nutzung der `js.org` Domain signalisiert der IT-Abteilung eines Stadtwerks: **"Das hier ist Standard-Technologie (JavaScript/Node.js), kein proprietärer Exot."**

Das senkt die Hürde für den Einsatz von `enerchy.de` im Unternehmen massiv, da die "Shadow IT" Sorge ("Was nutzen meine Mitarbeiter da?") durch den Open-Source-Code entkräftet wird.

---

## 📝 License

MIT License

---

## 🤝 Maintainer

**Maintained by [STROMDAO](https://stromdao.de/)**

Open Source · Made for the German Energy Market
