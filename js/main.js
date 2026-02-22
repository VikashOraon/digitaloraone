/**
 * Alex Morgan — Portfolio Website
 * Main JavaScript — Interactions, Animations, Slider, Form
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     UTILITY
  ───────────────────────────────────────────────────────── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ─────────────────────────────────────────────────────────
     FOOTER YEAR
  ───────────────────────────────────────────────────────── */
  const yearEl = qs('#footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─────────────────────────────────────────────────────
     LIGHT / DARK MODE TOGGLE
  ───────────────────────────────────────────────────── */
  const themeToggle = qs('#theme-toggle');
  const root        = document.documentElement;

  // Apply saved theme immediately (before paint) to avoid flash
  const savedTheme = localStorage.getItem('am-theme') || 'dark';
  if (savedTheme === 'light') root.setAttribute('data-theme', 'light');

  function setTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('am-theme', theme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      setTheme(current === 'light' ? 'dark' : 'light');
    });
  }

  /* ─────────────────────────────────────────────────────────
     STICKY NAV + SCROLLED CLASS
  ───────────────────────────────────────────────────────── */
  const navHeader = qs('#nav-header');

  function updateNav() {
    if (window.scrollY > 60) {
      navHeader.classList.add('scrolled');
    } else {
      navHeader.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ─────────────────────────────────────────────────────────
     ACTIVE NAV LINK (scroll spy)
  ───────────────────────────────────────────────────────── */
  const sections = qsa('main section[id]');
  const navAnchors = qsa('.nav-links a[href^="#"]');

  function updateActiveLink() {
    let current = '';
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      if (scrollY >= section.offsetTop) {
        current = section.id;
      }
    });

    navAnchors.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === `#${current}`) {
        a.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* ─────────────────────────────────────────────────────────
     MOBILE NAV TOGGLE
  ───────────────────────────────────────────────────────── */
  const navToggle = qs('#nav-toggle');
  const navLinks  = qs('#nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     SCROLL REVEAL (IntersectionObserver)
  ───────────────────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  qsa('.reveal').forEach(el => revealObserver.observe(el));

  /* ─────────────────────────────────────────────────────────
     HERO ENTRANCE — stagger headline lines
  ───────────────────────────────────────────────────────── */
  const heroLines = qsa('.hero-headline .line');
  heroLines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(24px)';
    line.style.transition = `opacity 0.7s ease ${0.15 + i * 0.12}s, transform 0.7s ease ${0.15 + i * 0.12}s`;
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateY(0)';
    }, 50);
  });

  /* ─────────────────────────────────────────────────────────
     PORTFOLIO FILTER
  ───────────────────────────────────────────────────────── */
  const filterBtns = qsa('.filter-btn');
  const workCards  = qsa('.work-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      workCards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;

        if (show) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeIn 0.4s ease both';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Inject fadeIn keyframe
  if (!qs('#am-keyframes')) {
    const style = document.createElement('style');
    style.id = 'am-keyframes';
    style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────────────────
     TESTIMONIALS SLIDER
  ───────────────────────────────────────────────────────── */
  const slider    = qs('#testimonials-slider');
  const slides    = slider ? qsa('.testimonial-slide', slider) : [];
  const dotsWrap  = qs('#ts-dots');
  const dots      = dotsWrap ? qsa('.ts-dot', dotsWrap) : [];
  const prevBtn   = qs('#ts-prev');
  const nextBtn   = qs('#ts-next');

  let currentSlide = 0;
  let autoSlideInterval = null;

  function goToSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    if (slider) slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }
  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  if (slides.length > 0) {
    prevBtn?.addEventListener('click', () => { stopAutoSlide(); goToSlide(currentSlide - 1); startAutoSlide(); });
    nextBtn?.addEventListener('click', () => { stopAutoSlide(); goToSlide(currentSlide + 1); startAutoSlide(); });
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        stopAutoSlide();
        goToSlide(Number(dot.dataset.index));
        startAutoSlide();
      });
    });

    // Touch swipe support
    let touchStartX = 0;
    slider.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 50) {
        stopAutoSlide();
        goToSlide(dx < 0 ? currentSlide + 1 : currentSlide - 1);
        startAutoSlide();
      }
    });

    startAutoSlide();
  }

  /* ─────────────────────────────────────────────────────────
     CONTACT FORM — simulate submission
  ───────────────────────────────────────────────────────── */
  const contactForm   = qs('#contact-form');
  const submitBtn     = qs('#form-submit');
  const formSuccess   = qs('#form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic validation
      const name    = qs('#cf-name', contactForm).value.trim();
      const email   = qs('#cf-email', contactForm).value.trim();
      const message = qs('#cf-message', contactForm).value.trim();

      if (!name || !email || !message) {
        shakeForm(contactForm);
        return;
      }
      if (!isValidEmail(email)) {
        qs('#cf-email', contactForm).style.borderColor = 'rgba(239,68,68,0.5)';
        setTimeout(() => { qs('#cf-email', contactForm).style.borderColor = ''; }, 2000);
        return;
      }

      // Loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // Simulate network delay
      await delay(1800);

      submitBtn.classList.remove('loading');
      submitBtn.style.display = 'none';
      formSuccess.classList.add('visible');
      contactForm.reset();
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeForm(form) {
    form.style.animation = 'shake 0.4s ease';
    setTimeout(() => { form.style.animation = ''; }, 400);
    if (!qs('#shake-keyframe')) {
      const s = document.createElement('style');
      s.id = 'shake-keyframe';
      s.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }`;
      document.head.appendChild(s);
    }
  }

  function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  /* ─────────────────────────────────────────────────────────
     PARALLAX — hero orbs subtle mouse parallax
  ───────────────────────────────────────────────────────── */
  const orb1 = qs('.orb-1');
  const orb2 = qs('.orb-2');

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    if (orb1) orb1.style.transform = `translate(${dx * 18}px, ${dy * 14}px) scale(1)`;
    if (orb2) orb2.style.transform = `translate(${-dx * 12}px, ${-dy * 10}px) scale(1)`;
  }, { passive: true });

  /* ─────────────────────────────────────────────────────────
     SMOOTH SCROLL (native already; enhance offset for fixed nav)
  ───────────────────────────────────────────────────────── */
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = qs(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navHeader ? navHeader.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─────────────────────────────────────────────────────────
     HERO CARD TILT (3D perspective on hover)
  ───────────────────────────────────────────────────────── */
  const heroStack = qs('.hero-card-stack');
  if (heroStack) {
    heroStack.addEventListener('mousemove', (e) => {
      const rect   = heroStack.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = -dy * 8;
      const rotY   =  dx * 8;

      heroStack.style.transform        = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      heroStack.style.transition       = 'transform 0.1s ease';
    });
    heroStack.addEventListener('mouseleave', () => {
      heroStack.style.transform  = 'perspective(900px) rotateX(0) rotateY(0)';
      heroStack.style.transition = 'transform 0.6s ease';
    });
  }

  /* ─────────────────────────────────────────────────────────
     CHART BARS — animate on scroll into view
  ───────────────────────────────────────────────────────── */
  const chartBars = qsa('.wsc-bar');
  if (chartBars.length > 0) {
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          chartBars.forEach((bar, i) => {
            const finalH = bar.style.height;
            bar.style.height = '0%';
            bar.style.transition = `height 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`;
            requestAnimationFrame(() => {
              setTimeout(() => { bar.style.height = finalH; }, 50);
            });
          });
          chartObserver.disconnect();
        }
      });
    }, { threshold: 0.5 });

    const chartEl = qs('.ws-chart');
    if (chartEl) chartObserver.observe(chartEl);
  }

  /* ─────────────────────────────────────────────────────────
     FORM INPUTS — float label effect (border highlight)
  ───────────────────────────────────────────────────────── */
  qsa('.form-group input, .form-group textarea, .form-group select').forEach(el => {
    el.addEventListener('focus', () => {
      el.parentElement?.classList.add('focused');
    });
    el.addEventListener('blur', () => {
      el.parentElement?.classList.remove('focused');
    });
  });

  /* ─────────────────────────────────────────────────────────
     CURSOR GLOW (optional, desktop only)
  ───────────────────────────────────────────────────────── */
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    Object.assign(glow.style, {
      position: 'fixed',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(201,179,130,0.04) 0%, transparent 70%)',
      pointerEvents: 'none',
      zIndex: '9999',
      transform: 'translate(-50%, -50%)',
      transition: 'opacity 0.3s',
      opacity: '0',
    });
    document.body.appendChild(glow);

    let glowX = 0, glowY = 0;
    let rafId;

    document.addEventListener('mousemove', (e) => {
      glowX = e.clientX;
      glowY = e.clientY;
      glow.style.opacity = '1';
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        glow.style.left = glowX + 'px';
        glow.style.top  = glowY + 'px';
      });
    }, { passive: true });

    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  }

  /* ─────────────────────────────────────────────────────────
     PROCESS STEPS — animate on reveal
  ───────────────────────────────────────────────────────── */
  const processSteps = qsa('.process-step');
  const processObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = `${i * 0.1}s`;
        entry.target.classList.add('visible');
        processObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  processSteps.forEach(step => {
    step.classList.add('reveal');
    processObserver.observe(step);
  });

  /* ─────────────────────────────────────────────────────────
     KEYBOARD NAVIGATION — close mobile nav on Escape
  ───────────────────────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks?.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle?.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

})();
