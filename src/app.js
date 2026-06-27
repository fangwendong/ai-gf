const STORAGE_KEY = "ai-gf-explore-v1";
const WORLD = { width: 3200, height: 1600 };
const QUESTS = [
  {
    id: "meet",
    title: "先走到林栖身边",
    detail: "她在房间里等你。先学会移动，再和她说话。",
    targetId: "linqi",
    reward: "林栖愿意带你出门。"
  },
  {
    id: "door",
    title: "穿过门廊去街区",
    detail: "沿着发光的门走出去。",
    targetId: "door",
    reward: "你们走进了更亮的街区。"
  },
  {
    id: "plane",
    title: "捡起纸飞机",
    detail: "街角那只发光的纸飞机在等你。",
    targetId: "plane",
    reward: "冲刺能力解锁。"
  },
  {
    id: "bench",
    title: "和她坐到长椅上",
    detail: "公园里先停一会儿，别急着走。",
    targetId: "bench",
    reward: "林栖靠得更近了。"
  },
  {
    id: "photo",
    title: "在喷泉前拍照",
    detail: "把这一幕留住。",
    targetId: "fountain",
    reward: "拍照功能解锁。"
  },
  {
    id: "home",
    title: "把照片挂回房间",
    detail: "回到家，把今晚挂到墙上。",
    targetId: "photoWall",
    reward: "今晚的约会完成了。"
  }
];

const INTERACTABLES = [
  { id: "linqi", label: "林栖", x: 430, y: 410, r: 78, kind: "npc" },
  { id: "door", label: "门廊", x: 980, y: 404, r: 62, kind: "gate" },
  { id: "plane", label: "纸飞机", x: 1540, y: 360, r: 52, kind: "pickup" },
  { id: "bench", label: "长椅", x: 2480, y: 1120, r: 76, kind: "rest" },
  { id: "fountain", label: "喷泉", x: 2810, y: 980, r: 82, kind: "photo" },
  { id: "photoWall", label: "照片墙", x: 160, y: 240, r: 58, kind: "deliver" }
];

const SOLIDS = [
  { x: 48, y: 72, w: 980, h: 34 },
  { x: 48, y: 72, w: 34, h: 700 },
  { x: 48, y: 738, w: 980, h: 34 },
  { x: 994, y: 72, w: 34, h: 720 },
  { x: 1320, y: 210, w: 130, h: 86 },
  { x: 1840, y: 210, w: 100, h: 96 },
  { x: 2230, y: 184, w: 120, h: 88 },
  { x: 2570, y: 880, w: 120, h: 84 },
  { x: 2970, y: 840, w: 110, h: 80 },
  { x: 2160, y: 1160, w: 92, h: 142 },
  { x: 1180, y: 840, w: 180, h: 84 }
];

const COLORS = {
  apartment: ["#18253b", "#0f1422", "#f2d4b6"],
  street: ["#1b2340", "#11182a", "#94c6ff"],
  park: ["#11351f", "#0b1c12", "#8df0d3"]
};

const defaultState = {
  questIndex: 0,
  bond: 0,
  dashUnlocked: false,
  photoUnlocked: false,
  photoCount: 0,
  finalized: false,
  questPanelOpen: false,
  dialogueOpen: false,
  objective: QUESTS[0].title,
  prompt: "先向前走，靠近林栖",
  zone: "公寓",
  hint: "WASD / 摇杆移动，靠近后按互动",
  player: { x: 280, y: 430, vx: 0, vy: 0, facing: 1, dash: 0 },
  companion: { x: 448, y: 420, vx: 0, vy: 0 },
  camera: { x: 0, y: 0, shake: 0 },
  clickTarget: null,
  joystick: { active: false, x: 0, y: 0, pointerId: null },
  keys: {},
  memoryLog: ["你第一次走进这座房间，林栖站在灯光里等你。"]
};

let state = loadState();
let lastTime = performance.now();
let sceneW = 1280;
let sceneH = 720;
let photoFlash = 0;
let dashFlash = 0;
let endBanner = 0;

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext ? canvas.getContext("2d") : null;
const renderer = ctx || createFallbackContext(canvas);

