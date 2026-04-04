// ── Fog Intro ──
(function() {
  const fog = document.getElementById('fog-intro');
  if (!fog) return;

  // bodyにブラーをかけた状態でスタート
  document.body.classList.add('fog-active');

  // 少し遅らせてブラーを解除（霧が晴れる感じに同期）
  setTimeout(() => {
    document.body.classList.add('fog-clear');
  }, 300);

  // アニメーション終了後にfog要素を削除
  setTimeout(() => {
    fog.remove();
    document.body.classList.remove('fog-active', 'fog-clear');
  }, 5500);
})();

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

  // Update elements with data-ja/data-en that have no .ja/.en children
  document.querySelectorAll('[data-ja][data-en]').forEach(el => {
    if (!el.querySelector('.ja, .en')) {
      el.textContent = lang === 'ja' ? el.dataset.ja : el.dataset.en;
    }
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
updateNav();

// ── Works filter (event delegation) ──
const tabsContainer = document.querySelector('.tabs');
if (tabsContainer) {
  tabsContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const cat = tab.dataset.category;
    document.querySelectorAll('.work-card').forEach(card => {
      const hide = cat !== 'all' && card.dataset.category !== cat;
      card.classList.toggle('hidden', hide);
    });
  });
}

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

// ── Category labels ──
const categoryLabels = {
  poetry:  { ja: '詩',   en: 'Poetry' },
  fiction: { ja: '小説', en: 'Fiction' },
  photo:   { ja: '写真', en: 'Photography' },
  lacquer: { ja: '漆芸', en: 'Urushi' }
};

// ── Render works from JSON ──
async function renderWorks() {
  const grid = document.getElementById('works-grid');
  if (!grid) return;

  try {
    const res = await fetch('data/works.json');
    const data = await res.json();

    grid.innerHTML = '';

    data.works.forEach(work => {
      const isText = (work.category === 'poetry' || work.category === 'fiction') && work.text_preview_ja;
      const isProse = work.category === 'fiction';
      const labels = categoryLabels[work.category] || { ja: '', en: '' };

      // Build media HTML
      let mediaHTML = '';
      if (isText) {
        const jaLines = (work.text_preview_ja || '').replace(/\n/g, '<br>');
        const enLines = (work.text_preview_en || '').replace(/\n/g, '<br>');
        mediaHTML = `<div class="text-preview${isProse ? ' text-preview--prose' : ''}">
            <p class="ja">${jaLines}</p>
            <p class="en hidden">${enLines}</p>
          </div>`;
      } else if (work.image) {
        mediaHTML = `<img src="${work.image}" alt="${work.title_ja}">`;
      } else {
        mediaHTML = `<div class="img-placeholder">Image</div>`;
      }

      // Build article element
      const article = document.createElement('article');
      article.dataset.category = work.category;
      article.className = [
        'work-card',
        isText ? 'work-card--text' : '',
        work.large ? 'work-card--large' : '',
        'reveal'
      ].filter(Boolean).join(' ');

      article.innerHTML = `<div class="card-inner">
          <div class="card-media">${mediaHTML}</div>
          <div class="card-overlay">
            <span class="overlay-category ja">${labels.ja}</span>
            <span class="overlay-category en hidden">${labels.en}</span>
            <h3 class="overlay-title">
              <span class="ja">${work.title_ja}</span>
              <span class="en hidden">${work.title_en}</span>
            </h3>
            <span class="overlay-year">${work.year}</span>
          </div>
        </div>`;

      grid.appendChild(article);
      observer.observe(article);
    });

    // Re-apply current language to newly rendered cards
    setLang(currentLang);

  } catch (e) {
    console.error('作品データの読み込みに失敗しました:', e);
  }
}

// ── Init ──
setLang('ja');
renderWorks();
