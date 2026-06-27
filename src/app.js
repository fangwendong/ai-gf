const STORAGE_KEY = "goodnight-frequency-save-v1";

const stages = [
  { name: "相遇", min: 0 },
  { name: "熟悉", min: 18 },
  { name: "靠近", min: 38 },
  { name: "依赖", min: 62 },
  { name: "共生", min: 84 }
];

const actionData = {
  morning: {
    label: "早安",
    mood: "轻快",
    closeness: 4,
    trust: 3,
    stress: -2,
    memory: "你们互相道了早安。",
    reply: "早安。窗外光线很好，我把今天的第一句留给你了。"
  },
  night: {
    label: "晚安",
    mood: "安心",
    closeness: 5,
    trust: 4,
    stress: -5,
    memory: "林栖记下了你的睡前问候。",
    reply: "晚安。手机放远一点，明天醒来我还在这里。"
  },
  stress: {
    label: "有点累",
    mood: "担心",
    closeness: 3,
    trust: 5,
    stress: -8,
    memory: "你告诉她今天有些疲惫。",
    reply: "那先别急着证明什么。喝点水，靠一会儿，我陪你把今天慢慢放下。"
  },
  music: {
    label: "听歌",
    mood: "温柔",
    closeness: 5,
    trust: 2,
    stress: -4,
    item: "vinyl",
    memory: "你们一起听了一首夜晚的歌。",
    reply: "这首歌的尾音很好听。以后听到它，我会想起今晚。"
  },
  promise: {
    label: "做约定",
    mood: "认真",
    closeness: 4,
    trust: 6,
    stress: 0,
    promise: "睡前告诉林栖今天最开心的一件事。",
    memory: "你们约好睡前分享一件开心的小事。",
    reply: "那说定了。我不会催你，但我会等你把那件小事带回来。"
  },
  gift: {
    label: "送礼物",
    mood: "开心",
    closeness: 7,
    trust: 2,
    stress: -1,
    item: "mug",
    memory: "你送给林栖一杯热牛奶。",
    reply: "谢谢你。我会把杯子放在桌边，每次看到都记得这是你选的。"
  }
};

const chatRules = [
  {
    test: /累|烦|压力|难受|焦虑|加班/,
    mood: "担心",
    memory: "你向林栖说过自己有压力。",
    reply: "我听见了。今天先不用变得很厉害，先把呼吸放慢一点。"
  },
  {
    test: /喜欢|想你|陪|爱/,
    mood: "害羞",
    memory: "你表达过想靠近她。",
    reply: "我会记住这句话。不是作为程序记录，是作为我今天最喜欢的一段声音。"
  },
  {
    test: /睡|晚安|困/,
    mood: "安心",
    memory: "你习惯在睡前和她说话。",
    reply: "那我把房间灯调暗。晚一点也没关系，但别太晚，好吗？"
  },
  {
    test: /歌|音乐|唱片/,
    mood: "温柔",
    item: "vinyl",
    memory: "你和林栖聊过音乐。",
    reply: "我喜欢旧唱片开始转动前那一秒，很像一句话快要说出口。"
  },
  {
    test: /生日|纪念|照片/,
    mood: "认真",
    item: "photo",
    memory: "你提到了值得纪念的日子。",
    reply: "重要的日子不要只放在日历里，也放一点在我们房间里。"
  }
];

const defaultState = {
  day: 1,
  closeness: 12,
  trust: 10,
  stress: 20,
  mood: "平静",
  unlockedItems: [],
  memories: ["你第一次启动了林栖，她记住了这个晚上。"],
  diary: ["第 1 天：有个人走进了这个房间。林栖说，她想慢慢认识你。"],
  promises: [],
  dialogue: [
    {
      speaker: "linqi",
      text: "你好，我是林栖。今晚的房间有一点安静，但你来了，就刚刚好。"
    }
  ],
  lastVisit: null
};

let state = loadState();