const els = {
  objectiveLabel: document.querySelector("#objectiveLabel"),
  zoneLabel: document.querySelector("#zoneLabel"),
  bondLabel: document.querySelector("#bondLabel"),
  hintLabel: document.querySelector("#hintLabel"),
  promptText: document.querySelector("#promptText"),
  interactButton: document.querySelector("#interactButton"),
  dashButton: document.querySelector("#dashButton"),
  photoButton: document.querySelector("#photoButton"),
  questButton: document.querySelector("#questButton"),
  questPanel: document.querySelector("#questPanel"),
  closeQuestButton: document.querySelector("#closeQuestButton"),
  questList: document.querySelector("#questList"),
  dialogueSheet: document.querySelector("#dialogueSheet"),
  dialogueKicker: document.querySelector("#dialogueKicker"),
  dialogueText: document.querySelector("#dialogueText"),
  dialogueChoices: document.querySelector("#dialogueChoices"),
  closeDialogueButton: document.querySelector("#closeDialogueButton"),
  joystick: document.querySelector("#joystick"),
  joystickKnob: document.querySelector("#joystickKnob"),
  touchInteractButton: document.querySelector("#touchInteractButton"),
  touchDashButton: document.querySelector("#touchDashButton")
};

const CURRENT_QUEST = () => QUESTS[state.questIndex] || QUESTS[QUESTS.length - 1];

