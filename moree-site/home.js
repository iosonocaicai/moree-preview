(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const body = document.body, root = document.documentElement;

/* ---------- nav ---------- */
const nav = $('#nav');
const onNav = () => nav.classList.toggle('scrolled', scrollY > 20);

/* ---------- hero intro ---------- */
const intro = $('#intro'), frame = $('#introFrame'), introImg = $('#introImg'), stamp = $('#introStamp');
const hero = $('#hero'), zone = $('#zone'), finder = $('#finder'), shutter = $('#shutter'), fw = $('#fw');
const scrCam = $('#scrCam'), scrPost = $('#scrPost'), take = $('#take'), comments = $('#comments');
const TAKE = "Cat's running the world's oldest IT desk.";
const seq = ['photo-02','photo-07','photo-03','app-breakfast','photo-05','photo-09','photo-06','photo-01','photo-10','photo-04','app-sunset','app-cat'].map(n => `img/${n}.jpg`);
let skipped = false, done = false;

const preload = src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; });

const cast = {
  yellow:{name:"My Moree", img:"img/yellow.webp", bg:"var(--yellow-soft)", who:["M","#7a64b8"], lines:["Cat's running the world's oldest IT desk."]},
  green:{name:"Theo's Moree", img:"img/green.webp", bg:"#DCE8DA", who:["T","#c9a100"], lines:["Have you tried turning the cat off and on again?","Ticket closed. Cat stays."]},
  black:{name:"Jo's Moree", img:"img/black.webp", bg:"#E7E5EA", who:["J","#26252a"], lines:["That desk has seen things.","…five more minutes."]},
  lilac:{name:"Lin's Moree", img:"img/purple.webp", bg:"#ECE4F8", who:["L","#2f5b3b"], lines:["Promote the cat!!","look at his little face"]},
  rust:{name:"Rain's Moree", img:"img/orange.webp", bg:"#FBDCCF", who:["R","#e4542a"], lines:["Who approved this cat?","Fine. The cat can stay."]}
};
const said = {};
const HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
function addComment(k, text, likes = 0, time = 'now') {
  const c = cast[k];
  const el = document.createElement('div');
  el.className = 'cmt';
  el.innerHTML = `<span class="ava" style="background:${c.bg}"><img src="${c.img}" alt=""><i style="background:#ddd url(img/av-${c.who[0]}.jpg) center/cover"></i></span><div><b>${c.name}<small>${time}</small></b><span class="tx"></span><span class="rp"><span>Reply</span><span>···</span></span></div><span class="hv">${HEART}<span>${likes || ''}</span></span>`;
  el.querySelector('.tx').textContent = text;
  comments.append(el);
  while (comments.children.length > 3) comments.firstChild.remove();
}
function seed() { if (!comments.children.length) addComment('yellow', TAKE, 3, ''); }

async function typeTake() {
  take.innerHTML = '<span></span><i class="caret"></i>';
  const span = take.firstChild;
  for (const ch of TAKE) { if (skipped) break; span.textContent += ch; await sleep(22); }
  span.textContent = TAKE;
  await sleep(160);
  take.querySelector('.caret')?.remove();
}

