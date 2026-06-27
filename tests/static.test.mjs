import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const requiredFiles = [
  "index.html",
  "src/styles.css",
  "src/app.js",
  "manifest.webmanifest",
  "sw.js",
  "assets/icon.svg",
  "assets/linqi-2d.png",
  "assets/couple-main.png",
  "docs/ASSETS.md",
  "docs/GDD.md",
  "tests/runtime-smoke.test.mjs"
];

for (const file of requiredFiles) {
  assert.equal(existsSync(new URL(file, root)), true, `${file} should exist`);
}

const [html, css, js, manifest, sw, gdd] = await Promise.all([
  read("index.html"),
  read("src/styles.css"),
  read("src/app.js"),
  read("manifest.webmanifest"),
  read("sw.js"),
  read("docs/GDD.md")
]);

assert.match(html, /<main class="game-layout">/, "main game layout is present");
assert.match(html, /<title>AI女友<\/title>/, "game title is AI女友");
assert.match(html, /id="chatForm"/, "chat form exists");
assert.match(html, /id="storyChoices"/, "story choices exist");
assert.match(html, /couple-main\.png/, "2D couple asset is used");
assert.match(html, /id="portraitMood"/, "portrait mood exists");
assert.match(html, /id="interactionState"/, "interaction state exists");
assert.match(html, /data-action="hug"/, "hug action exists");
assert.match(html, /data-action="kiss"/, "kiss action exists");
assert.match(html, /data-action="sulk"/, "sulk action exists");
assert.match(html, /data-action="game"/, "game action exists");
assert.match(html, /v0\.4 双人2D/, "visible version badge exists");
assert.match(html, /data-action="night"/, "night action exists");
assert.match(html, /rel="manifest"/, "manifest is linked");
assert.match(css, /\.character/, "character visual exists");
assert.match(css, /\.blink-left/, "blink animation exists");
assert.match(css, /@keyframes blink/, "blink keyframes exist");
assert.match(css, /@media \(max-width: 560px\)/, "mobile layout exists");
assert.match(js, /localStorage/, "save system uses localStorage");
assert.match(js, /serviceWorker/, "service worker registration exists");
assert.match(js, /const actionData = {/, "action data exists");
assert.match(js, /const chatRules = \[/, "chat rules exist");
assert.match(js, /const storyChapters = \[/, "story chapters exist");
assert.match(js, /scene: "hug"/, "hug scene exists");
assert.match(js, /scene: "kiss"/, "kiss scene exists");
assert.match(sw, /CACHE_NAME/, "service worker cache exists");
assert.match(sw, /skipWaiting/, "service worker activates updates quickly");
assert.match(sw, /request\.mode === "navigate"/, "navigation is network-first");
assert.equal(JSON.parse(manifest).display, "standalone", "manifest is installable");
assert.equal(JSON.parse(manifest).icons.length > 0, true, "manifest has an icon");
assert.match(gdd, /MVP 验收标准/, "GDD includes acceptance criteria");

console.log("Static checks passed.");
