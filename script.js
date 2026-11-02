const nav = document.querySelector('.site-header nav');
const hamb = document.querySelector('.site-header .hamb');
if (hamb && nav) hamb.addEventListener('click', () => { const open = nav.classList.toggle('open'); hamb.setAttribute('aria-expanded', String(open)); });
if (nav) nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); hamb?.setAttribute('aria-expanded', 'false'); }));
const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();
const config = window.MESSWAYS_CONFIG || {}, number = (config.whatsappNumber || '').replace(/\D/g, '');
const float = document.getElementById('whatsappFloat'); const hello = () => document.documentElement.lang === 'en' ? 'Hello MESSWAYS, I would like information about your courses.' : 'Bonjour MESSWAYS, je souhaite avoir des informations sur vos formations.';
if (float && number) { float.href = `https://wa.me/${number}?text=${encodeURIComponent(hello())}`; float.target = '_blank'; float.rel = 'noopener'; }
// Live search across course titles, descriptions, software and keywords.
const search = document.getElementById('courseSearch'), clear = document.getElementById('clearSearch'), status = document.getElementById('searchStatus'), cards = [...document.querySelectorAll('#courseGrid .course-card')];
function filterCourses() { if (!search) return; const q = search.value.trim().toLocaleLowerCase('fr'); let shown = 0; cards.forEach(card => { const match = !q || (card.innerText + ' ' + card.dataset.search).toLocaleLowerCase('fr').includes(q); card.hidden = !match; if (match) shown++; }); if (status) { const en = document.documentElement.lang === 'en'; status.textContent = q ? (shown ? (en ? `${shown} course${shown > 1 ? 's' : ''} found.` : `${shown} formation${shown > 1 ? 's' : ''} trouvée${shown > 1 ? 's' : ''}.`) : (en ? 'No courses found. Try another keyword.' : 'Aucune formation trouvée. Essayez un autre mot-clé.')) : (en ? 'Explore the six areas or search for software, a tool or a skill.' : 'Explorez les six domaines ou recherchez un logiciel, un outil ou une compétence.'); } clear?.classList.toggle('visible', !!q); }
search?.addEventListener('input', filterCourses); clear?.addEventListener('click', () => { search.value = ''; filterCourses(); search.focus(); });
// Contact form: submit to Apps Script, then show only the MESSWAYS thank-you page.
// WhatsApp is not opened automatically; visitors can contact us separately if they wish.
const form = document.getElementById('form');
const countrySelect = document.getElementById('countryCode'), otherCodeWrap = document.getElementById('otherCodeWrap'), otherCodeInput = document.getElementById('otherCountryCode');
function syncOtherCode() { if (!countrySelect) return; const other = countrySelect.value === 'other'; if (otherCodeWrap) otherCodeWrap.hidden = !other; if (otherCodeInput) otherCodeInput.required = other; }
countrySelect?.addEventListener('change', syncOtherCode); syncOtherCode();
if (form) form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form).entries());
  values.countryCode = values.countryCode === 'other' ? String(values.otherCountryCode || '').trim() : values.countryCode;
  values.countryCode = values.countryCode.replace(/[^+0-9]/g, '');
  values.phone = String(values.phone || '').replace(/[^0-9]/g, '');
  if (!/^\+[1-9][0-9]{0,3}$/.test(values.countryCode) || !values.phone) { if (hint) hint.textContent = document.documentElement.lang === 'en' ? 'Enter a valid country calling code and phone number.' : 'Saisissez un indicatif pays valide et un numéro de téléphone.'; return; }
  const en = document.documentElement.lang === 'en';
  const endpoint = config.googleAppsScriptUrl;
  const submit = form.querySelector('[type="submit"]');
  const hint = document.getElementById('hint');
  if (!endpoint) { if (hint) hint.textContent = en ? 'The form endpoint is not configured. Please contact us by email.' : 'Le formulaire n’est pas configuré. Merci de nous contacter par e-mail.'; return; }
  if (submit) { submit.disabled = true; submit.textContent = en ? 'Sending…' : 'Envoi en cours…'; }
  let frame = document.getElementById('messways-submit-frame');
  if (!frame) { frame = document.createElement('iframe'); frame.name = 'messways-submit-frame'; frame.id = frame.name; frame.hidden = true; document.body.appendChild(frame); }
  const post = document.createElement('form'); post.method = 'POST'; post.action = endpoint; post.target = frame.name; post.hidden = true;
  Object.entries({ ...values, source: 'MESSWAYS Website' }).forEach(([key, value]) => { const input = document.createElement('input'); input.type = 'hidden'; input.name = key; input.value = value; post.appendChild(input); });
  document.body.appendChild(post);
  let finished = false;
  const cleanup = () => { window.removeEventListener('message', onReply); post.remove(); };
  const onReply = event => {
    const data = event.data;
    if (!data || data.type !== 'messways_enquiry_result') return;
    finished = true; cleanup();
    if (data.success) { const params = new URLSearchParams({ lang: en ? 'en' : 'fr', name: values.name || '', course: values.course || '', countryCode: values.countryCode, phone: values.phone }); window.location.href = `merci.html?${params.toString()}`; }
    else { if (submit) { submit.disabled = false; submit.textContent = en ? 'Send my enquiry ↗' : 'Envoyer ma demande ↗'; } if (hint) hint.textContent = en ? 'Your enquiry could not be saved. Please try again or contact us by WhatsApp.' : 'Votre demande n’a pas pu être enregistrée. Réessayez ou contactez-nous par WhatsApp.'; }
  };
  window.addEventListener('message', onReply);
  post.submit();
  // Fail visibly rather than silently redirecting if the Apps Script deployment never responds.
  window.setTimeout(() => { if (finished) return; cleanup(); if (submit) { submit.disabled = false; submit.textContent = en ? 'Send my enquiry ↗' : 'Envoyer ma demande ↗'; } if (hint) hint.textContent = en ? 'No confirmation was received from the form service. Please try again or contact us directly.' : 'Aucune confirmation du service de formulaire. Réessayez ou contactez-nous directement.'; }, 12000);
});