function createFallbackContext(canvasNode) {
  const store = { canvas: canvasNode, fillStyle: "#000", strokeStyle: "#000", lineWidth: 1, font: "16px sans-serif", globalAlpha: 1 };
  return new Proxy(store, {
    get(target, prop) {
      if (prop === "canvas") return target.canvas;
      if (prop === "measureText") return (text) => ({ width: String(text).length * 10 });
      if (prop === "createLinearGradient" || prop === "createRadialGradient") {
        return () => ({ addColorStop() {} });
      }
      if (prop === "setTransform") return () => {};
      if (prop === "save" || prop === "restore" || prop === "beginPath" || prop === "closePath" || prop === "clip" || prop === "fill" || prop === "stroke" || prop === "clearRect" || prop === "fillRect" || prop === "strokeRect" || prop === "drawImage" || prop === "translate" || prop === "rotate" || prop === "scale" || prop === "moveTo" || prop === "lineTo" || prop === "arc" || prop === "arcTo" || prop === "rect" || prop === "ellipse" || prop === "bezierCurveTo" || prop === "quadraticCurveTo" || prop === "fillText" || prop === "strokeText") {
        return () => {};
      }
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stripTransient(state)));
}

function stripTransient(value) {
  return {
    ...value,
    dialogueOpen: false,
    clickTarget: null,
    joystick: { ...value.joystick, pointerId: null, active: false, x: 0, y: 0 },
    keys: {}
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function screenToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * sceneW + state.camera.x;
  const y = ((clientY - rect.top) / rect.height) * sceneH + state.camera.y;
  return { x, y };
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  sceneW = Math.max(320, Math.floor(rect.width || window.innerWidth || 1280));
  sceneH = Math.max(480, Math.floor(rect.height || window.innerHeight || 720));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(sceneW * dpr);
  canvas.height = Math.floor(sceneH * dpr);
  renderer.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function currentZone() {
  if (state.player.x < 1050) return "公寓";
  if (state.player.x < 2160) return "街区";
  return "公园";
}

function currentQuestTarget() {
  return INTERACTABLES.find((item) => item.id === CURRENT_QUEST().targetId);
}

function setQuestPanel(open) {
  state.questPanelOpen = open;
  els.questPanel.classList.toggle("collapsed", !open);
  saveState();
}

function setDialogue(open, speaker, text, choices = []) {
  state.dialogueOpen = open;
  els.dialogueSheet.hidden = !open;
  els.dialogueKicker.textContent = speaker || "林栖";
  els.dialogueText.textContent = text || "";
  els.dialogueChoices.innerHTML = "";
  if (open) {
    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = choice.label;
      button.addEventListener("click", () => {
        choice.onSelect?.();
      });
      els.dialogueChoices.appendChild(button);
    });
  }
  saveState();
}

function closeDialogue() {
  state.dialogueOpen = false;
  els.dialogueSheet.hidden = true;
  els.dialogueChoices.innerHTML = "";
  saveState();
}

function addMemory(text) {
  state.memoryLog.unshift(text);
  state.memoryLog = state.memoryLog.slice(0, 24);
}

function openQuestBeat(text, choices = []) {
  setDialogue(true, "林栖", text, choices);
}

function finishQuest({ memory, reward, dialogue, choices, onComplete }) {
  state.bond += 1;
  addMemory(memory);
  state.questIndex = Math.min(state.questIndex + 1, QUESTS.length - 1);
  if (reward === "dash") state.dashUnlocked = true;
  if (reward === "photo") {
    state.photoUnlocked = true;
    photoFlash = 0.35;
  }
  if (reward === "photoCount") state.photoCount += 1;
  if (typeof onComplete === "function") onComplete();
  if (state.questIndex === QUESTS.length - 1 && reward === "photoCount") {
    state.finalized = true;
    endBanner = 2.6;
  }
  saveState();
  renderHud();
  openQuestBeat(dialogue, choices);
}

function handleQuestInteraction() {
  if (state.dialogueOpen) return;
  const quest = CURRENT_QUEST();
  const target = currentQuestTarget();
  if (!target) return;
  if (distance(state.player, target) > target.r + 42) return;

  switch (quest.id) {
    case "meet":
      openQuestBeat("你终于走到我这边了。别只看着房间，先跟我出去。", [
        {
          label: "一起出门",
          onSelect: () => finishQuest({
            memory: "你和林栖第一次并肩出门。",
            reward: null,
            dialogue: "门口亮起来了。下一站，街区。",
            choices: [{ label: "继续", onSelect: closeDialogue }]
          })
        },
        {
          label: "再看一眼房间",
          onSelect: () => finishQuest({
            memory: "你回头看了一眼房间，再跟上林栖。",
            reward: null,
            dialogue: "回头看一眼也没关系。重要的是，你还是走过来了。",
            choices: [{ label: "继续", onSelect: closeDialogue }]
          })
        }
      ]);
      break;
    case "door":
      finishQuest({
        memory: "你跟着林栖穿过门廊，走进了街区。",
        reward: null,
        dialogue: "门开了。外面的风比想象中更轻。",
        choices: [{ label: "继续", onSelect: closeDialogue }],
        onComplete: () => {
          state.player.x = 1100;
          state.player.y = 400;
          state.companion.x = 1160;
          state.companion.y = 400;
        }
      });
      break;
    case "plane":
      finishQuest({
        memory: "你捡起了街角那只纸飞机。",
        reward: "dash",
        dialogue: "这只纸飞机像是在等你。现在你可以冲刺了。",
        choices: [{ label: "继续", onSelect: closeDialogue }]
      });
      break;
    case "bench":
      openQuestBeat("公园的长椅到了。先坐一下，别急着走。", [
        {
          label: "坐下",
          onSelect: () => finishQuest({
            memory: "你和林栖在长椅上坐了一会儿。",
            reward: null,
            dialogue: "这样就够了。你在，我就不赶路了。",
            choices: [{ label: "继续", onSelect: closeDialogue }]
          })
        },
        {
          label: "牵着她继续",
          onSelect: () => finishQuest({
            memory: "你牵起她的手，长椅变成了下一段路的停顿。",
            reward: null,
            dialogue: "那就再往前一点。今天的路还没走完。",
            choices: [{ label: "继续", onSelect: closeDialogue }]
          })
        }
      ]);
      break;
    case "photo":
      openQuestBeat("把这一幕拍下来，别只存在脑子里。", [
        {
          label: "举起相机",
          onSelect: () => finishQuest({
            memory: "你和林栖在喷泉前拍下了今天。",
            reward: "photo",
            dialogue: "快门声落下了。现在这一晚有了可以回头看的证据。",
            choices: [{ label: "继续", onSelect: closeDialogue }]
          })
        },
        {
          label: "让她先看镜头",
          onSelect: () => finishQuest({
            memory: "林栖先看向镜头，然后点头让你按下快门。",
            reward: "photo",
            dialogue: "好。你先看我，我再看镜头。",
            choices: [{ label: "继续", onSelect: closeDialogue }]
          })
        }
      ]);
      break;
    case "home":
      finishQuest({
        memory: "你把刚拍到的照片挂回了房间。",
        reward: "photoCount",
        dialogue: "今晚到这里就很完整了。回家吧，我会记住这个夜晚。",
        choices: [{ label: "继续", onSelect: closeDialogue }]
      });
      break;
    default:
      break;
  }
}

function handlePhoto() {
  if (!state.photoUnlocked || state.dialogueOpen) return;
  const quest = CURRENT_QUEST();
  if (quest.id !== "photo") {
    if (state.zone !== "公园" && !state.finalized) {
      setPrompt("去公园更适合拍照。");
      return;
    }
    photoFlash = 0.3;
    state.photoCount += 1;
    addMemory("你又拍下了一张合影。");
    saveState();
    openQuestBeat("快门声响起。你把这一幕又留住了一次。", [
      { label: "继续", onSelect: closeDialogue }
    ]);
    return;
  }
  handleQuestInteraction();
}

function triggerDash() {
  if (!state.dashUnlocked || state.dialogueOpen) return;
  if (state.player.dash > 0) return;
  state.player.dash = 0.22;
  dashFlash = 0.24;
  state.camera.shake = Math.max(state.camera.shake, 0.25);
  saveState();
}

function setPrompt(text) {
  state.prompt = text;
  els.promptText.textContent = text;
}

function renderHud() {
  const quest = CURRENT_QUEST();
  state.objective = quest.title;
  state.zone = currentZone();
  const target = currentQuestTarget();
  const ready = Boolean(target && distance(state.player, target) <= target.r + 42 && !state.dialogueOpen);
  els.objectiveLabel.textContent = quest.title;
  els.zoneLabel.textContent = state.zone;
  els.bondLabel.textContent = `羁绊 ${state.bond}`;
  els.hintLabel.textContent = state.photoUnlocked ? "WASD / 摇杆移动 / 可拍照" : state.dashUnlocked ? "WASD / 摇杆移动 / 可冲刺" : "WASD / 摇杆移动";
  els.photoButton.disabled = !state.photoUnlocked;
  els.dashButton.disabled = !state.dashUnlocked;
  els.touchDashButton.disabled = !state.dashUnlocked;
  els.interactButton.disabled = !ready;
  els.touchInteractButton.disabled = !ready;
  els.questPanel.classList.toggle("collapsed", !state.questPanelOpen);
  renderQuestList();
  if (state.dialogueOpen) {
    setPrompt("对话中，点继续再动。");
  } else if (target) {
    const dist = distance(state.player, target);
    if (dist <= target.r + 42) {
      setPrompt(`按互动：${target.label}`);
    } else {
      setPrompt(quest.detail);
    }
  }
}

function renderQuestList() {
  els.questList.innerHTML = QUESTS.map((quest, index) => {
    const stateClass = index < state.questIndex ? "done" : index === state.questIndex ? "active" : "";
    return `<li class="${stateClass}"><strong>${quest.title}</strong><br>${quest.detail}</li>`;
  }).join("");
}

function updateMovement(dt) {
  if (state.dialogueOpen) return;

  const inputX = (state.keys.ArrowLeft || state.keys.KeyA ? -1 : 0) + (state.keys.ArrowRight || state.keys.KeyD ? 1 : 0) + state.joystick.x;
  const inputY = (state.keys.ArrowUp || state.keys.KeyW ? -1 : 0) + (state.keys.ArrowDown || state.keys.KeyS ? 1 : 0) + state.joystick.y;

  let moveX = inputX;
  let moveY = inputY;

  if (!moveX && !moveY && state.clickTarget) {
    const dx = state.clickTarget.x - state.player.x;
    const dy = state.clickTarget.y - state.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 10) {
      moveX = dx / dist;
      moveY = dy / dist;
    } else {
      state.clickTarget = null;
    }
  }

  const len = Math.hypot(moveX, moveY);
  if (len > 1) {
    moveX /= len;
    moveY /= len;
  }

  if (moveX || moveY) {
    state.player.facing = moveX < 0 ? -1 : 1;
  }

  const baseSpeed = 220;
  const dashSpeed = state.player.dash > 0 ? 420 : 0;
  const speed = baseSpeed + dashSpeed;

  state.player.x += moveX * speed * dt;
  state.player.y += moveY * speed * dt;
  state.player.x = clamp(state.player.x, 40, WORLD.width - 40);
  state.player.y = clamp(state.player.y, 60, WORLD.height - 46);

  if (state.player.dash > 0) {
    state.player.dash = Math.max(0, state.player.dash - dt);
  }

  resolvePlayerCollision();

  const followDistance = state.bond >= 3 ? 26 : 38;
  const followX = state.player.x - state.player.facing * followDistance;
  const followY = state.player.y + 6;
  state.companion.x += (followX - state.companion.x) * 0.08;
  state.companion.y += (followY - state.companion.y) * 0.08;

  const cameraTargetX = clamp(state.player.x - sceneW * 0.5 + state.player.facing * 22, 0, WORLD.width - sceneW);
  const cameraTargetY = clamp(state.player.y - sceneH * 0.55, 0, WORLD.height - sceneH);
  state.camera.x += (cameraTargetX - state.camera.x) * 0.08;
  state.camera.y += (cameraTargetY - state.camera.y) * 0.08;

  const target = currentQuestTarget();
  if (target) {
    const dist = distance(state.player, target);
    if (dist <= target.r + 42) {
      switch (target.id) {
        case "linqi":
          setPrompt("按互动和林栖说话。");
          break;
        case "door":
          setPrompt("按互动穿过门廊。");
          break;
        case "plane":
          setPrompt("按互动捡起纸飞机。");
          break;
        case "bench":
          setPrompt("按互动坐到长椅上。");
          break;
        case "fountain":
          setPrompt("按互动拍下这一幕。");
          break;
        case "photoWall":
          setPrompt("按互动把照片挂回房间。");
          break;
        default:
          break;
      }
    } else {
      setPrompt(CURRENT_QUEST().detail);
    }
  }
}

