import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE_PATH = resolve(ROOT, "index.html");
export const PARTIALS_DIR = resolve(ROOT, "html");
export const MANIFEST_PATH = resolve(ROOT, "public/data/releases.json");

const INCLUDE_RE = /<!--\s*#include\s+([\w./-]+)\s*-->/g;
const EDITION_ACTION_RE = /{%EDITION_ACTIONS:([\w-]+)%}/g;

const DOWNLOAD_LABELS = Object.freeze({
  en: "Download",
  es: "Descargar",
  ja: "ダウンロード",
});

const DISABLED_LABELS = Object.freeze({
  beta: { en: "Beta support", es: "Soporte en beta", ja: "ベータサポート" },
  development: { en: "Coming Soon", es: "En desarrollo", ja: "開発中" },
  default: { en: "Coming Soon", es: "En desarrollo", ja: "開発中" },
});

function readReleaseManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
}

function getEditions(manifest) {
  if (!manifest || !Array.isArray(manifest.editions)) {
    throw new Error(`Invalid release manifest at ${MANIFEST_PATH}`);
  }
  return manifest.editions;
}

function expandIncludes(html) {
  let current = html;
  for (let depth = 0; depth < 20; depth += 1) {
    const hasInclude = INCLUDE_RE.test(current);
    INCLUDE_RE.lastIndex = 0;
    if (!hasInclude) break;

    current = current.replace(INCLUDE_RE, (_match, filePath) => {
      const fullPath = resolve(ROOT, filePath);
      if (!existsSync(fullPath)) {
        throw new Error(`HTML partial not found: ${filePath} (${fullPath})`);
      }
      return readFileSync(fullPath, "utf8");
    });
  }

  INCLUDE_RE.lastIndex = 0;
  const leftover = current.match(INCLUDE_RE);
  if (leftover) {
    throw new Error(`Unresolved HTML includes: ${leftover.join(", ")}`);
  }
  return current;
}

function renderEditionActions(edition) {
  if (!edition.url) {
    const labels = DISABLED_LABELS[edition.status] || DISABLED_LABELS.default;
    return [
      '<span class="btn-edition btn-disabled">',
      `  <span class="en">${labels.en}</span>`,
      `  <span class="es">${labels.es}</span>`,
      `  <span class="ja">${labels.ja}</span>`,
      "</span>",
    ].join("\n");
  }

  return [
    "<a",
    '  class="btn-edition btn-primary"',
    `  href="${edition.url}"`,
    '  target="_blank"',
    '  rel="noopener noreferrer"',
    ">",
    `  <span class="en">${DOWNLOAD_LABELS.en}</span>`,
    `  <span class="es">${DOWNLOAD_LABELS.es}</span>`,
    `  <span class="ja">${DOWNLOAD_LABELS.ja}</span>`,
    "</a>",
    `<span class="hash-text-inline" title="Click to copy" style="cursor: pointer">SHA256: ${edition.sha256}</span>`,
  ].join("\n");
}

function injectEditionActions(html, editions) {
  const byId = new Map(editions.map((edition) => [edition.id, edition]));
  let output = html;

  for (const [id, edition] of byId) {
    const token = `{%EDITION_ACTIONS:${id}%}`;
    if (!output.includes(token)) {
      throw new Error(
        `No edition card placeholder (${token}) found for edition "${id}"`,
      );
    }
    output = output.split(token).join(renderEditionActions(edition));
  }

  EDITION_ACTION_RE.lastIndex = 0;
  const leftover = output.match(EDITION_ACTION_RE);
  if (leftover) {
    throw new Error(
      `Edition cards exist without manifest entries: ${leftover
        .map((token) => token.replace(/%}/, "}"))
        .join(", ")}`,
    );
  }
  return output;
}

function injectHeroDownload(html, editions) {
  const recommended = editions.find((edition) => edition.recommended);
  if (!recommended) {
    throw new Error("Release manifest must declare exactly one recommended edition");
  }

  const url = recommended.url || "#";
  return html
    .split("{%HERO_DOWNLOAD_URL%}")
    .join(url)
    .split("{%HERO_EDITION_ID%}")
    .join(recommended.id);
}

function validateTokens(html) {
  const leftovers = html.match(/\{%[\w:.-]+%\}/g) || [];
  if (leftovers.length) {
    throw new Error(`Unresolved template tokens: ${leftovers.join(", ")}`);
  }
  return html;
}

export function assembleIndexHtml() {
  const manifest = readReleaseManifest();
  const editions = getEditions(manifest);
  const template = readFileSync(TEMPLATE_PATH, "utf8");

  return validateTokens(
    injectHeroDownload(injectEditionActions(expandIncludes(template), editions), editions),
  );
}

export function listPartialFiles(dir = PARTIALS_DIR, out = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const info = statSync(fullPath);
    if (info.isDirectory()) {
      listPartialFiles(fullPath, out);
    } else if (entry.endsWith(".html")) {
      out.push(fullPath);
    }
  }
  return out;
}

export function getEditionsFromManifest() {
  return getEditions(readReleaseManifest());
}