function lock(on) { root.style.overflow = on ? 'hidden' : ''; }
const block = e => { if (!done && root.style.overflow === 'hidden') e.preventDefault(); };
addEventListener('wheel', block, { passive: false }); addEventListener('touchmove', block, { passive: false });
addEventListener('keydown', e => { if (!done && ['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(e.key)) e.preventDefault(); });

function settle() {
  if (done) return; done = true;
  intro.classList.add('gone'); body.classList.remove('intro-run');
  body.classList.add('phone-on', 'ready');
  finder.classList.add('has');
  scrCam.classList.add('off'); scrPost.classList.add('on');
  if (!take.textContent) take.textContent = TAKE;
  take.querySelector('.caret')?.remove();
  seed();
  startScatter();
  lock(false);
  startPeeks();
  setTimeout(() => { flyGeom(); flyPlane(); fly.classList.add('on'); }, 300);
}

/* morees hiding behind the phone, popping out now and then with something to say */
const ips = $$('.ip');
const LINES = {
  y:  ["come look — that's my comment!", "told you. it's a desk.", "I'm famous now."],
  p0: ["psst… is the cat hiring?", "can I sit there too?", "nice desk."],
  p1: ["is it 6pm yet?", "…five more minutes.", "who's taking photos?"],
  p4: ["who approved this cat?", "fine. the cat stays.", "hmph."],
  p5: ["I brought snacks.", "group photo? GROUP PHOTO.", "hi hi hi!"]
};
const sayIdx = {};
let peekTimer = null, lastPeek = null, speaker = null;
function nextLine(b) { const id = b.dataset.id, L = LINES[id] || ['hi!']; sayIdx[id] = ((sayIdx[id] ?? -1) + 1) % L.length; return L[sayIdx[id]]; }
function talk(b) {
  if (speaker && speaker !== b) { speaker.classList.remove('talk'); clearTimeout(speaker._s); }
  speaker = b;
  const line = nextLine(b); b.querySelector('.say-b').textContent = line; b._line = line;
  clearTimeout(b._s); b._s = setTimeout(() => b.classList.add('talk'), 300);
}
function peek(b, { ms = 2400, say = false } = {}) {
  clearTimeout(b._t);
  b.classList.add('peek');
  if (say) talk(b);
  b._t = setTimeout(() => hide(b), ms);
}
function hide(b) {
  if (b.matches(':hover')) { b._t = setTimeout(() => hide(b), 500); return; }
  b.classList.remove('talk', 'peek', 'half'); clearTimeout(b._s);
  if (speaker === b) speaker = null;
}
function startPeeks() {
  if (peekTimer) return;
  const yel = $('.ip-yellow'), pks = $$('.ip.pk');
  peek(yel, { ms: 3200, say: true });
  // a couple of friends already half out, curious
  const sh = pks.slice().sort(() => Math.random() - .5);
  sh.slice(0, 2).forEach((b, i) => setTimeout(() => b.classList.add('half'), 250 + i * 200));
  let n = 0;
  peekTimer = setInterval(() => {
    if (document.hidden) return;
    n++;
    // shuffle who is half-peeking
    const halves = pks.filter(b => b.classList.contains('half'));
    if (halves.length && Math.random() < .5) halves[Math.floor(Math.random() * halves.length)].classList.remove('half');
    const idle = pks.filter(b => !b.classList.contains('half') && !b.classList.contains('peek'));
    if (idle.length && pks.filter(b => b.classList.contains('half')).length < 2) idle[Math.floor(Math.random() * idle.length)].classList.add('half');
    // and someone pops all the way out
    const pool = ips.filter(b => b !== lastPeek && !b.classList.contains('peek'));
    const b = pool[Math.floor(Math.random() * pool.length)];
    if (!b) return;
    lastPeek = b;
    peek(b, { ms: 2200, say: !speaker && n % 2 === 1 });
  }, 1500);
}

/* background photos: fade in once, then stay put */
let scatOn = false;
function startScatter() {
  if (scatOn) return; scatOn = true;
  $$('.scat').forEach((f, i) => setTimeout(() => f.classList.add('vis'), reduce ? 0 : 150 + i * 60));
}

function skip() { if (done) return; skipped = true; settle(); }

const clipPath = $('#introClipPath');
try { history.scrollRestoration = 'manual'; } catch {}
function toTop() { root.style.scrollBehavior = 'auto'; window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
function sqPath(w, h, r) {
  const p = 2 / 3.3, N = 14, pts = [];
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  const q = [[w - r, r, 1, -1, 1], [w - r, h - r, 1, 1, 0], [r, h - r, -1, 1, 1], [r, r, -1, -1, 0]];
  for (const [cx, cy, sx, sy, rev] of q) for (let i = 0; i <= N; i++) {
    const t = (rev ? N - i : i) / N * Math.PI / 2;
    pts.push(`${(cx + sx * r * Math.cos(t) ** p).toFixed(1)},${(cy + sy * r * Math.sin(t) ** p).toFixed(1)}`);
  }
  return 'M' + pts.join('L') + 'Z';
}
function drawFrame(v) {
  frame.style.left = v.x + 'px'; frame.style.top = v.y + 'px';
  frame.style.width = v.w + 'px'; frame.style.height = v.h + 'px';
  clipPath.setAttribute('d', sqPath(v.w, v.h, v.r));
}
const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
function tween(a, b, dur) {
  return new Promise(res => {
    const t0 = performance.now();
    const f = now => {
      if (skipped) return res();
      const k = Math.min(1, (now - t0) / dur), e = ease(k), v = {}, B = typeof b === 'function' ? b() : b;
      for (const key in a) v[key] = a[key] + (B[key] - a[key]) * e;
      drawFrame(v);
      k < 1 ? requestAnimationFrame(f) : res();
    };
    requestAnimationFrame(f);
  });
}

async function runIntro() {
  let seen = false; try { seen = localStorage.getItem('moreeIntro') === '1'; localStorage.setItem('moreeIntro', '1'); } catch {}
  if (reduce || location.hash || seen) { settle(); return; }
  toTop();
  lock(true); body.classList.add('intro-run');
  await Promise.race([Promise.all(seq.map(preload)), sleep(2200)]);
  for (let i = 0; i < seq.length; i++) {
    if (skipped) return;
    introImg.src = seq[i];
    stamp.textContent = `NOV.12 14:${String(44 - seq.length + 1 + i).padStart(2,'0')}`;
    const t = i < 2 ? 200 : i < seq.length - 3 ? 95 : 140 + (i - (seq.length - 3)) * 70;
    await sleep(i === seq.length - 1 ? 420 : t);
  }
  stamp.textContent = 'NOV.12 14:44';
  if (skipped) return;
  // 1 · full screen → the app's capture frame, centred (shape stays the app's squircle the whole way)
  const W = innerWidth, H = innerHeight, sz = Math.min(W * .6, H * .58);
  const full = { x: 0, y: 0, w: W, h: H, r: 0 };
  const mid = { x: (W - sz) / 2, y: (H - sz) / 2, w: sz, h: sz, r: sz / 2 };
  drawFrame(full); intro.classList.add('flying');
  await tween(full, mid, 620);
  if (skipped) return;
  body.classList.add('phone-on', 'ready'); body.classList.remove('intro-run');
  intro.classList.add('clear');
  startScatter();
  if (skipped) return;
  // 2 · into the phone's viewfinder
  toTop();
  const target = () => { const r = finder.querySelector('.sq .sq').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.width / 2 }; };
  await tween(mid, target, 820);
  if (skipped) return;
  finder.classList.add('has');
  intro.classList.add('gone');
  lock(false);
  await sleep(90);
  shutter.classList.add('press'); fw.classList.remove('go'); void fw.offsetWidth; fw.classList.add('go');
  await sleep(150); shutter.classList.remove('press');
  // keep the photo in place: glide it from the viewfinder to its spot in the post
  const pic = scrPost.querySelector('.pic'), from = finder.getBoundingClientRect();
  scrCam.classList.add('off'); scrPost.classList.add('on');
  const to = pic.getBoundingClientRect();
  pic.animate([{ transform: `translate(${from.left - to.left}px,${from.top - to.top}px) scale(${from.width / to.width})`, transformOrigin: '0 0' }, { transform: 'none', transformOrigin: '0 0' }], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
  await sleep(260);
  await typeTake();
  if (skipped) return;
  seed();
  startPeeks();
  settle();
}

/* pokes */
const KEYMAP = { green: 'green', black: 'black', lilac: 'lilac', rust: 'rust', yellow: 'yellow' };
ips.forEach(b => b.addEventListener('click', () => {
  if (!done) return;
  const k = b.dataset.k;
  peek(b, { ms: 2800, say: true });
  const img = b.querySelector('img');
  b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop');
  setTimeout(() => b.classList.remove('hop'), 600);
  if (k === 'yellow') { like(true); return; }
  setTimeout(() => addComment(KEYMAP[k], b._line || nextLine(b)), 250);
}));
const likeBtn = $('#like'), likes = $('#likes'); let liked = false;
function like(force) {
  liked = force ? true : !liked;
  likeBtn.classList.toggle('on', liked);
  likes.textContent = liked ? 5 : 4;
  likeBtn.classList.add('pop'); setTimeout(() => likeBtn.classList.remove('pop'), 300);
}
likeBtn.addEventListener('click', () => like());

/* ---------- 01 meet ---------- */
const mos = $$('#mstage .mo'), picks = $$('.picker button'), mname = $('#mname'), msay = $('#msay');
const MSAY = ['…five more minutes.', 'did someone say photos?', 'hi! I\'m yours.', 'group hug?', 'I don\'t do mornings.'];
let msayT = null;
let auto = true, pi = 2;
function pick(i) {
  pi = i;
  picks.forEach((p, j) => p.classList.toggle('on', j === i));
  mos.forEach((m, j) => m.classList.toggle('on', j === i));
  mname.textContent = picks[i].dataset.n;
  msay.classList.remove('show'); clearTimeout(msayT);
  msayT = setTimeout(() => { msay.textContent = MSAY[i]; msay.classList.add('show'); }, 380);
}
picks.forEach((p, i) => p.addEventListener('click', () => { auto = false; pick(i); }));
let stageVisible = false;
new IntersectionObserver(([e]) => stageVisible = e.isIntersecting, { threshold: .5 }).observe($('#mstage'));
new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); pick(pi); } }, { threshold: .6 }).observe($('#mstage'));
setInterval(() => { if (auto && stageVisible && !reduce && !document.hidden) pick((pi + 1) % picks.length); }, 2600);

/* ---------- 02 friends ---------- */
const invite = $('#invite'), cards = $('#cards'), fly = $('#fly');
/* paper plane: takes off from under the comments in the hero phone, flies down the page and dives into the invite envelope */
let G = null;
function flyGeom() {
  const sy = scrollY, W = document.documentElement.clientWidth, pw = fly.offsetWidth;
  const R = el => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top + sy, b: r.bottom + sy, w: r.width, h: r.height }; };
  const ph = R($('#phone')), hero = R($('#hero')), meet = R($('#meet')), wrap = R($('#meet .wrap')), env = R($('.env'));
  const fr = R($('#friendsCopy')), mst = R($('#mstage'));
  const rightGap = Math.min(W - pw * .9, (mst.r + W) / 2 - 30);   // empty space right of the 01 content
  const pts = [
    [ph.r + pw * .15, ph.t + ph.h * .62],                 // just off the phone, by the comments
    [Math.min(W - pw * .6, ph.r + pw * 1.1), hero.b - 40], // drifts out into the open between phone and photos
    [rightGap, meet.t + meet.h * .35],                    // right-hand margin beside 01
    [rightGap, meet.b + 30],
    [env.l + env.w * .2, env.t - pw * .55],               // drops in above the envelope
    [env.l + env.w * .5, env.t + env.h * .55]             // into the envelope
  ];
  G = { pts, pw, end: Math.max(1, pts[pts.length - 1][1] - innerHeight * .55) };
}
function cr(p0, p1, p2, p3, t) { const t2 = t * t, t3 = t2 * t; return .5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); }
function along(pts, u) {
  const n = pts.length - 1, f = Math.min(n - 1e-6, u * n), i = Math.floor(f), t = f - i;
  const P = k => pts[Math.max(0, Math.min(n, k))];
  return [0, 1].map(d => cr(P(i - 1)[d], P(i)[d], P(i + 1)[d], P(i + 2)[d], t));
}
let lastFs = 1, fr = 0;
function flyPlane() {
  if (!G || !done) return;
  const u = clamp(scrollY / G.end), { pts, pw } = G;
  const [x, y] = along(pts, u), [x2, y2] = along(pts, Math.min(1, u + .01));
  const dx = x2 - x, dy = y2 - y;
  if (Math.abs(dx) > .3) lastFs = dx > 0 ? -1 : 1;
  const th = Math.atan2(dy, Math.abs(dx) + 1e-3) * 57.3;
  let R = lastFs === -1 ? th - 35 : 35 - th; R = Math.max(-35, Math.min(35, R));
  fr += (R - fr) * .25;
  const k = u < .88 ? 1 : 1 - (u - .88) / .12 * .75;
  fly.style.opacity = u > .97 ? 0 : '';
  fly.style.transform = `translate3d(${x - pw / 2}px,${y - pw / 2}px,0) rotate(${fr}deg) scaleX(${lastFs}) scale(${k})`;
}


