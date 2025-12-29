(function () {
  'use strict';

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
      return;
    }
    fn();
  }

  function initSmoothScroll() {
    const links = qsa('a[href^="#"]')
      .filter(a => a.getAttribute('href') && a.getAttribute('href').length > 1);

    links.forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        const target = qs(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const nav = qs('#primaryNav');
        if (nav && nav.classList.contains('show')) {
          const btn = qs('.navbar-toggler');
          if (btn) btn.click();
        }
      });
    });
  }

  function initNavbarScrollState() {
    const nav = qs('.navbar-glass');
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initButtonGlow() {
    const btns = qsa('.btn-glow');
    btns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        btn.style.setProperty('--mx', x.toFixed(2) + '%');
        btn.style.setProperty('--my', y.toFixed(2) + '%');
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.removeProperty('--mx');
        btn.style.removeProperty('--my');
      });
    });
  }

  function animateCounter(el, durationMs) {
    const target = Number(el.getAttribute('data-target') || '0');
    const start = 0;
    const duration = Math.max(200, durationMs || 900);
    const t0 = performance.now();

    const step = (t) => {
      const p = clamp((t - t0) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(start + (target - start) * eased);
      el.textContent = String(v);
      if (p < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = qsa('.counter');
    if (!counters.length) return;

    const seen = new WeakSet();

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (seen.has(el)) return;
        seen.add(el);
        animateCounter(el, 950);
      });
    }, { threshold: 0.4 });

    counters.forEach(el => io.observe(el));
  }

  function initProgressBars() {
    const bars = qsa('.progress-bar[data-progress]');
    if (!bars.length) return;

    const seen = new WeakSet();

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const bar = entry.target;
        if (seen.has(bar)) return;
        seen.add(bar);
        const pct = clamp(Number(bar.getAttribute('data-progress') || '0'), 0, 100);
        bar.style.width = pct + '%';
      });
    }, { threshold: 0.35 });

    bars.forEach(bar => io.observe(bar));
  }

  function initTestimonials() {
    const items = qsa('.testimonial-item');
    const indicator = qs('#testIndicator');
    const prev = qs('#testPrev');
    const next = qs('#testNext');

    if (items.length <= 1) return;

    let index = 0;
    let timer = null;

    const render = () => {
      items.forEach((el, i) => {
        el.classList.toggle('is-active', i === index);
      });

      if (indicator) {
        const cur = String(index + 1).padStart(2, '0');
        const total = String(items.length).padStart(2, '0');
        indicator.textContent = `${cur} / ${total}`;
      }
    };

    const go = (dir) => {
      index = (index + dir + items.length) % items.length;
      render();
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => go(1), 5200);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    if (prev) prev.addEventListener('click', () => { go(-1); start(); });
    if (next) next.addEventListener('click', () => { go(1); start(); });

    const area = qs('#testimonialTrack');
    if (area) {
      area.addEventListener('mouseenter', stop);
      area.addEventListener('mouseleave', start);
      area.addEventListener('focusin', stop);
      area.addEventListener('focusout', start);
    }

    render();
    start();
  }

  function initContactForm() {
    const form = qs('#contactForm');
    const status = qs('#formStatus');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        if (status) status.textContent = 'Please fill in all required fields.';
        return;
      }

      const name = qs('#name')?.value?.trim() || '';
      if (status) status.textContent = `Thanks ${name || ''}! Message captured (demo).`;
      form.reset();
    });
  }

  function initYear() {
    const y = qs('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  onReady(function () {
    initYear();
    initSmoothScroll();
    initNavbarScrollState();
    initButtonGlow();
    initCounters();
    initProgressBars();
    initTestimonials();
    initContactForm();
  });
})();
