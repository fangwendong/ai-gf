import assert from "node:assert/strict";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(value) {
    this.values.add(value);
  }

  remove(value) {
    this.values.delete(value);
  }

  toggle(value, force) {
    const shouldAdd = force ?? !this.values.has(value);
    if (shouldAdd) this.values.add(value);
    else this.values.delete(value);
  }

  contains(value) {
    return this.values.has(value);
  }
}

class FakeElement {
  constructor(selector, dataset = {}) {
    this.selector = selector;
    this.dataset = dataset;
    this.classList = new FakeClassList();
    this.listeners = {};
    this.children = [];
    this.textContent = "";
    this.value = "";
    this.scrollTop = 0;
    this.scrollHeight = 0;
  }

  set innerHTML(value) {
    this._innerHTML = value;
    this.children = [];
    for (const match of value.matchAll(/data-choice="(\d+)"/g)) {
      this.children.push(new FakeElement("[data-choice]", { choice: match[1] }));
    }
  }

  get innerHTML() {
    return this._innerHTML || "";
  }

  addEventListener(type, callback) {
    this.listeners[type] = callback;
  }

  click() {
    this.listeners.click?.({ preventDefault() {} });
  }

  querySelectorAll(selector) {
    if (selector === "[data-choice]") return this.children;
    return [];
  }
}

const ids = [
  "dayText",
  "stageText",
  "moodText",
  "portraitCard",
  "portraitMood",
  "interactionState",
  "chapterKicker",
  "chapterTitle",
  "storyText",
  "storyChoices",
  "closenessMeter",
  "trustMeter",
  "stressMeter",
  "dialogue",
  "chatForm",
  "chatInput",
  "tab-memories",
  "tab-diary",
  "tab-promises"
];

const elements = new Map(ids.map((id) => [`#${id}`, new FakeElement(`#${id}`)]));
const actions = ["morning", "night", "stress", "music", "promise", "gift", "hug", "kiss", "sulk", "game"]
  .map((action) => new FakeElement("[data-action]", { action }));
const tabs = ["memories", "diary", "promises"].map((tab) => new FakeElement("[data-tab]", { tab }));
const roomItems = ["vinyl", "mug", "photo"].map((item) => new FakeElement(".room-item", { item }));
roomItems.forEach((item) => item.classList.add("locked"));

globalThis.localStorage = {
  data: new Map(),
  getItem(key) {
    return this.data.get(key) || null;
  },
  setItem(key, value) {
    this.data.set(key, String(value));
  }
};

Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: {
    serviceWorker: {
      addEventListener() {},
      register() {
        return Promise.resolve({ update() {} });
      }
    }
  }
});

globalThis.window = {
  location: {
    reload() {
      throw new Error("unexpected reload in smoke test");
    }
  }
};

globalThis.document = {
  querySelector(selector) {
    const element = elements.get(selector);
    assert.ok(element, `missing fake element for ${selector}`);
    return element;
  },
  querySelectorAll(selector) {
    if (selector === "[data-action]") return actions;
    if (selector === "[data-tab]") return tabs;
    if (selector === ".tab-content") return [elements.get("#tab-memories"), elements.get("#tab-diary"), elements.get("#tab-promises")];
    if (selector === ".room-item") return roomItems;
    return [];
  }
};

await import("../src/app.js");

assert.equal(elements.get("#chapterTitle").textContent, "雨夜来信");
assert.match(elements.get("#dialogue").innerHTML, /林栖/);

actions.find((action) => action.dataset.action === "hug").click();
assert.match(elements.get("#dialogue").innerHTML, /拥抱/);
assert.equal(elements.get("#interactionState").textContent, "拥抱");

elements.get("#storyChoices").children[0].click();
assert.notEqual(elements.get("#chapterTitle").textContent, "雨夜来信");
assert.match(elements.get("#dialogue").innerHTML, /问她等了多久|抱一下/);

console.log("Runtime smoke checks passed.");