function resolvePlayerCollision() {
  const p = state.player;
  for (const box of SOLIDS) {
    if (p.x + 20 < box.x || p.x - 20 > box.x + box.w || p.y + 20 < box.y || p.y - 20 > box.y + box.h) continue;
    const left = Math.abs(p.x - box.x);
    const right = Math.abs(p.x - (box.x + box.w));
    const top = Math.abs(p.y - box.y);
    const bottom = Math.abs(p.y - (box.y + box.h));
    const smallest = Math.min(left, right, top, bottom);
    if (smallest === left) p.x = box.x - 20;
    else if (smallest === right) p.x = box.x + box.w + 20;
    else if (smallest === top) p.y = box.y - 20;
    else p.y = box.y + box.h + 20;
  }
}

function updateParticles(dt) {
  photoFlash = Math.max(0, photoFlash - dt * 1.5);
  dashFlash = Math.max(0, dashFlash - dt * 1.4);
  endBanner = Math.max(0, endBanner - dt * 0.4);
}

function drawFrame() {
  const ctx = renderer;
  ctx.clearRect(0, 0, sceneW, sceneH);

  const shakeX = state.camera.shake > 0 ? (Math.random() - 0.5) * 8 * state.camera.shake : 0;
  const shakeY = state.camera.shake > 0 ? (Math.random() - 0.5) * 8 * state.camera.shake : 0;
  if (state.camera.shake > 0) state.camera.shake = Math.max(0, state.camera.shake - 0.08);

  ctx.save();
  ctx.translate(-state.camera.x + shakeX, -state.camera.y + shakeY);
  drawWorld(ctx);
  drawDecor(ctx);
  drawInteractables(ctx);
  drawCompanion(ctx, state.companion.x, state.companion.y);
  drawPlayer(ctx, state.player.x, state.player.y);
  drawQuestGlow(ctx);
  ctx.restore();

  drawOverlay(ctx);
}

