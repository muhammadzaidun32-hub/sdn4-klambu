/* ============================================================
   SDN 4 KLAMBU — Interaksi global
   - Menu mobile
   - Lightbox galeri (klik foto membesar)
   - Scroll reveal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Menu mobile ---------- */
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('nav.main > ul');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      menu.classList.toggle('show');
      burger.classList.toggle('open');
    });
  }

  /* ---------- Lightbox galeri ---------- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<img src="" alt="Foto galeri"><div class="cap"></div>';
  document.body.appendChild(lb);

  const imgEl = lb.querySelector('img');
  const capEl = lb.querySelector('.cap');

  document.addEventListener('click', (e) => {
    const a = e.target.closest('.gal a, .gal-item');
    if (a) {
      e.preventDefault();
      const bg = a.style.backgroundImage;
      const url = a.getAttribute('href') && a.getAttribute('href') !== '#'
                ? a.getAttribute('href')
                : (bg && bg !== 'none' ? bg.slice(5, -2) : null);
      const img = a.querySelector('img');
      imgEl.src = url || (img ? img.src : '');
      capEl.textContent = a.dataset.caption || '';
      lb.classList.add('open');
    }
  });
  lb.addEventListener('click', () => lb.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.card, .hstat, .news-card, .sambutan');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: .12 });
    revealEls.forEach(el => io.observe(el));
  }
});
