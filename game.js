(() => {
  const c = document.querySelector("#game"),
    g = c.getContext("2d"),
    $ = (s) => document.querySelector(s),
    ui = {
      hp: $("#hp"),
      xp: $("#xp"),
      score: $("#score"),
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
      bgmVolumeRange: $("#bgmVolumeRange"),
      bgmVolumeValue: $("#bgmVolumeValue"),
      sfxVolumeRange: $("#sfxVolumeRange"),
      sfxVolumeValue: $("#sfxVolumeValue"),
      combo: $("#comboToast"),
      ranking: $("#rankingScreen"),
      rankingButton: $("#rankingButton"),
      gameOverRanking: $("#gameOverRanking"),
      mainMenuButton: $("#mainMenuButton"),
      rankingClose: $("#rankingClose"),
      leaderboardList: $("#leaderboardList"),
      leaderboardStatus: $("#leaderboardStatus"),
      rankingPrev: $("#rankingPrev"),
      rankingPage: $("#rankingPage"),
      rankingNext: $("#rankingNext"),
      scoreSubmit: $("#scoreSubmit"),
      scoreSubmitTitle: $("#scoreSubmitTitle"),
      scoreSubmitIntro: $("#scoreSubmitIntro"),
      scoreName: $("#scoreName"),
      scoreMessage: $("#scoreMessage"),
      scoreButton: $("#submitScoreButton"),
      scoreStatus: $("#scoreStatus"),
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
      score: 0,
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
    COMBO_COLORS = ["#ff4d6d", "#ff9f43", "#ffd166", "#6ee7b7", "#53f0e4", "#758bff", "#d66efd"],
    knightCorner = (a, b) => {
      let dx = Math.abs(a.x - b.x),
        dy = Math.abs(a.y - b.y),
        isL = (dx === 1 && (dy === 2 || dy === 3)) || (dy === 1 && (dx === 2 || dx === 3));
      return isL
        ? dx > dy
          ? { x: b.x, y: a.y }
          : { x: a.x, y: b.y }
        : null;
    };
  const SUPABASE_URL = "https://ganvrpzlsmvbmcilerpq.supabase.co",
    SUPABASE_KEY = "sb_publishable_9VAPG9uz4EonoI_naGXemw_PCGDqOc4",
    LEADERBOARD_LIMIT = 10,
    LEADERBOARD_VIEW_LIMIT = 1000,
    LEADERBOARD_STORE_LIMIT = 10000;
  let leaderboardRows = [],
    leaderboardPage = 0;
  async function leaderboardRequest(path, options = {}) {
    let response = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
      ...options,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      let body = await response.text();
      throw new Error(body || "랭킹 서버에 연결할 수 없습니다.");
    }
    let body = await response.text();
    return body ? JSON.parse(body) : null;
  }
  function renderLeaderboard(rows, offset = 0) {
    ui.leaderboardList.textContent = "";
    if (!rows.length) {
      let empty = document.createElement("p");
      empty.className = "leaderboard-empty";
      empty.textContent = "첫 번째 기록을 남겨보세요.";
      ui.leaderboardList.appendChild(empty);
      return;
    }
    rows.forEach((row, index) => {
      let item = document.createElement("div"),
        rank = document.createElement("span"),
        name = document.createElement("strong"),
        score = document.createElement("span");
      item.className = "leaderboard-row";
      rank.className = "leaderboard-rank";
      name.className = "leaderboard-name";
      score.className = "leaderboard-score";
      rank.textContent = String(offset + index + 1).padStart(2, "0");
      name.textContent = row.name;
      score.textContent = Number(row.score).toLocaleString() + " PTS";
      item.append(rank, name, score);
      if (row.message) {
        let message = document.createElement("span");
        message.className = "leaderboard-message";
        message.textContent = row.message;
        item.appendChild(message);
      }
      ui.leaderboardList.appendChild(item);
    });
  }
  function updateLeaderboardPager(rows) {
    let maxPage = LEADERBOARD_VIEW_LIMIT / LEADERBOARD_LIMIT - 1;
    ui.rankingPage.textContent = `${leaderboardPage + 1} / ${maxPage + 1}`;
    ui.rankingPrev.disabled = leaderboardPage === 0;
    ui.rankingNext.disabled = leaderboardPage === maxPage || rows.length < LEADERBOARD_LIMIT;
  }
  async function loadLeaderboard(page = 0) {
    leaderboardPage = Math.max(0, Math.min(LEADERBOARD_VIEW_LIMIT / LEADERBOARD_LIMIT - 1, page));
    ui.leaderboardStatus.textContent = "기록을 불러오는 중…";
    ui.rankingPrev.disabled = true;
    ui.rankingNext.disabled = true;
    try {
      leaderboardRows = await leaderboardRequest(
        "leaderboard?select=name,score,message,created_at&order=score.desc,created_at.asc&limit=" +
          LEADERBOARD_LIMIT +
          "&offset=" +
          leaderboardPage * LEADERBOARD_LIMIT,
      );
      renderLeaderboard(leaderboardRows, leaderboardPage * LEADERBOARD_LIMIT);
      updateLeaderboardPager(leaderboardRows);
      ui.leaderboardStatus.textContent = `TOP 1,000 · ${leaderboardPage * LEADERBOARD_LIMIT + 1}–${leaderboardPage * LEADERBOARD_LIMIT + leaderboardRows.length}위 · 점수 기준`;
      return leaderboardRows;
    } catch (error) {
      ui.leaderboardList.textContent = "";
      ui.leaderboardStatus.textContent = "랭킹을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
      throw error;
    }
  }
  function isTopTenScore(score, rows = leaderboardRows) {
    return score > 0 && (rows.length < LEADERBOARD_LIMIT || score > rows[rows.length - 1].score);
  }
  async function leaderboardCutoff() {
    let rows = await leaderboardRequest(
      "leaderboard?select=score&order=score.desc,created_at.asc&offset=" +
        (LEADERBOARD_STORE_LIMIT - 1) +
        "&limit=1",
    );
    return rows[0]?.score ?? null;
  }
  async function openRanking() {
    ui.ranking.classList.remove("hidden");
    try {
      await loadLeaderboard(0);
    } catch (_) {}
  }
  function closeRanking() {
    ui.ranking.classList.add("hidden");
  }
  function returnToMenu() {
    S.running = false;
    S.dev = false;
    reset();
    closeRanking();
    ui.over.classList.add("hidden");
    ui.devBar.classList.add("hidden");
    ui.start.classList.remove("hidden");
  }
  async function offerScoreSubmission(score) {
    ui.scoreSubmit.classList.add("hidden");
    ui.scoreStatus.textContent = "글로벌 랭킹을 확인하는 중…";
    try {
      let [rows, cutoff] = await Promise.all([loadLeaderboard(), leaderboardCutoff()]),
        topTen = isTopTenScore(score, rows),
        qualifies = score > 0 && (cutoff === null || score > cutoff);
      if (qualifies) {
        S.scoreSubmissionTopTen = topTen;
        ui.scoreSubmit.classList.remove("hidden");
        ui.scoreSubmitTitle.textContent = topTen ? "TOP 10 달성!" : "TOP 10,000 진입!";
        ui.scoreSubmitIntro.textContent = topTen
          ? "이 기록을 남기고 한 줄 소감을 적어주세요."
          : "이 기록을 글로벌 랭킹에 남겨주세요.";
        ui.scoreMessage.disabled = !topTen;
        ui.scoreMessage.placeholder = topTen
          ? "한 줄 소감 (선택, 최대 120자)"
          : "한 줄 소감은 TOP 10만 작성할 수 있습니다.";
        ui.scoreStatus.textContent = topTen
          ? "현재 TOP 10 진입권입니다. 기록을 남겨주세요."
          : "현재 TOP 10,000 진입권입니다. 기록을 남겨주세요.";
        ui.scoreName.focus();
      } else {
        ui.scoreStatus.textContent = "이번 기록은 TOP 10,000 밖입니다. 다시 도전해보세요.";
      }
    } catch (_) {
      ui.scoreStatus.textContent = "랭킹 확인에 실패했습니다. 연결 후 다시 시도해주세요.";
    }
  }
  async function submitScore() {
    let name = ui.scoreName.value.trim(),
      message = S.scoreSubmissionTopTen ? ui.scoreMessage.value.trim() : "",
      score = S.finalScore;
    if (!name) {
      ui.scoreStatus.textContent = "닉네임을 입력해주세요.";
      ui.scoreName.focus();
      return;
    }
    if (!Number.isInteger(score) || score <= 0) return;
    let lastSubmit = Number(localStorage.getItem("its-my-turn-last-score-submit") || 0);
    if (Date.now() - lastSubmit < 15000) {
      ui.scoreStatus.textContent = "기록 등록은 잠시 후 다시 시도해주세요.";
      return;
    }
    ui.scoreButton.disabled = true;
    ui.scoreStatus.textContent = "기록을 남기는 중…";
    try {
      await leaderboardRequest("leaderboard", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ name, score, message }),
      });
      localStorage.setItem("its-my-turn-last-score-submit", String(Date.now()));
      ui.scoreSubmit.classList.add("hidden");
      ui.scoreStatus.textContent = "기록을 남겼습니다! GLOBAL RANKING에서 확인하세요.";
      loadLeaderboard().catch(() => {});
    } catch (_) {
      ui.scoreStatus.textContent = "기록 등록에 실패했습니다. 잠시 후 다시 시도해주세요.";
    } finally {
      ui.scoreButton.disabled = false;
    }
  }
  const legacyVolumeRaw = localStorage.getItem("checkbeat-volume-v5"),
    legacyVolume = legacyVolumeRaw === null ? NaN : Number(legacyVolumeRaw),
    savedBgmVolume = Number(localStorage.getItem("checkbeat-bgm-volume-v1")),
    savedSfxVolume = Number(localStorage.getItem("checkbeat-sfx-volume-v1"));
  const initialVolume = Number.isFinite(legacyVolume) ? legacyVolume : 100;
  const audio = {
    ctx: null,
    master: null,
    bgm: null,
    sfx: null,
    timer: null,
    step: 0,
    bgmVolume: Number.isFinite(savedBgmVolume) ? Math.max(0, Math.min(2, savedBgmVolume / 50)) : initialVolume / 50,
    sfxVolume: Number.isFinite(savedSfxVolume) ? Math.max(0, Math.min(2, savedSfxVolume / 50)) : initialVolume / 50,
  };
  function setBusVolume(bus, value) {
    let slider = Math.max(0, Math.min(100, value));
    audio[bus + "Volume"] = slider / 50;
    localStorage.setItem("checkbeat-" + bus + "-volume-v1", Math.round(slider));
    ui[bus + "VolumeRange"].value = Math.round(slider);
    ui[bus + "VolumeValue"].textContent = Math.round(slider) + "%";
    if (audio[bus]) audio[bus].gain.setTargetAtTime(audio[bus + "Volume"], audio.ctx.currentTime, 0.025);
  }
  function audioReady() {
    if (!window.AudioContext && !window.webkitAudioContext) return null;
    if (!audio.ctx) {
      audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
      audio.master = audio.ctx.createGain();
      audio.bgm = audio.ctx.createGain();
      audio.sfx = audio.ctx.createGain();
      let limiter = audio.ctx.createDynamicsCompressor();
      limiter.threshold.value = -10;
      limiter.knee.value = 8;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.16;
      audio.master.gain.value = 1;
      audio.bgm.gain.value = audio.bgmVolume;
      audio.sfx.gain.value = audio.sfxVolume;
      audio.bgm.connect(audio.master);
      audio.sfx.connect(audio.master);
      audio.master.connect(limiter).connect(audio.ctx.destination);
    }
    if (audio.ctx.state === "suspended") audio.ctx.resume();
    return audio.ctx;
  }
  function tone(freq, duration, type = "sine", volume = 0.2, slide = 1, bus = "sfx") {
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
    osc.connect(gain).connect(audio[bus]);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }
  function noise(duration = 0.08, volume = 0.08, bus = "sfx") {
    let ctx = audioReady();
    if (!ctx) return;
    let buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate),
      data = buffer.getChannelData(0),
      source = ctx.createBufferSource(),
      gain = ctx.createGain();
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain).connect(audio[bus]);
    source.start();
  }
  function sfx(kind, chain = 1) {
    if (!audio.ctx) return;
    if (kind === "move") tone(330, 0.07, "triangle", 0.13, 1.35);
    if (kind === "capture") {
      // Half a semitone per chain, capped at a clean fifth above the base sound.
      let pitch = Math.pow(2, Math.min(12, Math.max(0, chain - 1)) / 24);
      tone(180 * pitch, 0.12, "sawtooth", 0.22, 0.55);
      tone(620 * pitch, 0.09, "square", 0.11, 0.72);
      noise(0.07, 0.12);
    }
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
      if (n) tone(n * 2, 0.16, "triangle", 0.055, 0.995, "bgm");
      if (audio.step % 4 === 0) tone(n || 110, 0.22, "sine", 0.08, 0.98, "bgm");
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
      id: "diagonalBurst",
      icon: "✧",
      name: "DIAGONAL BURST",
      desc: "직접 타격 시 착지 칸의 모든 대각선 적 관통",
    },
    {
      id: "longStride",
      icon: "↔",
      name: "LONG STRIDE",
      desc: "킹·폰 3칸 / 나이트 확장 L자 / 슬라이딩 말 +2칸",
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
    {
      id: "fork",
      icon: "♞",
      name: "FORK",
      desc: "처치 시 나이트 위치의 적도 타격",
    },
    {
      id: "crossCheck",
      icon: "✚",
      name: "CROSS CHECK",
      desc: "처치 시 상하좌우 가장 가까운 적 관통",
    },
    {
      id: "slipstream",
      icon: "〰",
      name: "SLIPSTREAM",
      desc: "3적 턴마다 첫 비처치 이동 후 한 번 더 이동",
    },
  ];
  function reset() {
    S.phase = "enemy";
    S.elapsed = S.flash = S.wave = S.kills = S.score = S.death = S.chain = 0;
    S.displayChain = 0;
    S.devSpeed = 1;
    S.beat = 0.45;
    S.grace = 3;
    S.camera = { x: 0, y: 0 };
    S.particles = [];
    S.effects = [];
    S.trail = [];
    S.enemyTrail = [];
    S.upgradeOptions = [];
    S.player = { x: 0, y: 0, hp: 5, xp: 0, rank: 0, piece: "pawn", traits: [], slipUsed: false, slipCooldown: 0 };
    S.enemies = [
      { x: 0, y: -6, type: "pawn", face: { x: 0, y: 1 }, hp: 1, maxHp: 1 },
      { x: -2, y: -7, type: "pawn", face: { x: 0, y: 1 }, hp: 1, maxHp: 1 },
    ];
    moves();
    hud();
  }
  function hud() {
    ui.hp.textContent = S.wave;
    ui.xp.textContent = S.player.xp + " / " + (3 + S.player.rank * 2);
    ui.score.textContent = S.score.toLocaleString();
  }
  function chainMultiplier(chain) {
    return 1 + Math.min(9, Math.max(0, chain - 1)) * 0.25;
  }
  function showCombo(chain, fromChain = chain - 1) {
    clearTimeout(S.comboStepTimer);
    clearTimeout(S.comboHideTimer);
    let first = Math.max(1, Math.min(chain, fromChain + 1));
    function showStep(value) {
      let color = COMBO_COLORS[(value - 1) % COMBO_COLORS.length];
      S.displayChain = value;
      ui.combo.textContent = "CHAIN × " + value;
      ui.combo.style.color = color;
      ui.combo.style.textShadow = "0 0 14px " + color + ", 0 0 32px " + color;
      ui.combo.classList.remove("show");
      void ui.combo.offsetWidth;
      ui.combo.classList.add("show");
      if (value < chain) {
        S.comboStepTimer = setTimeout(() => showStep(value + 1), 92);
      } else {
        S.comboHideTimer = setTimeout(() => ui.combo.classList.remove("show"), 980);
      }
    }
    showStep(first);
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
    let longStride = p.traits?.includes("longStride");
    if (piece === "pawn" || piece === "king")
      base = longStride
        ? king.flatMap(([x, y]) => [[x, y], [x * 2, y * 2], [x * 3, y * 3]])
        : king;
    else if (piece === "knight") {
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
      if (longStride)
        base.push(
          [1, 3], [3, 1], [3, -1], [1, -3],
          [-1, -3], [-3, -1], [-3, 1], [-1, 3],
        );
    }
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
        range = longStride ? 5 : 3;
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
    if (["shockwave", "magnet", "echo", "spark", "fork", "cross"].includes(type))
      sfx(type === "fork" || type === "cross" ? "echo" : type);
  }
  function captureBurst(x, y, combo) {
    let color = COMBO_COLORS[(combo - 1) % COMBO_COLORS.length];
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
  function hitBurst(x, y, combo) {
    let color = COMBO_COLORS[(combo - 1) % COMBO_COLORS.length];
    for (let i = 0; i < 12; i++) {
      let a = Math.random() * Math.PI * 2,
        v = 1.2 + Math.random() * 2.5;
      S.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 0.2 + Math.random() * 0.18,
        color,
        size: 2 + Math.random() * 4,
        drag: 0.9,
        metal: true,
        spin: (Math.random() - 0.5) * 15,
        angle: Math.random() * 6.28,
      });
    }
  }
  function damageEnemies(targets, combo, hitSet) {
    let victims = [...new Set(targets)].filter(
      (e) => S.enemies.includes(e) && !hitSet?.has(e),
    );
    if (!victims.length) return { hits: 0, kills: 0, points: 0 };
    victims.forEach((e) => hitSet?.add(e));
    let dead = [];
    victims.forEach((e) => {
      e.hp = (e.hp || 1) - 1;
      if (e.hp <= 0) {
        dead.push(e);
        captureBurst(e.x, e.y, combo);
      } else hitBurst(e.x, e.y, combo);
    });
    S.enemies = S.enemies.filter((e) => !dead.includes(e));
    if (dead.length) {
      S.player.xp += dead.length;
      S.kills += dead.length;
    }
    return {
      hits: victims.length,
      kills: dead.length,
      points: dead.reduce((sum, e) => sum + 100 * (e.maxHp || 1), 0),
    };
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
    // Durability tiers use the same seven-color rainbow as the chain.
    // Heavier tiers arrive gradually, then become more common over time.
    let highestTier =
        S.wave < 14 ? 1 : Math.min(7, 2 + Math.floor((S.wave - 14) / 16)),
      heavyChance = S.wave < 14 ? 0 : Math.min(0.7, 0.22 + (S.wave - 14) * 0.008),
      maxHp =
        Math.random() < heavyChance
          ? 2 + Math.floor(Math.pow(Math.random(), 1.65) * (highestTier - 1))
          : 1;
    S.enemies.push({
      x,
      y,
      type: ts[Math.floor(Math.random() * ts.length)],
      face,
      hp: maxHp,
      maxHp,
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
    S.displayChain = 0;
    clearTimeout(S.comboStepTimer);
    clearTimeout(S.comboHideTimer);
    ui.combo.classList.remove("show");
    S.player.slipUsed = false;
    S.player.slipCooldown = Math.max(0, (S.player.slipCooldown || 0) - 1);
    sfx("enemy");
    let used = new Set(),
      captured = false,
      killer = null;
    S.enemies
      .sort((a, b) => dist(a, S.player) - dist(b, S.player))
      .forEach((e) => {
        let from = { x: e.x, y: e.y },
          n = toward(e);
        if (n.x === S.player.x && n.y === S.player.y) {
          captured = true;
          if (!killer && S.grace <= 0) {
            killer = e;
            e.x = S.player.x;
            e.y = S.player.y;
            used.add(K(e.x, e.y));
            S.enemyTrail.push({
              x1: from.x,
              y1: from.y,
              x2: e.x,
              y2: e.y,
              via: e.type === "knight" ? knightCorner(from, e) : null,
            });
            burst(e.x, e.y, "#ff5577", 28);
          }
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
    if (captured && S.grace <= 0) {
      S.phase = "captured";
      S.captureTimer = 0.34;
      S.flash = 0;
      ui.phase.textContent = "CHECKMATE";
      ui.beat.textContent = "CAPTURED";
      ui.hint.textContent = "적 말이 당신의 칸을 점령했습니다.";
      return;
    }
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
      earned = 0,
      scoreGain = 0,
      attacked = false,
      struck = new Set(),
      combo = S.chain + 1,
      dx = Math.sign(m.x - from.x),
      dy = Math.sign(m.y - from.y),
      caught = S.enemies.filter((e) => e.x === m.x && e.y === m.y);
    p.x = m.x;
    p.y = m.y;
    sfx("move");
    S.trail.push({ x1: from.x, y1: from.y, x2: p.x, y2: p.y, via: p.piece === "knight" ? knightCorner(from, p) : null, life: 1 });
    if (p.traits.includes("longStride") && (Math.abs(m.x - from.x) > 1 || Math.abs(m.y - from.y) > 1))
      traitFx("stride", p.x, p.y, { dx, dy });
    if (p.traits.includes("royalStep")) traitFx("royal", p.x, p.y);
    if (caught.length) {
      let r = damageEnemies(caught, combo, struck);
      attacked ||= r.hits > 0;
      gained += r.kills;
      earned += r.points;
    }
    if (p.traits.includes("shockwave")) {
      let v = S.enemies.filter(
          (e) => Math.max(Math.abs(e.x - p.x), Math.abs(e.y - p.y)) <= 1,
        );
      let r = damageEnemies(v, combo, struck);
      attacked ||= r.hits > 0;
      gained += r.kills;
      earned += r.points;
      burst(p.x, p.y, "#c274ff", 20);
      traitFx("shockwave", p.x, p.y);
    }
    if (p.traits.includes("diagonalBurst") && caught.length) {
      let v = S.enemies.filter((e) => {
        let x = e.x - p.x,
          y = e.y - p.y;
        return Math.abs(x) === Math.abs(y);
      });
      let r = damageEnemies(v, combo, struck);
      attacked ||= r.hits > 0;
      gained += r.kills;
      earned += r.points;
    }
    if (attacked && p.traits.includes("magnet")) {
      let v = S.enemies.filter(
        (e) => Math.max(Math.abs(e.x - p.x), Math.abs(e.y - p.y)) <= 2,
      );
      let r = damageEnemies(v, combo, struck);
      attacked ||= r.hits > 0;
      gained += r.kills;
      earned += r.points;
      traitFx("magnet", p.x, p.y);
    }
    if (attacked && p.traits.includes("echoBlade")) {
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
      let r = damageEnemies(v, combo, struck);
      attacked ||= r.hits > 0;
      gained += r.kills;
      earned += r.points;
      v.forEach((e) => traitFx("echo", p.x, p.y, { x2: e.x, y2: e.y }));
    }
    if (attacked && p.traits.includes("fork")) {
      let v = S.enemies.filter((e) => {
        let x = Math.abs(e.x - p.x),
          y = Math.abs(e.y - p.y);
        return (x === 1 && y === 2) || (x === 2 && y === 1);
      });
      let r = damageEnemies(v, combo, struck);
      attacked ||= r.hits > 0;
      gained += r.kills;
      earned += r.points;
      v.forEach((e) => {
        traitFx("fork", p.x, p.y, { x2: e.x, y2: e.y, via: knightCorner(p, e) });
      });
    }
    if (attacked && p.traits.includes("crossCheck")) {
      let v = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .map(([dx, dy]) =>
          S.enemies
            .filter((e) => {
              let x = e.x - p.x,
                y = e.y - p.y;
              return dx ? y === 0 && x * dx > 0 : x === 0 && y * dy > 0;
            })
            .sort((a, b) => dist(a, p) - dist(b, p))[0],
        )
        .filter(Boolean);
      let r = damageEnemies(v, combo, struck);
      attacked ||= r.hits > 0;
      gained += r.kills;
      earned += r.points;
      v.forEach((e) => {
        traitFx("cross", p.x, p.y, { x2: e.x, y2: e.y });
      });
    }
    if (attacked && p.traits.includes("chainSpark")) {
      p.xp++;
      traitFx("spark", p.x, p.y);
    }
    if (gained) {
      scoreGain = Math.round(earned * chainMultiplier(S.chain + gained));
      S.score += scoreGain;
    }
    if (attacked) sfx("capture", S.chain + Math.max(1, gained));
    hud();
    let reroll = (p.rank + 1) % 5 === 0;
    if (
      p.xp >= 3 + p.rank * 2 &&
      (p.rank === 0 || reroll || p.traits.length < TRAITS.length)
    ) {
      openUpgrade(true, gained);
      return;
    }
    if (attacked) {
      if (gained) {
        let previousChain = S.chain;
        S.chain += gained;
        showCombo(S.chain, previousChain);
      }
      S.flash = 1;
      moves();
      ui.hint.textContent =
        gained
          ? "연속 수 ×" + S.chain + "! +" + scoreGain.toLocaleString() + "점 · 한 번 더 움직일 수 있습니다."
          : "장갑 적을 타격했습니다! 마무리할 때까지 한 번 더 움직이세요.";
      return;
    }
    if (p.traits.includes("slipstream") && !p.slipUsed && !p.slipCooldown) {
      p.slipUsed = true;
      p.slipCooldown = 2;
      S.flash = 1;
      moves();
      traitFx("slip", p.x, p.y);
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
  function openUpgrade(continueTurn = false, chainGain = 0) {
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
    S.upgradeChainGain = chainGain;
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
          knight: "L자 이동",
          bishop: "대각선 3칸 이동",
          rook: "직선 3칸 이동",
          queen: "8방향 3칸 이동",
          king: "8방향 1칸 이동",
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
    let chainGain = S.upgradeChainGain || 0;
    S.upgradeContinueTurn = false;
    S.upgradeChainGain = 0;
    S.phase = continueTurn ? "player" : "enemy";
    S.elapsed = 0;
    if (continueTurn) {
      if (chainGain) {
        let previousChain = S.chain;
        S.chain += chainGain;
        showCombo(S.chain, previousChain);
      }
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
    S.finalScore = S.score;
    ui.result.textContent =
      "적 말이 당신을 잡았습니다. " +
      S.wave +
      "번의 박자 동안 SCORE " +
      S.score.toLocaleString() +
      "점 · " +
      S.kills +
      "개 처치.";
    ui.scoreSubmit.classList.add("hidden");
    ui.scoreName.value = localStorage.getItem("its-my-turn-ranking-name") || "";
    ui.scoreMessage.value = "";
    ui.scoreStatus.textContent = "";
    ui.over.classList.remove("hidden");
    offerScoreSubmission(S.finalScore);
  }
  function size() {
    let base = Math.max(48, Math.min(76, Math.min(W, H) / 8.5)),
      p = S.player;
    // Keep the normal board scale, but give a queen with LONG STRIDE a small
    // mobile-only zoom-out so its five-square rays do not fall off-screen.
    if (!p || !matchMedia("(max-width:560px)").matches || p.piece !== "queen" || !p.traits?.includes("longStride"))
      return base;
    let moves = S.moves || [],
      reachX = Math.max(1, ...moves.map((m) => Math.abs(m.x - p.x))),
      reachY = Math.max(1, ...moves.map((m) => Math.abs(m.y - p.y))),
      fitted = Math.min(W / (reachX * 2 + 1.15), H / (reachY * 2 + 1.15));
    return Math.max(base * 0.82, Math.min(base, fitted));
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
  function piece(x, y, t, enemy = false, hp = 1, maxHp = 1) {
    let q = pos(x, y),
      s = size(),
      // The color communicates remaining hits, not the enemy's original maximum.
      // A 2-health orange enemy becomes red after its first hit.
      durability = COMBO_COLORS[Math.max(0, Math.min(6, hp - 1))],
      col = enemy ? durability : "#53f0e4",
      health = Math.max(0, Math.min(1, hp / maxHp));
    g.save();
    g.shadowBlur = enemy ? 20 : 30;
    g.shadowColor = col;
    g.globalAlpha = enemy ? 0.68 + health * 0.32 : 1;
    g.fillStyle = enemy ? col : "#f1ffff";
    g.font = "700 " + s * 0.62 + "px Georgia, 'Times New Roman', serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(enemy ? enemyGlyph[t] : glyph[t], q.x, q.y);
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
      let col = S.chain ? COMBO_COLORS[(S.chain - 1) % COMBO_COLORS.length] : "#53f0e4";
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
      } else if (["echo", "fork", "cross"].includes(f.type)) {
        let end = pos(f.x2, f.y2);
        let colors = f.type === "fork" ? ["#6ee7ff", "#4b8dff"] : f.type === "cross" ? ["#ffd166", "#ff9f43"] : ["#ff8df5", "#ff4dff"];
        g.strokeStyle = colors[0];
        g.shadowColor = colors[1];
        g.shadowBlur = 20;
        g.lineWidth = 5 * (1 - t) + 1;
        g.beginPath();
        g.moveTo(q.x, q.y);
        if (f.via) {
          let via = pos(f.via.x, f.via.y);
          g.lineTo(via.x, via.y);
        }
        g.lineTo(end.x, end.y);
        g.stroke();
      } else if (f.type === "slip") {
        g.strokeStyle = "#53f0e4";
        g.shadowColor = "#53f0e4";
        g.shadowBlur = 16;
        g.lineWidth = 2.5;
        g.setLineDash([4, 5]);
        g.beginPath();
        g.arc(q.x, q.y, s * (0.34 + t * 1.2), 0, Math.PI * 2);
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
    // A move that remains beyond the limited zoom is still discoverable at the
    // nearest edge of the screen without making the board too small to play.
    if (S.phase === "player") {
      S.moves.forEach((m) => {
        let q = pos(m.x, m.y);
        if (q.x >= 18 && q.x <= W - 18 && q.y >= 18 && q.y <= H - 18) return;
        let dx = q.x - W / 2,
          dy = q.y - H / 2,
          scale = Math.min((W / 2 - 23) / Math.max(1, Math.abs(dx)), (H / 2 - 23) / Math.max(1, Math.abs(dy))),
          x = W / 2 + dx * scale,
          y = H / 2 + dy * scale,
          angle = Math.atan2(dy, dx);
        g.save();
        g.translate(x, y);
        g.rotate(angle);
        g.fillStyle = "#53f0e4";
        g.shadowColor = "#53f0e4";
        g.shadowBlur = 14;
        g.beginPath();
        g.moveTo(10, 0);
        g.lineTo(-6, -7);
        g.lineTo(-6, 7);
        g.closePath();
        g.fill();
        g.restore();
      });
    }
    if (S.phase === "captured") piece(S.player.x, S.player.y, S.player.piece);
    S.enemies.forEach((e) => piece(e.x, e.y, e.type, true, e.hp || 1, e.maxHp || 1));
    if (!["dead", "captured"].includes(S.phase)) piece(S.player.x, S.player.y, S.player.piece);
    if (S.phase === "dead") {
      let q = pos(S.player.x, S.player.y),
        t = 1 - S.death / 1.1;
      g.save();
      g.globalAlpha = 1 - t;
      g.fillStyle = "#f5efff";
      g.font = "700 " + s * 0.45 + "px 'Gowun Batang', serif";
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
        ui.meter.style.boxShadow = "0 0 15px #f45cf4";
        ui.beat.textContent = Math.max(0, S.beat - S.elapsed).toFixed(1) + "s";
        if (S.elapsed >= S.beat) enemyBeat();
      } else if (S.phase === "player") {
        let comboColor = S.displayChain
          ? COMBO_COLORS[(S.displayChain - 1) % COMBO_COLORS.length]
          : "#53f0e4";
        ui.meter.style.width = Math.min(100, S.displayChain * (100 / 7)) + "%";
        ui.meter.style.background = comboColor;
        ui.meter.style.boxShadow = "0 0 15px " + comboColor;
      } else if (S.phase === "captured") {
        S.captureTimer -= dt;
        ui.meter.style.width = Math.max(0, S.captureTimer / 0.34) * 100 + "%";
        ui.meter.style.background = "#ff315d";
        if (S.captureTimer <= 0) die();
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
    S.enemies.push({ x: q.x, y: q.y, type: "pawn", face: { x: 0, y: 1 }, hp: 1, maxHp: 1 });
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
        knight: "L자 이동",
        bishop: "대각선 3칸 이동",
        rook: "직선 3칸 이동",
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
  ui.rankingButton.addEventListener("click", openRanking);
  ui.gameOverRanking.addEventListener("click", openRanking);
  ui.mainMenuButton.addEventListener("click", returnToMenu);
  ui.rankingClose.addEventListener("click", closeRanking);
  ui.rankingPrev.addEventListener("click", () => loadLeaderboard(leaderboardPage - 1).catch(() => {}));
  ui.rankingNext.addEventListener("click", () => loadLeaderboard(leaderboardPage + 1).catch(() => {}));
  ui.scoreButton.addEventListener("click", () => {
    localStorage.setItem("its-my-turn-ranking-name", ui.scoreName.value.trim());
    submitScore();
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
  setBusVolume("bgm", Math.round(audio.bgmVolume * 50));
  setBusVolume("sfx", Math.round(audio.sfxVolume * 50));
  ui.soundToggle.addEventListener("click", () => ui.soundPanel.classList.toggle("hidden"));
  ui.bgmVolumeRange.addEventListener("input", (e) => setBusVolume("bgm", Number(e.target.value)));
  ui.sfxVolumeRange.addEventListener("input", (e) => setBusVolume("sfx", Number(e.target.value)));
  reset();
  requestAnimationFrame(tick);
})();