function drawWorld(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD.height);
  sky.addColorStop(0, "#16213f");
  sky.addColorStop(0.5, "#111826");
  sky.addColorStop(1, "#0b0f18");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  drawApartment(ctx);
  drawStreet(ctx);
  drawPark(ctx);
}

function drawApartment(ctx) {
  const base = ctx.createLinearGradient(0, 0, 1000, 0);
  base.addColorStop(0, "#202a42");
  base.addColorStop(1, "#101628");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1050, 800);

  ctx.fillStyle = "rgba(255, 214, 168, 0.08)";
  ctx.fillRect(100, 110, 220, 140);
  ctx.fillRect(360, 126, 300, 120);
  ctx.fillRect(700, 110, 220, 150);

  const lamp = ctx.createRadialGradient(540, 260, 20, 540, 260, 220);
  lamp.addColorStop(0, "rgba(255, 240, 183, 0.32)");
  lamp.addColorStop(1, "rgba(255, 240, 183, 0)");
  ctx.fillStyle = lamp;
  ctx.fillRect(300, 120, 450, 280);

  ctx.fillStyle = "#2d3c59";
  roundRect(ctx, 150, 430, 220, 70, 12);
  ctx.fill();
  ctx.fillStyle = "#1a2438";
  roundRect(ctx, 180, 390, 160, 48, 10);
  ctx.fill();

  ctx.fillStyle = "#3b2f4f";
  roundRect(ctx, 540, 380, 200, 98, 12);
  ctx.fill();
  ctx.fillStyle = "#271f37";
  roundRect(ctx, 560, 356, 120, 34, 8);
  ctx.fill();

  ctx.fillStyle = "#ffd7be";
  roundRect(ctx, 820, 270, 128, 220, 18);
  ctx.fill();
  ctx.fillStyle = "#8ecaff";
  ctx.fillRect(846, 312, 76, 102);

  ctx.fillStyle = "#0f1725";
  roundRect(ctx, 710, 520, 90, 160, 8);
  ctx.fill();
  ctx.fillStyle = "#62738f";
  ctx.fillRect(724, 542, 60, 112);

  ctx.fillStyle = "#223451";
  roundRect(ctx, 22, 40, 1006, 46, 0);
  ctx.fill();
}

