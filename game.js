(() => {
  const c = document.querySelector("#game"),
    g = c.getContext("2d"),
    $ = (s) => document.querySelector(s),
    ui = {
      hp: $("#hp"),
      xp: $("#xp"),
      phase: $("#phaseLabel"),
      beat: $("#beatText"),
      hint: $("#hint"),
      meter: $("#meterFill"),
      start: $("#startScreen"),
      upgrade: $("#upgradeScreen"),
      upgradeEyebrow: $("#upgradeEyebrow"),
      upgradeTitle: $("#upgradeTitle"),
      choices: [...document.querySelectorAll(".upgrade-choice")],
      over: $("#gameOverScreen"),
      result: $("#resultText"),
      devBar: $("#devBar"),
      devToggle: $("#devToggle"),
      devSpeed: $("#devSpeed"),
      devPick: $("#devPickScreen"),
      devPickTitle: $("#devPickTitle"),
      devPickOptions: $("#devPickOptions"),
      soundToggle: $("#soundToggle"),
      soundPanel: $("#soundPanel"),
      volumeRange: $("#volumeRange"),
      volumeValue: $("#volumeValue"),
      combo: $("#comboToast"),
    },
    glyph = {
      pawn: "♟",
      knight: "♞",
      bishop: "♝",
      rook: "♜",
      queen: "♛",
      king: "♚",
    },
    enemyGlyph = {
      pawn: "♟",
      knight: "♞",
      bishop: "♝",
      rook: "♜",
      queen: "♛",
      king: "♚",
    },
    S = {
      running: false,
      dev: false,
      devSpeed: 1,
      phase: "enemy",
      elapsed: 0,
      beat: 1.65,
      flash: 0,
      wave: 0,
      kills: 0,
      chain: 0,
      camera: { x: 0, y: 0 },
      player: null,
      enemies: [],
      moves: [],
      particles: [],
      effects: [],
      trail: [],
      enemyTrail: [],
      upgradeOptions: [],
      upgradeMode: "",
    };
  let W = 0,
    H = 0,
    D = 1,
    last = 0;
  const K = (x, y) => x + "," + y,
    dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y),
    knightCorner = (a, b) =>
      Math.abs(a.x - b.x) === 2 && Math.abs(a.y - b.y) === 1
        ? Math.abs(a.x - b.x) > Math.abs(a.y - b.y)
          ? { x: b.x, y: a.y }
          : { x: a.x, y: b.y }
        : null;
  const savedVolumeRaw = localStorage.getItem("checkbeat-volume-v5");
  const savedVolume = savedVolumeRaw === null ? NaN : Number(savedVolumeRaw);
  const audio = { ctx: null, master: null, timer: null, step: 0, volume: Number.isFinite(savedVolume) ? Math.max(0, Math.min(2, savedVolume / 50)) : 2 };
  function setVolume(value) {
    let slider = Math.max(0, Math.min(100, value));
    audio.volume = slider / 50;
    localStorage.setItem("checkbeat-volume-v5", Math.round(slider));
    ui.volumeRange.value = Math.round(slider);
    ui.volumeValue.textContent = Math.round(slider) + "%";
    if (audio.master) audio.master.gain.setTargetAtTime(audio.volume, audio.ctx.currentTime, 0.025);
  }
  function audioReady() {
    if (!window.AudioContext && !window.webkitAudioContext) return null;
    if (!audio.ctx) {
      audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
      audio.master = audio.ctx.createGain();
      let limiter = audio.ctx.createDynamicsCompressor();
      limiter.threshold.value = -10;
      limiter.knee.value = 8;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.16;
      audio.master.gain.value = audio.volume;
      audio.master.connect(limiter).connect(audio.ctx.destination);
    }
    if (audio.ctx.state === "suspended") audio.ctx.resume();
    return audio.ctx;
  }
  function tone(freq, duration, type = "sine", volume = 0.2, slide = 1) {
    let ctx = audioReady();
    if (!ctx) return;
    let osc = ctx.createOscillator(),
      gain = ctx.createGain(),
      now = ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(audio.master);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }
  function noise(duration = 0.08, volume = 0.08) {
    let ctx = audioReady();
    if (!ctx) return;
    let buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate),
      data = buffer.getChannelData(0),
      source = ctx.createBufferSource(),
      gain = ctx.createGain();
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain).connect(audio.master);
    source.start();
  }
  function sfx(kind) {
    if (!audio.ctx) return;
    if (kind === "move") tone(330, 0.07, "triangle", 0.13, 1.35);
    if (kind === "capture") { tone(180, 0.12, "sawtooth", 0.22, 0.55); tone(620, 0.09, "square", 0.11, 0.72); noise(0.07, 0.12); }
    if (kind === "enemy") { tone(95, 0.11, "square", 0.1, 0.78); noise(0.045, 0.04); }
    if (kind === "upgrade") { tone(440, 0.13, "triangle", 0.16, 1.5); tone(660, 0.23, "sine", 0.13, 1.5); }
    if (kind === "death") { tone(180, 0.6, "sawtooth", 0.25, 0.18); noise(0.28, 0.14); }
    if (kind === "shockwave") tone(105, 0.2, "sawtooth", 0.12, 0.45);
    if (kind === "magnet") tone(250, 0.2, "sine", 0.1, 1.9);
    if (kind === "echo") tone(720, 0.16, "square", 0.09, 0.55);
    if (kind === "spark") tone(820, 0.09, "triangle", 0.09, 1.6);
  }
  function startBgm() {
    audioReady();
    if (!audio.ctx || audio.timer) return;
    let notes = [110, 0, 164.81, 196, 220, 196, 164.81, 0, 130.81, 0, 196, 246.94, 261.63, 246.94, 196, 0];
    let loop = () => {
      if (!S.running) { audio.timer = null; return; }
      let n = notes[audio.step % notes.length];
      if (n) tone(n * 2, 0.16, "triangle", 0.055, 0.995);
      if (audio.step % 4 === 0) tone(n || 110, 0.22, "sine", 0.08, 0.98);
      audio.step++;
      audio.timer = setTimeout(loop, 190);
    };
    loop();
  }
  function resize() {
    D = Math.min(devicePixelRatio || 1, 2);
    let r = c.getBoundingClientRect(),
      gap = matchMedia("(max-width:560px)").matches
        ? Math.max(0, Math.min(24, (screen.width - r.width) / 2))
        : 0;
    document.documentElement.style.setProperty(
      "--mobile-center-offset",
      gap + "px",
    );
    W = r.width;
    H = r.height;
    c.width = W * D;
    c.height = H * D;
    g.setTransform(D, 0, 0, D, 0, 0);
  }
  addEventListener("resize", resize);
  resize();
  const TRAITS = [
    {
      id: "shockwave",
      icon: "✦",
      name: "IMPACT CORE",
      desc: "착지 시 주변 1칸 충격파",
    },
    {
      id: "longStride",
      icon: "↔",
      name: "LONG STRIDE",
      desc: "직선·대각 이동 거리 +2",
    },
    {
      id: "royalStep",
      icon: "♚",
      name: "ROYAL STEP",
      desc: "모든 방향으로 2칸 이동 가능",
    },
    {
      id: "magnet",
      icon: "✹",
      name: "ARC MAGNET",
      desc: "처치 시 주변 2칸의 적도 타격",
    },
    {
      id: "chainSpark",
      icon: "⚡",
      name: "CHAIN SPARK",
      desc: "연속 처치 시 XP를 추가 획득",
    },
    {
      id: "echoBlade",
      icon: "➤",
      name: "ECHO BLADE",
      desc: "처치 시 이동 방향의 가장 가까운 적 관통",
    },
  ];
  function reset() {
    S.phase = "enemy";
    S.elapsed = S.flash = S.wave = S.kills = S.death = S.chain = 0;
    S.devSpeed = 1;
    S.beat = 0.45;
    S.grace = 3;
    S.camera = { x: 0, y: 0 };
    S.particles = [];
    S.effects = [];
    S.trail = [];
    S.enemyTrail = [];
    S.upgradeOptions = [];
    S.player = { x: 0, y: 0, hp: 5, xp: 0, rank: 0, piece: "pawn", traits: [] };
    S.enemies = [
      { x: 0, y: -6, type: "pawn", face: { x: 0, y: 1 } },
      { x: -2, y: -7, type: "pawn", face: { x: 0, y: 1 } },
    ];
    moves();
    hud();
  }
  function hud() {
    ui.hp.textContent = S.wave;
    ui.xp.textContent = S.player.xp + " / " + (3 + S.player.rank * 2);
  }
  function showCombo(chain) {
    clearTimeout(S.comboTimer);
    ui.combo.textContent = "CHAIN × " + chain;
    ui.combo.classList.remove("show");
    void ui.combo.offsetWidth;
    ui.combo.classList.add("show");
    S.comboTimer = setTimeout(() => ui.combo.classList.remove("show"), 980);
  }
  function dirs(piece) {
    let p = S.player,
      king = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ],
      base;
    if (piece === "pawn" || piece === "king") base = king;
    else if (piece === "knight")
      base = [
        [1, 2],
        [2, 1],
        [2, -1],
        [1, -2],
        [-1, -2],
        [-2, -1],
        [-2, 1],
        [-1, 2],
      ];
    else {
      let b =
        piece === "bishop"
          ? [
              [1, 1],
              [1, -1],
              [-1, 1],
              [-1, -1],
            ]
          : piece === "queen"
            ? king
            : [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
              ],
        range = p.traits?.includes("longStride") ? 5 : 3;
      base = b.flatMap(([x, y]) =>
        Array.from({ length: range }, (_, i) => [x * (i + 1), y * (i + 1)]),
      );
    }
    if (!p.traits?.includes("royalStep")) return base;
    let royal = king.flatMap(([x, y]) => [[x, y], [x * 2, y * 2]]);
    return [...base, ...royal].filter(([x, y], i, all) => all.findIndex(([a, b]) => a === x && b === y) === i);
  }
  function moves() {
    let p = S.player;
    S.moves = dirs(p.piece).map(([x, y]) => ({ x: p.x + x, y: p.y + y }));
  }
  function burst(x, y, color = "#53f0e4", n = 12) {
    for (let i = 0; i < n; i++) {
      let a = Math.random() * Math.PI * 2,
        v = 0.18 + Math.random() * 0.7;
      S.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 0.35 + Math.random() * 0.45,
        color,
        size: 4 + Math.random() * 3,
      });
    }
  }
  function traitFx(type, x, y, extra = {}) {
    S.effects.push({ type, x, y, life: extra.life || 0.42, max: extra.life || 0.42, ...extra });
    if (["shockwave", "magnet", "echo", "spark"].includes(type)) sfx(type);
  }
  function captureBurst(x, y, combo) {
    let colors = [
        "#ff4d6d",
        "#ff9f43",
        "#ffd166",
        "#6ee7b7",
        "#53f0e4",
        "#758bff",
        "#d66efd",
      ],
      color = colors[(combo - 1) % 7];
    for (let i = 0; i < 26; i++) {
      let a = Math.random() * Math.PI * 2,
        v = 2.6 + Math.random() * 5.7;
      S.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 0.3 + Math.random() * 0.32,
        color,
        size: 3 + Math.random() * 7,
        drag: 0.95,
        metal: true,
        spin: (Math.random() - 0.5) * 20,
        angle: Math.random() * 6.28,
      });
    }
  }
  function deathBurst(x, y) {
    for (let i = 0; i < 34; i++) {
      let a = Math.random() * Math.PI * 2,
        v = 0.6 + Math.random() * 2.3;
      S.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 0.72 + Math.random() * 0.55,
        color: i % 3 ? "#ff315d" : "#fff1f5",
        size: 7 + Math.random() * 13,
        shard: true,
        spin: (Math.random() - 0.5) * 18,
        angle: Math.random() * 6.28,
      });
    }
  }
  function spawn() {
    let p = S.player,
      r = 7 + Math.min(S.wave, 8),
      side = Math.floor(Math.random() * 4),
      x = p.x,
      y = p.y,
      face = { x: 0, y: 1 };
    if (side === 0) {
      x += Math.floor(Math.random() * (r * 2 + 1)) - r;
      y -= r;
      face = { x: 0, y: 1 };
    }
    if (side === 1) {
      x += r;
      y += Math.floor(Math.random() * (r * 2 + 1)) - r;
      face = { x: -1, y: 0 };
    }
    if (side === 2) {
      x += Math.floor(Math.random() * (r * 2 + 1)) - r;
      y += r;
      face = { x: 0, y: -1 };
    }
    if (side === 3) {
      x -= r;
      y += Math.floor(Math.random() * (r * 2 + 1)) - r;
      face = { x: 1, y: 0 };
    }
    let ts =
      p.rank === 0
        ? ["pawn"]
        : p.rank === 1
          ? ["pawn", "pawn", "pawn", "knight"]
          : p.rank === 2
            ? ["pawn", "pawn", "knight", "knight", "bishop", "rook"]
            : p.rank === 3
              ? ["pawn", "knight", "rook", "bishop", "bishop", "king"]
              : ["pawn", "knight", "rook", "bishop", "king", "queen"];
    S.enemies.push({
      x,
      y,
      type: ts[Math.floor(Math.random() * ts.length)],
      face,
    });
  }
  function toward(e) {
    let p = S.player,
      occupied = new Set(
        S.enemies.filter((o) => o !== e).map((o) => K(o.x, o.y)),
      ),
      opts = [],
      king = [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
      ],
      slide = (ds) => {
        for (let [dx, dy] of ds) {
          for (let n = 1; n <= 3; n++) {
            let q = { x: e.x + dx * n, y: e.y + dy * n };
            if (occupied.has(K(q.x, q.y))) break;
            opts.push(q);
          }
        }
      };
    if (e.type === "knight")
      opts = [
        [1, 2],
        [2, 1],
        [2, -1],
        [1, -2],
        [-1, -2],
        [-2, -1],
        [-2, 1],
        [-1, 2],
      ].map(([x, y]) => ({ x: e.x + x, y: e.y + y }));
    else if (e.type === "bishop")
      slide([
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]);
    else if (e.type === "rook")
      slide([
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]);
    else if (e.type === "queen") slide(king);
    else
      opts = king
        .map(([x, y]) => ({ x: e.x + x, y: e.y + y }))
        .filter((q) => !occupied.has(K(q.x, q.y)));
    return (
      opts.sort((a, b) => dist(a, p) - dist(b, p))[0] || { x: e.x, y: e.y }
    );
  }
  function enemyBeat() {
    S.wave++;
    S.trail = [];
    S.enemyTrail = [];
    S.chain = 0;
    sfx("enemy");
    let used = new Set(),
      captured = false;
    S.enemies
      .sort((a, b) => dist(a, S.player) - dist(b, S.player))
      .forEach((e) => {
        let from = { x: e.x, y: e.y },
          n = toward(e);
        if (n.x === S.player.x && n.y === S.player.y) {
          captured = true;
          burst(e.x, e.y, "#ff5577", 28);
          return;
        }
        if (!used.has(K(n.x, n.y))) {
          e.x = n.x;
          e.y = n.y;
          used.add(K(e.x, e.y));
          if (from.x !== e.x || from.y !== e.y)
            S.enemyTrail.push({ x1: from.x, y1: from.y, x2: e.x, y2: e.y, via: e.type === "knight" ? knightCorner(from, e) : null });
        }
      });
    if (captured && S.grace <= 0) return die();
    S.grace = Math.max(0, S.grace - 1);
    for (let i = 0; i < (S.wave % 4 === 0 ? 2 : 1); i++) spawn();
    hud();
    S.phase = "player";
    S.flash = 1;
    moves();
    ui.phase.textContent = "YOUR MOVE";
    ui.beat.textContent = "MOVE NOW";
    ui.hint.textContent = S.grace
      ? "준비 박자 " + S.grace + " — 아직은 잡히지 않습니다."
      : "빛나는 칸을 한 번 선택하세요 — 적을 밟으면 XP를 얻습니다.";
  }
  function playerMove(m) {
    if (S.phase !== "player") return;
    let p = S.player,
      from = { x: p.x, y: p.y },
      gained = 0,
      combo = S.chain + 1,
      dx = Math.sign(m.x - from.x),
      dy = Math.sign(m.y - from.y),
      caught =
        p.piece === "rook" && (dx === 0 || dy === 0)
          ? S.enemies.filter((e) =>
              dx === 0
                ? e.x === from.x &&
                  Math.min(from.y, m.y) <= e.y &&
                  e.y <= Math.max(from.y, m.y)
                : e.y === from.y &&
                  Math.min(from.x, m.x) <= e.x &&
                  e.x <= Math.max(from.x, m.x),
            )
          : S.enemies.filter((e) => e.x === m.x && e.y === m.y);
    p.x = m.x;
    p.y = m.y;
    sfx("move");
    S.trail.push({ x1: from.x, y1: from.y, x2: p.x, y2: p.y, via: p.piece === "knight" ? knightCorner(from, p) : null, life: 1 });
    if (p.traits.includes("longStride") && (Math.abs(m.x - from.x) > 1 || Math.abs(m.y - from.y) > 1))
      traitFx("stride", p.x, p.y, { dx, dy });
    if (p.traits.includes("royalStep")) traitFx("royal", p.x, p.y);
    S.enemies = S.enemies.filter((e) => !caught.includes(e));
    if (caught.length) {
      gained += caught.length;
      p.xp += caught.length;
      S.kills += caught.length;
      caught.forEach((e) => captureBurst(e.x, e.y, combo));
    }
    if (p.piece === "knight" || p.traits.includes("shockwave")) {
      let v = S.enemies.filter(
          (e) => Math.max(Math.abs(e.x - p.x), Math.abs(e.y - p.y)) <= 1,
        );
      S.enemies = S.enemies.filter((e) => !v.includes(e));
      gained += v.length;
      p.xp += v.length;
      S.kills += v.length;
      v.forEach((e) => captureBurst(e.x, e.y, combo));
      burst(p.x, p.y, "#c274ff", 20);
      traitFx("shockwave", p.x, p.y);
    }
    if (p.piece === "bishop" && caught.length) {
      let v = S.enemies.filter((e) => {
        let x = e.x - p.x,
          y = e.y - p.y;
        return Math.abs(x) === Math.abs(y);
      });
      S.enemies = S.enemies.filter((e) => !v.includes(e));
      gained += v.length;
      p.xp += v.length;
      S.kills += v.length;
      v.forEach((e) => captureBurst(e.x, e.y, combo));
    }
    if (gained && p.traits.includes("magnet")) {
      let v = S.enemies.filter(
        (e) => Math.max(Math.abs(e.x - p.x), Math.abs(e.y - p.y)) <= 2,
      );
      S.enemies = S.enemies.filter((e) => !v.includes(e));
      gained += v.length;
      p.xp += v.length;
      S.kills += v.length;
      v.forEach((e) => captureBurst(e.x, e.y, combo));
      traitFx("magnet", p.x, p.y);
    }
    if (gained && p.traits.includes("echoBlade")) {
      let v = S.enemies
        .filter((e) => {
          let x = e.x - p.x,
            y = e.y - p.y;
          if (dx === 0) return x === 0 && y * dy > 0;
          if (dy === 0) return y === 0 && x * dx > 0;
          return x * dy === y * dx && x * dx > 0 && y * dy > 0;
        })
        .sort((a, b) => dist(a, p) - dist(b, p))
        .slice(0, 1);
      S.enemies = S.enemies.filter((e) => !v.includes(e));
      gained += v.length;
      p.xp += v.length;
      S.kills += v.length;
      v.forEach((e) => captureBurst(e.x, e.y, combo));
      v.forEach((e) => traitFx("echo", p.x, p.y, { x2: e.x, y2: e.y }));
    }
    if (gained && p.traits.includes("chainSpark")) {
      p.xp++;
      traitFx("spark", p.x, p.y);
    }
    if (gained) sfx("capture");
    hud();
    let reroll = (p.rank + 1) % 5 === 0;
    if (
      p.xp >= 3 + p.rank * 2 &&
      (p.rank === 0 || reroll || p.traits.length < TRAITS.length)
    ) {
      openUpgrade(true);
      return;
    }
    if (gained) {
      S.chain++;
      showCombo(S.chain);
      S.flash = 1;
      moves();
      ui.hint.textContent =
        "연속 수 ×" + S.chain + "! 한 번 더 움직일 수 있습니다.";
      return;
    }
    S.phase = "enemy";
    S.elapsed = 0;
    ui.phase.textContent = "ENEMY BEAT";
    ui.beat.textContent = "CHARGING";
    ui.hint.textContent = "다음 박자에 모든 적이 동시에 움직입니다.";
  }
  function chooseRandom(list, n) {
    return [...list].sort(() => Math.random() - 0.5).slice(0, n);
  }
  function openUpgrade(continueTurn = false) {
    let p = S.player,
      pieces = ["knight", "bishop", "rook", "queen", "king"],
      reroll = p.rank > 0 && (p.rank + 1) % 5 === 0;
    if (p.rank === 0) {
      let piece = pieces[Math.floor(Math.random() * pieces.length)];
      S.upgradeMode = "piece";
      S.upgradeOptions = [piece];
      ui.upgradeEyebrow.textContent = "DESTINY PROMOTION";
      ui.upgradeTitle.textContent = "운명의 기물을 받습니다";
      renderChoices();
    } else if (reroll) {
      S.upgradeMode = "fork";
      S.upgradeOptions = [
        { kind: "piece", icon: "♛", name: "REFORGE", desc: "다른 기물 하나를 무작위로 변경" },
        ...(TRAITS.some((t) => !p.traits.includes(t.id))
          ? [{ kind: "trait", icon: "✦", name: "AUGMENT", desc: "무작위 특성 3개 중 하나를 선택" }]
          : []),
      ];
      ui.upgradeEyebrow.textContent = "MILESTONE · LEVEL " + (p.rank + 1);
      ui.upgradeTitle.textContent = "기물 변경 또는 특성 뽑기";
      renderChoices();
    } else {
      let pool = TRAITS.filter((t) => !p.traits.includes(t.id));
      S.upgradeMode = "trait";
      S.upgradeOptions = chooseRandom(pool, Math.min(3, pool.length));
      ui.upgradeEyebrow.textContent = "RANDOM AUGMENTS";
      ui.upgradeTitle.textContent = "강화 특성을 선택하세요";
      renderChoices();
    }
    S.phase = "upgrade";
    S.upgradeContinueTurn = continueTurn;
    S.upgradeLock = performance.now() + 550;
    ui.upgrade.classList.remove("hidden");
    ui.hint.textContent = "레벨업 보상을 선택하세요.";
  }
  function renderChoices() {
    ui.choices.forEach((b, i) => {
      let o = S.upgradeOptions[i];
      b.style.display = o ? "block" : "none";
      if (!o) return;
      let icon, name, desc;
      if (S.upgradeMode === "fork") {
        icon = o.icon;
        name = o.name;
        desc = o.desc;
      } else if (S.upgradeMode === "piece") {
        icon = glyph[o];
        name = o.toUpperCase();
        desc = {
          knight: "L자 이동 · 착지 충격파",
          bishop: "대각선 이동 · 대각 폭발",
          rook: "직선 이동 · 관통 섬광",
          queen: "8방향 이동 · 왕실의 선",
          king: "8방향 이동 · 근접 지배",
        }[o];
      } else {
        icon = o.icon;
        name = o.name;
        desc = o.desc;
      }
      b.querySelector("b").textContent = icon;
      b.querySelector("strong").textContent = name;
      b.querySelector("span").textContent = desc;
    });
  }
  function chooseUpgrade(i) {
    let p = S.player,
      o = S.upgradeOptions[i];
    if (!o) return;
    if (S.upgradeMode === "fork") {
      if (o.kind === "piece") {
        let pool = ["knight", "bishop", "rook", "queen", "king"].filter((piece) => piece !== p.piece);
        S.upgradeMode = "piece";
        S.upgradeOptions = [pool[Math.floor(Math.random() * pool.length)]];
        ui.upgradeEyebrow.textContent = "FATED REFORGE · LEVEL " + (p.rank + 1);
        ui.upgradeTitle.textContent = "기물이 다시 태어납니다";
      } else {
        let pool = TRAITS.filter((t) => !p.traits.includes(t.id));
        S.upgradeMode = "trait";
        S.upgradeOptions = chooseRandom(pool, Math.min(3, pool.length));
        ui.upgradeEyebrow.textContent = "RANDOM AUGMENTS";
        ui.upgradeTitle.textContent = "강화 특성을 선택하세요";
      }
      S.upgradeLock = performance.now() + 300;
      renderChoices();
      return;
    }
    if (S.upgradeMode === "piece") p.piece = o;
    else {
      p.traits.push(o.id);
    }
    p.rank++;
    p.xp = 0;
    moves();
    hud();
    ui.upgrade.classList.add("hidden");
    let continueTurn = S.upgradeContinueTurn;
    S.upgradeContinueTurn = false;
    S.phase = continueTurn ? "player" : "enemy";
    S.elapsed = 0;
    if (continueTurn) {
      S.chain++;
      showCombo(S.chain);
      S.flash = 1;
      ui.phase.textContent = "YOUR MOVE";
      ui.beat.textContent = "MOVE NOW";
    } else {
      ui.phase.textContent = "ENEMY BEAT";
      ui.beat.textContent = "CHARGING";
    }
    ui.hint.textContent =
      S.upgradeMode === "piece"
        ? p.piece.toUpperCase() + (continueTurn ? "으로 승진! 한 번 더 움직이세요." : "으로 승진했습니다.")
        : "특성 " + o.name + (continueTurn ? " 획득! 한 번 더 움직이세요." : "을 획득했습니다.");
    burst(p.x, p.y, "#f45cf4", 34);
    sfx("upgrade");
  }
  function die() {
    S.phase = "dead";
    S.death = 1.1;
    ui.phase.textContent = "CHECKMATE";
    ui.beat.textContent = "CAPTURED";
    ui.hint.textContent = "당신의 말이 체스판에서 부서집니다.";
    deathBurst(S.player.x, S.player.y);
    sfx("death");
  }
  function over() {
    S.running = false;
    ui.result.textContent =
      "적 말이 당신을 잡았습니다. " +
      S.wave +
      "번의 박자 동안 " +
      S.kills +
      "개의 말을 제거했습니다.";
    ui.over.classList.remove("hidden");
  }
  function size() {
    return Math.max(48, Math.min(76, Math.min(W, H) / 8.5));
  }
  function pos(x, y) {
    let s = size();
    return { x: W / 2 + (x - S.camera.x) * s, y: H / 2 + (y - S.camera.y) * s };
  }
  function cell(x, y, s) {
    let q = pos(x, y);
    g.fillStyle = (x + y) & 1 ? "#12142b" : "#0d1023";
    g.fillRect(q.x - s / 2, q.y - s / 2, s, s);
    g.strokeStyle = "#66609422";
    g.strokeRect(q.x - s / 2, q.y - s / 2, s, s);
  }
  function piece(x, y, t, enemy = false) {
    let q = pos(x, y),
      s = size(),
      col = enemy ? "#fa5c8a" : "#53f0e4";
    g.save();
    g.shadowBlur = enemy ? 18 : 28;
    g.shadowColor = col;
    g.fillStyle = enemy ? "#31152a" : "#123d4d";
    g.beginPath();
    g.arc(q.x, q.y, s * 0.31, 0, 7);
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = col;
    g.stroke();
    g.shadowBlur = 0;
    g.fillStyle = enemy ? "#ffd3df" : "#f1ffff";
    g.font = "700 " + s * 0.34 + "px Georgia";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(enemy ? enemyGlyph[t] : glyph[t], q.x, q.y + 1);
    g.restore();
  }
  function draw() {
    g.clearRect(0, 0, W, H);
    let s = size(),
      cols = Math.ceil(W / s / 2) + 2,
      rows = Math.ceil(H / s / 2) + 2,
      cx = Math.floor(S.camera.x),
      cy = Math.floor(S.camera.y);
    for (let y = cy - rows; y <= cy + rows; y++)
      for (let x = cx - cols; x <= cx + cols; x++) cell(x, y, s);
    if (S.enemyTrail.length) {
      g.save();
      g.globalAlpha = 0.52;
      g.strokeStyle = "#ff5577";
      g.shadowColor = "#ff315d";
      g.shadowBlur = 10;
      g.lineWidth = 2;
      g.lineCap = "round";
      g.setLineDash([5, 6]);
      S.enemyTrail.forEach((t) => {
        let a = pos(t.x1, t.y1),
          b = pos(t.x2, t.y2);
        g.beginPath();
        g.moveTo(a.x, a.y);
        if (t.via) {
          let v = pos(t.via.x, t.via.y);
          g.lineTo(v.x, v.y);
        }
        g.lineTo(b.x, b.y);
        g.stroke();
      });
      g.restore();
    }
    if (S.trail.length) {
      let colors = [
          "#ff4d6d",
          "#ff9f43",
          "#ffd166",
          "#6ee7b7",
          "#53f0e4",
          "#758bff",
          "#d66efd",
        ],
        col = S.chain ? colors[(S.chain - 1) % 7] : "#53f0e4";
      g.save();
      g.strokeStyle = col;
      g.shadowColor = col;
      g.shadowBlur = 18;
      g.lineWidth = 5;
      g.lineJoin = "round";
      g.lineCap = "round";
      g.beginPath();
      let a = pos(S.trail[0].x1, S.trail[0].y1);
      g.moveTo(a.x, a.y);
      S.trail.forEach((t) => {
        let b = pos(t.x2, t.y2);
        if (t.via) {
          let v = pos(t.via.x, t.via.y);
          g.lineTo(v.x, v.y);
        }
        g.lineTo(b.x, b.y);
      });
      g.stroke();
      g.restore();
    }
    S.effects.forEach((f) => {
      let q = pos(f.x, f.y),
        t = 1 - f.life / f.max;
      g.save();
      g.globalAlpha = Math.max(0, f.life / f.max);
      g.lineCap = "round";
      if (f.type === "shockwave") {
        g.strokeStyle = "#c274ff";
        g.shadowColor = "#c274ff";
        g.shadowBlur = 18;
        g.lineWidth = 4 * (1 - t) + 1;
        g.beginPath();
        g.arc(q.x, q.y, s * (0.18 + t * 1.35), 0, Math.PI * 2);
        g.stroke();
      } else if (f.type === "magnet") {
        g.strokeStyle = "#62d8ff";
        g.shadowColor = "#62d8ff";
        g.shadowBlur = 16;
        g.lineWidth = 2;
        g.setLineDash([7, 5]);
        g.beginPath();
        g.arc(q.x, q.y, s * (0.45 + t * 1.65), -t * 7, Math.PI * 2 - t * 7);
        g.stroke();
      } else if (f.type === "royal") {
        g.strokeStyle = "#ffd166";
        g.shadowColor = "#ffd166";
        g.shadowBlur = 14;
        g.lineWidth = 2.5;
        g.translate(q.x, q.y);
        g.rotate(t * Math.PI / 2);
        g.strokeRect(-s * (0.22 + t * 0.34), -s * (0.22 + t * 0.34), s * (0.44 + t * 0.68), s * (0.44 + t * 0.68));
      } else if (f.type === "stride") {
        g.strokeStyle = "#53f0e4";
        g.shadowColor = "#53f0e4";
        g.shadowBlur = 14;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(q.x - f.dx * s * (0.15 + t * 1.4), q.y - f.dy * s * (0.15 + t * 1.4));
        g.lineTo(q.x + f.dx * s * 0.18, q.y + f.dy * s * 0.18);
        g.stroke();
      } else if (f.type === "spark") {
        g.strokeStyle = "#fff3a3";
        g.shadowColor = "#ffd166";
        g.shadowBlur = 18;
        g.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          let a = (i * Math.PI) / 4 + t * 0.5;
          g.beginPath();
          g.moveTo(q.x, q.y);
          g.lineTo(q.x + Math.cos(a) * s * (0.25 + t * 0.7), q.y + Math.sin(a) * s * (0.25 + t * 0.7));
          g.stroke();
        }
      } else if (f.type === "echo") {
        let end = pos(f.x2, f.y2);
        g.strokeStyle = "#ff8df5";
        g.shadowColor = "#ff4dff";
        g.shadowBlur = 20;
        g.lineWidth = 5 * (1 - t) + 1;
        g.beginPath();
        g.moveTo(q.x, q.y);
        g.lineTo(end.x, end.y);
        g.stroke();
      }
      g.restore();
    });
    S.moves.forEach((m) => {
      let q = pos(m.x, m.y),
        active = S.phase === "player",
        a = active
          ? 0.2 + 0.19 * Math.sin(performance.now() / 100) + S.flash * 0.35
          : 0.07;
      g.fillStyle = "rgba(83,240,228," + a + ")";
      g.fillRect(q.x - s * 0.42, q.y - s * 0.42, s * 0.84, s * 0.84);
      g.strokeStyle = active ? "#53f0e4" : "#53f0e466";
      g.lineWidth = active ? 2 : 1;
      g.strokeRect(q.x - s * 0.42, q.y - s * 0.42, s * 0.84, s * 0.84);
    });
    S.enemies.forEach((e) => piece(e.x, e.y, e.type, true));
    if (S.phase !== "dead") piece(S.player.x, S.player.y, S.player.piece);
    if (S.phase === "dead") {
      let q = pos(S.player.x, S.player.y),
        t = 1 - S.death / 1.1;
      g.save();
      g.globalAlpha = 1 - t;
      g.fillStyle = "#f5efff";
      g.font = "700 " + s * 0.45 + "px Georgia";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(glyph[S.player.piece], q.x, q.y);
      g.globalAlpha = 1;
      g.strokeStyle = "#ff315d";
      g.lineWidth = 5 * (1 - t) + 1;
      g.shadowBlur = 28;
      g.shadowColor = "#ff315d";
      g.beginPath();
      g.arc(q.x, q.y, s * (0.25 + t * 1.9), 0, Math.PI * 2);
      g.stroke();
      g.restore();
    }
    S.particles.forEach((p) => {
      let q = pos(p.x, p.y),
        z = p.size || 4;
      g.save();
      g.globalAlpha = Math.max(0, p.life * 2);
      g.fillStyle = p.color;
      if (p.shard) {
        g.translate(q.x, q.y);
        g.rotate(p.angle || 0);
        g.fillRect(-z / 2, -z / 4, z, z / 2);
      } else if (p.metal) {
        g.translate(q.x, q.y);
        g.rotate(p.angle || 0);
        g.fillRect(-z / 2, -Math.max(1, z * 0.11), z, Math.max(2, z * 0.22));
      } else g.fillRect(q.x - z / 2, q.y - z / 2, z, z);
      g.restore();
    });
    g.globalAlpha = 1;
  }
  function tick(now) {
    let dt = Math.min(0.05, (now - last) / 1000 || 0) * S.devSpeed;
    last = now;
    if (S.running) {
      S.camera.x += (S.player.x - S.camera.x) * Math.min(1, dt * 8);
      S.camera.y += (S.player.y - S.camera.y) * Math.min(1, dt * 8);
      S.flash = Math.max(0, S.flash - dt * 1.8);
      S.particles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= p.drag || 0.93;
        p.vy *= p.drag || 0.93;
        p.angle = (p.angle || 0) + (p.spin || 0) * dt;
        p.life -= dt;
      });
      S.particles = S.particles.filter((p) => p.life > 0);
      S.effects.forEach((f) => (f.life -= dt));
      S.effects = S.effects.filter((f) => f.life > 0);
      if (S.phase === "enemy") {
        S.elapsed += dt;
        let r = Math.min(1, S.elapsed / S.beat);
        ui.meter.style.width = r * 100 + "%";
        ui.meter.style.background = "#f45cf4";
        ui.beat.textContent = Math.max(0, S.beat - S.elapsed).toFixed(1) + "s";
        if (S.elapsed >= S.beat) enemyBeat();
      } else if (S.phase === "player") {
        ui.meter.style.width = "100%";
        ui.meter.style.background = "#53f0e4";
      } else if (S.phase === "dead") {
        S.death -= dt;
        ui.meter.style.width = Math.max(0, S.death / 1.1) * 100 + "%";
        ui.meter.style.background = "#ff315d";
        if (S.death <= 0) over();
      } else ui.meter.style.width = "100%";
    }
    draw();
    requestAnimationFrame(tick);
  }
  function tap(e) {
    if (!S.running || S.phase !== "player") return;
    let r = c.getBoundingClientRect(),
      s = size(),
      x = (e.clientX - r.left - W / 2) / s + S.camera.x,
      y = (e.clientY - r.top - H / 2) / s + S.camera.y,
      m = S.moves.find((m) => m.x === Math.round(x) && m.y === Math.round(y));
    if (m) playerMove(m);
  }
  function devXp() {
    if (!S.running || ["upgrade", "devpick"].includes(S.phase)) return;
    S.player.xp = 3 + S.player.rank * 2;
    hud();
    openUpgrade();
  }
  function devPawn() {
    if (!S.running || S.phase === "devpick") return;
    let p = S.player,
      q = S.moves[0] || { x: p.x + 1, y: p.y };
    S.enemies.push({ x: q.x, y: q.y, type: "pawn", face: { x: 0, y: 1 } });
    ui.hint.textContent = "DEV: 인접한 폰을 생성했습니다.";
  }
  function devBeat() {
    if (!S.running || ["upgrade", "dead", "devpick"].includes(S.phase)) return;
    S.phase = "enemy";
    enemyBeat();
  }
  function devSpeed() {
    if (S.phase === "devpick") return;
    S.devSpeed = S.devSpeed === 1 ? 2 : 1;
    ui.devSpeed.textContent = "[4] ×" + S.devSpeed + " SPEED";
    ui.hint.textContent = "DEV: 게임 속도 ×" + S.devSpeed;
  }
  function closeDevPick() {
    ui.devPick.classList.add("hidden");
    S.phase = S.devReturnPhase || "player";
    S.devReturnPhase = null;
  }
  function openDevPick(kind) {
    if (!S.running || ["upgrade", "dead", "devpick"].includes(S.phase)) return;
    S.devReturnPhase = S.phase;
    S.phase = "devpick";
    let pieceInfo = {
        pawn: "8방향 1칸",
        knight: "L자 이동 · 착지 충격파",
        bishop: "대각선 3칸 · 대각 폭발",
        rook: "직선 3칸 · 관통 섬광",
        queen: "8방향 3칸",
        king: "8방향 1칸",
      },
      options =
        kind === "piece"
          ? Object.keys(glyph).map((id) => ({ id, icon: glyph[id], name: id.toUpperCase(), desc: pieceInfo[id] }))
          : TRAITS;
    ui.devPickTitle.textContent = kind === "piece" ? "기물을 즉시 변경" : "특성을 즉시 추가";
    ui.devPickOptions.innerHTML = "";
    options.forEach((o) => {
      let b = document.createElement("button"),
        owned = kind === "trait" && S.player.traits.includes(o.id);
      b.disabled = owned;
      b.innerHTML = "<b>" + o.icon + "</b><strong>" + (o.name || o.id.toUpperCase()) + "</strong><span>" + (owned ? "이미 보유함" : o.desc) + "</span>";
      b.addEventListener("click", () => {
        let p = S.player;
        if (kind === "piece") {
          p.piece = o.id;
          ui.hint.textContent = "DEV: " + o.id.toUpperCase() + "로 변경했습니다.";
        } else {
          p.traits.push(o.id);
          ui.hint.textContent = "DEV: " + o.name + " 특성을 추가했습니다.";
        }
        moves();
        hud();
        burst(p.x, p.y, "#ffd166", 24);
        closeDevPick();
      });
      ui.devPickOptions.appendChild(b);
    });
    ui.devPick.classList.remove("hidden");
  }
  c.addEventListener("pointerdown", tap);
  $("#startButton").addEventListener("click", () => {
    reset();
    S.dev = ui.devToggle.checked;
    ui.devBar.classList.toggle("hidden", !S.dev);
    S.running = true;
    startBgm();
    ui.start.classList.add("hidden");
  });
  $("#restartButton").addEventListener("click", () => {
    reset();
    ui.devSpeed.textContent = "[4] ×2 SPEED";
    ui.devBar.classList.toggle("hidden", !S.dev);
    S.running = true;
    startBgm();
    ui.over.classList.add("hidden");
  });
  $("#devXp").addEventListener("click", devXp);
  $("#devPawn").addEventListener("click", devPawn);
  $("#devBeat").addEventListener("click", devBeat);
  $("#devSpeed").addEventListener("click", devSpeed);
  $("#devPiece").addEventListener("click", () => openDevPick("piece"));
  $("#devTrait").addEventListener("click", () => openDevPick("trait"));
  $("#devPickClose").addEventListener("click", closeDevPick);
  document.addEventListener("keydown", (e) => {
    if (!S.dev) return;
    let k = e.key.toLowerCase();
    if (k === "1") devXp();
    if (k === "2") devPawn();
    if (k === "3") devBeat();
    if (k === "4") devSpeed();
    if (k === "5") openDevPick("piece");
    if (k === "6") openDevPick("trait");
    if (k === "d") ui.devBar.classList.toggle("hidden");
  });
  document.addEventListener(
    "click",
    (e) => {
      if (
        e.target.closest(".upgrade-choice") &&
        performance.now() < (S.upgradeLock || 0)
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
  ui.choices.forEach((b) =>
    b.addEventListener("click", () => chooseUpgrade(Number(b.dataset.choice))),
  );
  setVolume(Number.isFinite(savedVolume) ? savedVolume : 100);
  ui.soundToggle.addEventListener("click", () => ui.soundPanel.classList.toggle("hidden"));
  ui.volumeRange.addEventListener("input", (e) => setVolume(Number(e.target.value)));
  reset();
  requestAnimationFrame(tick);
})();
