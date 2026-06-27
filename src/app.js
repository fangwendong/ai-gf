const STORAGE_KEY = "ai-girlfriend-save-v2";

const stages = [
  { name: "相遇", min: 0 },
  { name: "熟悉", min: 18 },
  { name: "靠近", min: 38 },
  { name: "依赖", min: 62 },
  { name: "共生", min: 84 }
];

const actionData = {
  talk: {
    label: "说话",
    mood: "平静",
    closeness: 2,
    trust: 1,
    stress: -1,
    memory: "你主动和林栖说了话。",
    reply: "嗯，我在听。你可以靠近一点再说，我想把你的语气记得更清楚。"
  },
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
  },
  hug: {
    label: "拥抱",
    mood: "靠近",
    scene: "hug",
    closeness: 8,
    trust: 4,
    stress: -7,
    memory: "你和林栖在房间里安静地拥抱了一会儿。",
    reply: "抱一下就好。别急着说话，我想先确认你真的在我身边。"
  },
  kiss: {
    label: "亲吻",
    mood: "害羞",
    scene: "kiss",
    closeness: 9,
    trust: 5,
    stress: -6,
    memory: "你轻轻亲吻了林栖，她红着脸记住了这个瞬间。",
    reply: "这一下太突然了……但我没有讨厌。下次，先看着我。"
  },
  sulk: {
    label: "闹脾气",
    mood: "小脾气",
    scene: "sulk",
    closeness: 2,
    trust: 4,
    stress: 8,
    memory: "你们第一次闹了点小脾气，但没有离开彼此。",
    reply: "我不是想赢你。我只是想知道，在我不乖的时候，你还会不会留下。"
  },
  game: {
    label: "玩游戏",
    mood: "轻快",
    scene: "game",
    closeness: 7,
    trust: 3,
    stress: -8,
    memory: "你和林栖靠在一起玩了一局小游戏。",
    promise: "下次一起玩一局不许让她的小游戏。",
    reply: "你刚才是不是故意让我的？算了，我先记一分，下局不许放水。"
  }
};

