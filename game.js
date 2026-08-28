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
      preToggle: $("#preToggle"),
      devPassword: $("#devPasswordScreen"),
      devPasswordInput: $("#devPasswordInput"),
      devPasswordStatus: $("#devPasswordStatus"),
      devPasswordSubmit: $("#devPasswordSubmit"),
      devPasswordCancel: $("#devPasswordCancel"),
      devSpeed: $("#devSpeed"),
      devAuto: $("#devAuto"),
      devPick: $("#devPickScreen"),
      devPickTitle: $("#devPickTitle"),
      devPickOptions: $("#devPickOptions"),
      soundToggle: $("#soundToggle"),
      soundPanel: $("#soundPanel"),
      bgmVolumeRange: $("#bgmVolumeRange"),
      bgmVolumeValue: $("#bgmVolumeValue"),
      sfxVolumeRange: $("#sfxVolumeRange"),
      sfxVolumeValue: $("#sfxVolumeValue"),
      offscreenIndicatorToggle: $("#offscreenIndicatorToggle"),
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
    // PRE MODE uses outlines extracted from macOS Apple Symbols — the exact
    // font fallback used by the original canvas glyphs on this Mac. Keeping
    // the paths here prevents iOS from substituting a different pawn glyph.
    preSvgShapes = {
      pawn: 'M1422 -299H116Q116 -165 136.5 -75Q157 15 206 95Q268 196 336.5 255.5Q405 315 525 371Q477 432 459.5 480Q442 528 442 601Q442 686 490.5 758.5Q539 831 629 881Q574 960 574 1006Q574 1087 630 1143.5Q686 1200 767 1200Q843 1200 899 1143.5Q955 1087 955 1010Q955 957 899 884Q1007 828 1046 760Q1095 675 1095 591Q1095 481 1013 373Q1141 309 1208 251.5Q1275 194 1328 102Q1423 -61 1423 -246Z',
      knight: 'M1420 -300H494Q489 -256 489 -231Q489 -156 535.5 -45Q582 66 651 155L721 245Q779 320 816 436Q749 348 681.5 306Q614 264 509 246Q473 162 440 127Q407 92 364 92Q356 92 335 93Q373 123 398 172Q322 102 293 102Q258 102 193.5 171Q129 240 129 277Q129 318 163.5 406.5Q198 495 241 566L300 662Q325 703 348 765Q379 851 404 879.5Q429 908 507 948Q485 993 473 1015L439 1072Q431 1087 431 1103Q431 1126 462 1126Q488 1126 539.5 1088Q591 1050 645 992Q659 1051 659 1071L657 1142Q657 1174 668 1186Q674 1193 685 1193Q775 1193 828 1003Q1011 935 1121 820Q1224 711 1308 537Q1358 434 1392.5 256.5Q1427 79 1427 -78L1423 -183ZM1357 -226L1361 -88Q1361 79 1331.5 237.5Q1302 396 1251 507Q1175 671 1084 765.5Q993 860 842 933L852 874Q1071 756 1191 509Q1311 262 1311 -71L1310 -133L1308 -226ZM593 828Q516 817 490 789.5Q464 762 464 691L477 703Q528 718 534 730L570 795Q576 807 593 828ZM288 312Q246 308 228 269Q242 265 252 265Q288 265 288 305Q288 306 288 312Z',
      bishop: 'M1121 77Q978 121 888 121Q786 121 611 80Q757 20 865 20Q976 20 1121 77ZM1115 126L1059 281Q942 316 879 316Q808 316 677 281L624 130Q767 169 874 169Q973 169 1115 126ZM922 500V607H1071L1072 717H924L923 832H814V715L655 716L653 607H815L816 502ZM1560 -300Q1454 -232 1375 -201Q1266 -160 1248 -161L990 -182Q970 -184 888 -134V-29Q877 -30 873 -30Q865 -30 853 -28L852 -134Q761 -176 713 -179Q708 -179 587 -165Q561 -162 536 -162Q453 -162 377 -190.5Q301 -219 181 -296L179 -159Q282 -95 375 -63Q480 -28 489 -29L746 -67Q758 -69 816 -28Q721 -15 671.5 1Q622 17 534 62L618 289Q523 375 486 450.5Q449 526 449 636Q449 788 547 902.5Q645 1017 828 1080Q759 1143 759 1189Q759 1231 790.5 1261.5Q822 1292 866 1292Q910 1292 943 1261.5Q976 1231 976 1190Q976 1142 900 1077Q1001 1050 1060 1013.5Q1119 977 1183 903Q1293 776 1293 624Q1293 433 1118 294L1203 63Q1080 8 1042 -3.5Q1004 -15 920 -25Q978 -65 990 -63L1235 -29Q1240 -28 1292 -45L1414 -86Q1452 -98 1559 -158Z',
      rook: 'M1390 -300H150V-107H243L241 28H293L448 182L445 738L346 835L272 834V1125L468 1124L469 1022L626 1020V1125H936V1019H1081V1122L1283 1124V837L1208 836L1107 733V173L1253 27H1300V-110H1390ZM1321 -247V-162H216L217 -246ZM1229 -110L1230 -27H313L314 -108ZM1176 28L1103 104H444L371 29ZM1067 773L1133 837H424L488 773ZM1229 893L1228 966H326V894Z',
      queen: 'M1200 -140L1194 -65Q1095 -30 1031.5 -19Q968 -8 856 -8Q676 -8 512 -62L508 -139Q672 -87 855 -87Q1018 -87 1200 -140ZM1192 -13L1189 61Q1010 115 865 115Q704 115 516 59L513 -12Q682 43 855 43Q1013 43 1192 -13ZM1193 102L1198 184Q1027 240 847 240Q682 240 509 185L514 105Q684 159 848 159Q1017 159 1193 102ZM1287 -268Q1085 -295 844 -295Q673 -295 419 -271Q452 -70 452 61L450 175L241 758Q224 756 211 756Q176 756 146.5 791.5Q117 827 117 869Q117 913 151 945.5Q185 978 231 978Q273 978 308.5 948Q344 918 344 882Q344 842 297 779L530 425L515 906Q412 924 412 1018Q412 1063 444.5 1096Q477 1129 522 1129Q569 1129 602.5 1094.5Q636 1060 636 1013Q636 972 576 917L739 477L814 995Q739 1032 739 1096Q739 1146 771.5 1178.5Q804 1211 854 1211Q900 1211 932 1179.5Q964 1148 964 1103Q964 1039 885 994L964 481L1125 920Q1066 965 1066 1016Q1066 1064 1099.5 1097Q1133 1130 1181 1130Q1229 1130 1261.5 1098.5Q1294 1067 1294 1021Q1294 933 1184 906L1169 426L1403 782Q1357 838 1355 875Q1353 912 1391.5 947.5Q1430 983 1472 983Q1518 983 1551 949.5Q1584 916 1584 869Q1584 781 1458 761L1255 192Q1255 -76 1287 -268Z',
      king: 'M1216 -271Q1040 -299 951 -299L803 -296H666Q589 -296 397 -270L419 168Q168 409 168 616Q168 776 282 860Q378 930 478 930Q558 930 664 846Q643 903 643 949Q643 1037 763 1047V1120H671L669 1190H763V1273L849 1272L851 1190L939 1189L940 1122H850L849 1043Q959 1031 959 951Q959 897 937 834Q998 887 1039.5 904Q1081 921 1152 921Q1279 921 1357 833Q1435 745 1435 602Q1435 381 1190 171ZM1132 -153L1123 -69Q922 -32 791 -32Q664 -32 488 -67L480 -154Q666 -120 791 -120Q916 -120 1132 -153ZM1116 5L1107 111Q929 138 798 138Q660 138 505 116L495 6Q654 38 779 38Q925 38 1116 5ZM1094 212Q1233 332 1292 423Q1351 514 1351 609Q1351 712 1293.5 776Q1236 840 1144 840Q1008 840 931 688Q854 536 854 269V227L976 220ZM1089 268L913 281Q913 503 976.5 641Q1040 779 1142 779Q1210 779 1251 731.5Q1292 684 1292 605Q1292 486 1149 335Q1128 313 1089 268ZM754 228Q754 500 701 645Q630 838 467 838Q378 838 315.5 775Q253 712 253 623Q253 521 311 427Q369 333 506 214Q647 228 754 228ZM700 284L516 270Q316 482 316 617Q316 688 357.5 734.5Q399 781 463 781Q572 781 636 646.5Q700 512 700 284ZM805 544Q839 631 862 729.5Q885 828 885 886Q885 933 861.5 965.5Q838 998 804 998Q777 998 751.5 970.5Q726 943 726 914Q726 762 805 544ZM804 687Q771 824 771 872Q771 900 781.5 924Q792 948 805 949Q837 951 837 886Q837 864 831 821L821 756Q818 738 804 687Z',
    },
    // Each glyph has a different font advance width. Offset its outline so
    // the fixed SVG frame centers it exactly like canvas textAlign="center".
    preSvgOffsets = { pawn: 98.5, knight: 91, bishop: 0, rook: 93, queen: 36, king: 75.5 },
    preSvgImages = new Map(),
    S = {
      running: false,
      dev: false,
      pre: false,
      devSpeed: 1,
      autoPlay: false,
      autoElapsed: 0,
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
      terrain: [],
      wormholeId: 0,
      terrainNotice: "",
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
      showOffscreenIndicators: true,
    };
  let W = 0,
    H = 0,
    D = 1,
    last = 0;
  const DEV_PASSWORD_HASH = "c4876de490dcf38b74d6c0d4f120cf01126c3d6a3a49b93ec81caae38ea1497e";
  let devUnlocked = sessionStorage.getItem("its-my-turn-dev-unlocked") === "1",
    passwordTarget = "dev";
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
  const BOSS_TYPES = {
    rook: { name: "IRON ROOK", hp: 5, xp: 5, score: 5000, axes: ["row", "column"] },
    bishop: { name: "VOID BISHOP", hp: 6, xp: 6, score: 6500, axes: ["diagDown", "diagUp"] },
    queen: { name: "CROWN QUEEN", hp: 7, xp: 8, score: 8000, axes: ["row", "column", "diagDown", "diagUp"] },
    bloodQueen: { name: "BLOOD QUEEN", piece: "queen", hp: 8, xp: 10, score: 10000, axes: ["row", "column", "diagDown", "diagUp"], gimmick: "blood", seals: 4 },
    checkmateBishop: { name: "CHECKMATE BISHOP", piece: "bishop", hp: 7, xp: 9, score: 9000, axes: ["diagDown", "diagUp"], gimmick: "sanctuary" },
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
      copy: "아이템은 적을 잡은 자리에 떨어지지 않아요. 적들이 움직인 뒤, 보드의 빈 칸에 가끔 나타납니다. 보드 위에는 동시에 2개 이상의 아이템이 있을 수 없고, 14턴 동안 먹지 않으면 사라집니다.",
      visual: '<div class="tutorial-codex"><div class="tutorial-entry" style="color:#8eeaff"><b>✦ KING’S AEGIS</b><span>다음 적 턴 2회 동안 무적</span></div><div class="tutorial-entry" style="color:#7dffb2"><b>↔ LONG STRIDE RUNE</b><span>다음 3회 이동 사거리 +2</span></div><div class="tutorial-entry" style="color:#e6e9ff"><b>☾ SILVER NECKLACE</b><span>비처치 이동 2회도 턴 유지</span></div><div class="tutorial-entry" style="color:#ffd166"><b>ϟ JUDGEMENT</b><span>보드 위 모든 적에게 1 피해</span></div><div class="tutorial-entry" style="color:#ffba47"><b>▣ TREASURE CHEST</b><span>현재 웨이브 × 100점 획득</span></div></div>',
    },
    {
      eyebrow: "BOSS MONSTER",
      title: "보스 몬스터",
      copy: "붉은 LOCKED 상태에서는 공격할 수 없습니다. IRON ROOK는 가로·세로, VOID BISHOP은 대각선, CROWN QUEEN은 모든 줄을 예고합니다. BLOOD QUEEN은 일반 적 4기를 처치해야 열리고, CHECKMATE BISHOP은 청록 SAFE 구역으로 이동해야 합니다. 공격 뒤에도 내 턴이 이어집니다.",
      visual: '<div class="tutorial-boss-compare"><div class="tutorial-boss-card"><div class="tutorial-boss-piece">♛</div><span>✕ LOCKED<br/>DODGE LINE<br/>공격 불가</span></div><div class="tutorial-boss-card open"><div class="tutorial-boss-piece">♛</div><span>◆ CORE OPEN<br/>STRIKE<br/>공격 가능</span></div></div>',
    },
    {
      eyebrow: "RISING TERRAIN",
      title: "웨이브가 오르면 보드도 바뀝니다",
      copy: "벽은 장벽 형태로 나타나며 통과할 수 없고 장거리 이동도 막습니다. 파란 2×2 증폭 지대는 사거리 +1, 붉은 2×2 감쇠 지대는 사거리 −1입니다. 웜홀에 들어가면 같은 색의 반대편 출구로 이동합니다.",
      visual: '<div class="tutorial-codex"><div class="tutorial-entry" style="color:#aeb7d3"><b>▦ WALL</b><span>장벽 형태 · 플레이어·적 통과 불가</span></div><div class="tutorial-entry" style="color:#5a8dff"><b>^ AMPLIFIER</b><span>2×2 구역 · 출발 시 사거리 +1</span></div><div class="tutorial-entry" style="color:#ff5577"><b>v INHIBITOR</b><span>2×2 구역 · 출발 시 사거리 −1</span></div><div class="tutorial-entry" style="color:#b971ff"><b>▣ WORMHOLE</b><span>같은 색의 반대편 출구로 이동</span></div></div>',
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
    S.dev = ui.devToggle.checked && devUnlocked;
    S.pre = ui.preToggle.checked && devUnlocked;
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
  function setOffscreenIndicators(enabled) {
    S.showOffscreenIndicators = enabled;
    localStorage.setItem("its-my-turn-offscreen-indicators-v1", enabled ? "1" : "0");
    ui.offscreenIndicatorToggle.checked = enabled;
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
    S.terrain = [];
    S.wormholeId = 0;
    S.terrainNotice = "";
    S.itemCooldown = S.invincibleBeats = S.rangeBoostMoves = S.extendedMoves = 0;
    S.displayChain = 0;
    S.devSpeed = 1;
    S.autoPlay = false;
    S.autoElapsed = 0;
    ui.devAuto.textContent = "[8] AUTO OFF";
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
      terrainType = terrainAt(p.x, p.y)?.type,
      terrainStride = terrainType === "amplifier",
      terrainDrag = terrainType === "inhibitor",
      extraRange = (fieldStride ? 2 : 0) + (terrainStride ? 1 : 0) - (terrainDrag ? 1 : 0);
    if (piece === "pawn" || piece === "king")
      base = king.flatMap(([x, y]) =>
        Array.from({ length: Math.max(1, (longStride ? 3 : 1) + extraRange) }, (_, i) => [x * (i + 1), y * (i + 1)]),
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
      let knightRange = Math.max(0, (longStride ? 1 : 0) + (fieldStride ? 2 : 0) + (terrainStride ? 1 : 0) - (terrainDrag ? 1 : 0));
      for (let n = 3; n <= 2 + knightRange; n++)
        base.push(
          [1, n], [n, 1], [n, -1], [1, -n],
          [-1, -n], [-n, -1], [-n, 1], [-1, n],
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
        range = Math.max(1, (longStride ? 5 : 3) + extraRange);
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
      .filter((m) => !isWall(m.x, m.y) && pathClear(p, m, p.piece))
      .filter((m) => {
        let exit = wormholeExit(m.x, m.y);
        return !S.enemies.some(
          (e) =>
            e.boss &&
            e.bossPhase !== "vulnerable" &&
            ((e.x === m.x && e.y === m.y) || (exit && e.x === exit.x && e.y === exit.y)),
        );
      });
    S.moveReach = {
      x: Math.max(1, ...S.moves.map((m) => Math.abs(m.x - p.x))),
      y: Math.max(1, ...S.moves.map((m) => Math.abs(m.y - p.y))),
    };
  }
  function terrainAt(x, y) {
    return S.terrain.find((t) => t.x === x && t.y === y);
  }
  function isWall(x, y) {
    return terrainAt(x, y)?.type === "wall";
  }
  function pathClear(from, to, piece) {
    if (piece === "knight") return true;
    let dx = to.x - from.x,
      dy = to.y - from.y,
      steps = Math.max(Math.abs(dx), Math.abs(dy)),
      sx = Math.sign(dx),
      sy = Math.sign(dy);
    for (let i = 1; i <= steps; i++) if (isWall(from.x + sx * i, from.y + sy * i)) return false;
    return true;
  }
  function wormholeExit(x, y) {
    let gate = terrainAt(x, y);
    if (gate?.type !== "wormhole") return null;
    return S.terrain.find((t) => t.type === "wormhole" && t.pair === gate.pair && t !== gate) || null;
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
    let sealedBoss = boss(),
      minionKills = dead.filter((e) => !e.boss).length;
    if (sealedBoss?.gimmick === "blood" && sealedBoss.bossPhase === "sealed" && minionKills) {
      sealedBoss.seals = Math.max(0, sealedBoss.seals - minionKills);
      burst(sealedBoss.x, sealedBoss.y, sealedBoss.seals ? "#ff5577" : "#53f0e4", sealedBoss.seals ? 12 : 34);
      if (!sealedBoss.seals) sealedBoss.bossPhase = "vulnerable";
    }
    if (dead.length) {
      gainXp(dead.reduce((sum, e) => sum + (e.boss ? e.bossXp : e.risk ? 2 : 1), 0));
      S.kills += dead.length;
    }
    return {
      hits: victims.length,
      kills: dead.length,
      points: dead.reduce((sum, e) => sum + (e.boss ? e.bossScore : 100 * (e.maxHp || 1) * (e.risk ? 1.5 : 1)), 0),
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
  function terrainSpot(minDistance = 4) {
    let p = S.player;
    for (let i = 0; i < 36; i++) {
      let radius = minDistance + Math.floor(Math.random() * 5),
        x = p.x + Math.floor(Math.random() * (radius * 2 + 1)) - radius,
        y = p.y + Math.floor(Math.random() * (radius * 2 + 1)) - radius;
      if (
        Math.max(Math.abs(x - p.x), Math.abs(y - p.y)) >= minDistance &&
        !terrainAt(x, y) &&
        !S.items.some((item) => item.x === x && item.y === y) &&
        !S.enemies.some((e) => e.x === x && e.y === y)
      )
        return { x, y };
    }
    return null;
  }
  function addTerrain(type) {
    if (type === "wormhole") {
      let a = terrainSpot(5),
        b = terrainSpot(5);
      if (!a || !b || (a.x === b.x && a.y === b.y)) return false;
      let pair = ++S.wormholeId;
      S.terrain.push({ ...a, type, pair }, { ...b, type, pair });
      burst(a.x, a.y, "#b971ff", 20);
      burst(b.x, b.y, "#b971ff", 20);
      S.terrainNotice = "새 지형: 웜홀 — 같은 색의 출구로 이동합니다.";
      return true;
    }
    let patterns =
        type === "wall"
          ? [
              [[0, 0], [1, 0], [2, 0]],
              [[0, 0], [0, 1], [0, 2]],
              [[0, 0], [1, 0], [0, 1]],
            ]
          : [[[0, 0], [1, 0], [0, 1], [1, 1]]],
      pattern = patterns[Math.floor(Math.random() * patterns.length)],
      cells = null;
    for (let i = 0; i < 28; i++) {
      let spot = terrainSpot(5);
      if (!spot) break;
      let candidate = pattern.map(([x, y]) => ({ x: spot.x + x, y: spot.y + y }));
      if (
        candidate.every(
          (cell) =>
            Math.max(Math.abs(cell.x - S.player.x), Math.abs(cell.y - S.player.y)) >= 3 &&
            !terrainAt(cell.x, cell.y) &&
            !S.items.some((item) => item.x === cell.x && item.y === cell.y) &&
            !S.enemies.some((e) => e.x === cell.x && e.y === cell.y),
        )
      ) {
        cells = candidate;
        break;
      }
    }
    if (!cells) return false;
    S.terrain.push(...cells.map((cell) => ({ ...cell, type })));
    let amplifier = type === "amplifier",
      inhibitor = type === "inhibitor";
    cells.forEach((cell) => burst(cell.x, cell.y, amplifier ? "#5a8dff" : inhibitor ? "#ff5577" : "#6d718d", 10));
    S.terrainNotice = amplifier
      ? "새 지형: 증폭 지대 — 2×2 구역에서 출발하면 사거리가 +1입니다."
      : inhibitor
        ? "새 지형: 감쇠 지대 — 2×2 구역에서 출발하면 사거리가 −1입니다."
        : "새 지형: 벽 — 장벽을 통과할 수 없고, 장거리 이동도 막습니다.";
    return true;
  }
  function spawnTerrainByWave() {
    let count = (type) => S.terrain.filter((t) => t.type === type).length;
    if (S.wave >= 12 && S.wave % 12 === 0 && count("wall") < 9) addTerrain("wall");
    if (S.wave >= 24 && (S.wave - 24) % 18 === 0 && count("amplifier") < 8) addTerrain("amplifier");
    if (S.wave >= 42 && (S.wave - 42) % 24 === 0 && count("inhibitor") < 8) addTerrain("inhibitor");
    if (S.wave >= 60 && (S.wave - 60) % 30 === 0 && count("wormhole") < 6) addTerrain("wormhole");
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
    if (terrainAt(x, y)) return;
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
  function axisThreat(e, axis, target = S.player) {
    if (axis === "row") return target.y === e.y;
    if (axis === "column") return target.x === e.x;
    if (axis === "diagDown") return target.x - e.x === target.y - e.y;
    return target.x - e.x === -(target.y - e.y);
  }
  function bossLineThreat(e, target = S.player) {
    return [e.bossAxis, e.rageAxis].filter(Boolean).some((axis) => axisThreat(e, axis, target));
  }
  function bossAxisName(axis) {
    return axis === "row" ? "가로" : axis === "column" ? "세로" : axis === "diagDown" ? "↘ 대각선" : "↗ 대각선";
  }
  function chooseSafeCells(e) {
    let visible = S.moves.filter((m) => {
        let q = pos(m.x, m.y);
        return q.x > 40 && q.x < W - 40 && q.y > 40 && q.y < H - 40;
      }),
      emptyVisible = visible.filter((m) => !S.enemies.some((enemy) => enemy.x === m.x && enemy.y === m.y)),
      candidates = emptyVisible.length ? emptyVisible : visible.length ? visible : S.moves;
    e.safeCells = [...candidates].sort(() => Math.random() - 0.5).slice(0, Math.max(1, Math.ceil(candidates.length / 2)));
  }
  function nextBossKind() {
    return ["rook", "bloodQueen", "bishop", "checkmateBishop", "queen"][(Math.floor(S.wave / 30) - 1) % 5];
  }
  function bossRelocate(e) {
    let directions = e.type === "rook"
        ? [[1, 0], [-1, 0], [0, 1], [0, -1]]
        : e.type === "bishop"
          ? [[1, 1], [1, -1], [-1, 1], [-1, -1]]
          : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
      occupied = new Set(S.enemies.filter((other) => other !== e).map((other) => K(other.x, other.y))),
      choices = [];
    directions.forEach(([dx, dy]) => {
      for (let step = 1; step <= 2; step++) {
        let q = { x: e.x + dx * step, y: e.y + dy * step };
        if (isWall(q.x, q.y) || occupied.has(K(q.x, q.y))) break;
        if (dist(q, S.player) >= 3) choices.push(q);
      }
    });
    if (!choices.length) return false;
    choices.sort((a, b) => dist(a, S.player) - dist(b, S.player) || Math.random() - 0.5);
    let from = { x: e.x, y: e.y },
      to = choices[0];
    e.x = to.x;
    e.y = to.y;
    S.enemyTrail.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, boss: true });
    burst(to.x, to.y, e.enraged ? "#ff9f43" : "#ff5577", 18);
    return true;
  }
  function spawnBoss(kind = nextBossKind()) {
    if (boss()) return;
    let data = BOSS_TYPES[kind];
    if (!data) return;
    let p = S.player,
      spots = [[0, -4], [4, 0], [0, 4], [-4, 0]]
        .sort(() => Math.random() - 0.5)
        .map(([x, y]) => ({ x: p.x + x, y: p.y + y })),
      q = spots.find((spot) => !terrainAt(spot.x, spot.y) && !S.enemies.some((e) => e.x === spot.x && e.y === spot.y));
    if (!q) return;
    S.enemies.push({
      x: q.x,
      y: q.y,
      type: data.piece || kind,
      bossType: kind,
      hp: data.hp,
      maxHp: data.hp,
      boss: true,
      bossName: data.name,
      bossXp: data.xp,
      bossScore: data.score,
      bossPhase: data.gimmick === "blood" ? "sealed" : data.gimmick === "sanctuary" ? "sanctuary" : "telegraph",
      bossAxis: data.axes[Math.floor(Math.random() * data.axes.length)],
      gimmick: data.gimmick || "",
      seals: data.seals || 0,
      safeCells: [],
      enraged: false,
      rageAxis: null,
    });
    burst(q.x, q.y, "#ff5577", 42);
  }
  function advanceBoss() {
    let e = boss();
    if (!e) return null;
    if (e.bossPhase === "sealed") return null;
    if (e.bossPhase === "sanctuary") {
      let safe = e.safeCells || [];
      if (!safe.length) {
        e.bossPhase = "vulnerable";
        burst(e.x, e.y, "#53f0e4", 34);
        return null;
      }
      if (safe.some((cell) => S.player.x === cell.x && S.player.y === cell.y)) {
        e.bossPhase = "vulnerable";
        burst(e.x, e.y, "#53f0e4", 34);
        return null;
      }
      return { boss: e, from: { x: e.x, y: e.y }, sanctuary: true };
    }
    if (e.bossPhase === "telegraph") {
      let hit = bossLineThreat(e);
      if (hit) return { boss: e, from: { x: e.x, y: e.y } };
      e.bossPhase = "vulnerable";
      burst(e.x, e.y, "#53f0e4", 28);
      return null;
    }
    e.enraged = e.hp <= Math.ceil(e.maxHp / 2);
    bossRelocate(e);
    e.bossPhase = "telegraph";
    if (e.gimmick === "sanctuary") {
      e.bossPhase = "sanctuary";
      e.safeCells = [];
      return null;
    }
    let axes = BOSS_TYPES[e.bossType || e.type].axes;
    e.bossAxis = axes[Math.floor(Math.random() * axes.length)];
    e.rageAxis = e.enraged ? axes.filter((axis) => axis !== e.bossAxis)[Math.floor(Math.random() * Math.max(1, axes.length - 1))] : null;
    return null;
  }
  function toward(e, target = S.player) {
    let p = target,
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
            if (occupied.has(K(q.x, q.y)) || isWall(q.x, q.y)) break;
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
      ].map(([x, y]) => ({ x: e.x + x, y: e.y + y })).filter((q) => !isWall(q.x, q.y));
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
        .filter((q) => !occupied.has(K(q.x, q.y)) && !isWall(q.x, q.y));
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
    let bossStrike = advanceBoss();
    if (bossStrike && !invulnerable) {
      let e = bossStrike.boss;
      if (!bossStrike.sanctuary) {
        e.x = S.player.x;
        e.y = S.player.y;
        S.enemyTrail.push({ x1: bossStrike.from.x, y1: bossStrike.from.y, x2: e.x, y2: e.y });
        burst(e.x, e.y, "#ff5577", 36);
      } else {
        burst(S.player.x, S.player.y, "#ff5577", 48);
      }
      S.phase = "captured";
      S.captureTimer = 0.34;
      S.flash = 0;
      ui.phase.textContent = "CHECKMATE";
      ui.beat.textContent = bossStrike.sanctuary ? "JUDGEMENT" : "BOSS STRIKE";
      ui.hint.textContent = bossStrike.sanctuary
        ? e.bossName + "의 SAFE 구역에 도착하지 못했습니다."
        : e.bossName + "의 예고선을 피하지 못했습니다.";
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
    if (S.wave % 30 === 0) spawnBoss();
    spawnTerrainByWave();
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
    if (!S.moves.length) {
      S.phase = "enemy";
      S.elapsed = 0;
      ui.phase.textContent = "ENEMY TURN";
      ui.beat.textContent = "NO MOVE";
      ui.hint.textContent = "갈 수 있는 칸이 없습니다 — 적 턴으로 넘어갑니다.";
      return;
    }
    ui.phase.textContent = "YOUR MOVE";
    ui.beat.textContent = "MOVE NOW";
    let activeBoss = boss();
    if (activeBoss?.bossPhase === "sanctuary" && !activeBoss.safeCells?.length) {
      chooseSafeCells(activeBoss);
    }
    let terrainNotice = S.terrainNotice;
    S.terrainNotice = "";
    ui.hint.textContent = terrainNotice || (S.grace
      ? "준비 박자 " + S.grace + " — 아직은 잡히지 않습니다."
      : activeBoss?.bossPhase === "sealed"
        ? activeBoss.bossName + " 봉인 " + activeBoss.seals + "/4 — 일반 적을 처치해 봉인을 푸세요."
        : activeBoss?.bossPhase === "sanctuary"
          ? activeBoss.bossName + "의 심판 — 청록 이중 사각형 SAFE 구역으로 이동해야 살아남습니다."
      : activeBoss?.bossPhase === "telegraph"
        ? activeBoss.bossName + (activeBoss.enraged ? " RAGE — 붉은·주황 두 예고선 밖으로 이동하세요." : "의 " + bossAxisName(activeBoss.bossAxis) + " 줄 예고 — 붉은 선 밖으로 이동하세요.")
        : activeBoss?.bossPhase === "vulnerable"
          ? activeBoss.bossName + " 코어 노출! 지금 보스를 밟아 피해를 주세요."
      : S.riskBeats
        ? "위험 계약 " + S.riskBeats + "박자 남음 — 강화 적 처치 시 XP ×2 · 점수 ×1.5"
        : "빛나는 칸을 한 번 선택하세요 — 적을 밟으면 XP를 얻습니다.");
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
    let exit = wormholeExit(p.x, p.y);
    if (exit) {
      let entrance = { x: p.x, y: p.y };
      p.x = exit.x;
      p.y = exit.y;
      S.trail.push({ x1: entrance.x, y1: entrance.y, x2: p.x, y2: p.y, life: 1 });
      burst(entrance.x, entrance.y, "#b971ff", 18);
      burst(p.x, p.y, "#b971ff", 18);
      let warpPickup = collectItemsAt(p.x, p.y, combo, struck);
      attacked ||= warpPickup.hits > 0;
      gained += warpPickup.kills;
      earned += warpPickup.points;
      let exitCaught = S.enemies.filter((e) => e.x === p.x && e.y === p.y);
      if (exitCaught.length) {
        let r = damageEnemies(exitCaught, combo, struck);
        attacked ||= r.hits > 0;
        gained += r.kills;
        earned += r.points;
      }
      ui.hint.textContent = "웜홀을 통과했습니다.";
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
      ui.upgradeTitle.textContent = "새 말로 승급합니다";
      renderChoices();
    } else if (reroll) {
      S.upgradeMode = "fork";
      S.upgradeOptions = [
        { kind: "piece", icon: "♛", name: "말 바꾸기", desc: "현재 말이 무작위 기물로 바뀝니다" },
        ...(TRAITS.some((t) => !p.traits.includes(t.id))
          ? [{ kind: "trait", icon: "✦", name: "특성 고르기", desc: "무작위 특성 3개 중 하나를 고릅니다" }]
          : []),
      ];
      ui.upgradeEyebrow.textContent = "MILESTONE · LEVEL " + (p.rank + 1);
      ui.upgradeTitle.textContent = "이번에는 무엇을 고를까요?";
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
        ui.upgradeEyebrow.textContent = "RANDOM PIECE · LEVEL " + (p.rank + 1);
        ui.upgradeTitle.textContent = "새 말이 정해졌습니다";
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
  function terrainTile(tile) {
    let q = pos(tile.x, tile.y),
      s = size(),
      pulse = 0.75 + Math.sin(performance.now() / 260 + tile.x) * 0.16;
    g.save();
    g.translate(q.x, q.y);
    if (tile.type === "wall") {
      g.fillStyle = "#272b40";
      g.strokeStyle = "#78809b";
      g.lineWidth = 2;
      g.fillRect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8);
      g.strokeRect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8);
      g.strokeStyle = "#a5acc4";
      g.globalAlpha = 0.48;
      for (let y = -0.22; y <= 0.22; y += 0.22) {
        g.beginPath();
        g.moveTo(-s * 0.34, y * s);
        g.lineTo(s * 0.34, y * s);
        g.stroke();
      }
    } else if (tile.type === "amplifier") {
      g.strokeStyle = "#5a8dff";
      g.shadowColor = "#5a8dff";
      g.shadowBlur = 12;
      g.lineWidth = 2.5;
      g.globalAlpha = pulse;
      g.fillStyle = "#111a38";
      g.fillRect(-s * 0.29, -s * 0.29, s * 0.58, s * 0.58);
      g.strokeRect(-s * 0.29, -s * 0.29, s * 0.58, s * 0.58);
      g.fillStyle = "#dce7ff";
      g.font = "700 " + s * 0.31 + "px monospace";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("^", 0, 1);
    } else if (tile.type === "inhibitor") {
      g.strokeStyle = "#ff5577";
      g.shadowColor = "#ff5577";
      g.shadowBlur = 12;
      g.lineWidth = 2.5;
      g.globalAlpha = pulse;
      g.fillStyle = "#2a101d";
      g.fillRect(-s * 0.29, -s * 0.29, s * 0.58, s * 0.58);
      g.strokeRect(-s * 0.29, -s * 0.29, s * 0.58, s * 0.58);
      g.fillStyle = "#ffdce5";
      g.font = "700 " + s * 0.31 + "px monospace";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("v", 0, -s * 0.04);
    } else if (tile.type === "wormhole") {
      let colors = ["#b971ff", "#53f0e4", "#ff72c9"],
        col = colors[(tile.pair - 1) % colors.length];
      g.strokeStyle = col;
      g.shadowColor = col;
      g.shadowBlur = 18;
      g.lineWidth = 3;
      g.globalAlpha = pulse;
      g.fillStyle = "#11172c";
      g.fillRect(-s * 0.31, -s * 0.31, s * 0.62, s * 0.62);
      g.strokeRect(-s * 0.31, -s * 0.31, s * 0.62, s * 0.62);
      g.globalAlpha = 0.45;
      g.strokeRect(-s * 0.15, -s * 0.15, s * 0.3, s * 0.3);
    }
    g.restore();
  }
  function drawPrePiece(type, x, y, scale, color) {
    let key = type + color,
      image = preSvgImages.get(key);
    if (!image) {
      image = new Image();
      let offset = preSvgOffsets[type] ?? preSvgOffsets.pawn,
        svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1760 1600"><g transform="translate(' + offset + ' 1300) scale(1 -1)" fill="' + color + '"><path d="' + (preSvgShapes[type] || preSvgShapes.pawn) + '"/></g></svg>';
      image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      preSvgImages.set(key, image);
    }
    if (image.complete && image.naturalWidth) {
      g.drawImage(image, x - scale / 2, y - scale / 2, scale, scale);
    } else {
      g.font = "700 " + scale * 0.72 + "px Georgia, serif";
      g.fillText(glyph[type] || glyph.pawn, x, y);
    }
  }
  function piece(x, y, t, enemy = false, hp = 1, maxHp = 1, risk = false, bossPiece = false, bossPhase = "", bossName = "", seals = 0, enraged = false) {
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
    g.textAlign = "center";
    g.textBaseline = "middle";
    // Apple Symbols uses a 2048-unit em while the fixed SVG viewport is
    // 1760 units wide. These multipliers preserve the old canvas font sizes.
    if (S.pre) drawPrePiece(t, q.x, q.y, s * (bossPiece ? 0.81 : 0.54), enemy ? col : "#f1ffff");
    else {
      g.font = "700 " + s * (bossPiece ? 0.94 : 0.62) + "px Georgia, 'Times New Roman', serif";
      g.fillText(enemy ? enemyGlyph[t] : glyph[t], q.x, q.y);
    }
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
        : bossPhase === "sealed"
          ? "✕ BLOOD SEAL · " + seals + " LEFT"
          : bossPhase === "sanctuary"
            ? "✦ SAFE CELL REQUIRED"
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
      g.fillText((bossName || "BOSS") + (enraged ? " · RAGE" : "") + " · " + hp + "/" + maxHp, q.x, q.y + s * 0.62);
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
    g.beginPath();
    g.arc(q.x, q.y, s * 0.28, 0, Math.PI * 2);
    g.fill();
    g.stroke();
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
  function edgeEnemyTargets() {
    if (!S.showOffscreenIndicators) return [];
    let margin = 42,
      candidates = S.enemies
        .map((e) => {
          let q = pos(e.x, e.y),
            offscreen = q.x < -margin || q.x > W + margin || q.y < -margin || q.y > H + margin,
            danger = e.boss
              ? e.bossPhase === "telegraph" && bossLineThreat(e)
              : toward(e).x === S.player.x && toward(e).y === S.player.y;
          if (!offscreen) return null;
          return { e, q, danger, distance: dist(e, S.player) };
        })
        .filter(Boolean)
        .sort((a, b) => Number(b.e.boss) - Number(a.e.boss) || a.distance - b.distance)
        .slice(0, 3);
    return candidates.map((target, index) => {
      let dx = target.q.x - W / 2,
        dy = target.q.y - H / 2,
        scale = Math.min((W / 2 - margin) / Math.max(1, Math.abs(dx)), (H / 2 - margin) / Math.max(1, Math.abs(dy))),
        angle = Math.atan2(dy, dx),
        offset = (index - (candidates.length - 1) / 2) * 42,
        x = W / 2 + dx * scale - Math.sin(angle) * offset,
        y = H / 2 + dy * scale + Math.cos(angle) * offset;
      return { ...target, x: Math.max(margin, Math.min(W - margin, x)), y: Math.max(margin, Math.min(H - margin, y)), angle };
    });
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
    S.terrain.forEach(terrainTile);
    let activeBoss = boss();
    if (activeBoss?.bossPhase === "telegraph") {
      let q = pos(activeBoss.x, activeBoss.y),
        span = Math.max(W, H) * 1.5;
      g.save();
      g.globalAlpha = 0.6 + Math.sin(performance.now() / 130) * 0.18;
      g.strokeStyle = "#ff5577";
      g.shadowColor = "#ff315d";
      g.shadowBlur = 16;
      g.lineWidth = Math.max(3, s * 0.09);
      g.setLineDash([9, 8]);
      [activeBoss.bossAxis, activeBoss.rageAxis].filter(Boolean).forEach((axis, index) => {
        g.globalAlpha = (0.6 + Math.sin(performance.now() / 130) * 0.18) * (index ? 0.75 : 1);
        if (index) {
          g.strokeStyle = "#ff9f43";
          g.shadowColor = "#ff9f43";
        }
        g.beginPath();
        if (axis === "row") {
          g.moveTo(0, q.y);
          g.lineTo(W, q.y);
        } else if (axis === "column") {
          g.moveTo(q.x, 0);
          g.lineTo(q.x, H);
        } else if (axis === "diagDown") {
          g.moveTo(q.x - span, q.y - span);
          g.lineTo(q.x + span, q.y + span);
        } else {
          g.moveTo(q.x - span, q.y + span);
          g.lineTo(q.x + span, q.y - span);
        }
        g.stroke();
      });
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
        safeTarget = activeBoss?.bossPhase === "sanctuary" && activeBoss.safeCells?.some((cell) => cell.x === m.x && cell.y === m.y),
        sanctuaryUnsafe = activeBoss?.bossPhase === "sanctuary" && !safeTarget,
        active = S.phase === "player",
        a = active
          ? 0.2 + 0.19 * Math.sin(performance.now() / 100) + S.flash * 0.35
          : 0.07;
      g.fillStyle = safeTarget ? "rgba(83,240,228," + Math.min(0.76, a + 0.24) + ")" : sanctuaryUnsafe ? "rgba(255,49,93," + Math.min(0.65, a + 0.18) + ")" : bossTarget ? "rgba(255,209,102," + Math.min(0.9, a + 0.25) + ")" : "rgba(83,240,228," + a + ")";
      g.fillRect(q.x - s * 0.42, q.y - s * 0.42, s * 0.84, s * 0.84);
      g.strokeStyle = safeTarget ? "#7ff8ef" : sanctuaryUnsafe ? "#ff5577" : bossTarget ? "#ffd166" : active ? "#53f0e4" : "#53f0e466";
      g.lineWidth = safeTarget ? 3 : active ? 2 : 1;
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
      if (safeTarget) {
        g.save();
        g.strokeStyle = "#efffff";
        g.shadowColor = "#53f0e4";
        g.shadowBlur = 12;
        g.lineWidth = 1.5;
        g.strokeRect(q.x - s * 0.19, q.y - s * 0.19, s * 0.38, s * 0.38);
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
    edgeEnemyTargets().forEach((target) => {
      let e = target.e,
        pulse = target.danger ? 0.62 + Math.sin(performance.now() / 95) * 0.38 : 1,
        color = target.danger ? "#ff315d" : e.boss ? "#ffd166" : COMBO_COLORS[Math.max(0, Math.min(6, (e.hp || 1) - 1))],
        icon = enemyGlyph[e.type];
      g.save();
      g.globalAlpha = pulse;
      g.translate(target.x, target.y);
      g.rotate(target.angle);
      g.fillStyle = color;
      g.shadowColor = color;
      g.shadowBlur = target.danger ? 24 : 14;
      g.beginPath();
      g.moveTo(20, 0);
      g.lineTo(10, -5);
      g.lineTo(10, 5);
      g.closePath();
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha = pulse;
      g.fillStyle = "#0d1330";
      g.strokeStyle = color;
      g.shadowColor = color;
      g.shadowBlur = target.danger ? 22 : 12;
      g.lineWidth = e.boss ? 3 : 2;
      g.beginPath();
      g.arc(target.x, target.y, e.boss ? 12 : 9, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.fillStyle = color;
      g.font = "700 " + (e.boss ? 17 : 13) + "px Georgia, serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(icon, target.x, target.y + 1);
      if (e.boss || target.danger) {
        g.font = "700 7px monospace";
        g.fillText(target.danger ? "CHECK!" : "BOSS", target.x, target.y - (e.boss ? 20 : 16));
      }
      g.restore();
    });
    if (S.phase === "captured") piece(S.player.x, S.player.y, S.player.piece);
    S.items.forEach(fieldItem);
    S.enemies.forEach((e) => piece(e.x, e.y, e.type, true, e.hp || 1, e.maxHp || 1, e.risk, e.boss, e.bossPhase, e.bossName, e.seals, e.enraged));
    if (!["dead", "captured"].includes(S.phase)) piece(S.player.x, S.player.y, S.player.piece);
    if (S.phase === "dead") {
      let q = pos(S.player.x, S.player.y),
        t = 1 - S.death / 1.1;
      g.save();
      g.globalAlpha = 1 - t;
      g.fillStyle = "#f5efff";
      g.textAlign = "center";
      g.textBaseline = "middle";
      if (S.pre) drawPrePiece(S.player.piece, q.x, q.y, s * 0.39, "#f1ffff");
      else {
        g.font = "700 " + s * 0.45 + "px 'Gowun Batang', serif";
        g.fillText(glyph[S.player.piece], q.x, q.y);
      }
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
        if (S.autoPlay) {
          S.autoElapsed += dt;
          if (S.autoElapsed >= 0.28) {
            S.autoElapsed = 0;
            autoMove();
          }
        }
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
      } else if (S.phase === "upgrade" && S.autoPlay) {
        S.autoElapsed += dt;
        if (S.autoElapsed >= 0.55 && performance.now() >= (S.upgradeLock || 0)) {
          S.autoElapsed = 0;
          chooseUpgrade(Math.floor(Math.random() * S.upgradeOptions.length));
        }
      } else if (S.phase === "risk" && S.autoPlay) {
        S.autoElapsed += dt;
        if (S.autoElapsed >= 0.55) {
          S.autoElapsed = 0;
          resolveRisk(Math.random() < 0.5);
        }
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
  function devBoss(kind = "rook") {
    if (!S.running || ["upgrade", "dead"].includes(S.phase)) return;
    if (boss()) {
      ui.hint.textContent = "DEV: 이미 보스 몬스터가 보드에 있습니다.";
      return;
    }
    spawnBoss(kind);
    moves();
    let summonedBoss = boss();
    if (summonedBoss?.bossPhase === "sanctuary") chooseSafeCells(summonedBoss);
    hud();
    ui.hint.textContent = "DEV: " + BOSS_TYPES[kind].name + (summonedBoss?.bossPhase === "sanctuary" ? " — SAFE 구역으로 이동하세요." : "를 소환했습니다.");
  }
  function autoMove() {
    if (!S.autoPlay || S.phase !== "player" || !S.moves.length) return;
    let candidates = S.moves.map((m) => {
      let exit = wormholeExit(m.x, m.y),
        landing = exit || m,
        targets = S.enemies.filter(
          (e) =>
            (!e.boss || e.bossPhase === "vulnerable") &&
            ((e.x === m.x && e.y === m.y) || (exit && e.x === landing.x && e.y === landing.y)),
        ),
        remaining = S.enemies.filter((e) => !targets.includes(e) || (e.hp || 1) > 1),
        nearest = Math.min(...remaining.map((e) => Math.abs(e.x - landing.x) + Math.abs(e.y - landing.y)), 99),
        enemyStrike = remaining.filter(
          (e) =>
            !e.boss &&
            toward(e, landing).x === landing.x &&
            toward(e, landing).y === landing.y,
        ).length,
        activeBoss = boss(),
        bossStrike = activeBoss?.bossPhase === "telegraph" && bossLineThreat(activeBoss, landing),
        sanctuarySafe = activeBoss?.bossPhase === "sanctuary" && activeBoss.safeCells?.some((cell) => landing.x === cell.x && landing.y === cell.y),
        sanctuaryFail = activeBoss?.bossPhase === "sanctuary" && !sanctuarySafe,
        durableMajor = targets.some(
          (e) => !e.boss && (e.hp || 1) > 1 && ["queen", "rook", "bishop"].includes(e.type),
        ),
        score = targets.length
          ? durableMajor
            ? -2400
            : 1800 + targets.length * 250 - Math.max(...targets.map((e) => e.hp || 1)) * 35
          : 420 - nearest * 24 - enemyStrike * 5000 - (bossStrike ? 9000 : 0) - (sanctuaryFail ? 12000 : 0) + (sanctuarySafe ? 9000 : 0);
      if (targets.some((e) => e.boss && e.bossPhase === "vulnerable")) score += 5000;
      if (exit && !targets.length) score -= 80;
      // A little noise prevents identical boards from producing a rigid loop.
      return { m, score: score + Math.random() * 12 };
    });
    candidates.sort((a, b) => b.score - a.score);
    playerMove(candidates[0].m);
  }
  function devAuto() {
    if (!S.running || ["upgrade", "dead", "devpick"].includes(S.phase)) return;
    S.autoPlay = !S.autoPlay;
    S.autoElapsed = 0;
    ui.devAuto.textContent = "[8] AUTO " + (S.autoPlay ? "ON" : "OFF");
    ui.hint.textContent = S.autoPlay ? "DEV: 자동 플레이를 시작합니다." : "DEV: 자동 플레이를 멈췄습니다.";
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
          : kind === "boss"
            ? Object.entries(BOSS_TYPES).map(([id, data]) => ({
                id,
                icon: glyph[data.piece || id],
                name: data.name,
                desc: id === "rook" ? "가로·세로 관통 예고" : id === "bishop" ? "대각선 관통 예고" : id === "queen" ? "8방향 관통 예고" : id === "bloodQueen" ? "잡몹 4기 처치로 봉인 해제" : "SAFE 구역 도달로 생존",
              }))
            : TRAITS;
    ui.devPickTitle.textContent = kind === "piece" ? "기물을 즉시 변경" : kind === "boss" ? "소환할 보스를 선택하세요" : "특성을 즉시 추가";
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
        } else if (kind === "boss") {
          devBoss(o.id);
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
  function openDevPassword(target = "dev") {
    passwordTarget = target;
    ui.devPasswordInput.value = "";
    ui.devPasswordStatus.textContent = "";
    ui.devPassword.classList.remove("hidden");
    requestAnimationFrame(() => ui.devPasswordInput.focus());
  }
  function closeDevPassword() {
    ui.devPassword.classList.add("hidden");
    ui.devPasswordInput.value = "";
  }
  async function unlockDevPassword() {
    let password = ui.devPasswordInput.value;
    if (!password) {
      ui.devPasswordStatus.textContent = "비밀번호를 입력하세요.";
      return;
    }
    try {
      let bytes = new TextEncoder().encode(password),
        digest = await crypto.subtle.digest("SHA-256", bytes),
        hash = [...new Uint8Array(digest)].map((n) => n.toString(16).padStart(2, "0")).join("");
      if (hash !== DEV_PASSWORD_HASH) {
        ui.devPasswordStatus.textContent = "비밀번호가 맞지 않습니다.";
        ui.devPasswordInput.select();
        return;
      }
      devUnlocked = true;
      sessionStorage.setItem("its-my-turn-dev-unlocked", "1");
      if (passwordTarget === "pre") ui.preToggle.checked = true;
      else ui.devToggle.checked = true;
      closeDevPassword();
    } catch (_) {
      ui.devPasswordStatus.textContent = "인증을 처리할 수 없습니다. 다시 시도하세요.";
    }
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
  ui.devToggle.addEventListener("change", () => {
    if (ui.devToggle.checked && !devUnlocked) {
      ui.devToggle.checked = false;
      openDevPassword("dev");
    }
  });
  ui.preToggle.addEventListener("change", () => {
    if (ui.preToggle.checked && !devUnlocked) {
      ui.preToggle.checked = false;
      openDevPassword("pre");
    }
  });
  ui.devPasswordSubmit.addEventListener("click", unlockDevPassword);
  ui.devPasswordCancel.addEventListener("click", closeDevPassword);
  ui.devPasswordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") unlockDevPassword();
  });
  $("#devXp").addEventListener("click", devXp);
  $("#devPawn").addEventListener("click", devPawn);
  $("#devBeat").addEventListener("click", devBeat);
  $("#devSpeed").addEventListener("click", devSpeed);
  $("#devPiece").addEventListener("click", () => openDevPick("piece"));
  $("#devTrait").addEventListener("click", () => openDevPick("trait"));
  $("#devBoss").addEventListener("click", () => openDevPick("boss"));
  $("#devAuto").addEventListener("click", devAuto);
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
    if (k === "7") openDevPick("boss");
    if (k === "8") devAuto();
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
  setOffscreenIndicators(localStorage.getItem("its-my-turn-offscreen-indicators-v1") !== "0");
  ui.soundToggle.addEventListener("click", () => ui.soundPanel.classList.toggle("hidden"));
  ui.bgmVolumeRange.addEventListener("input", (e) => setBusVolume("bgm", Number(e.target.value)));
  ui.sfxVolumeRange.addEventListener("input", (e) => setBusVolume("sfx", Number(e.target.value)));
  ui.offscreenIndicatorToggle.addEventListener("change", (e) => setOffscreenIndicators(e.target.checked));
  reset();
  requestAnimationFrame(tick);
})();