function drawStreet(ctx) {
  ctx.fillStyle = "#0f1527";
  ctx.fillRect(1050, 0, 1100, 800);
  const road = ctx.createLinearGradient(1050, 0, 2150, 0);
  road.addColorStop(0, "#18223d");
  road.addColorStop(0.5, "#10182a");
  road.addColorStop(1, "#1d2747");
  ctx.fillStyle = road;
  ctx.fillRect(1050, 0, 1100, 800);

  ctx.fillStyle = "#2a3556";
  ctx.fillRect(1080, 90, 118, 640);
  ctx.fillRect(1270, 150, 156, 580);
  ctx.fillRect(1486, 82, 132, 648);
  ctx.fillRect(1688, 160, 174, 570);
  ctx.fillRect(1922, 110, 130, 620);

  ctx.fillStyle = "#0f1829";
  ctx.fillRect(1050, 500, 1100, 80);
  ctx.fillRect(1050, 0, 1100, 68);

  ctx.fillStyle = "#3d4e77";
  ctx.fillRect(1040, 400, 980, 32);
  ctx.fillStyle = "#101725";
  ctx.fillRect(1380, 0, 30, 800);
  ctx.fillRect(1720, 0, 30, 800);

  ctx.fillStyle = "#27405f";
  roundRect(ctx, 1440, 330, 220, 116, 10);
  ctx.fill();
  ctx.fillStyle = "#8bd4ff";
  ctx.fillRect(1464, 354, 166, 68);

  ctx.fillStyle = "#304661";
  roundRect(ctx, 1810, 320, 170, 138, 10);
  ctx.fill();
  ctx.fillStyle = "#edcb73";
  ctx.fillRect(1844, 346, 96, 76);
}

