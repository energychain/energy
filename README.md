# energy.js.org — Energy JavaScript Praxisbibliothek

Static website for practical JavaScript notes in the German energy domain.

Public surface: https://energy.js.org

## Editorial mode

The site is maintained as a non-promotional practice library:

- short recipes under `/recipes/`
- small runnable examples under `/examples/`
- MaKo notes under `/mako-notes/`
- practical CET, CernionLENS and Willi-Mako entry points
- contextual, PII-free `#WebToDialogue` transitions from recipes to Felix via the canonical Cernion intake
- static SEO/LLM hygiene via `sitemap.xml`, `robots.txt`, `llms.txt` and `feed.xml`

Examples must use synthetic data. Do not publish customer data, secrets, private names, raw inbox content or binding legal/commercial claims.

## Local checks

```bash
npm run validate
node examples/vdmi-role-proposal-preflight.js
node examples/cet-openai-provider-acceptance.js
node examples/versioned-data-quality-catalog.js
node examples/cet-project-admin-overview.js
node examples/mako-14a-lfw24-triage.js
node examples/cet-project-graph-review.js
node examples/willi-mako-case-file.js
node examples/cet-token-readonly-plan.js
node examples/municipal-evidence-brief.js
node examples/cet-decision-frame-preflight.js
node examples/cet-capability-boundary-matrix.js
node examples/edifact-segments.js
```
