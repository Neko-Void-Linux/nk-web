# Managing Download Links and SHA256 Checksums

This guide explains how to add, update, or disable edition download links and
their SHA256 checksums for the Neko Void landing page.

## Background

Edition download data lives in **one source of truth**:

```
public/data/releases.json
```

When the page loads, `js/services/DownloadService.js` fetches this manifest and
binds every edition card in `index.html` to its corresponding edition by the
`data-edition-id` attribute. It overwrites the card's download `href` and
renders the `SHA256:` checksum at runtime. If an edition has **no** `url`, the
service disables the card (shows the "development" / disabled state).

> `index.html` also contains static fallback URLs and checksums. These keep the
> page functional even before JavaScript runs, and are validated by the test
> suite (see below). Always keep them in sync with `releases.json`.

## Editions table

| id            | Card element | Status field | Downloadable when |
|---------------|--------------|--------------|--------------------|
| `mate-xorg`   | `[data-edition-id="mate-xorg"]`   | `stable`   | yes |
| `mate-xlibre` | `[data-edition-id="mate-xlibre"]` | `stable`   | yes |
| `nvidia`      | `[data-edition-id="nvidia"]`      | `beta`     | no  |
| `xfce`        | `[data-edition-id="xfce"]`        | `stable`   | yes |
| `kde`         | `[data-edition-id="kde"]`         | `stable`   | yes |
| `i3`          | `[data-edition-id="i3"]`          | `stable`   | yes |
| `openbox`     | `[data-edition-id="openbox"]`     | `development` | no |
| `lxqt`        | `[data-edition-id="lxqt"]`        | `stable`   | yes |
| `labwc`       | `[data-edition-id="labwc"]`       | `stable`   | yes |
| `niri`        | `[data-edition-id="niri"]`        | `stable`   | yes |
| `icewm-jwm`   | `[data-edition-id="icewm-jwm"]`   | `stable`   | yes |

## Where to edit

### 1. `public/data/releases.json` (required — source of truth)

Each edition is an object in the `editions` array:

```json
{
  "id": "i3",
  "name": "I3",
  "kind": "flavor",
  "status": "stable",
  "recommended": false,
  "description": "A tiling window manager edition.",
  "version": "2026.08.30",
  "architecture": "x86_64",
  "installer": "Kasha",
  "sha256": "04f19f44da243d2ac17a6d9f857ae90e92f9fe94c680f8132aa9178d53215ec2",
  "url": "https://huggingface.co/arepaconcafe/neko-base/resolve/main/nekovoid-i3-20260830.iso"
}
```

Rules enforced by the test suite:

- `status` must be one of `stable`, `beta`, or `development`.
- `version` must match `YYYY.MM.DD`.
- `architecture` must be `x86_64`.
- If `url` is **present**, it must start with `https://` and `sha256` must be a
  64-character lowercase hex string.
- If `url` is **absent** (`null`), then `sha256` **must also be `null`** and the
  card will render in its disabled / development state.

#### Publishing a new ISO (making an edition downloadable)

When you release a new ISO:

1. Upload the ISO to Hugging Face (e.g. `nekovoid-i3-20260830.iso`).
2. Set `url` to the `resolve/main/...` URL of the uploaded file.
3. Set `sha256` to the actual checksum of the ISO (see
   [Getting the checksum](#getting-the-checksum)).
4. Keep `status: "stable"` (or `beta` for beta editions).

#### Taking an edition offline / marking it in development

1. Set `url: null`.
2. Set `sha256: null`.
3. Optionally set `status: "development"`.

The card will automatically show the disabled state and no download button.

### 2. `index.html` (keep the static fallback in sync)

For every edition that has a `url`, mirror the URL and checksum in its card so
the page works without JavaScript:

```html
<div class="edition-item" data-edition-id="i3">
  <div class="edition-info">
    <h3>i3</h3>
    <span class="edition-badge-flavor">Flavor</span>
    <p class="edition-description">
      <span class="en">A tiling window manager edition.</span>
    </p>
  </div>
  <div class="edition-actions">
    <!-- Mantener sincronizado con public/data/releases.json -->
    <a
      class="btn-edition btn-primary"
      href="https://huggingface.co/arepaconcafe/neko-base/resolve/main/nekovoid-i3-20260830.iso"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="en">Download</span>
    </a>
    <span class="hash-text-inline" title="Click to copy" style="cursor: pointer"
      >SHA256:
      04f19f44da243d2ac17a6d9f857ae90e92f9fe94c680f8132aa9178d53215ec2</span
    >
  </div>
</div>
```

For editions without a `url`, keep the disabled markup:

```html
<div class="edition-actions">
  <span class="btn-edition btn-disabled">
    <span class="en">Coming Soon</span>
  </span>
</div>
```

> The comment `<!-- Mantener sincronizado con public/data/releases.json -->`
> marks these static fallbacks. Keep `href` and `SHA256:` here identical to
> `releases.json`.

### 3. `public/dd/download.js` (only when adding/removing editions)

This file maps legacy URL hash anchors (`#i3`, `#kde`, ...) to edition ids for
the `/dd/` redirect page:

```js
const HASH_TO_EDITION = Object.freeze({
  "#icejwm": "icewm-jwm",
  "#i3": "i3",
  "#kde": "kde",
  // ...
});
```

Add or remove an entry here whenever you add or remove an edition so deep links
like `https://nekovoid.vercel.app/dd/#i3` keep working.

## Getting the checksum

From a downloaded ISO:

```bash
sha256sum nekovoid-i3-20260830.iso
```

or directly from the Hugging Face blob URL (no download needed) using the
project's helper:

```bash
curl -sSL http://nekovoid.vercel.app/sha256/shafind.py | python - \
  https://huggingface.co/arepaconcafe/neko-base/blob/main/nekovoid-i3-20260830.iso
```

## Verifying the work

Run the test suite — it asserts that every editions card URL and SHA256 is kept
in sync with `releases.json`:

```bash
npm test
```

Relevant checks in `tests/site-content.test.mjs`:

- `the release manifest exists and has exactly one recommended edition`
- `every available edition has verifiable release metadata`
- `static edition cards keep direct download URLs and checksums in sync`

If a checksum or URL is stale, the test fails with the offending edition id.

## Testing locally

```bash
npm run dev
```

Open http://localhost:5173 and scroll to the Downloads section. Confirm that:

- Downloadable editions show a **Download** button and a `SHA256:` value.
- Disabled editions (e.g. `openbox`, `nvidia`) show the disabled / development
  state and no download button.
- The `SHA256:` value can be clicked to copy the checksum.
