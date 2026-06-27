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
  "docs/GDD.md"
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
assert.match(html, /id="chatForm"/, "chat form exists");
assert.match(html, /data-action="night"/, "night action exists");
assert.match(html, /rel="manifest"/, "manifest is linked");
assert.match(css, /\.character/, "character visual exists");
assert.match(css, /@media \(max-width: 560px\)/, "mobile layout exists");
assert.match(js, /localStorage/, "save system uses localStorage");
assert.match(js, /serviceWorker/, "service worker registration exists");
assert.match(js, /const actionData = {/, "action data exists");
assert.match(js, /const chatRules = \[/, "chat rules exist");
assert.match(sw, /CACHE_NAME/, "service worker cache exists");
assert.equal(JSON.parse(manifest).display, "standalone", "manifest is installable");
assert.equal(JSON.parse(manifest).icons.length > 0, true, "manifest has an icon");
assert.match(gdd, /MVP 验收标准/, "GDD includes acceptance criteria");

console.log("Static checks passed.");
