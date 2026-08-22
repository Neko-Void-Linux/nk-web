import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const index = readFileSync(resolve(root, "index.html"), "utf8");
const compactIndex = index.replace(/\s+/g, " ");
const manifestPath = resolve(root, "public/data/releases.json");
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : null;

function getEditionBlock(id) {
  const marker = `<div class="edition-item" data-edition-id="${id}"`;
  const start = index.indexOf(marker);
  assert.notEqual(start, -1, `missing edition card for ${id}`);
  const next = index.indexOf(
    '<div class="edition-item"',
    start + marker.length,
  );
  return index
    .slice(start, next === -1 ? index.length : next)
    .replace(/\s+/g, " ");
}

test("the release manifest exists and has exactly one recommended edition", () => {
  assert.ok(manifest, "public/data/releases.json must exist");
  assert.ok(Array.isArray(manifest.editions));
  assert.equal(
    manifest.editions.filter((edition) => edition.recommended).length,
    1,
  );
});

test("every available edition has verifiable release metadata", () => {
  assert.ok(manifest, "release manifest is required");
  for (const edition of manifest.editions) {
    assert.ok(edition.id && edition.name && edition.description);
    assert.match(edition.status, /^(stable|beta|development)$/);
    assert.match(edition.version, /^\d{4}\.\d{2}\.\d{2}$/);
    assert.match(edition.architecture, /^x86_64$/);
    if (edition.url) {
      assert.match(edition.url, /^https:\/\//);
      assert.match(edition.sha256, /^[a-f0-9]{64}$/);
    } else {
      assert.equal(edition.sha256, null);
    }
  }
});

test("static edition cards keep direct download URLs and checksums in sync", () => {
  assert.ok(manifest, "release manifest is required");
  for (const edition of manifest.editions.filter((item) => item.url)) {
    const card = getEditionBlock(edition.id);
    assert.ok(
      card.includes(`href="${edition.url}"`),
      `${edition.id} has a stale static URL`,
    );
    assert.ok(
      card.includes(`SHA256: ${edition.sha256}`),
      `${edition.id} has no static checksum`,
    );
  }
});

test("the hero preserves the project identity and exposes the recommended path", () => {
  assert.match(index, /NEKO VOID/i);
  assert.match(index, /id="typewriter-text"/i);
  assert.match(index, /id="quote-typewriter"/i);
  assert.match(index, /Descargar edición recomendada/i);
  assert.match(index, /Elegir otra edición/i);
});

test("the hero highlights Neko Void features instead of base Void traits", () => {
  assert.match(index, /NEKO WIZARD/i);
  assert.match(index, /KORE/i);
  assert.match(index, /READY TO USE/i);
});

test("the animated reliability quote keeps its quotation marks", () => {
  const typewriter = readFileSync(
    resolve(root, "js/components/Typewriter.js"),
    "utf8",
  );
  assert.match(
    typewriter,
    /\"La simplicidad es un requisito previo para la fiabilidad\"/i,
  );
});

test("the page exposes an installation path and project status", () => {
  assert.match(index, /quick-start/i);
  assert.match(index, /Estado del instalador/i);
  assert.match(index, /Guía de instalación/i);
});

test("downloads keep the concise Ventoy installation path", () => {
  assert.match(
    compactIndex,
    /Elige tu edición\. Las opciones en gris siguen en desarrollo\./i,
  );
  assert.match(
    index,
    /Crea un USB con[\s\S]*href="https:\/\/www\.ventoy\.net\/en\/index\.html"[\s\S]*Ventoy/i,
  );
  assert.match(index, /Kasha se distribuye actualmente en modo online/i);
});

test("downloads expose the NVIDIA category as beta", () => {
  const nvidia = manifest.editions.find((edition) => edition.id === "nvidia");
  assert.equal(nvidia.status, "beta");
  assert.match(getEditionBlock("nvidia"), /NVIDIA[\s\S]*Soporte en beta/i);
});

test("specifications mention NVIDIA support and omit Tinyfetch", () => {
  assert.match(index, /soporte en beta para tarjetas[\s\S]*NVIDIA/i);
  assert.doesNotMatch(index, /Tinyfetch/i);
});

test("specifications expose Vouru and CNR as Neko Void tools", () => {
  assert.match(
    compactIndex,
    /href="https:\/\/github\.com\/javiercplus\/vouru"[\s\S]*>\s*Vouru\s*</i,
  );
  assert.match(
    compactIndex,
    /href="https:\/\/github\.com\/Neko-Void-Linux\/cnr"[\s\S]*>\s*CNR\s*</i,
  );
  assert.match(
    compactIndex,
    /Vouru ayuda a buscar, instalar y actualizar programas en Void Linux[\s\S]*plantillas mantenidas por el creador y el equipo de Neko Void/i,
  );
  for (const [url, label] of [
    ["https://github.com/ezequielgk/Kore-Package-Manager", "Kore"],
    [
      "https://github.com/Neko-Void-Linux/Neko-Kernel-Manager",
      "Neko Kernel Manager",
    ],
    ["https://github.com/Neko-Void-Linux/Neko-Wizard", "Neko Wizard"],
    ["https://github.com/javiercplus/iruka-xbps", "Iruka XBPS"],
  ]) {
    assert.match(
      compactIndex,
      new RegExp(`href="${url}"[\\s\\S]*>\\s*${label}\\s*<`, "i"),
    );
  }
  assert.match(
    compactIndex,
    /Asistente de post-instalación y gestor de repositorios/i,
  );
});

test("team credits preserve the requested project roles and buttons", () => {
  assert.match(compactIndex, /Mantenedor y Supervisor de la versión Musl/i);
  assert.match(
    compactIndex,
    /Mantenedor y supervisor de la versión musl de Neko Void/i,
  );
  assert.match(compactIndex, /Creador de Vouru/i);
  assert.match(
    compactIndex,
    /rockman6554[\s\S]*href="https:\/\/github\.com\/javiercplus\/vouru"[\s\S]*class="btn-link"/i,
  );
});

test("the page exposes SEO metadata and a useful footer", () => {
  assert.match(index, /meta\s+name="description"/i);
  assert.match(index, /rel="canonical"/i);
  assert.match(index, /property="og:title"/i);
  assert.match(index, /site-footer[\s\S]*Licencia/i);
});

test("the legacy donation section moves into the optional download dialog", () => {
  assert.doesNotMatch(index, /href="#donaciones"/i);
  assert.doesNotMatch(index, /id="donaciones"/i);
  assert.match(index, /id="download-support-dialog"/i);
  assert.match(index, /href="https:\/\/linktr\.ee\/javiercplusx"/i);
  assert.match(index, /<span class="es">Donar<\/span\s*>/i);
  assert.match(
    compactIndex,
    /apoyar su desarrollo, considera hacer una donación/i,
  );
  assert.doesNotMatch(
    index,
    /mantener los servidores|keep the servers running/i,
  );
  assert.doesNotMatch(index, /invitar[n]?nos un café|buying us a coffee/i);
  assert.doesNotMatch(index, /Invítame un Café/i);
  assert.doesNotMatch(index, /itch\.io/i);
  assert.match(index, /No, gracias[\s\S]*Descargar gratis/i);
});

test("the footer exposes the restored project buttons", () => {
  for (const label of [
    "SourceForge",
    "Codeberg",
    "DistroWatch",
    "Kasha Installer",
    "GitHub",
    "Wiki",
  ]) {
    assert.match(index, new RegExp(`>${label}<`, "i"));
  }
  assert.match(index, /distrowatch\.com\/table\.php\?distribution=nekovoid/i);
  assert.match(index, /sourceforge\.net\/projects\/neko-void\/files\/repo/i);
});

test("SourceForge recognitions load all dark badges with one script", () => {
  assert.equal((index.match(/class="sf-root"/g) || []).length, 5);
  assert.equal(
    (index.match(/b\.sf-syn\.com\/badge_js\?sf_id=3954096/g) || []).length,
    1,
  );
  assert.match(index, /oss-open-source-excellence-black/i);
  assert.match(index, /oss-users-love-us-black/i);
});

test("edition cards are addressable by manifest id", () => {
  assert.ok(manifest, "release manifest is required");
  for (const edition of manifest.editions) {
    assert.match(index, new RegExp(`data-edition-id="${edition.id}"`));
  }
});
