// ── Language toggle ──
const htmlEl = document.documentElement;
const langBtn = document.getElementById('lang-toggle');
let currentLang = 'ja';

function setLang(lang) {
  currentLang = lang;
  htmlEl.lang = lang === 'ja' ? 'ja' : 'en';
  langBtn.textContent = lang === 'ja' ? 'EN' : 'JA';

  document.querySelectorAll('.ja').forEach(el => {
    el.classList.toggle('hidden', lang !== 'ja');
  });
  document.querySelectorAll('.en').forEach(el => {
    el.classList.toggle('hidden', lang !== 'en');
  });

  // Update tab labels
  document.querySelectorAll('.tab[data-ja][data-en]').forEach(el => {
    el.textContent = lang === 'ja' ? el.dataset.ja : el.dataset.en;
  });
}

langBtn.addEventListener('click', () => setLang(currentLang === 'ja' ? 'en' : 'ja'));

// ── Navigation state ──
const nav = document.getElementById('nav');
const hero = document.getElementById('top');

function updateNav() {
  const heroBottom = hero.getBoundingClientRect().bottom;
  const scrolled = window.scrollY > 10;

  nav.classList.toggle('opaque', scrolled);
  nav.classList.toggle('over-hero', heroBottom > 0);
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav(); // run once on load

// ── Works filter ──
const tabs = document.querySelectorAll('.tab');
const cards = document.querySelectorAll('.work-card');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const cat = tab.dataset.category;
    cards.forEach(card => {
      const hide = cat !== 'all' && card.dataset.category !== cat;
      card.classList.toggle('hidden', hide);
    });

    // Reset large-tile layout when filtered to single category
    cards.forEach(card => {
      if (!card.classList.contains('hidden') && card.classList.contains('work-card--large')) {
        card.style.gridColumn = '';
        card.style.gridRow = '';
      }
    });
  });
});

// ── Scroll reveal ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Init ──
setLang('ja');
