import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const service = readFileSync(
  resolve(root, "js/services/DownloadService.js"),
  "utf8",
);
const uiManager = readFileSync(resolve(root, "js/ui/UIManager.js"), "utf8");
const fallback = readFileSync(resolve(root, "public/dd/index.html"), "utf8");
const downloadGatePath = resolve(root, "js/components/DownloadGate.js");
const fallbackModulePath = resolve(root, "public/dd/download.js");
const typewriterPath = resolve(root, "js/components/Typewriter.js");

test("download service uses the single release manifest and edition hooks", () => {
  assert.match(service, /data\/releases\.json/);
  assert.match(service, /data-edition-id/);
  assert.match(service, /SHA256/);
});

test("navigation supports deep links and browser history", () => {
  assert.match(uiManager, /location\.hash/);
  assert.match(uiManager, /history\.pushState/);
  assert.match(uiManager, /popstate/);
  assert.match(uiManager, /section-link/);
});

test("download fallback exposes a manual action when redirect cannot start", () => {
  assert.match(fallback, /manual-download/);
  assert.match(fallback, /Descarga manual/i);
});

test("download fallback resolves legacy hashes from release-manifest data", async () => {
  assert.ok(existsSync(fallbackModulePath), "public/dd/download.js must exist");
  const { resolveEditionUrl } = await import(pathToFileURL(fallbackModulePath));
  const editions = [
    { id: "mate-xorg", url: "https://downloads.example/mate.iso" },
    { id: "kde", url: "https://downloads.example/kde.iso" },
  ];

  assert.equal(
    resolveEditionUrl(editions, "#xorg"),
    "https://downloads.example/mate.iso",
  );
  assert.equal(
    resolveEditionUrl(editions, "#kde"),
    "https://downloads.example/kde.iso",
  );
  assert.equal(resolveEditionUrl(editions, "#unknown"), null);
});

test("the reliability quote can be activated without a mouse", async () => {
  const { bindQuoteActivation } = await import(pathToFileURL(typewriterPath));
  const listeners = new Map();
  const target = {
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
  };
  let activations = 0;

  bindQuoteActivation(target, () => {
    activations += 1;
  });

  for (const eventName of ["mouseenter", "focus", "click", "touchstart"]) {
    assert.ok(listeners.has(eventName), `missing ${eventName} activation`);
  }
  listeners.get("focus")();
  assert.equal(activations, 1);
});

test("download gate keeps the selected ISO free while offering the project's support link", async () => {
  assert.ok(existsSync(downloadGatePath), "DownloadGate.js must exist");
  const { createDownloadGateController } = await import(
    pathToFileURL(downloadGatePath)
  );
  const dialog = {
    dataset: {},
    opened: false,
    showModal() {
      this.opened = true;
    },
  };
  const freeDownload = { href: "" };
  const supportLink = { href: "" };
  const controller = createDownloadGateController({
    dialog,
    freeDownload,
    supportLink,
  });

  controller.open("https://downloads.example/neko.iso");

  assert.equal(freeDownload.href, "https://downloads.example/neko.iso");
  assert.equal(supportLink.href, "https://linktr.ee/javiercplusx");
  assert.equal(dialog.opened, true);
});
