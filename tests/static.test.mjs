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
  "docs/2D_GAME_SPEC.md",
  "tests/runtime-smoke.test.mjs"
];

for (const file of requiredFiles) {
  assert.equal(existsSync(new URL(file, root)), true, `${file} should exist`);
}

const [html, css, js, manifest, sw, gdd, gameSpec] = await Promise.all([
  read("index.html"),
  read("src/styles.css"),
  read("src/app.js"),
  read("manifest.webmanifest"),
  read("sw.js"),
  read("docs/GDD.md"),
  read("docs/2D_GAME_SPEC.md")
]);

assert.match(html, /<main class="cinematic-stage"/, "cinematic game stage is present");
assert.match(html, /<title>AI女友<\/title>/, "game title is AI女友");
assert.match(html, /id="chatForm"/, "chat form exists");
assert.match(html, /id="chapterGoal"/, "chapter goal exists");
assert.match(html, /id="storyChoices"/, "story choices exist");
assert.match(html, /couple-main\.png/, "2D couple asset is used");
assert.match(html, /id="interactionState"/, "interaction state exists");
assert.match(html, /character-hotspots/, "character hotspots exist");
assert.match(html, /data-action="talk"/, "talk action exists");
assert.match(html, /data-action="hug"/, "hug action exists");
assert.match(html, /data-action="kiss"/, "kiss action exists");
assert.match(html, /data-action="sulk"/, "sulk action exists");
assert.match(html, /data-action="game"/, "game action exists");
assert.match(html, /v0\.9 Story Pass/, "visible version badge exists");
assert.match(html, /id="openPanelButton"/, "panel toggle exists");
assert.match(html, /id="nextSceneButton"/, "next scene exists");
assert.match(html, /data-action="night"/, "night action exists");
assert.match(html, /rel="manifest"/, "manifest is linked");
assert.match(css, /\.cinematic-stage/, "cinematic stage exists");
assert.match(css, /position: absolute;/, "cinematic layers use absolute positioning");
assert.match(css, /\.blink-left/, "blink animation exists");
assert.match(css, /@keyframes blink/, "blink keyframes exist");
assert.match(css, /\.hud/, "hud exists");
assert.match(css, /\.memory-panel\.collapsed/, "collapsed memory panel exists");
assert.match(css, /@media \(max-width: 560px\)/, "mobile layout exists");
assert.match(js, /localStorage/, "save system uses localStorage");
assert.match(js, /serviceWorker/, "service worker registration exists");
assert.match(js, /const actionData = {/, "action data exists");
assert.match(js, /const chatRules = \[/, "chat rules exist");
assert.match(js, /const storyChapters = \[/, "story chapters exist");
assert.match(js, /const sceneBeats = \[/, "scene beats exist");
assert.match(js, /objective:/, "story chapters include objectives");
assert.match(js, /chapterGoal/, "chapter goal wiring exists");
assert.match(js, /scene: "hug"/, "hug scene exists");
assert.match(js, /scene: "kiss"/, "kiss scene exists");
assert.match(js, /function advanceScene\(/, "advance scene exists");
assert.match(sw, /CACHE_NAME/, "service worker cache exists");
assert.match(sw, /ai-gf-v10/, "service worker cache version is current");
assert.match(sw, /skipWaiting/, "service worker activates updates quickly");
assert.match(sw, /request\.mode === "navigate"/, "navigation is network-first");
assert.equal(JSON.parse(manifest).display, "standalone", "manifest is installable");
assert.equal(JSON.parse(manifest).icons.length > 0, true, "manifest has an icon");
assert.match(gdd, /MVP 验收标准/, "GDD includes acceptance criteria");
assert.match(gameSpec, /Core Loop/, "2D game spec includes core loop");
assert.match(gameSpec, /First 5 Minutes/, "2D game spec includes first-session arc");

console.log("Static checks passed.");