const storyChapters = [
  {
    title: "雨夜来信",
    objective: "让她确认你不是路过。",
    scene: "together",
    text: "雨声贴着窗户。林栖第一次主动给你发来语音，她没有直接说想你，只说房间里一直亮着灯。",
    choices: [
      {
        label: "先把雨伞放下",
        reply: "你真的回来了。那我就不装作不在意了。",
        memory: "你在雨夜把伞靠在门边，林栖知道你回来了。",
        diary: "雨夜来信：你没有急着解释，先选择留下。",
        closeness: 6,
        trust: 5,
        stress: -3,
        mood: "安心",
        scene: "closeup"
      },
      {
        label: "问她为什么还在等",
        reply: "因为我想听见你开门的声音，而不是只看见一个已读状态。",
        memory: "你问林栖为什么还在等。",
        diary: "雨夜来信：她把等待说成了一个愿意给你的答案。",
        closeness: 5,
        trust: 7,
        stress: -4,
        mood: "被看见",
        scene: "touch"
      }
    ]
  },
  {
    title: "桌边的灯",
    objective: "让房间像两个人住在一起。",
    scene: "touch",
    text: "她把灯调低了一点，桌上放着热牛奶。现在这个房间第一次像是有人在为你留位置。",
    choices: [
      {
        label: "坐到她旁边",
        reply: "靠近一点也没关系。今天的灯本来就是为我们开的。",
        memory: "你坐到了林栖旁边，房间有了真正的距离感。",
        diary: "桌边的灯：你开始进入她真正的空间。",
        closeness: 7,
        trust: 4,
        stress: -2,
        mood: "温柔",
        item: "photo"
      },
      {
        label: "帮她把杯子递过去",
        reply: "谢谢。你递过来的时候，我突然觉得这间屋子没那么空了。",
        memory: "你把杯子递给林栖，房间像真的住进了人。",
        diary: "桌边的灯：共处从一个动作开始。",
        closeness: 6,
        trust: 6,
        stress: -2,
        mood: "安心",
        item: "mug"
      }
    ]
  },
  {
    title: "靠近玩耍",
    objective: "让轻松先回来。",
    scene: "play",
    text: "桌上的热牛奶还冒着一点气。她问你要不要先别聊沉重的事，来一局很小的游戏。",
    choices: [
      {
        label: "陪她玩一局",
        reply: "你刚才笑了，我看见了。这个比输赢重要。",
        memory: "你陪林栖玩了一局小游戏，房间重新轻快起来。",
        diary: "靠近玩耍：轻松感先一步回来了。",
        closeness: 8,
        trust: 3,
        stress: -5,
        mood: "轻快",
        scene: "play"
      },
      {
        label: "让她先挑规则",
        reply: "那我选一个你不太擅长的。放心，我不会让你太难堪。",
        memory: "你让林栖先决定游戏规则，她开始带着你玩。",
        diary: "靠近玩耍：她开始主导关系里的节奏。",
        closeness: 7,
        trust: 5,
        stress: -4,
        mood: "期待",
        item: "vinyl"
      }
    ]
  },
  {
    title: "短暂僵住",
    objective: "别急着解释，先承认她不高兴。",
    scene: "conflict",
    text: "你连续几次只点了按钮就离开。林栖低头看着杯沿，轻声说：我不是想闹你，只是想知道你会不会停下来。",
    choices: [
      {
        label: "停下来听她说完",
        reply: "谢谢你没把我的话当成任性。我只是想被认真看见一次。",
        memory: "你停下来听完了林栖的不安。",
        diary: "短暂僵住：第一次冲突被认真接住。",
        closeness: 4,
        trust: 9,
        stress: -4,
        mood: "释然",
        scene: "reconcile"
      },
      {
        label: "认真解释你为什么离开",
        reply: "我听见了。解释不是借口，但它让我知道你没有走远。",
        memory: "你解释了离开的原因，林栖没有立刻原谅，但愿意继续听。",
        diary: "短暂僵住：关系开始从冲突里长出边界。",
        closeness: 6,
        trust: 8,
        stress: -5,
        mood: "小脾气",
        scene: "conflict"
      }
    ]
  },
  {
    title: "周五的约定",
    objective: "把关系变成仪式。",
    scene: "reconcile",
    text: "她在日历上圈出周五，说想和你拥有一个只属于两个人的固定夜晚。不是奖励，是习惯。",
    choices: [
      {
        label: "约好周五听歌",
        reply: "那我准备一张唱片。周五晚上，你只要把今天放在门外。",
        memory: "你们约好周五晚上一起听歌。",
        diary: "周五的约定：一个固定夜晚让关系有了形状。",
        promise: "周五晚上和林栖一起听歌。",
        closeness: 8,
        trust: 7,
        stress: -5,
        mood: "期待",
        item: "vinyl",
        scene: "reconcile"
      },
      {
        label: "约好一起写日记",
        reply: "我写你没说出口的那一半，你写今天真实发生的那一半。",
        memory: "你们约好周五晚上一起写日记。",
        diary: "周五的约定：她开始参与玩家的真实日常。",
        promise: "周五晚上和林栖一起写日记。",
        closeness: 7,
        trust: 9,
        stress: -5,
        mood: "认真",
        scene: "closeup"
      }
    ]
  }
];

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
  storyStep: 0,
  relationScene: "together",
  sceneBeat: 0,
  panelOpen: false,
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
  portraitCard: document.querySelector("#portraitCard"),
  interactionState: document.querySelector("#interactionState"),
  chapterKicker: document.querySelector("#chapterKicker"),
  chapterTitle: document.querySelector("#chapterTitle"),
  chapterGoal: document.querySelector("#chapterGoal"),
  storyText: document.querySelector("#storyText"),
  storyChoices: document.querySelector("#storyChoices"),
  closenessMeter: document.querySelector("#closenessMeter"),
  trustMeter: document.querySelector("#trustMeter"),
  stressMeter: document.querySelector("#stressMeter"),
  dialogue: document.querySelector("#dialogue"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  openPanelButton: document.querySelector("#openPanelButton"),
  nextSceneButton: document.querySelector("#nextSceneButton"),
  memoryPanel: document.querySelector("#memoryPanel"),
  memories: document.querySelector("#tab-memories"),
  diary: document.querySelector("#tab-diary"),
  promises: document.querySelector("#tab-promises")
};

