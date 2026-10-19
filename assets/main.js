/* ===== INTRO: Hoa hạt Galaxy (thay thư) → Tỏa hoa như ban đầu ===== */
(() => {
  const canvas = document.getElementById("loveCanvas");
  const ctx = canvas.getContext("2d");
  const hint = document.getElementById("galaxyHint");

  // ---- Galaxy particles (thay cho envelope) ----
  const N = 14000;
  let W, H, DPR, CX, CY, S;

  const tx = new Float32Array(N), ty = new Float32Array(N);
  const x = new Float32Array(N), y = new Float32Array(N);
  const size = new Float32Array(N), phase = new Float32Array(N);
  const base = new Float32Array(N);
  const hue = new Uint8Array(N);

  const TAU = Math.PI * 2, rnd = Math.random;
  const A0 = -Math.PI / 2;
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;

  const LAYERS = [
    { n: 8, off: 0, L: 1.00, W: 0.30, curl: 0.06, w: 0.23, hue: 0, a: 0.85 },
    { n: 8, off: Math.PI / 8, L: 0.82, W: 0.27, curl: -0.05, w: 0.185, hue: 0, a: 0.8 },
    { n: 8, off: 0, L: 0.62, W: 0.22, curl: 0.05, w: 0.15, hue: 1, a: 0.95 },
    { n: 5, off: Math.PI / 5, L: 0.42, W: 0.17, curl: -0.04, w: 0.11, hue: 0, a: 1.0 }
  ];
  const petalW = (u, Ww) => Ww * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 0.9);

  function petalPoint(Ly, mode) {
    const k = Math.floor(rnd() * Ly.n);
    const ang = A0 + Ly.off + k * TAU / Ly.n;
    const side = rnd() < 0.5 ? -1 : 1;
    const u = rnd();
    const w = petalW(u, Ly.W);
    let v;
    if (mode === 0) v = side * w;
    else if (mode === 1) v = (rnd() * 2 - 1) * w * 0.95;
    else if (rnd() < 0.5) v = 0;
    else v = side * w * 0.5 * (0.6 + 0.4 * u);
    v += Ly.curl * u * u * u;
    const x0 = u * Ly.L, c = Math.cos(ang), s = Math.sin(ang);
    return [x0 * c - v * s, x0 * s + v * c];
  }

  function pickLayer() {
    let r = rnd(), acc = 0;
    for (const Ly of LAYERS) { acc += Ly.w; if (r < acc) return Ly; }
    return LAYERS[LAYERS.length - 1];
  }

  const STAMENS = 28;
  const stamenLen = k => 0.27 + 0.07 * (0.5 + 0.5 * Math.sin(k * 2.3));

  function build() {
    for (let i = 0; i < N; i++) {
      const g = rnd();
      let px, py, j = 0, h = 0, al = 0.8;
      if (g < 0.655) {
        const Ly = pickLayer();
        const m = rnd();
        const mode = m < 0.62 ? 0 : m < 0.84 ? 1 : 2;
        [px, py] = petalPoint(Ly, mode);
        if (mode === 0) { h = Ly.hue; al = Ly.a * (0.6 + rnd() * 0.4); j = 0.0045; }
        else if (mode === 1) { h = 1; al = 0.10 + rnd() * 0.14; j = 0.0; }
        else { h = Ly.hue; al = 0.35 + rnd() * 0.3; j = 0.003; }
      } else if (g < 0.735) {
        const th = rnd() * TAU, r = 0.18 + Math.pow(rnd(), 1.6) * 0.55;
        px = Math.cos(th) * r; py = Math.sin(th) * r;
        h = 1; al = Math.max(0.1, 0.6 - r * 0.7);
      } else if (g < 0.815) {
        const k = Math.floor(rnd() * STAMENS), th = A0 + k * TAU / STAMENS + 0.12;
        const r = 0.19 + rnd() * (stamenLen(k) - 0.19);
        const t = (r - 0.19) / (stamenLen(k) - 0.19 + 1e-6);
        const a2 = th + 0.18 * t * t;
        px = Math.cos(a2) * r; py = Math.sin(a2) * r;
        h = 2; al = 0.35 + 0.35 * t; j = 0.0015;
      } else if (g < 0.845) {
        const k = Math.floor(rnd() * STAMENS), th = A0 + k * TAU / STAMENS + 0.12 + 0.18;
        const r = stamenLen(k);
        px = Math.cos(th) * r + gauss() * 0.011; py = Math.sin(th) * r + gauss() * 0.011;
        h = 2; al = 0.9 + rnd() * 0.1;
      } else if (g < 0.945) {
        const n = Math.floor(rnd() * 420), r = 0.17 * Math.sqrt(n / 420), th = n * 2.39996;
        px = Math.cos(th) * r; py = Math.sin(th) * r;
        h = 2; al = 0.75 + rnd() * 0.25; j = 0.002;
      } else if (g < 0.975) {
        const th = rnd() * TAU, r = 0.19 + gauss() * 0.005;
        px = Math.cos(th) * r; py = Math.sin(th) * r;
        h = 0; al = 1;
      } else {
        const th = rnd() * TAU, r = 1.0 + Math.pow(rnd(), 1.5) * 0.35;
        px = Math.cos(th) * r; py = Math.sin(th) * r;
        h = rnd() < 0.5 ? 0 : 1; al = 0.15 + rnd() * 0.3;
      }
      tx[i] = px + gauss() * j;
      ty[i] = py + gauss() * j;
      hue[i] = h; base[i] = al;
      size[i] = 0.6 + rnd() * 1.0;
      phase[i] = rnd() * TAU;
      x[i] = CX; y[i] = CY;
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    CX = W / 2; CY = H * 0.46;
    S = Math.min(W * 0.38, H * 0.30);
  }

  function flowerPos(i, now) {
    const ang = now * 0.00012;
    const breath = 1 + 0.025 * Math.sin(now * 0.0016);
    const c = Math.cos(ang), s = Math.sin(ang);
    const j = 1.2 * Math.sin(now * 0.002 + phase[i]);
    const fx = (tx[i] * c - ty[i] * s) * S * breath + j;
    const fy = (tx[i] * s + ty[i] * c) * S * breath + Math.cos(now * 0.0023 + phase[i]) * 1.2;
    return [CX + fx, CY + fy];
  }

  // ---- Hiệu ứng tỏa bông hoa (GIỮ NGUYÊN như bản gốc) ----
  const flowers = [];
  const flowerImages = [];
  for (let i = 1; i <= 8; i++) {
    const img = new Image();
    img.src = `images/flower${i}.webp`;
    flowerImages.push(img);
  }

  function createFlower(index, leftSide) {
    const ring = Math.floor(index / 40);
    const pos = index % 40;
    const side = leftSide ? 1 : -1;
    const angle =
      (leftSide ? -Math.PI / 2 : Math.PI / 2) +
      side * (pos / 40) * Math.PI * 2 +
      (Math.random() - 0.5) * 0.08;
    const radius =
      Math.max(W, H) * (0.05 + ring * 0.12 + Math.random() * 0.08);
    flowers.push({
      tx: Math.cos(angle) * radius,
      ty: Math.sin(angle) * radius,
      img: flowerImages[Math.floor(Math.random() * flowerImages.length)],
      start: performance.now(),
      dur: 800 + Math.random() * 150,
      rot: (Math.random() - 0.5) * 50,
      spin: (Math.random() - 0.5) * 120,
      drop: H + 300 + Math.random() * 300,
    });
  }

  // galaxy → burst → waiting → dropping → done
  let state = "galaxy";
  let dropStart = 0;
  let galaxyFade = false;
  let galaxyFadeStart = 0;
  let canSecondClick = false; // chặn click lọt từ lần 1
  const COLORS = ["rgba(236,228,255,", "rgba(170,120,255,", "rgba(255,236,170,"];
  const easeOut = t => 1 - (1 - t) * (1 - t);
  const easeIn = t => t * t;

  function startBurst() {
    galaxyFade = true;
    galaxyFadeStart = performance.now();
    canSecondClick = false;
    hint.classList.remove("show");
    hint.style.pointerEvents = "none";

    let left = 0, right = 0;
    const timer = setInterval(() => {
      for (let i = 0; i < 3 && left < 300; i++) { createFlower(left, true); left++; }
      for (let i = 0; i < 3 && right < 300; i++) { createFlower(right, false); right++; }
      if (left >= 300 && right >= 300) {
        clearInterval(timer);
        // DỪNG — chờ bấm lần 2 (KHÔNG tự rơi)
        state = "waiting";
        hint.textContent = "Tiếp nào";
        setTimeout(() => {
          canSecondClick = true;
          hint.classList.add("show");
          hint.style.pointerEvents = "auto";
        }, 700);
      }
    }, 33);
  }

  function startDrop() {
    if (state !== "waiting" || !canSecondClick) return;
    canSecondClick = false;
    hint.classList.remove("show");
    hint.style.pointerEvents = "none";
    state = "dropping";
    dropStart = performance.now();

    // Phát nhạc từ lần click thứ 2 (khi hoa rơi) — lặp lại
    const audio = document.getElementById("audio");
    if (audio) {
      audio.currentTime = 0;
      audio.loop = true; // lặp lại
      const p = audio.play();
      if (p && typeof p.catch === "function") p.catch(function () { });
    }

    setTimeout(() => {
      state = "done";
      const intro = document.querySelector(".love-intro");
      if (intro) {
        intro.style.transition = "opacity 0.8s ease-out";
        intro.style.opacity = "0";
        intro.style.pointerEvents = "none";
      }
      setTimeout(() => {
        const content = document.getElementById("content");
        content.style.display = "flex";
        requestAnimationFrame(() => {
          content.classList.add("show");
          if (typeof window.initKhung === "function") window.initKhung();
        });
      }, 500);
    }, 1800);
  }

  function handleClick(e) {
    if (e) e.stopPropagation();
    if (state === "galaxy") {
      state = "burst";
      startBurst();
    } else if (state === "waiting" && canSecondClick) {
      startDrop();
    }
  }

  function frame(now) {
    if (state === "done") return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Galaxy flower
    let gAlpha = 1;
    if (galaxyFade) gAlpha = Math.max(0, 1 - (now - galaxyFadeStart) / 800);
    if (gAlpha > 0.01) {
      for (let i = 0; i < N; i++) {
        const p = flowerPos(i, now);
        x[i] = p[0]; y[i] = p[1];
      }
      ctx.globalCompositeOperation = "lighter";
      const gr = S * 0.45;
      const gg = ctx.createRadialGradient(CX, CY, 0, CX, CY, gr * 2.2);
      gg.addColorStop(0, `rgba(150,100,255,${0.30 * gAlpha})`);
      gg.addColorStop(1, "rgba(150,100,255,0)");
      ctx.fillStyle = gg;
      ctx.fillRect(CX - gr * 2.2, CY - gr * 2.2, gr * 4.4, gr * 4.4);
      for (let h = 0; h < 3; h++) {
        ctx.fillStyle = COLORS[h] + "1)";
        for (let i = 0; i < N; i++) {
          if (hue[i] !== h) continue;
          ctx.globalAlpha = base[i] * gAlpha;
          ctx.fillRect(x[i], y[i], size[i], size[i]);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    // Bông hoa ảnh (tỏa hoa)
    if (flowers.length > 0) {
      for (let i = 0; i < flowers.length; i++) {
        const f = flowers[i];
        let fx, fy, scale, alpha, rot;
        if (state === "dropping" || state === "done") {
          const p = Math.min(1, (now - dropStart) / 1800);
          const ee = easeIn(p);
          fx = CX + f.tx;
          fy = CY + f.ty + ee * f.drop;
          scale = 1;
          alpha = 1 - p;
          rot = f.rot + ((now - f.start) / 1000) * f.spin;
        } else {
          const p = easeOut(Math.min(1, (now - f.start) / f.dur));
          fx = CX + p * f.tx;
          fy = CY + p * f.ty;
          scale = p;
          alpha = Math.min(1.2 * p, 0.92);
          rot = f.rot + ((now - f.start) / 1000) * f.spin;
        }
        if (alpha <= 0) continue;
        const img = f.img;
        if (!img.complete) continue;
        const w = 380, hh = 800;
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.scale(scale * 0.8, scale * 0.8);
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, -w / 2, -hh / 2, w, hh);
        ctx.restore();
      }
    }

    requestAnimationFrame(frame);
  }

  addEventListener("resize", () => { if (state !== "done") resize(); });
  // Không gắn document click — tránh double-fire làm hoa tự rơi
  canvas.addEventListener("click", handleClick);
  hint.addEventListener("click", handleClick);

  resize();
  build();
  setTimeout(() => {
    hint.textContent = "Nhấn vào màn hình đi";
    hint.classList.add("show");
    hint.style.pointerEvents = "auto";
  }, 1000);
  requestAnimationFrame(frame);
})();


/* ===== KHUNG JS ===== */
window.initKhung = function () {
  if (window._khungStarted) return;
  window._khungStarted = true;

  var $ = function (id) { return document.getElementById(id) };

  var CONFIG = {
    n1: "Anh", n2: "Em",
    date: "2026-10-20",
    t1: "",
    t2: "Happy Woman's Day",
    led: "#ffc878",
    zoom: 1, offX: 0, offY: 0
  };

  var MASK = ["0111001110", "1111111111", "1111111111", "0111111110", "0011111100", "0001111000", "0000110000"];
  var S = 64, COLS = 10, ROWS = 7, photo = "", H, V;

  function edge(x0, y0, x1, y1, sg) {
    var dx = x1 - x0, dy = y1 - y0, nx = -dy * sg, ny = dx * sg;
    function p(t, k) { return (x0 + dx * t + nx * k).toFixed(1) + " " + (y0 + dy * t + ny * k).toFixed(1) }
    return "L" + p(.37, 0) + " C" + p(.37, .10) + " " + p(.28, .12) + " " + p(.28, .20) + " C" + p(.28, .32) + " " + p(.72, .32) + " " + p(.72, .20) + " C" + p(.72, .12) + " " + p(.63, .10) + " " + p(.63, 0) + " L" + x1 + " " + y1 + " ";
  }

  var pieceCount = 0;
  var assembled = false;
  var holdTimer = null;
  var HOLD_MS = 650;

  function countPieces() {
    var n = 0, i, j;
    for (i = 0; i < ROWS; i++) for (j = 0; j < COLS; j++) if (MASK[i][j] === "1") n++;
    return n;
  }

  function showHoldHintBriefly() {
    var hint = $("holdHint");
    if (!hint) return;
    hint.classList.add("show");
    // Hiện ~1.35s rồi mất
    setTimeout(function () {
      hint.classList.remove("show");
    }, 1350);
  }

  function onAssembleDone() {
    if (assembled) return;
    assembled = true;
    showHoldHintBriefly();
  }

  function shuffle() {
    var i, j; H = []; V = [];
    for (i = 0; i <= ROWS; i++) { H[i] = []; for (j = 0; j < COLS; j++) H[i][j] = Math.random() < .5 ? 1 : -1 }
    for (i = 0; i < ROWS; i++) { V[i] = []; for (j = 0; j <= COLS; j++) V[i][j] = Math.random() < .5 ? 1 : -1 }
    assembled = false;
    render();
  }

  function render() {
    var W = COLS * S, Hh = ROWS * S, z = CONFIG.zoom, iw = W * z, ih = Hh * z;
    var ix = (W - iw) / 2 + CONFIG.offX / 100 * W, iy = (Hh - ih) / 2 + CONFIG.offY / 100 * Hh;
    var out = '<defs><pattern id="ph" patternUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + Hh + '">' +
      '<rect width="' + W + '" height="' + Hh + '" fill="#d4506e"/>' +
      (photo ? '<image href="' + photo + '" x="' + ix + '" y="' + iy + '" width="' + iw + '" height="' + ih + '" preserveAspectRatio="xMidYMid slice"/>' : '') +
      '</pattern>' +
      '<linearGradient id="sh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs>';

    pieceCount = countPieces();
    var order = [], cnt = 0, k;
    for (k = 0; k < pieceCount; k++) order.push(k);
    for (k = pieceCount - 1; k > 0; k--) { var r = Math.floor(Math.random() * (k + 1)), t = order[k]; order[k] = order[r]; order[r] = t; }

    for (var i = 0; i < ROWS; i++) for (var j = 0; j < COLS; j++) {
      if (MASK[i][j] !== "1") continue;
      var x = j * S, y = i * S;
      var d = "M" + x + " " + y + " " + edge(x, y, x + S, y, H[i][j]) + edge(x + S, y, x + S, y + S, -V[i][j + 1]) + edge(x + S, y + S, x, y + S, -H[i + 1][j]) + edge(x, y + S, x, y, V[i][j]) + "Z";
      // Khoảng bay ngắn hơn → mượt, ít lag
      var ang = Math.random() * Math.PI * 2, dist = 180 + Math.random() * 160;
      out += '<g class="pc" style="--dx:' + (Math.cos(ang) * dist).toFixed(0) + 'px;--dy:' + (Math.sin(ang) * dist).toFixed(0) + 'px;--rot:' + (Math.random() * 240 - 120).toFixed(0) + 'deg;--i:' + order[cnt++] + '">' +
        '<path d="' + d + '" fill="url(#ph)" stroke="rgba(255,255,255,.92)" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="' + d + '" fill="url(#sh)"/></g>';
    }
    $("pz").setAttribute("viewBox", "-20 -20 " + (W + 40) + " " + (Hh + 40));
    $("pz").innerHTML = out;

    // Thời gian ghép xong ≈ delay max + duration animation
    // delay = (pieceCount-1)*0.035s, anim = 0.55s
    var doneMs = Math.ceil((pieceCount - 1) * 35 + 550 + 80);
    setTimeout(onAssembleDone, doneMs);
  }

  function calendar() {
    var dt = new Date(CONFIG.date + "T00:00:00");
    if (isNaN(dt)) dt = new Date();
    var y = dt.getFullYear(), m = dt.getMonth(), d = dt.getDate();
    $("mon").textContent = dt.toLocaleDateString("en-US", { month: "long" }) + " " + y;
    var first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    var h = "SMTWTFS".split("").map(function (c) { return "<b>" + c + "</b>" }).join("");
    for (var k = 0; k < first; k++) h += "<span></span>";
    for (var n = 1; n <= days; n++) h += '<span' + (n === d ? ' class="on"' : '') + '>' + n + '</span>';
    $("cal").innerHTML = h;
  }

  $("n1").textContent = CONFIG.n1; $("n2").textContent = CONFIG.n2;
  $("t1").textContent = CONFIG.t1; $("t2").textContent = CONFIG.t2;
  document.querySelector(".gold").style.setProperty("--led", CONFIG.led + "b3");

  var el = $("anh"), started = false;
  function start() {
    if (started) return;
    started = true;
    if (el.naturalWidth > 0) photo = el.getAttribute("src");
    shuffle();
  }
  calendar();
  el.addEventListener("load", start);
  el.addEventListener("error", start);
  if (el.complete) start();
  setTimeout(start, 1500);

  // ---- Bấm giữ vào trái tim → chuyển sang churoi.html ----
  var pz = $("pzwrap");
  function clearHold() {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    pz.classList.remove("holding");
  }
  function beginHold(e) {
    if (!assembled) return;
    if (e && e.cancelable) e.preventDefault();
    pz.classList.add("holding");
    clearTimeout(holdTimer);
    holdTimer = setTimeout(function () {
      holdTimer = null;
      // Fade khung → hiện cảnh dải ngân hà (cùng trang, không đổi tab)
      var content = document.getElementById("content");
      if (content) {
        content.style.transition = "opacity .5s ease";
        content.style.opacity = "0";
      }
      setTimeout(function () {
        if (content) {
          content.style.display = "none";
          content.style.pointerEvents = "none";
        }
        if (typeof window.initChuroi === "function") window.initChuroi();
      }, 500);
    }, HOLD_MS);
  }
  pz.addEventListener("mousedown", beginHold);
  pz.addEventListener("touchstart", beginHold, { passive: false });
  pz.addEventListener("mouseup", clearHold);
  pz.addEventListener("mouseleave", clearHold);
  pz.addEventListener("touchend", clearHold);
  pz.addEventListener("touchcancel", clearHold);
  // Bỏ click shuffle — tránh xung đột với bấm giữ
};


/* ===== CẢNH DẢI NGÂN HÀ (từ churoi) — cùng trang ===== */
window.initChuroi = function () {
  if (window._churoiStarted) return;
  window._churoiStarted = true;

  const sceneEl = document.getElementById("galaxy-scene");
  if (!sceneEl) return;
  sceneEl.classList.add("active");
  sceneEl.setAttribute("aria-hidden", "false");

  // Giữ nhạc khi vào chữ xoay / dải ngân hà
  (function ensureMusicPlaying() {
    var a = document.getElementById("audio");
    if (!a) return;
    a.loop = true;
    if (a.paused) {
      var p = a.play();
      if (p && typeof p.catch === "function") p.catch(function () { });
    }
  })();

  const DEFAULTS = {
    anhNut: "images/icon/mewmew.gif",
    titulo: "",
    frases: [
      "Em là đóa hoa đẹp nhất trong lòng anh",
      "Chúc em 20/10 luôn xinh đẹp và rạng rỡ",
      "Cảm ơn em đã xuất hiện trong cuộc đời anh",
      "Mong nụ cười em luôn rạng rỡ như hôm nay",
      "Với anh, em luôn là điều đặc biệt nhất",
      "Anh mong mình sẽ cùng nhau đi qua thật nhiều mùa hoa",
      "20/10 này và cả những ngày sau, anh vẫn thương em",
      "Tặng em một đóa hoa, gửi em cả tấm lòng anh",
      "Mong anh luôn là người khiến em cảm thấy hạnh phúc"
    ],
    fotos: [
      "images/anh/anh1.jpg",
      "images/anh/anh2.jpg",
      "images/anh/anh3.jpg",
      "images/anh/anh4.jpg",
      "images/anh/anh5.jpg",
      "images/anh/anh6.jpg",
      "images/anh/anh7.jpg"
    ],
    // Đường dẫn nhạc: chỉ cần sửa chỗ này (file mp3 của bạn)
    musica: "./images/audio/nhac.mp3"
  };
  const CONFIG = DEFAULTS;

  const titleEl = document.getElementById("main-title");
  if (titleEl) titleEl.textContent = CONFIG.titulo || "";

  const effectImg = document.getElementById("effect-btn-img");
  const effectBtn = document.getElementById("love-letter-btn");
  if (effectBtn) {
    effectBtn.hidden = false; // hiện nút lớp trên cùng
    effectBtn.style.zIndex = "2147483647";
  }
  if (effectImg) {
    effectImg.onerror = function () {
      effectImg.style.display = "none";
      if (effectBtn) effectBtn.classList.add("no-img");
    };
    effectImg.src = CONFIG.anhNut;
    // Nếu đã lỗi cache sẵn
    if (effectImg.complete && effectImg.naturalWidth === 0) {
      effectImg.style.display = "none";
      if (effectBtn) effectBtn.classList.add("no-img");
    }
  }

  // Không gọi audio.load() ở đây — tránh dừng nhạc đang phát từ lúc hoa rơi
  // Đường dẫn nhạc đã set sẵn trong HTML / CONFIG.musica
  const audio = document.getElementById("audio");
  if (audio) {
    const src = audio.querySelector("source");
    if (src && CONFIG.musica && src.getAttribute("src") !== CONFIG.musica) {
      // Chỉ đổi src khi khác (và chưa phát) — không reload khi đang nghe
      if (audio.paused) {
        src.src = CONFIG.musica;
        audio.load();
      }
    }
    audio.loop = true; // luôn lặp suốt toàn bộ trải nghiệm
  }

  let vanishTarget = 0, vanish = 0;
  function playCustomEffect() {
    vanishTarget = vanishTarget ? 0 : 1;
    if (titleEl) titleEl.classList.toggle("fade-out", vanishTarget === 1);
    spawnBurst();
  }
  // Icon mèo / click chữ-ảnh xoay:
  // 1) Chạy hết hiệu ứng kết thúc (burst + chữ/ảnh tỏa biến mất)
  // 2) Sau đó mới hiện quả cầu ảnh
  // 3) Phần sau quả cầu (envelope → thư) giữ nguyên như cricle
  var goingToSphere = false;
  var vanishSpeed = 1 / 240; // mặc định ~4s; khi đi sang cầu sẽ nhanh hơn
  function ensureMusicPlaying() {
    var a = document.getElementById("audio");
    if (!a) return;
    a.loop = true;
    if (a.paused) {
      var p = a.play();
      if (p && typeof p.catch === "function") p.catch(function () { });
    }
  }

  function goToSphere() {
    if (goingToSphere) return;
    if (window.isSphereActive && window.isSphereActive()) return;
    goingToSphere = true;

    // Giữ nhạc khi chuyển sang quả cầu
    ensureMusicPlaying();

    // Hiệu ứng kết thúc: chữ/ảnh tỏa + quả cầu đen giữa biến mất
    vanishTarget = 1;
    vanishSpeed = 1 / 90; // ~1.5s thay vì ~4s
    if (titleEl) titleEl.classList.add("fade-out");
    spawnBurst();

    // Mở quả cầu ảnh ngay khi hiệu ứng gần xong (~1.2s)
    setTimeout(function () {
      ensureMusicPlaying();
      if (typeof window.openSphereGallery === "function") {
        window.openSphereGallery();
      }
    }, 1200);
  }
  if (effectBtn) {
    effectBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      goToSphere();
    });
  }

  if (typeof THREE === "undefined") {
    console.error("Three.js chưa load");
    return;
  }

  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
  // Trong suốt — lộ nền galaxy + hiệu ứng từ cricle (effects-overlay)
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 5000);
  let targetDist = 390, currentDist = 390, rotX = 0.2, rotY = 0;

  (function makeStars(count, spread) {
    count = count || 2000; spread = spread || 3000;
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = spread * (0.3 + Math.random() * 0.7);
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph);
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.5, color: 0xffffff, depthWrite: false })));
  })();

  const coreMat = new THREE.MeshPhongMaterial({ color: 0x0c0618, transparent: true, opacity: 0.92, shininess: 30 });
  const core = new THREE.Mesh(new THREE.SphereGeometry(20, 64, 64), coreMat);
  scene.add(core);
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const pLight = new THREE.PointLight(0xff99cc, 1.2, 800);
  pLight.position.set(0, 40, 80);
  scene.add(pLight);

  const GLOW_BASE = 181;
  function makeGlow(size, c1, c2) {
    size = size || 768; c1 = c1 || "255,153,204"; c2 = c2 || "242,102,181";
    const c = document.createElement("canvas"); c.width = c.height = size;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(size / 2, size / 2, size * 0.05, size / 2, size / 2, size * 0.5);
    grad.addColorStop(0, "rgba(" + c1 + ",0.55)");
    grad.addColorStop(0.5, "rgba(" + c2 + ",0.25)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad; g.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlow(), transparent: true, depthWrite: false }));
  glow.scale.set(GLOW_BASE, GLOW_BASE, 1);
  scene.add(glow);

  function ringTexture(size) {
    size = size || 1024;
    const c = document.createElement("canvas"); c.width = c.height = size;
    const g = c.getContext("2d"); g.translate(size / 2, size / 2);
    const rInner = size * 0.205, rOuter = size * 0.49;
    const grd = g.createRadialGradient(0, 0, rInner, 0, 0, rOuter);
    grd.addColorStop(0.00, "rgba(255,230,242,1)");
    grd.addColorStop(0.30, "rgba(255,153,204,1)");
    grd.addColorStop(0.65, "rgba(230,77,155,0.95)");
    grd.addColorStop(1.00, "rgba(217,54,139,0.85)");
    g.fillStyle = grd;
    g.beginPath(); g.arc(0, 0, rOuter, 0, Math.PI * 2); g.arc(0, 0, rInner, 0, Math.PI * 2, true); g.closePath(); g.fill();
    for (let i = 0; i < 26; i++) {
      const r = rInner + (rOuter - rInner) * (i / 25);
      g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2);
      g.lineWidth = (rOuter - rInner) / 26 * (0.55 + Math.random() * 0.35);
      g.strokeStyle = (i % 3 === 0) ? "rgba(100,20,60,0.20)" : "rgba(240,225,255,0.16)";
      g.stroke();
    }
    return new THREE.CanvasTexture(c);
  }
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(21, 58, 160),
    new THREE.MeshBasicMaterial({ map: ringTexture(), transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, opacity: 1 })
  );
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  const FLOWER_PARTICLES = 2400, FLOWER_R = 74;
  const flowerPositions = new Float32Array(FLOWER_PARTICLES * 3);
  const flowerColors = new Float32Array(FLOWER_PARTICLES * 3);
  const flowerCenterColor = new THREE.Color(0xf5e9ff);
  const flowerPetalColorA = new THREE.Color(0xcdaaff);
  const flowerPetalColorB = new THREE.Color(0x8b4df0);
  function rosaXY(R) {
    if (Math.random() < 1 / 9) {
      const a = Math.random() * Math.PI * 2, rr = 0.34 * R * Math.sqrt(Math.random());
      return [Math.cos(a) * rr, Math.sin(a) * rr, true];
    }
    for (let intento = 0; intento < 40; intento++) {
      const px = (Math.random() * 2 - 1) * R, py = (Math.random() * 2 - 1) * R;
      const rad = Math.sqrt(px * px + py * py);
      if (rad <= R * Math.abs(Math.cos(2.5 * Math.atan2(py, px)))) return [px, py, false];
    }
    return [0, 0, true];
  }
  for (let i = 0; i < FLOWER_PARTICLES; i++) {
    const rp = rosaXY(FLOWER_R);
    const px = rp[0], py = rp[1], esCentro = rp[2];
    const rad = Math.sqrt(px * px + py * py) / FLOWER_R;
    flowerPositions[i * 3] = px; flowerPositions[i * 3 + 1] = py;
    flowerPositions[i * 3 + 2] = (1 - rad) * 5.5 + (Math.random() - 0.5) * 4;
    const col = esCentro ? flowerCenterColor : flowerPetalColorA.clone().lerp(flowerPetalColorB, Math.min(1, rad));
    flowerColors[i * 3] = col.r; flowerColors[i * 3 + 1] = col.g; flowerColors[i * 3 + 2] = col.b;
  }
  const SPARKLE_PARTICLES = 700;
  const sparklePositions = new Float32Array(SPARKLE_PARTICLES * 3);
  for (let i = 0; i < SPARKLE_PARTICLES; i++) {
    const rp = rosaXY(FLOWER_R * 0.92);
    sparklePositions[i * 3] = rp[0]; sparklePositions[i * 3 + 1] = rp[1];
    sparklePositions[i * 3 + 2] = 6 + (Math.random() - 0.5) * 3;
  }
  function makeDotTexture(size) {
    size = size || 64;
    const c = document.createElement("canvas"); c.width = c.height = size;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.7)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad; g.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }
  const dotTex = makeDotTexture();
  const flowerGeo = new THREE.BufferGeometry();
  flowerGeo.setAttribute("position", new THREE.BufferAttribute(flowerPositions, 3));
  flowerGeo.setAttribute("color", new THREE.BufferAttribute(flowerColors, 3));
  const flowerMat = new THREE.PointsMaterial({
    size: 6.4, map: dotTex, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, vertexColors: (THREE.VertexColors !== undefined ? THREE.VertexColors : true), sizeAttenuation: true
  });
  const flowerPoints = new THREE.Points(flowerGeo, flowerMat);
  const sparkleGeo = new THREE.BufferGeometry();
  sparkleGeo.setAttribute("position", new THREE.BufferAttribute(sparklePositions, 3));
  const sparkleMat = new THREE.PointsMaterial({
    size: 3.2, map: dotTex, color: 0xffffff, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, sizeAttenuation: true, opacity: 0.9
  });
  const sparklePoints = new THREE.Points(sparkleGeo, sparkleMat);
  const flowerGroup = new THREE.Group();
  flowerGroup.add(flowerPoints); flowerGroup.add(sparklePoints);
  flowerGroup.position.set(0, 118, 0);
  scene.add(flowerGroup);
  const flowerHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeGlow(512, "255,153,204", "242,102,181"), transparent: true, depthWrite: false, opacity: 0.55
  }));
  flowerHalo.scale.set(260, 260, 1);
  flowerGroup.add(flowerHalo);

  const frasesBase = CONFIG.frases;
  const WORD_SLOTS = 150;
  const WORDS = Array.from({ length: WORD_SLOTS }, function (_, i) { return frasesBase[i % frasesBase.length]; });
  function makeTextTexture(text, color) {
    const c = document.createElement("canvas"); c.width = 512; c.height = 128;
    const ctx = c.getContext("2d"); ctx.clearRect(0, 0, c.width, c.height);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff"; ctx.shadowColor = color; ctx.shadowBlur = 30;
    const maxWidth = c.width - 48;
    let fontSize = 60;
    ctx.font = fontSize + "px 'Mali', cursive";
    while (ctx.measureText(text).width > maxWidth && fontSize > 24) {
      fontSize -= 2;
      ctx.font = fontSize + "px 'Mali', cursive";
    }
    ctx.fillText(text, c.width / 2, c.height / 2);
    return new THREE.CanvasTexture(c);
  }
  const COLORS = ["#FF99CC", "#FFC2E0", "#F266B5", "#FF85C2", "#FFD6EB", "#F266B5", "#FFC2E0", "#E64D9B", "#FFADD6", "#FFB8DC"];
  const textGroup = new THREE.Group(); scene.add(textGroup);
  function buildWords() {
    for (let i = 0; i < WORDS.length; i++) {
      const tex = makeTextTexture(WORDS[i], COLORS[i % COLORS.length]);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(78, 25, 1);
      const phi = Math.acos(2 * Math.random() - 1), theta = Math.random() * Math.PI * 2;
      const r = 150 + Math.random() * 120;
      sp.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
      sp.userData = { phi: phi, theta: theta, radius: r, speed: 0.001 + Math.random() * 0.001 };
      textGroup.add(sp);
    }
  }
  if (document.fonts && document.fonts.load) {
    document.fonts.load("40px 'Mali'").catch(function () { }).then(buildWords);
  } else {
    setTimeout(buildWords, 200);
  }

  const fotosBase = CONFIG.fotos;
  function makePhotoSprite(url, size) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(size, size, 1);
    const img = new Image();
    img.onload = function () {
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      tex.needsUpdate = true;
      const aspect = img.naturalWidth / img.naturalHeight;
      const aX = Math.min(1, aspect), aY = Math.min(1, 1 / aspect);
      sp.scale.set(size * aX, size * aY, 1);
    };
    img.src = url;
    return sp;
  }
  const FOTO_ESCALA = (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || innerWidth < 768) ? 1.35 : 1;
  const photoGroup = new THREE.Group(); scene.add(photoGroup);
  for (let i = 0; i < 42; i++) {
    const url = fotosBase[i % fotosBase.length];
    const size = (28 + Math.random() * 20) * FOTO_ESCALA;
    const sp = makePhotoSprite(url, size);
    const phi = Math.acos(2 * Math.random() - 1), theta = Math.random() * Math.PI * 2;
    const r = 140 + Math.random() * 170;
    sp.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    sp.userData = { phi: phi, theta: theta, radius: r, speed: 0.0006 + Math.random() * 0.0012 };
    photoGroup.add(sp);
  }

  const bursts = [];
  const BURST_COLORS = [0xffe6f2, 0xff99cc, 0xcdaaff, 0xf266b5, 0x8b4df0];
  function spawnBurst() {
    const N = 700, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), vel = [];
    for (let i = 0; i < N; i++) {
      const phi = Math.acos(2 * Math.random() - 1), th = Math.random() * Math.PI * 2, sp = 0.8 + Math.random() * 4.2;
      vel.push(sp * Math.sin(phi) * Math.cos(th), sp * Math.cos(phi), sp * Math.sin(phi) * Math.sin(th));
      const c = new THREE.Color(BURST_COLORS[i % BURST_COLORS.length]);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({
      size: 5, map: dotTex, vertexColors: (THREE.VertexColors !== undefined ? THREE.VertexColors : true), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const pts = new THREE.Points(g, m); scene.add(pts);
    const wave = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlow(512, "255,230,242", "242,102,181"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    wave.scale.set(10, 10, 1); scene.add(wave);
    bursts.push({ pts: pts, wave: wave, vel: vel, life: 1 });
  }
  function updateBursts() {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i]; b.life -= 0.007;
      if (b.life <= 0) {
        scene.remove(b.pts); scene.remove(b.wave);
        b.pts.geometry.dispose(); b.pts.material.dispose(); b.wave.material.dispose();
        bursts.splice(i, 1); continue;
      }
      const p = b.pts.geometry.attributes.position.array;
      for (let k = 0; k < p.length; k++) p[k] += b.vel[k];
      b.pts.geometry.attributes.position.needsUpdate = true;
      b.pts.material.opacity = b.life;
      const w = (1 - b.life) * 900; b.wave.scale.set(w, w, 1); b.wave.material.opacity = b.life * 0.8;
    }
  }

  let isPointerDown = false, startX = 0, startY = 0;
  let targetRotX = rotX, targetRotY = rotY, velX = 0, velY = 0;
  let pointerMoved = false;
  let downClientX = 0, downClientY = 0;

  function onDown(e) {
    isPointerDown = true; velX = 0; velY = 0; pointerMoved = false;
    const t = e.touches ? e.touches[0] : e;
    startX = t.clientX; startY = t.clientY;
    downClientX = t.clientX; downClientY = t.clientY;
  }
  function onMove(e) {
    if (!isPointerDown) return;
    if (e.touches && e.touches.length > 1) return;
    const t = e.touches ? e.touches[0] : e;
    const dx = t.clientX - startX, dy = t.clientY - startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      pointerMoved = true;
      const sensX = (Math.PI * 1.5) / innerWidth, sensY = (Math.PI * 0.8) / innerHeight;
      velY = -dx * sensX; velX = dy * sensY;
      targetRotY += velY; targetRotX = Math.max(-1.25, Math.min(1.25, targetRotX + velX));
      startX = t.clientX; startY = t.clientY;
    }
  }
  function onUp(e) {
    if (!isPointerDown) return;
    isPointerDown = false;
    // Không chuyển sang quả cầu khi bấm chữ/ảnh xoay —
    // chỉ icon mèo (love-letter-btn) mới gọi goToSphere()
  }

  const domEl = renderer.domElement;
  domEl.addEventListener("mousedown", onDown);
  domEl.addEventListener("mousemove", onMove);
  addEventListener("mouseup", onUp);
  domEl.addEventListener("touchstart", onDown, { passive: true });
  domEl.addEventListener("touchmove", onMove, { passive: true });
  addEventListener("touchend", onUp, { passive: true });
  addEventListener("wheel", function (e) {
    targetDist += e.deltaY * 0.25;
    targetDist = Math.max(160, Math.min(600, targetDist));
  }, { passive: true });

  let pinchDist = null;
  function getPinchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX, dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }
  addEventListener("touchstart", function (e) {
    if (e.touches.length === 2) { pinchDist = getPinchDist(e.touches); isPointerDown = false; }
  }, { passive: true });
  addEventListener("touchmove", function (e) {
    if (e.touches.length === 2) {
      const newDist = getPinchDist(e.touches);
      if (pinchDist !== null) {
        targetDist += (pinchDist - newDist) * 0.85;
        targetDist = Math.max(160, Math.min(600, targetDist));
      }
      pinchDist = newDist;
    } else if (pinchDist !== null) {
      pinchDist = null;
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX; startY = e.touches[0].clientY; isPointerDown = true;
      }
    }
  }, { passive: true });
  addEventListener("touchend", function (e) {
    if (e.touches.length < 2) pinchDist = null;
  }, { passive: true });

  addEventListener("resize", function () {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });

  let t = 0;
  function tick() {
    requestAnimationFrame(tick); t += 0.01;
    vanish += Math.max(-vanishSpeed, Math.min(vanishSpeed, vanishTarget - vanish));
    const e = vanish * vanish * (3 - 2 * vanish);
    const inv = 1 - e;
    const expand = 1 + e * 3.5;

    updateBursts();
    flowerGroup.quaternion.copy(camera.quaternion);
    flowerPoints.rotation.z += 0.0025;
    sparklePoints.rotation.z -= 0.004;

    const flowerBreath = 1 + 0.05 * Math.sin(t * 0.6);
    const fk = flowerBreath * expand;
    flowerGroup.scale.set(fk, fk, 1);
    flowerPoints.rotation.z += e * 0.12; sparklePoints.rotation.z -= e * 0.2;
    flowerMat.opacity = (0.85 + 0.15 * Math.sin(t * 1.3)) * inv;
    sparkleMat.opacity = (0.65 + 0.35 * Math.sin(t * 2.4)) * inv;
    flowerHalo.material.opacity = (0.45 + 0.15 * Math.sin(t * 0.6)) * inv;

    ring.rotation.z += 0.003 + e * 0.2;
    ring.scale.setScalar(expand);
    ring.material.opacity = inv;

    const gk = GLOW_BASE * (1 + Math.sin(t * 0.4) * 0.03) * expand;
    glow.scale.set(gk, gk, 1);
    // Glow + quả cầu đen giữa cũng mờ dần khi tỏa
    if (glow.material) glow.material.opacity = inv * 0.9;

    const s = 1.0 + 0.05 * Math.sin(t * 3);
    // Co nhỏ + mờ dần → biến mất (không để quả cầu đen phình to)
    const cs = s * (1 - e * 0.95);
    core.scale.set(cs, cs, cs);
    coreMat.opacity = 0.92 * inv;
    core.visible = inv > 0.02;

    textGroup.children.forEach(function (sp) {
      sp.material.opacity = (0.8 + 0.2 * Math.sin(t * 2)) * inv;
      sp.userData.theta += sp.userData.speed * (1 + e * 12);
      const R = sp.userData.radius * expand;
      sp.position.x = R * Math.sin(sp.userData.phi) * Math.cos(sp.userData.theta);
      sp.position.y = R * Math.cos(sp.userData.phi);
      sp.position.z = R * Math.sin(sp.userData.phi) * Math.sin(sp.userData.theta);
    });
    photoGroup.children.forEach(function (sp) {
      sp.material.opacity = (0.85 + 0.15 * Math.sin(t * 2 + sp.userData.radius)) * inv;
      sp.userData.theta += sp.userData.speed * (1 + e * 12);
      const R = sp.userData.radius * expand;
      sp.position.x = R * Math.sin(sp.userData.phi) * Math.cos(sp.userData.theta);
      sp.position.y = R * Math.cos(sp.userData.phi);
      sp.position.z = R * Math.sin(sp.userData.phi) * Math.sin(sp.userData.theta);
    });

    if (!isPointerDown) {
      velX *= 0.88; velY *= 0.88;
      targetRotX = Math.max(-1.25, Math.min(1.25, targetRotX + velX));
      targetRotY += velY;
    }
    rotX += (targetRotX - rotX) * 0.12;
    rotY += (targetRotY - rotY) * 0.12;
    currentDist += (targetDist - currentDist) * 0.06;
    const cx = Math.cos(rotX), sx = Math.sin(rotX);
    const cy = Math.cos(rotY), sy = Math.sin(rotY);
    camera.position.set(currentDist * sy * cx, currentDist * sx, currentDist * cy * cx);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  tick();

  // Nhạc chỉ phát khi click lần 2 (hoa rơi) — xem startDrop() ở trên
};