function drawPark(ctx) {
  const grass = ctx.createLinearGradient(0, 800, 3200, 1600);
  grass.addColorStop(0, "#133821");
  grass.addColorStop(1, "#0d1f15");
  ctx.fillStyle = grass;
  ctx.fillRect(0, 800, WORLD.width, 800);

  ctx.fillStyle = "rgba(132, 237, 211, 0.08)";
  ctx.fillRect(2080, 840, 1120, 680);

  ctx.fillStyle = "#2f6a45";
  for (let i = 0; i < 7; i += 1) {
    const x = 2120 + i * 140;
    ctx.beginPath();
    ctx.arc(x, 960 + (i % 2) * 24, 44, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#0d1b12";
  ctx.fillRect(2240, 980, 710, 22);
  ctx.fillRect(2360, 1120, 500, 18);

  ctx.fillStyle = "#2f2c42";
  roundRect(ctx, 2360, 1090, 260, 78, 18);
  ctx.fill();
  ctx.fillStyle = "#e9c99c";
  ctx.fillRect(2400, 1120, 190, 12);

  const fountain = ctx.createRadialGradient(2790, 980, 10, 2790, 980, 120);
  fountain.addColorStop(0, "rgba(141, 240, 211, 0.66)");
  fountain.addColorStop(1, "rgba(141, 240, 211, 0)");
  ctx.fillStyle = fountain;
  ctx.beginPath();
  ctx.arc(2790, 980, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#284c4b";
  ctx.beginPath();
  ctx.arc(2790, 980, 52, 0, Math.PI * 2);
  ctx.fill();
}

function drawDecor(ctx) {
  for (let i = 0; i < 22; i += 1) {
    const x = (i * 146 + (i % 4) * 28) % WORLD.width;
    const y = 110 + (i % 3) * 48 + Math.sin((i + state.player.x * 0.002) * 1.6) * 4;
    ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.06)" : "rgba(118,243,216,0.08)";
    ctx.beginPath();
    ctx.arc(x, y, 2.2 + (i % 3) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (photoFlash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${photoFlash * 0.4})`;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  }
}

function drawQuestGlow(ctx) {
  const target = currentQuestTarget();
  if (!target || state.dialogueOpen) return;
  const pulse = 1 + Math.sin(performance.now() * 0.005) * 0.08;
  ctx.save();
  ctx.translate(target.x, target.y - 28);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgba(118,243,216,0.16)";
  ctx.beginPath();
  ctx.arc(0, 0, target.r * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(118,243,216,0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, target.r * 0.72 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawInteractables(ctx) {
  const current = CURRENT_QUEST();
  INTERACTABLES.forEach((item) => {
    const active = item.id === current.targetId;
    const glow = active ? 0.42 : 0.16;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.fillStyle = `rgba(255,255,255,${glow})`;
    ctx.beginPath();
    ctx.arc(0, 0, item.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = active ? "rgba(118,243,216,0.88)" : "rgba(246,244,255,0.54)";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(item.label, 0, -item.r - 16);
    ctx.restore();
  });
}

function drawPlayer(ctx, x, y) {
  drawChibi(ctx, x, y, {
    body: "#5176ff",
    dress: "#d9e3ff",
    hair: "#1d2340",
    accent: "#76f3d8",
    facing: state.player.facing,
    walk: Math.sin(performance.now() * 0.015) * 0.5,
    name: "你"
  });
}

function drawCompanion(ctx, x, y) {
  drawChibi(ctx, x, y, {
    body: "#ef7d95",
    dress: "#ffe4eb",
    hair: "#3f1634",
    accent: "#ffd37b",
    facing: state.player.x < x ? -1 : 1,
    walk: Math.sin(performance.now() * 0.015 + 1.1) * 0.55,
    name: "林栖"
  });
}

function drawChibi(ctx, x, y, palette) {
  const bob = Math.sin(performance.now() * 0.006 + x * 0.01) * 2.5 + palette.walk * 2.2;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(palette.facing, 1);

  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.beginPath();
  ctx.ellipse(0, 36, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.body;
  ctx.beginPath();
  ctx.arc(0, -18, 19, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.hair;
  ctx.beginPath();
  ctx.arc(0, -30, 22, Math.PI * 1.05, Math.PI * 1.95);
  ctx.arc(-12, -19, 10, Math.PI * 1.7, Math.PI * 0.3, true);
  ctx.arc(12, -19, 10, Math.PI * 0.7, Math.PI * 1.9, true);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fff8f0";
  ctx.beginPath();
  ctx.arc(-7, -20, 3.8, 0, Math.PI * 2);
  ctx.arc(7, -20, 3.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#12131b";
  ctx.beginPath();
  ctx.arc(-7, -20, 1.4, 0, Math.PI * 2);
  ctx.arc(7, -20, 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.dress;
  roundRect(ctx, -11, 0, 22, 26, 8);
  ctx.fill();
  ctx.fillStyle = palette.accent;
  ctx.fillRect(-10, 4, 20, 4);

  ctx.fillStyle = palette.body;
  roundRect(ctx, -17, 20, 10, 18, 4);
  roundRect(ctx, 7, 20, 10, 18, 4);
  ctx.fill();

  ctx.restore();
}

function drawOverlay(ctx) {
  if (state.photoUnlocked && !state.dialogueOpen && state.questIndex >= 4) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#76f3d8";
    ctx.fillRect(0, 0, sceneW, sceneH);
    ctx.restore();
  }
  if (dashFlash > 0) {
    ctx.save();
    ctx.globalAlpha = dashFlash * 0.18;
    const g = ctx.createRadialGradient(sceneW * 0.5, sceneH * 0.52, 12, sceneW * 0.5, sceneH * 0.52, sceneW * 0.75);
    g.addColorStop(0, "rgba(118,243,216,0.9)");
    g.addColorStop(1, "rgba(118,243,216,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, sceneW, sceneH);
    ctx.restore();
  }
  if (endBanner > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, endBanner / 2.6);
    ctx.fillStyle = "rgba(9, 12, 20, 0.56)";
    ctx.fillRect(0, 0, sceneW, sceneH);
    ctx.fillStyle = "#fff8f3";
    ctx.textAlign = "center";
    ctx.font = "600 28px Inter, sans-serif";
    ctx.fillText("今晚的约会结束了", sceneW * 0.5, sceneH * 0.46);
    ctx.font = "500 16px Inter, sans-serif";
    ctx.fillStyle = "rgba(246,244,255,0.82)";
    ctx.fillText("你可以继续探索，也可以把这张照片带回房间。", sceneW * 0.5, sceneH * 0.52);
    ctx.restore();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function updateLoop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  if (!state.dialogueOpen) updateMovement(dt);
  updateParticles(dt);
  renderHud();
  drawFrame();
  if (!window.__AI_GF_DISABLE_AUTO_LOOP__) {
    requestAnimationFrame(updateLoop);
  }
}

function bindInput() {
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("keydown", (event) => {
    state.keys[event.code] = true;
    if (event.code === "Escape") {
      if (state.dialogueOpen) closeDialogue();
      else setQuestPanel(!state.questPanelOpen);
    }
    if (event.code === "Space") triggerDash();
    if (event.code === "KeyE") handleQuestInteraction();
    if (event.code === "KeyF") handlePhoto();
  });
  window.addEventListener("keyup", (event) => {
    state.keys[event.code] = false;
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const rect = canvas.getBoundingClientRect();
    const inHud = event.clientY < rect.top + 120;
    if (inHud) return;
    const world = screenToWorld(event.clientX, event.clientY);
    state.clickTarget = world;
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.joystick.active) return;
    updateJoystickFromEvent(event);
  });

  canvas.addEventListener("pointerup", () => {
    state.clickTarget = null;
  });

  canvas.addEventListener("pointercancel", () => {
    state.clickTarget = null;
  });

  els.questButton.addEventListener("click", () => setQuestPanel(!state.questPanelOpen));
  els.closeQuestButton.addEventListener("click", () => setQuestPanel(false));
  els.interactButton.addEventListener("click", handleQuestInteraction);
  els.touchInteractButton.addEventListener("click", handleQuestInteraction);
  els.dashButton.addEventListener("click", triggerDash);
  els.touchDashButton.addEventListener("click", triggerDash);
  els.photoButton.addEventListener("click", handlePhoto);
  els.closeDialogueButton.addEventListener("click", closeDialogue);

  els.joystick.addEventListener("pointerdown", (event) => {
    state.joystick.active = true;
    state.joystick.pointerId = event.pointerId;
    updateJoystick(event);
    els.joystick.setPointerCapture?.(event.pointerId);
  });
  els.joystick.addEventListener("pointermove", updateJoystick);
  els.joystick.addEventListener("pointerup", releaseJoystick);
  els.joystick.addEventListener("pointercancel", releaseJoystick);
  els.joystick.addEventListener("lostpointercapture", releaseJoystick);
}

function updateJoystick(event) {
  if (!state.joystick.active) return;
  const rect = els.joystick.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = event.clientX - cx;
  const dy = event.clientY - cy;
  const radius = Math.max(32, rect.width * 0.28);
  const length = Math.hypot(dx, dy);
  const nx = length > radius ? (dx / length) * radius : dx;
  const ny = length > radius ? (dy / length) * radius : dy;
  state.joystick.x = clamp(nx / radius, -1, 1);
  state.joystick.y = clamp(ny / radius, -1, 1);
  els.joystickKnob.style.transform = `translate(${state.joystick.x * 38}px, ${state.joystick.y * 38}px)`;
}

function releaseJoystick() {
  state.joystick.active = false;
  state.joystick.pointerId = null;
  state.joystick.x = 0;
  state.joystick.y = 0;
  els.joystickKnob.style.transform = "translate(0, 0)";
}

function updateJoystickFromEvent(event) {
  if (!state.joystick.active) return;
  updateJoystick(event);
}

function bootstrap() {
  resizeCanvas();
  bindInput();
  renderHud();
  if (state.questPanelOpen) els.questPanel.classList.remove("collapsed");
  els.dialogueSheet.hidden = !state.dialogueOpen;
  els.promptText.textContent = state.prompt;
  drawFrame();
  if (!window.__AI_GF_DISABLE_AUTO_LOOP__) requestAnimationFrame(updateLoop);
  window.__aiGfDebug = {
    state,
    quests: QUESTS,
    interact: handleQuestInteraction,
    photo: handlePhoto,
    dash: triggerDash,
    setQuestPanel,
    closeDialogue
  };
}

bootstrap();
