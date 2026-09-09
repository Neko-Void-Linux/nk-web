# Managing Download Links and SHA256 Checksums

This guide explains how to add, update, or disable edition download links and
their SHA256 checksums for the Neko Void landing page.

## Background

Edition download data lives in **one source of truth**:

```
public/data/releases.json
```

The page (`index.html`) is a thin **template** assembled from partials in
`html/`. During `npm run dev` and `npm run build`, the Vite plugin in
`vite.config.js` calls `scripts/assemble-html.mjs`, which:

1. Splices the HTML partials (`html/head.html`, `html/sections/*.html`, ...)
   into `index.html`.
2. Renders every edition card's download button and `SHA256:` checksum from
   `releases.json`, replacing the `{%EDITION_ACTIONS:<id>%}` placeholders.
3. Fills the hero "recommended edition" button from the manifest.

So the **state of an edition derives from its `url`**:

- If the edition has a `url`, the card renders an enabled **Download** button
  plus its `SHA256:` checksum.
- If `url` is `null`, the card renders its disabled / development state (no
  download link), e.g. `nvidia` → "Beta support", `openbox` → "Coming Soon".

There is **no second place** to keep URLs or checksums in sync: editing
`releases.json` is enough. `js/services/DownloadService.js` still reconciles
the cards at runtime as a safety net (e.g. copy-to-clipboard on the checksum).

## Editions table

| id            | Card element | Status field | Downloadable when |
|---------------|--------------|--------------|--------------------|
| `mate-xorg`   | `[data-edition-id="mate-xorg"]`   | `stable`   | yes |
| `mate-xlibre` | `[data-edition-id="mate-xlibre"]` | `stable`   | yes |
| `nvidia`      | `[data-edition-id="nvidia"]`      | `beta`     | no  |
| `xfce`        | `[data-edition-id="xfce"]`        | `stable`   | yes |
| `kde`         | `[data-edition-id="kde"]`         | `stable`   | yes |
| `i3`          | `[data-edition-id="i3"]`          | `development` | no |
| `openbox`     | `[data-edition-id="openbox"]`     | `development` | no |
| `lxqt`        | `[data-edition-id="lxqt"]`        | `stable`   | yes |
| `labwc`       | `[data-edition-id="labwc"]`       | `stable`   | yes |
| `niri`        | `[data-edition-id="niri"]`        | `stable`   | yes |
| `icewm-jwm`   | `[data-edition-id="icewm-jwm"]`   | `stable`   | yes |

## Where to edit

### `public/data/releases.json` (required — source of truth)

Each edition is an object in the `editions` array:

```json
{
  "id": "icewm-jwm",
  "name": "IceWM & JWM",
  "kind": "flavor",
  "status": "stable",
  "recommended": false,
  "description": "Una edición de bajo consumo para hardware antiguo o limitado.",
  "version": "2026.08.18",
  "architecture": "x86_64",
  "installer": "Kasha",
  "sha256": "3c1fda45e5eb968e76852254d07fae050f9861daa6f728339e4c60f1b69a1287",
  "url": "https://huggingface.co/arepaconcafe/neko-base/resolve/main/nekovoid-lts-icejwm-20260822.iso"
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

1. Upload the ISO to Hugging Face or archive.org (e.g.
   `nekovoid-lts-icejwm-20260822.iso`).
2. Set `url` to the `resolve/main/...` URL of the uploaded file.
3. Set `sha256` to the actual checksum of the ISO (see
   [Getting the checksum](#getting-the-checksum)).
4. Keep `status: "stable"` (or `beta` for beta editions).

That's it — the button, checksum and hero recommendation update automatically
on the next build. If the edition already has a card in
`html/sections/downloads.html` you do not touch the HTML at all.

#### Taking an edition offline / marking it in development

1. Set `url: null`.
2. Set `sha256: null`.
3. Optionally set `status: "development"`.

The card will automatically render its disabled state with no download button.

### Adding or removing an edition (optional extra steps)

The **download data** only lives in `releases.json`. To add or remove a whole
edition card you also need to touch its presentation:

1. Add/remove the edition object in `releases.json`.
2. Add/remove the card shell (title, description copy) in
   `html/sections/downloads.html` containing the placeholder
   `{%EDITION_ACTIONS:<id>%}` in its `.edition-actions` div. If the card is
   missing, `assembleIndexHtml()` throws so tests fail loudly.
3. Add/remove the legacy hash anchor in `public/dd/download.js`
   (`HASH_TO_EDITION`) so deep links like
   `https://nekovoid.vercel.app/dd/#xfce` keep working.

## Getting the checksum

From a downloaded ISO:

```bash
sha256sum nekovoid-lts-icejwm-20260822.iso
```

or directly from the Hugging Face blob URL (no download needed) using the
project's helper:

```bash
curl -sSL http://nekovoid.vercel.app/sha256/shafind.py | python - \
  https://huggingface.co/arepaconcafe/neko-base/blob/main/nekovoid-lts-icejwm-20260822.iso
```

## Verifying the work

Run the test suite. Tests read the assembled page (the same
`scripts/assemble-html.mjs` used by Vite) and assert that:

- Download URLs and checksums are generated from `releases.json` and **not
  duplicated** in any HTML partial.
- Every edition card state derives from `url` (present → enabled, `null` →
  disabled).
- The hero recommended download matches the manifest.

```bash
npm test
```

Relevant checks in `tests/site-content.test.mjs`:

- `the release manifest exists and has exactly one recommended edition`
- `every available edition has verifiable release metadata`
- `download URLs and checksums are generated from the manifest only`
- `download data is not duplicated in the HTML partials`
- `edition cards derive their state from the manifest url`

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
