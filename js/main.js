/* ═══════════ LuxAuto Detailing — main.js ═══════════ */
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────── PRELOADER ─────────── */
(() => {
  const pre = $('#preloader');
  const bar = $('#preloaderBar');
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(p + Math.random() * 22, 92);
    bar.style.width = p + '%';
  }, 180);

  const finish = () => {
    clearInterval(tick);
    bar.style.width = '100%';
    setTimeout(() => {
      pre.classList.add('done');
      document.dispatchEvent(new Event('site:ready'));
    }, 420);
  };
  let finished = false;
  const finishOnce = () => { if (!finished) { finished = true; finish(); } };
  // wait for the hero image (not the whole 20MB gallery) before revealing
  const start = () => {
    const heroImg = document.querySelector('#heroParallax img');
    if (heroImg && !heroImg.complete) heroImg.addEventListener('load', finishOnce, { once: true });
    else finishOnce();
    setTimeout(finishOnce, 2500); // safety net
  };
  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
})();

/* ─────────── GSAP ANIMATIONS ─────────── */
document.addEventListener('site:ready', () => {
  if (typeof gsap === 'undefined' || reduceMotion) {
    $$('.hero-el, [data-reveal]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  gsap.to('.hero-el', {
    opacity: 1, y: 0, duration: 1.1, stagger: 0.14, ease: 'power3.out', delay: 0.1
  });

  gsap.to('#heroParallax img', {
    yPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  $$('[data-reveal]').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%' }
    });
  });

  // Counter animation
  $$('.stat-num').forEach(el => {
    const target = +el.dataset.count;
    gsap.fromTo(el, { textContent: 0 }, {
      textContent: target, duration: 2, ease: 'power2.out', snap: { textContent: 1 },
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });
}, { once: true });

/* ─────────── HERO PARTICLES ─────────── */
(() => {
  const cv = $('#particles');
  if (!cv || reduceMotion) return;
  const ctx = cv.getContext('2d');
  let W, H, pts = [];

  const resize = () => {
    W = cv.width = cv.offsetWidth;
    H = cv.height = cv.offsetHeight;
  };
  resize();
  addEventListener('resize', resize);

  const N = Math.min(70, Math.floor(innerWidth / 22));
  for (let i = 0; i < N; i++) {
    pts.push({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - .5) * .00045,
      vy: -Math.random() * .0006 - .0001,
      a: Math.random() * .5 + .1,
      tw: Math.random() * Math.PI * 2
    });
  }

  let visible = true;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(cv);

  (function draw(t) {
    requestAnimationFrame(draw);
    if (!visible) return;
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      const tw = (Math.sin(t / 900 + p.tw) + 1) / 2;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, 7);
      ctx.fillStyle = `rgba(197,169,109,${(p.a * tw).toFixed(3)})`;
      ctx.fill();
    }
  })(0);
})();

