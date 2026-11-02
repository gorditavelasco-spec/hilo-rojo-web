(function () {
class Site {
  constructor(root) {
    this.root = root;
    // "Completo" = todas las animaciones siempre, igual que en el diseño (también en celulares con "Reducir movimiento").
    this.props = { motion: 'Completo' };
    this.menu = false;
    const bar = root.querySelector('.bar'), btn = root.querySelector('.menu-btn'), nav = root.querySelector('.bar .nav');
    const setMenu = (open) => {
      this.menu = open;
      bar.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    btn.addEventListener('click', () => setMenu(!this.menu));
    nav.addEventListener('click', (e) => { if (this.menu && e.target.closest && e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.menu) { setMenu(false); btn.focus(); } });
    root.querySelectorAll('[data-replay]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { window.scrollTo(0, 0); }
      clearTimeout(this.replayT);
      this.replayT = setTimeout(() => { this.teardown(); this.boot(); }, 650);
    }));
    this.boot();
  }

  q(s) { return this.r ? this.r.querySelector(s) : null; }

  boot() {
    const root = this.root || document.querySelector('.hr');
    if (!root) return;
    this.r = root;
    this.offs = [];
    this.timers = [];
    const all = root.querySelectorAll('[data-rv]');
    root.classList.remove('armed', 'go', 'still');
    all.forEach((e) => e.classList.remove('in'));
    const mode = this.props.motion || 'Completo';
    let reduced = mode === 'Reducido';
    if (mode === 'Según el sistema') { try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) {} }
    if (reduced) {
      root.classList.add('still');
      all.forEach((e) => e.classList.add('in'));
      const bar0 = this.q('.bar');
      const sc0 = () => { if (bar0) bar0.classList.toggle('sc', (window.scrollY || 0) > 30); };
      window.addEventListener('scroll', sc0, { passive: true });
      this.offs.push(() => window.removeEventListener('scroll', sc0));
      sc0();
      return;
    }
    root.classList.add('armed');
    const T = (ms, fn) => this.timers.push(setTimeout(fn, ms));
    const add = (s) => { const el = this.q(s); if (el) el.classList.add('in'); };
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.add('go');
      T(250, () => add('.h-pre'));
      T(1150, () => add('.thr-hero'));
      T(2150, () => add('.h-main'));
      T(3300, () => { add('.h-tail'); add('.h-tail2'); });
    }));

    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); this.io.unobserve(e.target); }
      }), { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
      root.querySelectorAll('[data-rv]:not([data-intro])').forEach((e) => this.io.observe(e));
      this.io2 = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('live', e.isIntersecting)), { threshold: 0 });
      ['.hero', '.contact'].forEach((s) => { const el = this.q(s); if (el) this.io2.observe(el); });
    } else {
      all.forEach((e) => e.classList.add('in'));
    }

    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); this.offs.push(() => t.removeEventListener(ev, fn, o)); };
    const onScroll = () => { if (!this.sraf) this.sraf = requestAnimationFrame(() => { this.sraf = 0; this.scrollFx(); }); };
    on(window, 'scroll', onScroll, { passive: true });
    on(window, 'resize', onScroll);
    this.scrollFx();

    const hero = this.q('.hero');
    if (hero) {
      on(hero, 'pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      on(hero, 'pointerleave', () => { hero.style.setProperty('--mx', '0'); hero.style.setProperty('--my', '0'); });
    }
    this.setupTip(on);
    this.setupHz(on);
    this.setupCursor(on);
    this.setupMag(on);
    this.scrollFx();
  }

  scrollFx() {
    if (!this.r) return;
    const vh = window.innerHeight || 800;
    const cl = (v) => Math.max(0, Math.min(1, v));
    const bar = this.q('.bar');
    if (bar) bar.classList.toggle('sc', (window.scrollY || 0) > 30);
    const hero = this.q('.hero');
    if (hero) {
      const h = hero.getBoundingClientRect();
      hero.style.setProperty('--sp', cl(-h.top / h.height).toFixed(3));
    }
    const work = this.q('.work');
    if (work) {
      const w = work.getBoundingClientRect();
      work.style.setProperty('--open', cl((vh - w.top) / (vh * 0.75)).toFixed(3));
    }
    const pin = this.q('.pin'), steps = this.q('.steps');
    if (pin && steps && this.r.classList.contains('hz') && this.hzDist) {
      const pr = pin.getBoundingClientRect();
      const p = cl(-pr.top / this.hzDist);
      steps.style.setProperty('--tx', (-p * this.hzDist).toFixed(1) + 'px');
      const pg = this.q('.prog');
      if (pg) pg.style.setProperty('--pp', p.toFixed(3));
      const tipX = window.innerWidth * 0.62 + p * this.hzDist;
      steps.querySelectorAll('.step').forEach((el) => el.classList.toggle('on', el.offsetLeft + 30 < tipX));
    } else if (steps) {
      // Celular: los pasos se encienden uno a uno al subir por la pantalla.
      steps.querySelectorAll('.step').forEach((el) => el.classList.toggle('on', el.getBoundingClientRect().top < vh * 0.7));
    }
    this.r.querySelectorAll('[data-rv]:not(.in):not([data-intro])').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add('in');
    });
    this.r.querySelectorAll('[data-words]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const p = cl((vh * 0.9 - r.top) / (r.height + vh * 0.15));
      const ws = el.querySelectorAll('.w'), n = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle('on', i < n));
    });
    const ph = this.q('.ph-in');
    if (ph) {
      const p = ph.getBoundingClientRect();
      const t = (p.top + p.height / 2 - vh / 2) / vh;
      const img = ph.querySelector('img');
      if (img) img.style.setProperty('--py', (-7 + t * -9).toFixed(2) + '%');
      const fig = this.q('.photo');
      if (fig) fig.style.setProperty('--ry', (t * -36).toFixed(1) + 'px');
    }
  }

  setupHz(on) {
    const root = this.r, pin = this.q('.pin'), steps = this.q('.steps');
    if (!pin || !steps) return;
    const fit = () => {
      const wide = window.innerWidth > 820;
      root.classList.toggle('hz', wide);
      if (!wide) { pin.style.height = ''; steps.style.setProperty('--tx', '0px'); this.hzDist = 0; return; }
      const dist = Math.max(0, steps.scrollWidth - window.innerWidth);
      this.hzDist = dist;
      pin.style.setProperty('--pinH', (window.innerHeight + dist) + 'px');
    };
    fit();
    on(window, 'resize', fit);
    this.timers.push(setTimeout(fit, 1200));
  }

  setupCursor(on) {
    let fine = false;
    try { fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (_) {}
    const cur = this.q('.cx');
    if (!fine || !cur) return;
    this.r.classList.add('has-cur');
    const c = { x: -100, y: -100, tx: -100, ty: -100, run: false };
    const tick = () => {
      c.x += (c.tx - c.x) * 0.28; c.y += (c.ty - c.y) * 0.28;
      cur.style.transform = 'translate3d(' + c.x.toFixed(1) + 'px,' + c.y.toFixed(1) + 'px,0)';
      if (Math.abs(c.tx - c.x) > 0.1 || Math.abs(c.ty - c.y) > 0.1) this.curRaf = requestAnimationFrame(tick); else c.run = false;
    };
    on(window, 'pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      c.tx = e.clientX; c.ty = e.clientY;
      if (c.x < -50) { c.x = c.tx; c.y = c.ty; }
      cur.classList.add('vis');
      const t = e.target && e.target.closest ? e.target : null;
      const grab = !!(t && t.closest('.tug'));
      cur.classList.toggle('grab', grab);
      cur.classList.toggle('big', !grab && !!(t && t.closest('a,button')));
      if (!c.run) { c.run = true; this.curRaf = requestAnimationFrame(tick); }
    }, { passive: true });
    on(document, 'mouseleave', () => cur.classList.remove('vis'));
  }

  setupMag(on) {
    let fine = false;
    try { fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (_) {}
    if (!fine) return;
    this.r.querySelectorAll('[data-mag]').forEach((el) => {
      on(el, 'pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate3d(' + (dx * 0.22).toFixed(1) + 'px,' + (dy * 0.3).toFixed(1) + 'px,0)';
      });
      on(el, 'pointerleave', () => { el.style.transform = ''; });
    });
  }

  setupTip(on) {
    const sec = this.q('.contact'), wrap = this.q('.thr-close'), tug = this.q('.tug');
    if (!sec || !wrap || !tug) return;
    const s = { tx: 0, rot: 0, gx: 0, grot: 0, grab: false, px: -9999, py: -9999, sx: 0, sy: 0, moved: 0, run: false };
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const aim = () => {
      const r = wrap.getBoundingClientRect();
      const cx = r.left + r.width * 0.15, cy = r.top + r.height * 0.7;
      const dx = s.px - cx, dy = s.py - cy, d = Math.hypot(dx, dy);
      const R = s.grab ? 1e5 : 280;
      let f = d < R ? 1 - d / R : 0;
      f = f * f * (3 - 2 * f);
      const k = s.grab ? 0.5 : 0.2, mx = s.grab ? 120 : 36;
      s.gx = clamp(dx * k * f, -mx, mx * 0.4);
      const gy = clamp(dy * k * f, -mx * 0.8, mx * 0.8);
      s.grot = -Math.atan2(gy, r.width * 0.85) * 57.2958;
    };
    const tick = () => {
      const e = s.grab ? 0.16 : 0.075;
      s.tx += (s.gx - s.tx) * e;
      s.rot += (s.grot - s.rot) * e;
      tug.style.transform = 'translate3d(' + s.tx.toFixed(2) + 'px,0,0) rotate(' + s.rot.toFixed(3) + 'deg)';
      if (Math.abs(s.gx - s.tx) > 0.05 || Math.abs(s.grot - s.rot) > 0.004) this.tipRaf = requestAnimationFrame(tick);
      else s.run = false;
    };
    const kick = () => { if (!s.run) { s.run = true; this.tipRaf = requestAnimationFrame(tick); } };
    const rest = () => { s.gx = 0; s.grot = 0; kick(); };
    on(sec, 'pointermove', (e) => {
      if (e.pointerType !== 'mouse' && !s.grab) return;
      s.px = e.clientX; s.py = e.clientY;
      if (s.grab) s.moved = Math.max(s.moved, Math.hypot(s.px - s.sx, s.py - s.sy));
      aim(); kick();
    });
    on(sec, 'pointerleave', () => { if (!s.grab) rest(); });
    on(tug, 'pointerdown', (e) => {
      s.grab = true; s.sx = s.px = e.clientX; s.sy = s.py = e.clientY; s.moved = 0;
      try { tug.setPointerCapture(e.pointerId); } catch (_) {}
      tug.classList.add('grabbing'); aim(); kick();
    });
    const release = () => { if (!s.grab) return; s.grab = false; tug.classList.remove('grabbing'); rest(); };
    on(tug, 'pointerup', release);
    on(tug, 'pointercancel', release);
    on(tug, 'click', (e) => { if (s.moved > 8) { e.preventDefault(); s.moved = 0; } });
    on(tug, 'dragstart', (e) => e.preventDefault());
  }

  teardown() {
    (this.timers || []).forEach(clearTimeout);
    (this.offs || []).forEach((f) => f());
    this.timers = []; this.offs = [];
    if (this.io) this.io.disconnect();
    if (this.io2) this.io2.disconnect();
    this.io = this.io2 = null;
    cancelAnimationFrame(this.sraf || 0); this.sraf = 0;
    cancelAnimationFrame(this.tipRaf || 0);
    cancelAnimationFrame(this.curRaf || 0);
    const tug = this.q('.tug');
    if (tug) tug.style.transform = '';
    if (this.r) {
      this.r.classList.remove('hz', 'has-cur');
      const pin = this.q('.pin'); if (pin) pin.style.removeProperty('--pinH');
      const st = this.q('.steps'); if (st) st.style.removeProperty('--tx');
      this.r.querySelectorAll('[data-mag]').forEach((el) => { el.style.transform = ''; });
    }
  }
}
const root = document.querySelector('.hr');
if (root) new Site(root);
})();
