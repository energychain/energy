(() => {
  const DOMAIN = 'energy.js.org';
  const CAMPAIGN = '#WebToDialogue';
  const CTA_ID = 'energyjs_recipe_question';
  const TOPIC = 'energyjs_recipe';

  function safePath(value) {
    return /^\/[a-z0-9\-_/\.]*$/i.test(value || '') ? value : '/';
  }

  function dialogueUrl(sourcePath) {
    const url = new URL('https://cernion.de/kontakt');
    const params = {
      intent: 'api_testgrenze',
      source_domain: DOMAIN,
      source_path: safePath(sourcePath),
      cta_id: CTA_ID,
      topic: TOPIC,
      product: 'cernion_energy_tools',
      target_family: 'cernion_fachsichtung',
      campaign: CAMPAIGN,
      campaign_source: 'energyjs',
      utm_source: 'energy.js.org',
      utm_medium: 'owned_web',
      utm_campaign: 'web_to_dialogue',
      utm_content: safePath(sourcePath).replace(/^\//, '').replace(/[^a-z0-9]+/gi, '_').slice(0, 100) || 'home'
    };
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    url.hash = 'formular';
    return url.toString();
  }

  function trackStart(link) {
    link.addEventListener('click', () => {
      if (typeof window.plausible !== 'function') return;
      window.plausible('dialogue_start', {
        props: {
          product: 'cernion_energy_tools',
          source_domain: DOMAIN,
          source_path: safePath(window.location.pathname),
          cta_id: CTA_ID,
          topic: TOPIC,
          target_family: 'cernion_fachsichtung',
          campaign: CAMPAIGN
        }
      });
    });
  }

  function addRecipeDialogue() {
    if (!window.location.pathname.startsWith('/recipes/') || window.location.pathname === '/recipes/') return;
    const container = document.querySelector('main .section .wrap');
    if (!container || container.querySelector('[data-web-to-dialogue]')) return;

    const card = document.createElement('aside');
    card.className = 'card dialogue-card';
    card.setAttribute('data-web-to-dialogue', 'recipe-question');

    const heading = document.createElement('h2');
    heading.textContent = 'Frage zu diesem Beispiel?';
    const copy = document.createElement('p');
    copy.textContent = 'Wenn der öffentliche Praxisfall für deinen technischen Kontext noch eine Lücke hat, kannst du Felix die Frage in zwei bis vier Sätzen schildern. Der Rezeptpfad wird mitgegeben; bitte keine Kunden-, Mess-, EDIFACT- oder Zugangsdaten senden.';
    const link = document.createElement('a');
    link.className = 'btn primary';
    link.href = dialogueUrl(window.location.pathname);
    link.textContent = 'Beispiel mit Felix einordnen';
    link.setAttribute('data-dialogue-start', 'energyjs_recipe_question');
    link.setAttribute('rel', 'noopener');
    trackStart(link);

    card.append(heading, copy, link);
    container.appendChild(card);
  }

  function wireContactDialogue() {
    document.querySelectorAll('[data-energyjs-dialogue-link]').forEach((link) => {
      link.href = dialogueUrl('/contact/');
      trackStart(link);
    });
  }

  function init() {
    addRecipeDialogue();
    wireContactDialogue();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