/* ─────────── HEADER / NAV ─────────── */
(() => {
  const header = $('#header');
  const toTop = $('#toTop');
  addEventListener('scroll', () => {
    header.classList.toggle('scrolled', scrollY > 40);
    toTop.classList.toggle('show', scrollY > 700);
  }, { passive: true });

  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  // Smooth anchor scrolling with header offset
  $$('.nav-link[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMobile();
      const y = target.getBoundingClientRect().top + scrollY - 70;
      scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  // Mobile menu
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  function closeMobile() {
    burger.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $('#mobileMenuBg').addEventListener('click', closeMobile);
})();

/* ─────────── 3D TILT ─────────── */
(() => {
  if (reduceMotion || !matchMedia('(hover:hover)').matches) return;
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (x * 100) + '%');
      card.style.setProperty('--my', (y * 100) + '%');
      card.style.transform =
        `perspective(900px) rotateY(${(x - .5) * 7}deg) rotateX(${(.5 - y) * 7}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
    });
  });
})();

/* ─────────── BEFORE / AFTER SLIDERS ─────────── */
(() => {
  $$('.ba-slider').forEach(sl => {
    const set = clientX => {
      const r = sl.getBoundingClientRect();
      const pos = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
      sl.style.setProperty('--pos', pos + '%');
      // keep the "before" image full-width so the two photos stay aligned
      const before = sl.querySelector('.ba-before');
      before.style.width = r.width + 'px';
    };
    const onMove = e => set(e.touches ? e.touches[0].clientX : e.clientX);

    sl.addEventListener('pointerdown', e => {
      sl.setPointerCapture(e.pointerId);
      set(e.clientX);
      sl.addEventListener('pointermove', onMove);
    });
    sl.addEventListener('pointerup', () => sl.removeEventListener('pointermove', onMove));
    sl.addEventListener('pointercancel', () => sl.removeEventListener('pointermove', onMove));
    // initial alignment
    requestAnimationFrame(() => {
      const r = sl.getBoundingClientRect();
      sl.querySelector('.ba-before').style.width = r.width + 'px';
    });
    addEventListener('resize', () => {
      const r = sl.getBoundingClientRect();
      sl.querySelector('.ba-before').style.width = r.width + 'px';
    });
  });
})();

/* ─────────── GALLERY ─────────── */
(() => {
  const grid = $('#galleryGrid');
  const cats = ['enterijer', 'eksterijer', 'detalji'];
  // g01–g66 real photos; category assigned round-robin for filtering
  const photos = [];
  for (let i = 1; i <= 66; i++) {
    const n = String(i).padStart(2, '0');
    photos.push({ src: `images/g${n}.jpg`, cat: cats[i % 3] });
  }

  const PAGE = 12;
  let shown = 0;
  let filter = 'all';

  const filtered = () => filter === 'all' ? photos : photos.filter(p => p.cat === filter);

  function render(reset = false) {
    if (reset) { grid.innerHTML = ''; shown = 0; }
    const list = filtered().slice(shown, shown + PAGE);
    list.forEach((p, idx) => {
      const fig = document.createElement('figure');
      fig.className = 'g-item loading';
      fig.style.animationDelay = (idx * 45) + 'ms';
      const img = new Image();
      img.loading = 'lazy';
      img.src = p.src;
      img.alt = `N Detailing Studio — ${p.cat}`;
      img.onload = () => fig.classList.remove('loading');
      fig.appendChild(img);
      fig.addEventListener('click', () => openLightbox(p.src));
      grid.appendChild(fig);
    });
    shown += list.length;
    $('#loadMore').style.display = shown >= filtered().length ? 'none' : '';
  }

  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      filter = btn.dataset.filter;
      render(true);
    });
  });
  $('#loadMore').addEventListener('click', () => render());
  render(true);

  // Lightbox
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  let current = 0;

  function openLightbox(src) {
    current = filtered().findIndex(p => p.src === src);
    lbImg.src = src;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  function step(d) {
    const list = filtered();
    current = (current + d + list.length) % list.length;
    lbImg.src = list[current].src;
  }
  $('#lbClose').addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
})();

/* ─────────── REVIEWS ─────────── */
(() => {
  const LS_KEY = 'ndetailing_reviews';
  const track = $('#reviewTrack');
  const dots = $('#revDots');

  const seed = [
    { name: 'Nikola Petrović', car: 'BMW 530d', stars: 5, text: 'Gold paket — auto izgleda bolje nego kad sam ga kupio. Lak je dobio dubinu koju nisam video ni u salonu. Sve preporuke!' },
    { name: 'Milica Jovanović', car: 'Audi Q5', stars: 5, text: 'Hemijsko čišćenje sedišta i ozoniranje — nestale su sve fleke i miris. Profesionalan odnos od prvog poziva do isporuke.' },
    { name: 'Stefan Ilić', car: 'Mercedes C klasa', stars: 5, text: 'Keramička zaštita urađena vrhunski. Voda samo klizi sa haube, auto se duplo lakše održava. Vredi svakog dinara.' },
    { name: 'Ana Stanković', car: 'VW Golf 8', stars: 4, text: 'Premium detailing za stariji Golf — enterijer kao nov. Jedina zamerka je što sam morala da čekam termin nedelju dana, ali isplatilo se.' },
    { name: 'Marko Đorđević', car: 'Porsche Macan', stars: 5, text: 'Diamond paket. Višefazno poliranje uklonilo je sve swirl tragove. Momci su perfekcionisti — pratite njihove savete za održavanje.' }
  ];

  const load = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
  };
  const save = list => localStorage.setItem(LS_KEY, JSON.stringify(list));

  const starHtml = n =>
    '<span class="review-stars">' +
    '★'.repeat(n) + '<span class="off">' + '★'.repeat(5 - n) + '</span></span>';

  const esc = s => s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function render() {
    const all = [...load(), ...seed];
    track.innerHTML = all.map(r => `
      <article class="review-card">
        ${starHtml(r.stars)}
        <p class="review-text">“${esc(r.text)}”</p>
        ${r.photo ? `<img class="review-photo" src="${r.photo}" alt="Fotografija uz recenziju">` : ''}
        <div class="review-who">
          <span class="review-ava">${esc(r.name.trim()[0].toUpperCase())}</span>
          <span><b>${esc(r.name)}</b><i>${esc(r.car || 'Klijent')}</i></span>
        </div>
      </article>`).join('');
    buildDots();
  }

  // Carousel controls
  function pages() {
    return Math.max(1, Math.ceil(track.scrollWidth / track.clientWidth));
  }
  function buildDots() {
    dots.innerHTML = '';
    requestAnimationFrame(() => {
      dots.innerHTML = Array.from({ length: pages() },
        (_, i) => `<span class="rev-dot${i === 0 ? ' on' : ''}" data-i="${i}"></span>`).join('');
    });
  }
  $('#revPrev').addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }));
  $('#revNext').addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }));
  dots.addEventListener('click', e => {
    const d = e.target.closest('.rev-dot');
    if (d) track.scrollTo({ left: d.dataset.i * track.clientWidth, behavior: 'smooth' });
  });
  track.addEventListener('scroll', () => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    $$('.rev-dot', dots).forEach((d, k) => d.classList.toggle('on', k === i));
  }, { passive: true });

  // Star picker
  let rating = 0;
  const picker = $('#starPicker');
  $$('button', picker).forEach(b => {
    b.addEventListener('click', () => {
      rating = +b.dataset.star;
      $$('button', picker).forEach(x => x.classList.toggle('lit', +x.dataset.star <= rating));
    });
  });

  // Submit
  $('#reviewForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#revName').value.trim();
    const text = $('#revText').value.trim();
    const msg = $('#reviewMsg');

    $('#revName').classList.toggle('err', !name);
    $('#revText').classList.toggle('err', !text);
    if (!name || !text || !rating) {
      msg.textContent = !rating ? 'Molimo izaberite ocenu zvezdicama.' : 'Molimo popunite obavezna polja.';
      msg.classList.remove('hidden');
      return;
    }

    const file = $('#revPhoto').files[0];
    const finalize = photo => {
      const list = load();
      list.unshift({ name, text, stars: rating, photo: photo || null, date: Date.now() });
      save(list);
      render();
      e.target.reset();
      rating = 0;
      $$('button', picker).forEach(x => x.classList.remove('lit'));
      msg.textContent = '✓ Hvala! Vaša recenzija je objavljena.';
      msg.classList.remove('hidden');
      track.scrollTo({ left: 0, behavior: 'smooth' });
      setTimeout(() => msg.classList.add('hidden'), 4000);
    };

    if (file && file.size < 2.5e6) {
      const rd = new FileReader();
      rd.onload = () => finalize(rd.result);
      rd.readAsDataURL(file);
    } else {
      finalize(null);
    }
  });

  render();
  addEventListener('resize', buildDots);
})();

/* ─────────── BOOKING ─────────── */
(() => {
  const LS_KEY = 'ndetailing_bookings';
  const MONTHS = ['Januar','Februar','Mart','April','Maj','Jun','Jul','Avgust','Septembar','Oktobar','Novembar','Decembar'];
  const CFG = window.DOSTUPNOST || {};
  const DAY_KEYS = ['nedelja','ponedeljak','utorak','sreda','cetvrtak','petak','subota'];
  const calDays = $('#calDays');
  const calTitle = $('#calTitle');
  const slotsBox = $('#timeSlots');

  const today = new Date(); today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let selDate = null;
  let selTime = null;

  const load = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
  };
  const save = list => localStorage.setItem(LS_KEY, JSON.stringify(list));
  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  // working hours and days off come from js/dostupnost.js
  const isDayOff = d =>
    (CFG.neradniDani || []).includes(dateKey(d)) ||
    !(CFG.radnoVreme || {})[DAY_KEYS[d.getDay()]];

  function slotsFor(d) {
    if (isDayOff(d)) return [];
    const [from, to] = CFG.radnoVreme[DAY_KEYS[d.getDay()]];
    const step = CFG.trajanjeTermina || 2;
    const out = [];
    for (let h = from; h < to; h += step) out.push(`${String(h).padStart(2,'0')}:00`);
    return out;
  }

  function renderCal() {
    calTitle.textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
    calDays.innerHTML = '';
    const firstDay = (view.getDay() + 6) % 7; // Monday-first
    const daysIn = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      calDays.insertAdjacentHTML('beforeend', '<span class="cal-day off"></span>');
    }
    for (let d = 1; d <= daysIn; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'cal-day';
      el.textContent = d;
      if (date < today) el.classList.add('past');
      else if (isDayOff(date)) el.classList.add('closed');
      if (+date === +today) el.classList.add('today');
      if (selDate && +date === +selDate) el.classList.add('sel');

      if (date >= today && !isDayOff(date)) {
        el.addEventListener('click', () => { selDate = date; selTime = null; renderCal(); renderSlots(); updateSummary(); });
      }
      calDays.appendChild(el);
    }
  }

  function renderSlots() {
    if (!selDate) return;
    $('#slotDate').textContent = selDate.toLocaleDateString('sr-RS', { weekday: 'long', day: 'numeric', month: 'long' });
    const taken = [
      ...load().filter(b => b.date === dateKey(selDate)).map(b => b.time),
      ...((CFG.zauzetiTermini || {})[dateKey(selDate)] || [])
    ];
    const now = new Date();
    const isToday = +selDate === +today;

    slotsBox.innerHTML = '';
    slotsFor(selDate).forEach(t => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'slot';
      el.textContent = t;
      const past = isToday && +t.slice(0, 2) <= now.getHours();
      if (taken.includes(t) || past) el.classList.add('taken');
      else el.addEventListener('click', () => {
        selTime = t;
        $$('.slot', slotsBox).forEach(s => s.classList.remove('sel'));
        el.classList.add('sel');
        updateSummary();
      });
      if (selTime === t) el.classList.add('sel');
      slotsBox.appendChild(el);
    });
  }

  function chosenService() {
    return $('input[name="bkService"]:checked')?.value || '';
  }
  function updateSummary() {
    $('#sumService').textContent = chosenService().replace('(', '— ').replace(')', '');
    const w = $('#sumWhen');
    if (selDate && selTime) {
      w.textContent = `${selDate.toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' })} u ${selTime}h`;
      w.classList.remove('text-neutral-500');
    } else {
      w.textContent = 'Datum i vreme nisu izabrani';
      w.classList.add('text-neutral-500');
    }
  }

  $('#calPrev').addEventListener('click', () => {
    if (view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth()) return;
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCal();
  });
  $('#calNext').addEventListener('click', () => {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCal();
  });
  $$('input[name="bkService"]').forEach(r => r.addEventListener('change', updateSummary));

  // Package "Rezerviši" buttons pre-select the service
  $$('.booking-cta').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.package;
      const radio = $(`input[name="bkService"][value="${val}"]`);
      if (radio) { radio.checked = true; updateSummary(); }
    });
  });

  // Submit
  $('#bookingForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#bkName').value.trim();
    const phone = $('#bkPhone').value.trim();
    const car = $('#bkCar').value.trim();

    $('#bkName').classList.toggle('err', !name);
    $('#bkPhone').classList.toggle('err', !phone);
    $('#bkCar').classList.toggle('err', !car);

    if (!name || !phone || !car) return;
    if (!selDate || !selTime) {
      $('#sumWhen').textContent = '⚠ Izaberite datum i vreme termina';
      $('#rezervacija').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const booking = {
      service: chosenService(),
      date: dateKey(selDate), time: selTime,
      name, phone,
      email: $('#bkEmail').value.trim(),
      car, segment: $('#bkSegment').value,
      note: $('#bkNote').value.trim(),
      created: Date.now()
    };
    const list = load();
    list.push(booking);
    save(list);

    const whenText =
      `${selDate.toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' })} u ${selTime}h`;

    // Email notification to the owner (FormSubmit — free, no backend)
    if (CFG.emailZaRezervacije) {
      fetch(`https://formsubmit.co/ajax/${CFG.emailZaRezervacije}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `🚗 Nova rezervacija — ${booking.date} u ${booking.time}`,
          _template: 'table',
          Usluga: booking.service,
          Datum: booking.date,
          Vreme: booking.time,
          Ime: booking.name,
          Telefon: booking.phone,
          Email: booking.email || '—',
          Vozilo: booking.car,
          Segment: booking.segment || '—',
          Napomena: booking.note || '—'
        })
      }).catch(() => {});
    }

    // WhatsApp confirmation link (customer sends the summary to the owner)
    const waText = encodeURIComponent(
      `Nova rezervacija — N Detailing Studio\n` +
      `Usluga: ${booking.service}\n` +
      `Termin: ${whenText}\n` +
      `Ime: ${name}\n` +
      `Telefon: ${phone}\n` +
      `Vozilo: ${car}${booking.segment ? ' (' + booking.segment + ')' : ''}` +
      (booking.note ? `\nNapomena: ${booking.note}` : '')
    );
    const waBtn = $('#mWhatsApp');
    if (waBtn && CFG.brojWhatsApp) waBtn.href = `https://wa.me/${CFG.brojWhatsApp}?text=${waText}`;

    // Modal summary
    $('#mService').textContent = booking.service;
    $('#mWhen').textContent = whenText;
    $('#mName').textContent = name;
    $('#mCar').textContent = car + (booking.segment ? ` (${booking.segment})` : '');
    $('#mPhone').textContent = phone;
    $('#bkModal').classList.add('open');
    document.body.style.overflow = 'hidden';

    e.target.reset();
    $('input[name="bkService"][value="Gold (120€)"]').checked = true;
    selTime = null;
    renderSlots();
    updateSummary();
  });

  const closeModal = () => {
    $('#bkModal').classList.remove('open');
    document.body.style.overflow = '';
  };
  $('#bkModalClose').addEventListener('click', closeModal);
  $('#bkModalBg').addEventListener('click', closeModal);

  renderCal();
  updateSummary();
})();
