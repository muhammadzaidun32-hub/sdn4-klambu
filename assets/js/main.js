/* ============================================================
   SDN 3 KLAMBU — Global Script
   Menu mobile, counter animasi, efek scroll reveal
   ============================================================ */

// ---------- Mobile menu ----------
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('nav.main > ul');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      menu.classList.toggle('show');
      burger.classList.toggle('open');
    });
  }

  // ---------- Scroll reveal ----------
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
