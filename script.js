document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initCounterAnimation();
  init3DSphere();
  initServiceCards3D();
  initComplaintForm();
  initTrackForm();
  initModal();
  initMobileMenu();
  initParallaxOrbs();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  document.querySelectorAll('.nav-links a, .hero-actions a, .footer-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          document.querySelector('.nav-links')?.classList.remove('active');
          document.getElementById('mobileToggle')?.classList.remove('active');
        }
      }
    });
  });
}

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
}

function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-number');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const start = performance.now();
    const isPercent = el.parentElement.querySelector('.stat-label')?.textContent.includes('%');

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = isPercent ? current : current.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function init3DSphere() {
  const sphere = document.getElementById('waterSphere');
  if (!sphere) return;

  const heroVisual = sphere.closest('.hero-visual');

  heroVisual.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    sphere.style.transform = `
      translateY(${Math.sin(Date.now() / 1000) * 10}px)
      rotateX(${y * -20}deg)
      rotateY(${x * 20}deg)
    `;
  });

  heroVisual.addEventListener('mouseleave', () => {
    sphere.style.transform = '';
  });
}

function initServiceCards3D() {
  const cards = document.querySelectorAll('.service-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `
        translateY(-8px)
        rotateX(${y * -8}deg)
        rotateY(${x * 8}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function generateRefId() {
  const year = new Date().getFullYear();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `AQ-${year}-${num}`;
}

function initComplaintForm() {
  const form = document.getElementById('complaintForm');
  const modal = document.getElementById('successModal');
  const refDisplay = document.getElementById('refIdDisplay');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const refId = generateRefId();
    refDisplay.textContent = refId;

    const complaints = JSON.parse(localStorage.getItem('aquaguard_complaints') || '{}');
    complaints[refId] = {
      status: 'submitted',
      progress: 25,
      steps: [
        { label: 'Complaint Received', completed: true },
        { label: 'Under Review', completed: false, active: true },
        { label: 'Field Inspection Scheduled', completed: false },
        { label: 'Issue Resolved', completed: false }
      ],
      submittedAt: new Date().toISOString(),
      data: Object.fromEntries(new FormData(form))
    };
    localStorage.setItem('aquaguard_complaints', JSON.stringify(complaints));

    modal.classList.remove('hidden');
    form.reset();

    const btn = form.querySelector('.btn-primary');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  });
}

function initTrackForm() {
  const form = document.getElementById('trackForm');
  const result = document.getElementById('trackResult');
  const resultId = document.getElementById('resultId');
  const resultStatus = document.getElementById('resultStatus');
  const progressFill = document.getElementById('progressFill');
  const resultSteps = document.getElementById('resultSteps');

  const demoData = {
    progress: 75,
    status: 'In Progress',
    steps: [
      { label: 'Complaint Received', completed: true },
      { label: 'Under Review — Completed', completed: true },
      { label: 'Field Inspection — In Progress', completed: false, active: true },
      { label: 'Issue Resolved', completed: false }
    ]
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const trackId = document.getElementById('trackId').value.trim();
    if (!trackId) return;

    const complaints = JSON.parse(localStorage.getItem('aquaguard_complaints') || '{}');
    const data = complaints[trackId] || demoData;

    resultId.textContent = trackId;
    resultStatus.textContent = data.status || 'In Progress';
    result.classList.remove('hidden');

    progressFill.style.width = '0';
    requestAnimationFrame(() => {
      progressFill.style.width = `${data.progress}%`;
    });

    resultSteps.innerHTML = data.steps.map((step) => {
      let cls = 'result-step';
      if (step.completed) cls += ' completed';
      if (step.active) cls += ' active';
      return `
        <div class="${cls}">
          <span class="step-dot"></span>
          ${step.label}
        </div>
      `;
    }).join('');

    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function initModal() {
  const modal = document.getElementById('successModal');
  const closeBtn = document.getElementById('closeModal');
  const backdrop = modal.querySelector('.modal-backdrop');

  const close = () => modal.classList.add('hidden');

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function initMobileMenu() {
  const toggle = document.getElementById('mobileToggle');
  const navLinks = document.querySelector('.nav-links');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
}

function initParallaxOrbs() {
  const orbs = document.querySelectorAll('.orb');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = (i + 1) * 0.05;
      orb.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrolled = window.scrollY;
      const navbar = document.getElementById('navbar');

      document.querySelectorAll('.process-step').forEach((step, i) => {
        const rect = step.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
          step.style.transitionDelay = `${i * 0.1}s`;
        }
      });

      ticking = false;
    });
    ticking = true;
  }
});

document.querySelectorAll('input, select, textarea').forEach((input) => {
  input.addEventListener('focus', () => {
    input.closest('.form-group')?.classList.add('focused');
  });
  input.addEventListener('blur', () => {
    input.closest('.form-group')?.classList.remove('focused');
  });
});
