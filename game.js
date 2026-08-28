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
      risk: $("#riskScreen"),
      riskAccept: $("#riskAccept"),
      riskDecline: $("#riskDecline"),
      over: $("#gameOverScreen"),
      result: $("#resultText"),
      resultRank: $("#resultRank"),
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
      tutorial: $("#tutorialScreen"),
      tutorialButton: $("#tutorialButton"),
      tutorialStep: $("#tutorialStep"),
      tutorialEyebrow: $("#tutorialEyebrow"),
      tutorialTitle: $("#tutorialTitle"),
      tutorialCopy: $("#tutorialCopy"),
      tutorialVisual: $("#tutorialVisual"),
      tutorialPrev: $("#tutorialPrev"),
      tutorialNext: $("#tutorialNext"),
      tutorialSkip: $("#tutorialSkip"),
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
      items: [],
      itemCooldown: 0,
      invincibleBeats: 0,
      rangeBoostMoves: 0,
      extendedMoves: 0,
      moves: [],
      moveReach: { x: 1, y: 1 },
      particles: [],
      effects: [],
      trail: [],
      enemyTrail: [],
      upgradeOptions: [],
      upgradeMode: "",
      riskBeats: 0,
    };
  let W = 0,
    H = 0,
    D = 1,
    last = 0;
  const K = (x, y) => x + "," + y,
    dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y),
    COMBO_COLORS = ["#ff4d6d", "#ff9f43", "#ffd166", "#6ee7b7", "#53f0e4", "#758bff", "#d66efd"],
    FIELD_ITEMS = {
      aegis: { icon: "✦", name: "KING'S AEGIS", color: "#8eeaff" },
      stride: { icon: "↔", name: "LONG STRIDE RUNE", color: "#7dffb2" },
      necklace: { icon: "☾", name: "SILVER NECKLACE", color: "#e6e9ff" },
      judgement: { icon: "ϟ", name: "JUDGEMENT", color: "#ffd166" },
      chest: { icon: "▣", name: "TREASURE CHEST", color: "#ffba47" },
    },
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
  async function leaderboardRank(score) {
    let response = await fetch(
      SUPABASE_URL + "/rest/v1/leaderboard?select=score&score=gt." + encodeURIComponent(score),
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY,
          Prefer: "count=exact",
          Range: "0-0",
        },
      },
    );
    if (!response.ok) throw new Error("랭킹을 계산할 수 없습니다.");
    let total = response.headers.get("content-range")?.match(/\/(\d+)$/)?.[1];
    if (total === undefined) throw new Error("랭킹 수를 받지 못했습니다.");
    return Number(total) + 1;
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
  const TUTORIAL_PAGES = [
    {
      eyebrow: "ONE MOVE · ONE TURN",
      title: "빛나는 칸을 선택하세요",
      copy: "빛나는 칸 하나를 골라 움직이세요. 적을 밟아 처치하면 바로 한 번 더 움직일 수 있어요. 아무도 잡지 못한 채 턴을 끝내면, 그때 적들이 한꺼번에 움직입니다.",
      visual: '<div class="tutorial-flow"><b>CAPTURE</b> → MOVE AGAIN &nbsp; / &nbsp; NO CAPTURE → ENEMY TURN</div>',
    },
    {
      eyebrow: "ENEMY DURABILITY",
      title: "적의 색은 남은 내구도입니다",
      copy: "빨강은 한 번, 주황은 두 번 때리면 처치됩니다. 노랑부터 보라까지 갈수록 더 많이 때려야 해요. 적의 내구도만 낮춰도 내 턴은 이어지지만, 적을 오래 살려두는 만큼 판이 복잡해집니다.",
      visual: '<div class="tutorial-swatch" style="color:#ff4d6d;background:#ff4d6d"></div><div class="tutorial-swatch" style="color:#ff9f43;background:#ff9f43"></div><div class="tutorial-swatch" style="color:#ffd166;background:#ffd166"></div><div class="tutorial-swatch" style="color:#6ee7b7;background:#6ee7b7"></div><div class="tutorial-swatch" style="color:#53f0e4;background:#53f0e4"></div><div class="tutorial-swatch" style="color:#758bff;background:#758bff"></div><div class="tutorial-swatch" style="color:#d66efd;background:#d66efd"></div>',
    },
    {
      eyebrow: "FIELD ITEMS",
      title: "아이템은 필드에 따로 나타납니다",
      copy: "아이템은 적을 잡은 자리에 떨어지지 않아요. 적들이 움직인 뒤, 보드의 빈 칸에 가끔 나타납니다. 한 번에 하나만 남아 있고 14턴 동안 먹지 않으면 사라집니다.",
      visual: '<div class="tutorial-item" style="color:#8eeaff">✦ AEGIS</div><div class="tutorial-item" style="color:#7dffb2">↔ STRIDE</div><div class="tutorial-item" style="color:#ffd166">▣ CHEST</div>',
    },
    {
      eyebrow: "BOSS MONSTER",
      title: "보스 몬스터",
      copy: "보스 몬스터는 일반 적과 다르게 특수한 기믹을 갖고 있습니다. 상태 표시와 공격 예고를 잘 보고 조심해서 상대하세요.",
      visual: '<div class="tutorial-boss-demo"><div class="tutorial-boss-piece">♜<small>IRON ROOK · 5/5</small></div><div class="tutorial-boss-line"></div><div class="tutorial-boss-state">LOCKED<br/>DODGE LINE</div></div>',
    },
  ];
  let tutorialPage = 0,
    tutorialStartsRun = false;
  function renderTutorial() {
    let page = TUTORIAL_PAGES[tutorialPage];
    ui.tutorialStep.textContent = String(tutorialPage + 1).padStart(2, "0") + " / " + String(TUTORIAL_PAGES.length).padStart(2, "0");
    ui.tutorialEyebrow.textContent = page.eyebrow;
    ui.tutorialTitle.textContent = page.title;
    ui.tutorialCopy.textContent = page.copy;
    ui.tutorialVisual.innerHTML = page.visual;
    ui.tutorialPrev.disabled = tutorialPage === 0;
    ui.tutorialNext.textContent = tutorialPage === TUTORIAL_PAGES.length - 1 ? (tutorialStartsRun ? "시작하기" : "닫기") : "다음";
    ui.tutorialSkip.textContent = tutorialStartsRun ? "건너뛰고 시작" : "닫기";
  }
  function openTutorial(startAfter = false) {
    tutorialPage = 0;
    tutorialStartsRun = startAfter;
    renderTutorial();
    ui.tutorial.classList.remove("hidden");
  }
  function beginRun() {
    reset();
    S.dev = ui.devToggle.checked;
    ui.devBar.classList.toggle("hidden", !S.dev);
    S.running = true;
    startBgm();
    ui.start.classList.add("hidden");
  }
  function closeTutorial(startRun = false) {
    ui.tutorial.classList.add("hidden");
    if (startRun || tutorialPage === TUTORIAL_PAGES.length - 1)
      localStorage.setItem("its-my-turn-tutorial-seen", "1");
    if (startRun) {
      beginRun();
    }
  }
  async function offerScoreSubmission(score) {
    ui.scoreSubmit.classList.add("hidden");
    ui.scoreStatus.textContent = "글로벌 랭킹을 확인하는 중…";
    try {
      let [rows, cutoff, rank] = await Promise.all([
          loadLeaderboard(),
          leaderboardCutoff(),
          leaderboardRank(score).catch(() => null),
        ]),
        topTen = isTopTenScore(score, rows),
        qualifies = score > 0 && (cutoff === null || score > cutoff);
      ui.resultRank.textContent = rank
        ? rank <= LEADERBOARD_STORE_LIMIT
          ? "현재 점수 기준 예상 " + rank.toLocaleString() + "위"
          : "현재 점수 기준 TOP 10,000 밖"
        : "현재 점수의 순위를 불러오지 못했습니다.";
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
      ui.resultRank.textContent = "현재 점수의 순위를 불러오지 못했습니다.";
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
    // The UI remains 0–100%, while 100% deliberately maps to 500% internal gain.
    bgmVolume: Number.isFinite(savedBgmVolume) ? Math.max(0, Math.min(5, savedBgmVolume * 0.05)) : initialVolume * 0.05,
    sfxVolume: Number.isFinite(savedSfxVolume) ? Math.max(0, Math.min(5, savedSfxVolume * 0.05)) : initialVolume * 0.05,
  };
  function setBusVolume(bus, value) {
    let slider = Math.max(0, Math.min(100, value));
    audio[bus + "Volume"] = slider * 0.05;
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
    S.elapsed = S.flash = S.wave = S.kills = S.score = S.death = S.chain = S.riskBeats = 0;
    S.items = [];
    S.itemCooldown = S.invincibleBeats = S.rangeBoostMoves = S.extendedMoves = 0;
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
  function gainXp(amount) {
    let multiplier = S.player.piece === "king" ? 1.5 : 1;
    S.player.xp = Math.round((S.player.xp + amount * multiplier) * 2) / 2;
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
    let longStride = p.traits?.includes("longStride"),
      fieldStride = S.rangeBoostMoves > 0,
      extraRange = fieldStride ? 2 : 0;
    if (piece === "pawn" || piece === "king")
      base = king.flatMap(([x, y]) =>
        Array.from({ length: (longStride ? 3 : 1) + extraRange }, (_, i) => [x * (i + 1), y * (i + 1)]),
      );
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
      if (longStride || fieldStride)
        base.push(
          [1, 3], [3, 1], [3, -1], [1, -3],
          [-1, -3], [-3, -1], [-3, 1], [-1, 3],
        );
      if (fieldStride)
        base.push(
          [1, 4], [4, 1], [4, -1], [1, -4],
          [-1, -4], [-4, -1], [-4, 1], [-1, 4],
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
        range = (longStride ? 5 : 3) + extraRange;
      base = b.flatMap(([x, y]) =>
        Array.from({ length: range }, (_, i) => [x * (i + 1), y * (i + 1)]),
      );
      if (piece === "bishop") base.push([0, -1]);
    }
    if (!p.traits?.includes("royalStep")) return base;
    let royal = king.flatMap(([x, y]) => [[x, y], [x * 2, y * 2]]);
    return [...base, ...royal].filter(([x, y], i, all) => all.findIndex(([a, b]) => a === x && b === y) === i);
  }
  function moves() {
    let p = S.player;
    S.moves = dirs(p.piece)
      .map(([x, y]) => ({ x: p.x + x, y: p.y + y }))
      .filter((m) => !S.enemies.some((e) => e.boss && e.x === m.x && e.y === m.y && e.bossPhase !== "vulnerable"));
    S.moveReach = {
      x: Math.max(1, ...S.moves.map((m) => Math.abs(m.x - p.x))),
      y: Math.max(1, ...S.moves.map((m) => Math.abs(m.y - p.y))),
    };
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
      (e) => S.enemies.includes(e) && !hitSet?.has(e) && (!e.boss || e.bossPhase === "vulnerable"),
    );
    if (!victims.length) return { hits: 0, kills: 0, points: 0 };
    victims.forEach((e) => hitSet?.add(e));
    let dead = [];
    victims.forEach((e) => {
      e.hp = (e.hp || 1) - 1;
      if (e.hp <= 0) {
        dead.push(e);
        captureBurst(e.x, e.y, combo);
      } else {
        if (e.boss) e.bossPhase = "recover";
        hitBurst(e.x, e.y, combo);
      }
    });
    S.enemies = S.enemies.filter((e) => !dead.includes(e));
    if (dead.length) {
      gainXp(dead.reduce((sum, e) => sum + (e.boss ? 5 : e.risk ? 2 : 1), 0));
      S.kills += dead.length;
    }
    return {
      hits: victims.length,
      kills: dead.length,
      points: dead.reduce((sum, e) => sum + (e.boss ? 5000 : 100 * (e.maxHp || 1) * (e.risk ? 1.5 : 1)), 0),
    };
  }
  function rollFieldItem() {
    let roll = Math.random() * 100;
    return roll < 40 ? "chest" : roll < 65 ? "necklace" : roll < 85 ? "stride" : roll < 95 ? "aegis" : "judgement";
  }
  function spawnFieldItem() {
    if (S.items.length || S.itemCooldown) return;
    let p = S.player,
      r = 5 + Math.min(S.wave, 6),
      side = Math.floor(Math.random() * 4),
      x = p.x,
      y = p.y;
    if (side === 0) { x += Math.floor(Math.random() * (r * 2 + 1)) - r; y -= r; }
    if (side === 1) { x += r; y += Math.floor(Math.random() * (r * 2 + 1)) - r; }
    if (side === 2) { x += Math.floor(Math.random() * (r * 2 + 1)) - r; y += r; }
    if (side === 3) { x -= r; y += Math.floor(Math.random() * (r * 2 + 1)) - r; }
    if (S.enemies.some((e) => e.x === x && e.y === y) || (x === p.x && y === p.y)) return;
    let type = rollFieldItem();
    S.items.push({ type, x, y, life: 14 });
    S.itemCooldown = 2;
    burst(x, y, FIELD_ITEMS[type].color, 14);
  }
  function collectItemsAt(x, y, combo, hitSet) {
    let picked = S.items.filter((item) => item.x === x && item.y === y),
      result = { hits: 0, kills: 0, points: 0, names: [] };
    if (!picked.length) return result;
    S.items = S.items.filter((item) => item.x !== x || item.y !== y);
    picked.forEach((item) => {
      let data = FIELD_ITEMS[item.type];
      result.names.push(data.name);
      burst(x, y, data.color, 24);
      if (item.type === "aegis") S.invincibleBeats = Math.max(S.invincibleBeats, 2);
      if (item.type === "stride") S.rangeBoostMoves = Math.max(S.rangeBoostMoves, 3);
      if (item.type === "necklace") S.extendedMoves = Math.max(S.extendedMoves, 2);
      if (item.type === "chest") {
        let gold = S.wave * 100;
        S.score += gold;
        result.names[result.names.length - 1] += " +" + gold.toLocaleString() + "점";
      }
      if (item.type === "judgement") {
        let hit = damageEnemies([...S.enemies], combo, hitSet);
        result.hits += hit.hits;
        result.kills += hit.kills;
        result.points += hit.points;
      }
    });
    return result;
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
          : 1,
      risk = S.riskBeats > 0;
    if (risk) maxHp = Math.min(7, maxHp + 1);
    S.enemies.push({
      x,
      y,
      type: ts[Math.floor(Math.random() * ts.length)],
      face,
      hp: maxHp,
      maxHp,
      risk,
    });
  }
  function boss() {
    return S.enemies.find((e) => e.boss);
  }
  function spawnRookBoss() {
    if (boss()) return;
    let p = S.player,
      spots = [[0, -4], [4, 0], [0, 4], [-4, 0]]
        .sort(() => Math.random() - 0.5)
        .map(([x, y]) => ({ x: p.x + x, y: p.y + y })),
      q = spots.find((spot) => !S.enemies.some((e) => e.x === spot.x && e.y === spot.y));
    if (!q) return;
    S.enemies.push({
      x: q.x,
      y: q.y,
      type: "rook",
      hp: 5,
      maxHp: 5,
      boss: true,
      bossPhase: "telegraph",
      bossAxis: Math.random() < 0.5 ? "row" : "column",
    });
    burst(q.x, q.y, "#ff5577", 42);
  }
  function advanceRookBoss() {
    let e = boss();
    if (!e) return null;
    if (e.bossPhase === "telegraph") {
      let hit = e.bossAxis === "row" ? S.player.y === e.y : S.player.x === e.x;
      if (hit) return { boss: e, from: { x: e.x, y: e.y } };
      e.bossPhase = "vulnerable";
      burst(e.x, e.y, "#53f0e4", 28);
      return null;
    }
    e.bossPhase = "telegraph";
    e.bossAxis = Math.random() < 0.5 ? "row" : "column";
    return null;
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
    let invulnerable = S.invincibleBeats > 0;
    if (invulnerable) S.invincibleBeats--;
    S.itemCooldown = Math.max(0, S.itemCooldown - 1);
    S.items = S.items.filter((item) => --item.life > 0);
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
    let bossStrike = advanceRookBoss();
    if (bossStrike && !invulnerable) {
      let e = bossStrike.boss;
      e.x = S.player.x;
      e.y = S.player.y;
      S.enemyTrail.push({ x1: bossStrike.from.x, y1: bossStrike.from.y, x2: e.x, y2: e.y });
      burst(e.x, e.y, "#ff5577", 36);
      S.phase = "captured";
      S.captureTimer = 0.34;
      S.flash = 0;
      ui.phase.textContent = "CHECKMATE";
      ui.beat.textContent = "ROOK STRIKE";
      ui.hint.textContent = "철의 룩이 예고한 줄을 관통했습니다.";
      return;
    }
    if (bossStrike && invulnerable) burst(S.player.x, S.player.y, "#8eeaff", 26);
    let used = new Set(),
      captured = false,
      killer = null;
    S.enemies
      .filter((e) => !e.boss)
      .sort((a, b) => dist(a, S.player) - dist(b, S.player))
      .forEach((e) => {
        let from = { x: e.x, y: e.y },
          n = toward(e);
        if (n.x === S.player.x && n.y === S.player.y) {
          captured = true;
          if (!killer && S.grace <= 0 && !invulnerable) {
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
    if (captured && S.grace <= 0 && !invulnerable) {
      S.phase = "captured";
      S.captureTimer = 0.34;
      S.flash = 0;
      ui.phase.textContent = "CHECKMATE";
      ui.beat.textContent = "CAPTURED";
      ui.hint.textContent = "적 말이 당신의 칸을 점령했습니다.";
      return;
    }
    if (captured && invulnerable) burst(S.player.x, S.player.y, "#8eeaff", 20);
    S.grace = Math.max(0, S.grace - 1);
    let enemySpawns = S.wave % 4 === 0 ? 2 : 1;
    for (let i = 0; i < enemySpawns; i++) spawn();
    if (S.wave % 30 === 0) spawnRookBoss();
    if (Math.random() < 1 - Math.pow(0.92, enemySpawns)) spawnFieldItem();
    if (S.riskBeats > 0) S.riskBeats--;
    hud();
    if (S.wave % 20 === 0) {
      offerRisk();
      return;
    }
    beginPlayerTurn();
  }
  function beginPlayerTurn() {
    S.phase = "player";
    S.flash = 1;
    moves();
    ui.phase.textContent = "YOUR MOVE";
    ui.beat.textContent = "MOVE NOW";
    let ironRook = boss();
    ui.hint.textContent = S.grace
      ? "준비 박자 " + S.grace + " — 아직은 잡히지 않습니다."
      : ironRook?.bossPhase === "telegraph"
        ? "철의 룩이 " + (ironRook.bossAxis === "row" ? "가로" : "세로") + " 줄을 예고합니다 — 붉은 선 밖으로 이동하세요."
        : ironRook?.bossPhase === "vulnerable"
          ? "철의 룩 코어 노출! 지금 룩을 밟아 피해를 주세요."
      : S.riskBeats
        ? "위험 계약 " + S.riskBeats + "박자 남음 — 강화 적 처치 시 XP ×2 · 점수 ×1.5"
        : "빛나는 칸을 한 번 선택하세요 — 적을 밟으면 XP를 얻습니다.";
  }
  function offerRisk() {
    S.phase = "risk";
    ui.risk.classList.remove("hidden");
    ui.hint.textContent = "위험 계약을 수락하거나 거절하세요.";
  }
  function resolveRisk(accept) {
    if (S.phase !== "risk") return;
    ui.risk.classList.add("hidden");
    if (accept) {
      S.riskBeats = 10;
      ui.hint.textContent = "위험 계약 체결 — 강화 적에서 XP ×2 · 점수 ×1.5!";
      sfx("capture", 4);
    } else {
      ui.hint.textContent = "계약을 거절했습니다. 안전한 전투를 계속합니다.";
    }
    beginPlayerTurn();
  }
  function playerMove(m) {
    if (S.phase !== "player") return;
    let p = S.player,
      from = { x: p.x, y: p.y },
      usedRangeBoost = S.rangeBoostMoves > 0,
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
    if (usedRangeBoost) S.rangeBoostMoves--;
    sfx("move");
    S.trail.push({ x1: from.x, y1: from.y, x2: p.x, y2: p.y, via: p.piece === "knight" ? knightCorner(from, p) : null, life: 1 });
    if (p.traits.includes("longStride") && (Math.abs(m.x - from.x) > 1 || Math.abs(m.y - from.y) > 1))
      traitFx("stride", p.x, p.y, { dx, dy });
    if (p.traits.includes("royalStep")) traitFx("royal", p.x, p.y);
    let pickup = collectItemsAt(p.x, p.y, combo, struck);
    attacked ||= pickup.hits > 0;
    gained += pickup.kills;
    earned += pickup.points;
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
      gainXp(1);
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
    if (S.extendedMoves > 0) {
      S.extendedMoves--;
      S.flash = 1;
      moves();
      ui.hint.textContent = "은 목걸이 — 처치 없이 한 번 더 움직입니다. (" + S.extendedMoves + "회 남음)";
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
          bishop: "대각선 3칸 · 위로 1칸",
          rook: "직선 3칸 이동",
          queen: "8방향 3칸 이동",
          king: "8방향 1칸 · XP ×1.5",
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
    ui.resultRank.textContent = "현재 점수의 순위를 계산하는 중…";
    ui.scoreSubmit.classList.add("hidden");
    ui.scoreName.value = localStorage.getItem("its-my-turn-ranking-name") || "";
    ui.scoreMessage.value = "";
    ui.scoreStatus.textContent = "";
    ui.over.classList.remove("hidden");
    offerScoreSubmission(S.finalScore);
  }
  function size() {
    let base = Math.max(48, Math.min(76, Math.min(W, H) / 8.5)),
      reach = S.moveReach;
    // Persist the scale selected for the current move set through the move
    // animation; it is refreshed only when the next move set is generated.
    if (!matchMedia("(max-width:560px)").matches || !reach) return base;
    let fitted = Math.min(W / (reach.x * 2 + 1.15), H / (reach.y * 2 + 1.15));
    return Math.max(base * 0.7, Math.min(base, fitted));
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
  function piece(x, y, t, enemy = false, hp = 1, maxHp = 1, risk = false, bossPiece = false, bossPhase = "") {
    let q = pos(x, y),
      s = size(),
      // The color communicates remaining hits, not the enemy's original maximum.
      // A 2-health orange enemy becomes red after its first hit.
      durability = COMBO_COLORS[Math.max(0, Math.min(6, hp - 1))],
      col = bossPiece ? (bossPhase === "vulnerable" ? "#53f0e4" : "#ff5577") : enemy ? durability : "#53f0e4",
      health = Math.max(0, Math.min(1, hp / maxHp));
    g.save();
    g.shadowBlur = bossPiece ? 38 : enemy ? 20 : 30;
    g.shadowColor = col;
    g.globalAlpha = enemy ? 0.68 + health * 0.32 : 1;
    g.fillStyle = enemy ? col : "#f1ffff";
    g.font = "700 " + s * (bossPiece ? 0.94 : 0.62) + "px Georgia, 'Times New Roman', serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(enemy ? enemyGlyph[t] : glyph[t], q.x, q.y);
    if (enemy && risk) {
      g.fillStyle = "#f45cf4";
      g.shadowColor = "#f45cf4";
      g.shadowBlur = 10;
      g.font = "700 " + s * 0.2 + "px serif";
      g.fillText("◆", q.x + s * 0.28, q.y - s * 0.3);
    }
    if (bossPiece) {
      g.strokeStyle = col;
      g.lineWidth = 2;
      g.strokeRect(q.x - s * 0.46, q.y - s * 0.46, s * 0.92, s * 0.92);
      let exposed = bossPhase === "vulnerable";
      let bossStatus = exposed
        ? "◆ CORE OPEN — STRIKE!"
        : bossPhase === "recover"
          ? "✕ ARMOR RESETTING"
          : "✕ LOCKED — DODGE LINE";
      g.fillStyle = exposed ? "#062427" : "#310d19";
      g.strokeStyle = col;
      g.lineWidth = 1;
      g.fillRect(q.x - s * 0.72, q.y - s * 0.84, s * 1.44, s * 0.22);
      g.strokeRect(q.x - s * 0.72, q.y - s * 0.84, s * 1.44, s * 0.22);
      g.fillStyle = exposed ? "#cafffb" : "#ffd5de";
      g.font = "700 " + s * 0.115 + "px monospace";
      g.fillText(bossStatus, q.x, q.y - s * 0.73);
      g.fillStyle = "#fff0f4";
      g.font = "700 " + s * 0.15 + "px monospace";
      g.fillText("IRON ROOK · " + hp + "/" + maxHp, q.x, q.y + s * 0.62);
    }
    g.restore();
  }
  function fieldItem(item) {
    let q = pos(item.x, item.y),
      s = size(),
      data = FIELD_ITEMS[item.type],
      pulse = 0.78 + Math.sin(performance.now() / 180) * 0.18;
    g.save();
    g.globalAlpha = Math.min(1, item.life / 1.3) * pulse;
    g.fillStyle = "#11172c";
    g.strokeStyle = data.color;
    g.shadowColor = data.color;
    g.shadowBlur = 18;
    g.lineWidth = 2.5;
    g.fillRect(q.x - s * 0.26, q.y - s * 0.26, s * 0.52, s * 0.52);
    g.strokeRect(q.x - s * 0.26, q.y - s * 0.26, s * 0.52, s * 0.52);
    g.fillStyle = data.color;
    g.font = "700 " + s * 0.31 + "px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(data.icon, q.x, q.y + s * 0.01);
    g.restore();
  }
  function edgeMoveTargets() {
    if (S.phase !== "player") return [];
    return S.moves
      .map((m) => {
        let q = pos(m.x, m.y);
        if (q.x >= 18 && q.x <= W - 18 && q.y >= 18 && q.y <= H - 18) return null;
        let dx = q.x - W / 2,
          dy = q.y - H / 2,
          scale = Math.min((W / 2 - 23) / Math.max(1, Math.abs(dx)), (H / 2 - 23) / Math.max(1, Math.abs(dy)));
        return { m, x: W / 2 + dx * scale, y: H / 2 + dy * scale, angle: Math.atan2(dy, dx) };
      })
      .filter(Boolean);
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
    let ironRook = boss();
    if (ironRook?.bossPhase === "telegraph") {
      let q = pos(ironRook.x, ironRook.y);
      g.save();
      g.globalAlpha = 0.6 + Math.sin(performance.now() / 130) * 0.18;
      g.strokeStyle = "#ff5577";
      g.shadowColor = "#ff315d";
      g.shadowBlur = 16;
      g.lineWidth = Math.max(3, s * 0.09);
      g.setLineDash([9, 8]);
      g.beginPath();
      if (ironRook.bossAxis === "row") {
        g.moveTo(0, q.y);
        g.lineTo(W, q.y);
      } else {
        g.moveTo(q.x, 0);
        g.lineTo(q.x, H);
      }
      g.stroke();
      g.restore();
    }
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
        bossTarget = S.enemies.some(
          (e) => e.boss && e.bossPhase === "vulnerable" && e.x === m.x && e.y === m.y,
        ),
        active = S.phase === "player",
        a = active
          ? 0.2 + 0.19 * Math.sin(performance.now() / 100) + S.flash * 0.35
          : 0.07;
      g.fillStyle = bossTarget ? "rgba(255,209,102," + Math.min(0.9, a + 0.25) + ")" : "rgba(83,240,228," + a + ")";
      g.fillRect(q.x - s * 0.42, q.y - s * 0.42, s * 0.84, s * 0.84);
      g.strokeStyle = bossTarget ? "#ffd166" : active ? "#53f0e4" : "#53f0e466";
      g.lineWidth = active ? 2 : 1;
      g.strokeRect(q.x - s * 0.42, q.y - s * 0.42, s * 0.84, s * 0.84);
      if (bossTarget) {
        g.save();
        g.fillStyle = "#fff6c8";
        g.shadowColor = "#ffd166";
        g.shadowBlur = 15;
        g.font = "700 " + s * 0.18 + "px monospace";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("STRIKE", q.x, q.y);
        g.restore();
      }
    });
    // Off-screen moves stay selectable through a directional edge control,
    // keeping the board at a stable, readable scale.
    edgeMoveTargets().forEach((target) => {
      g.save();
      g.translate(target.x, target.y);
      g.rotate(target.angle);
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
    if (S.phase === "captured") piece(S.player.x, S.player.y, S.player.piece);
    S.items.forEach(fieldItem);
    S.enemies.forEach((e) => piece(e.x, e.y, e.type, true, e.hp || 1, e.maxHp || 1, e.risk, e.boss, e.bossPhase));
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
    if (!m) {
      let tx = e.clientX - r.left,
        ty = e.clientY - r.top,
        edge = edgeMoveTargets().find((target) => Math.hypot(target.x - tx, target.y - ty) < 30);
      m = edge?.m;
    }
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
        bishop: "대각선 3칸 · 위로 1칸",
        rook: "직선 3칸 이동",
        queen: "8방향 3칸",
        king: "8방향 1칸 · XP ×1.5",
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
    if (localStorage.getItem("its-my-turn-tutorial-seen")) beginRun();
    else openTutorial(true);
  });
  ui.tutorialButton.addEventListener("click", () => openTutorial(false));
  ui.tutorialPrev.addEventListener("click", () => {
    if (tutorialPage === 0) return;
    tutorialPage--;
    renderTutorial();
  });
  ui.tutorialNext.addEventListener("click", () => {
    if (tutorialPage < TUTORIAL_PAGES.length - 1) {
      tutorialPage++;
      renderTutorial();
    } else closeTutorial(tutorialStartsRun);
  });
  ui.tutorialSkip.addEventListener("click", () => closeTutorial(tutorialStartsRun));
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
  ui.riskAccept.addEventListener("click", () => resolveRisk(true));
  ui.riskDecline.addEventListener("click", () => resolveRisk(false));
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
  setBusVolume("bgm", Math.round(audio.bgmVolume / 0.05));
  setBusVolume("sfx", Math.round(audio.sfxVolume / 0.05));
  ui.soundToggle.addEventListener("click", () => ui.soundPanel.classList.toggle("hidden"));
  ui.bgmVolumeRange.addEventListener("input", (e) => setBusVolume("bgm", Number(e.target.value)));
  ui.sfxVolumeRange.addEventListener("input", (e) => setBusVolume("sfx", Number(e.target.value)));
  reset();
  requestAnimationFrame(tick);
})();