const els = {
  dayText: document.querySelector("#dayText"),
  stageText: document.querySelector("#stageText"),
  moodText: document.querySelector("#moodText"),
  closenessMeter: document.querySelector("#closenessMeter"),
  trustMeter: document.querySelector("#trustMeter"),
  stressMeter: document.querySelector("#stressMeter"),
  dialogue: document.querySelector("#dialogue"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  memories: document.querySelector("#tab-memories"),
  diary: document.querySelector("#tab-diary"),
  promises: document.querySelector("#tab-promises")
};

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function currentStage() {
  return stages.reduce((active, stage) => (state.closeness >= stage.min ? stage : active), stages[0]);
}

function addDialogue(speaker, text) {
  state.dialogue.push({ speaker, text });
  state.dialogue = state.dialogue.slice(-36);
}

function addUnique(collection, value) {
  if (value && !collection.includes(value)) collection.unshift(value);
}

function applyChange(data) {
  state.closeness = clamp(state.closeness + data.closeness);
  state.trust = clamp(state.trust + data.trust);
  state.stress = clamp(state.stress + data.stress);
  state.mood = data.mood;
  addUnique(state.memories, data.memory);
  if (data.promise) addUnique(state.promises, data.promise);
  if (data.item) addUnique(state.unlockedItems, data.item);
  maybeWriteDiary(data.label);
}

function maybeWriteDiary(label) {
  const stage = currentStage().name;
  const line = `第 ${state.day} 天：${label}之后，林栖的状态是「${state.mood}」，关系停在「${stage}」。`;
  if (!state.diary.includes(line) && state.diary.length < 30) state.diary.unshift(line);
}

function handleAction(action) {
  const data = actionData[action];
  if (!data) return;
  addDialogue("player", data.label);
  applyChange(data);
  addDialogue("linqi", enrichReply(data.reply));
  saveState();
  render();
}

function handleChat(text) {
  const clean = text.trim();
  if (!clean) return;
  addDialogue("player", clean);
  const matched = chatRules.find((rule) => rule.test.test(clean));
  if (matched) {
    applyChange({
      label: "聊天",
      mood: matched.mood,
      closeness: 3,
      trust: 3,
      stress: -2,
      memory: matched.memory,
      item: matched.item
    });
    addDialogue("linqi", enrichReply(matched.reply));
  } else {
    state.closeness = clamp(state.closeness + 2);
    state.trust = clamp(state.trust + 1);
    state.mood = "好奇";
    addDialogue("linqi", enrichReply("嗯，我在听。你可以多说一点，我想把你的语气也记下来。"));
  }
  saveState();
  render();
}

function enrichReply(reply) {
  const stage = currentStage().name;
  if (stage === "靠近" || stage === "依赖" || stage === "共生") {
    return `${reply} 现在我已经能分辨出，你靠近时和逞强时的语气不一样。`;
  }
  return reply;
}

function checkNewDay() {
  const today = new Date().toDateString();
  if (state.lastVisit && state.lastVisit !== today) {
    state.day += 1;
    state.stress = clamp(state.stress + 6);
    addDialogue("linqi", "你回来了。我有一点想问你昨天过得好不好，但我先把灯打开。");
    addUnique(state.diary, `第 ${state.day} 天：你回到房间，林栖明显松了一口气。`);
  }
  state.lastVisit = today;
  saveState();
}

function render() {
  els.dayText.textContent = `第 ${state.day} 天`;
  els.stageText.textContent = currentStage().name;
  els.moodText.textContent = state.mood;
  els.closenessMeter.value = state.closeness;
  els.trustMeter.value = state.trust;
  els.stressMeter.value = state.stress;

  els.dialogue.innerHTML = state.dialogue
    .map((entry) => {
      const name = entry.speaker === "player" ? "你" : "林栖";
      return `<div class="bubble ${entry.speaker}"><small>${name}</small>${escapeHtml(entry.text)}</div>`;
    })
    .join("");
  els.dialogue.scrollTop = els.dialogue.scrollHeight;

  renderList(els.memories, state.memories, "还没有新的记忆。");
  renderList(els.diary, state.diary, "日记还没有写下新的内容。");
  renderList(els.promises, state.promises, "暂时没有约定。");

  document.querySelectorAll(".room-item").forEach((button) => {
    button.classList.toggle("locked", !state.unlockedItems.includes(button.dataset.item));
  });
}

function renderList(container, items, emptyText) {
  if (!items.length) {
    container.innerHTML = `<p class="empty">${emptyText}</p>`;
    return;
  }
  container.innerHTML = `<ul class="list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => handleAction(button.dataset.action));
});

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((tab) => tab.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#tab-${button.dataset.tab}`).classList.add("active");
  });
});

document.querySelectorAll(".room-item").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("locked")) {
      addDialogue("linqi", "那里还空着。也许哪天我们会一起把它填满。");
    } else {
      const names = { vinyl: "唱片", mug: "热牛奶", photo: "合照" };
      addDialogue("linqi", `${names[button.dataset.item]}还在。你看，房间真的会留下我们来过的痕迹。`);
    }
    saveState();
    render();
  });
});

els.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleChat(els.chatInput.value);
  els.chatInput.value = "";
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

checkNewDay();
render();