function sizeDays() {}


/* ---------- scroll loop ---------- */
const getpill = $('#getpill'), closingEl = $('#closing');
function onScroll() {
  onNav();
  if (getpill) { const rc = closingEl.getBoundingClientRect(); getpill.classList.toggle('show', done && scrollY > innerHeight * .7 && rc.top > innerHeight * .65); }
  const vh = innerHeight;
  // envelope rise
  const ri = invite.getBoundingClientRect();
  const pr = clamp((vh - ri.top) / (vh * .9));
  cards.style.setProperty('--rise', pr.toFixed(3));
  flyPlane();
}
let ticking = false;
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); } }, { passive: true });
addEventListener('resize', () => { sizeDays(); flyGeom(); onScroll(); });

/* ---------- reveals & one-shots ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .18 });
$$('.reveal, #friendsCopy, #closing').forEach(el => io.observe(el));

new IntersectionObserver(([e], o) => { if (e.isIntersecting) { $('#fan').classList.add('open'); o.disconnect(); } }, { threshold: .5 }).observe($('#acard'));

const chatMsgs = $$('#chat .msg'), typing = $('#typing');
const PRE = 2;  // the first two lines are already there
function resetChat() {
  chatMsgs.forEach((m, i) => { const on = i < PRE; m.classList.toggle('show', on); if (m.dataset.t) m.textContent = on ? m.dataset.t : ''; });
}
resetChat();
async function playChat() {
  for (const m of chatMsgs.slice(PRE)) {
    if (m.classList.contains('mo')) {
      if (!reduce) { m.before(typing); typing.classList.add('show'); await sleep(900); typing.classList.remove('show'); }
      m.classList.add('show');
      const t = m.dataset.t;
      if (reduce) m.textContent = t; else for (let i = 1; i <= t.length; i++) { m.textContent = t.slice(0, i); await sleep(18); }
      await sleep(700);
    } else { m.classList.add('show'); await sleep(reduce ? 0 : 800); }
  }
}
let chatSeen = false;
new IntersectionObserver(async ([e]) => {
  if (!e.isIntersecting || chatSeen) return; chatSeen = true;
  await sleep(700);
  while (true) { await playChat(); if (reduce) break; await sleep(4000); resetChat(); await sleep(1200); }
}, { threshold: .35 }).observe($('#chatCard') || document.createElement('i'));

/* draggable stickers */
const board = $('#board'); let z = 5;
$$('.sticker').forEach(s => {
  s.addEventListener('pointerdown', e => {
    e.preventDefault(); s.setPointerCapture(e.pointerId); s.style.zIndex = ++z;
    const b = board.getBoundingClientRect(), r = s.getBoundingClientRect();
    const ox = e.clientX - r.left, oy = e.clientY - r.top;
    const move = ev => {
      s.style.left = `${clamp(ev.clientX - b.left - ox, -r.width * .3, b.width - r.width * .7)}px`;
      s.style.top = `${clamp(ev.clientY - b.top - oy, -r.height * .3, b.height - r.height * .5)}px`;
    };
    const up = () => { s.removeEventListener('pointermove', move); s.removeEventListener('pointerup', up); };
    s.addEventListener('pointermove', move); s.addEventListener('pointerup', up);
  });
});

