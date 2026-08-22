# Neko-Void Portal Demo Design

## Goal

Turn the current console-themed landing page into a clearer product and download portal while preserving the visual identity, multilingual content, progressive no-JavaScript fallback, and static Vite deployment.

## Audience and promise

The primary audience is a user who wants Void Linux's rolling, systemd-free base without assembling a desktop setup from scratch. Secondary audiences are gamers, users who need graphics-driver guidance, and advanced users choosing a desktop or display-server flavor.

The central promise is: "Void Linux, listo para usar, con instalación guiada y escritorios preconfigurados." Systemd-free remains a supporting differentiator, not the only headline.

## Experience

The home section will contain a clear proposition, one recommended-download CTA, an edition chooser CTA, a trust strip, and a short five-step installation flow. The downloads section will expose edition purpose and release metadata while retaining direct download and SHA256 actions. A status panel will communicate the current online installer requirement and known-issue guidance without claiming unsupported guarantees.

## Technical constraints

- Keep the current static HTML/CSS/ES-module Vite architecture.
- Keep the no-JavaScript page usable and retain direct static download hrefs.
- Use one release manifest for the page cards, download metadata, and fallback routes.
- Keep external ISO hosting unchanged.
- Do not push, publish, or modify external services.
- Add metadata and navigation behavior without changing the hosting provider.

## Acceptance criteria

- A new visitor can understand what Neko-Void is and reach a recommended download from the home section.
- Edition cards explain purpose, status, build, architecture, and verification affordances.
- Navigation updates the URL hash, restores the active section on reload, and responds to browser back/forward.
- The document language follows the selected language.
- The download fallback gives a useful manual link when automatic redirection is unavailable.
- The page has a non-empty footer, description, canonical URL, social metadata, and clear support/documentation links.
- Existing sections, translations, mobile layout, and no-JavaScript fallback remain functional.