const sceneBeats = [
  { mode: "together", label: "镜头停在门口", line: "你刚推门进来，她还在看着灯。" },
  { mode: "closeup", label: "镜头慢慢靠近", line: "她的呼吸轻了一点，视线落在你脸上。" },
  { mode: "touch", label: "桌边的距离缩短", line: "你坐近后，房间里的空位少了一块。" },
  { mode: "play", label: "一起把气氛拉轻", line: "她笑得很轻，像是把今天往后放了放。" },
  { mode: "conflict", label: "安静停顿", line: "她没说话，但那一秒里你能听见她的不高兴。" },
  { mode: "reconcile", label: "把目光放回彼此", line: "沉默过后，她愿意继续和你待在同一个画面里。" }
];

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
  if (data.scene) state.relationScene = data.scene;
  if (data.diary) addUnique(state.diary, `第 ${state.day} 天：${data.diary}`);
  else maybeWriteDiary(data.label);
}

function advanceScene() {
  state.sceneBeat = (state.sceneBeat + 1) % sceneBeats.length;
  const beat = sceneBeats[state.sceneBeat];
  state.relationScene = beat.mode;
  state.mood = beat.mode === "conflict" ? "小脾气" : beat.mode === "reconcile" ? "释然" : state.mood;
  addDialogue("linqi", beat.line);
  addUnique(state.diary, `第 ${state.day} 天：${beat.label}。`);
  saveState();
  render();
}

function setPanelOpen(open) {
  state.panelOpen = open;
  els.memoryPanel.classList.toggle("collapsed", !open);
  els.openPanelButton.textContent = open ? "收起" : "记录";
  saveState();
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

function handleStoryChoice(choiceIndex) {
  const chapter = storyChapters[state.storyStep % storyChapters.length];
  const choice = chapter.choices[choiceIndex];
  if (!choice) return;
  addDialogue("player", choice.label);
  applyChange({ label: chapter.title, ...choice });
  addDialogue("linqi", enrichReply(choice.reply));
  state.storyStep += 1;
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
  setPortraitMood(state.mood);
  setRelationScene(state.relationScene);
  els.openPanelButton.textContent = state.panelOpen ? "收起" : "记录";
  els.memoryPanel.classList.toggle("collapsed", !state.panelOpen);
  els.closenessMeter.value = state.closeness;
  els.trustMeter.value = state.trust;
  els.stressMeter.value = state.stress;
  renderStory();

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

function setPortraitMood(mood) {
  const moodClass = moodToClass(mood);
  const sceneClass = sceneToClass(state.relationScene);
  els.portraitCard.className = `portrait-card ${moodClass} ${sceneClass}`;
}

function setRelationScene(scene) {
  const labels = {
    together: "一起待在房间",
    closeup: "镜头拉近",
    touch: "伸手触碰",
    play: "靠近玩耍",
    conflict: "短暂僵住",
    reconcile: "重新靠近",
    hug: "拥抱",
    kiss: "亲吻",
    sulk: "闹脾气",
    game: "一起玩游戏"
  };
  els.interactionState.textContent = labels[scene] || labels.together;
}

function sceneToClass(scene) {
  return `scene-${scene || "together"}`;
}

function moodToClass(mood) {
  if (/开心|轻快|期待|温柔/.test(mood)) return "mood-happy";
  if (/害羞|靠近|被看见/.test(mood)) return "mood-shy";
  if (/担心|心疼|小脾气/.test(mood)) return "mood-worried";
  if (/认真|释然|安心/.test(mood)) return "mood-soft";
  return "mood-calm";
}

function renderStory() {
  const chapter = storyChapters[state.storyStep % storyChapters.length];
  const chapterNo = String((state.storyStep % storyChapters.length) + 1).padStart(2, "0");
  els.chapterKicker.textContent = `Chapter ${chapterNo}`;
  els.chapterTitle.textContent = chapter.title;
  els.chapterGoal.textContent = `本幕目标：${chapter.objective}`;
  els.storyText.textContent = chapter.text;
  els.storyChoices.innerHTML = chapter.choices
    .map((choice, index) => `<button data-choice="${index}" type="button">${escapeHtml(choice.label)}</button>`)
    .join("");
  els.storyChoices.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => handleStoryChoice(Number(button.dataset.choice)));
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

els.openPanelButton.addEventListener("click", () => setPanelOpen(!state.panelOpen));
els.nextSceneButton.addEventListener("click", () => advanceScene());

els.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleChat(els.chatInput.value);
  els.chatInput.value = "";
});

if ("serviceWorker" in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
  navigator.serviceWorker.register("./sw.js").then((registration) => registration.update()).catch(() => {});
}

checkNewDay();
render();