/* lineup hops */
$$('.lineup button').forEach(b => b.addEventListener('click', () => { b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop'); }));


/* ---------- photo pile (closing) ---------- */
function initPile() {
  const el = $('#pile'), M = window.Matter;
  if (!el || !M) return;
  const { Engine, Bodies, Composite, Mouse, MouseConstraint, Events } = M;
  const W = el.clientWidth, H = el.clientHeight;
  const engine = Engine.create({ enableSleeping: true });
  engine.gravity.y = 1.15;
  const T = 2000;
  Composite.add(engine.world, [
    Bodies.rectangle(W / 2, H + T / 2, W + T * 2, T, { isStatic: true }),
    Bodies.rectangle(-T / 2, H / 2 - H, T, H * 5, { isStatic: true }),
    Bodies.rectangle(W + T / 2, H / 2 - H, T, H * 5, { isStatic: true })
  ]);
  const photos = ['photo-01','photo-02','photo-03','photo-04','photo-05','photo-06','photo-07','photo-08','photo-09','photo-10','app-cat','app-sunset','app-breakfast','window-a','window-c'];
  const chars = ['yellow','black','green','purple','orange'];
  const small = W < 640;
  const base = small ? Math.max(64, W / 5.4) : Math.min(165, Math.max(100, W / 10.5));
  const count = small ? 16 : Math.round(Math.min(30, W / 52));
  const items = [];
  const rnd = (a, b) => a + Math.random() * (b - a);
  let pi = 0, ci = 0;
  const qrAt = Math.floor(count * .55);
  let guide = null;
  function spawn(i) {
    const kind = i === qrAt ? 'qr' : i % 5 === 2 ? 'ch' : 'ph';
    const sz = kind === 'qr' ? base * 1.25 : kind === 'ch' ? base * rnd(.36, .44) : kind === 'guide' ? base * .78 : base * rnd(.84, 1.16);
    const node = document.createElement('div');
    node.className = 'b ' + (kind === 'ch' || kind === 'guide' ? 'ch' : 'sq-frame') + (kind === 'qr' ? ' qr' : '') + (kind === 'guide' ? ' guide' : '');
    node.style.width = node.style.height = sz + 'px';
    if (kind === 'ch') node.innerHTML = `<img src="img/${chars[ci++ % chars.length]}.webp" alt="" draggable="false">`;
    else if (kind === 'guide') node.innerHTML = `<img src="img/yellow-stand.webp" alt="" draggable="false">`;
    else if (kind === 'qr') node.innerHTML = `<div class="sq"><div class="sq"><img src="img/qr.svg" alt="" draggable="false"></div></div>`;
    else node.innerHTML = `<div class="sq"><div class="sq"><img src="img/${photos[pi++ % photos.length]}.jpg" alt="" draggable="false"></div></div>`;
    el.append(node);
    const g = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
    const cx = kind === 'qr' ? W / 2 + rnd(-W * .08, W * .08) : kind === 'guide' && items.length ? items[items.length - 1].body.position.x + sz : W / 2 + g * W * .34;
    const x = Math.max(sz / 2, Math.min(W - sz / 2, cx)), y = -sz - rnd(0, 120);
    const opts = { restitution: .12, friction: 1, frictionStatic: 3, frictionAir: .012, density: kind === 'ch' || kind === 'guide' ? .001 : .0018, angle: kind === 'qr' ? rnd(-.12, .12) : rnd(-.5, .5) };
    const body = (kind === 'ch' || kind === 'guide') ? Bodies.circle(x, y, sz * .42, opts) : Bodies.rectangle(x, y, sz, sz, { ...opts, chamfer: { radius: sz * .32 } });
    Composite.add(engine.world, body);
    const it = { node, body, sz };
    items.push(it);
    if (kind === 'qr' || kind === 'guide') {
      let down = null;
      node.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
      node.addEventListener('click', e => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 8) location.href = 'get.html'; });
      node.setAttribute('role', 'link'); node.setAttribute('aria-label', 'Get moree'); node.tabIndex = 0;
      node.addEventListener('keydown', e => { if (e.key === 'Enter') location.href = 'get.html'; });
    }
    if (kind === 'qr') {
      const tip = document.createElement('a'); tip.className = 'tip'; tip.href = 'get.html'; tip.innerHTML = 'Scan to download moree <span aria-hidden="true">↓</span>';
      el.append(tip); it.tip = tip;
      setTimeout(() => tip.classList.add('show'), 1800);
    }
  }
  if (matchMedia('(pointer: fine)').matches) {
    const mouse = Mouse.create(el);
    ['wheel', 'mousewheel', 'DOMMouseScroll'].forEach(t => el.removeEventListener(t, mouse.mousewheel));
    const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: .18, damping: .1, render: { visible: false } } });
    Composite.add(engine.world, mc);
  }
  const draw = () => { for (const it of items) { const { x, y } = it.body.position; it.node.style.transform = `translate3d(${x - it.sz / 2}px,${y - it.sz / 2}px,0) rotate(${it.body.angle}rad)`; if (it.tip) { const tw = it.tip.offsetWidth; it.tip.style.transform = `translate3d(${Math.max(4, Math.min(W - tw - 4, x - tw / 2))}px,${Math.max(4, y - it.sz * .5 - 44)}px,0)`; } } };
  if (reduce) {
    for (let i = 0; i < count; i++) { spawn(i); for (let k = 0; k < 20; k++) Engine.update(engine, 1000 / 60); }
    for (let k = 0; k < 400; k++) Engine.update(engine, 1000 / 60);
    draw(); return;
  }
  let i = 0;
  const drop = setInterval(() => { if (i >= count) return clearInterval(drop); spawn(i++); }, 90);
  let on = true, last = performance.now();
  new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) { last = performance.now(); requestAnimationFrame(loop); } }).observe(el);
  function loop(now) {
    if (!on) return;
    const dt = Math.min(16.66, now - last) || 16.66; last = now;
    Engine.update(engine, dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  el.classList.add('live');
}
const pileEl = $('#pile');
if (pileEl) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); initPile(); } }, { threshold: .25 }).observe(pileEl);

/* nav: tuck into the logo while scrolling down, open again on the way up */
(()=>{const n=document.getElementById('nav'),lg=n.querySelector('.logo img');const fit=()=>n.style.setProperty('--cw',(lg.offsetWidth+44)+'px');fit();addEventListener('load',fit);addEventListener('resize',fit);let ly=scrollY,acc=0;addEventListener('scroll',()=>{const y=scrollY,d=y-ly;ly=y;if(y<120){n.classList.remove('compact');acc=0;return}acc=(Math.sign(d)===Math.sign(acc)?acc:0)+d;if(acc>40)n.classList.add('compact');else if(acc<-40)n.classList.remove('compact')},{passive:true});n.addEventListener('mouseenter',()=>n.classList.remove('compact'))})();

/* go */
addEventListener('load', () => { sizeDays(); if (done) flyGeom(); onScroll(); });
sizeDays(); onScroll();
runIntro();
})();
