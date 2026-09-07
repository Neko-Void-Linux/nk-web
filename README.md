# Neko Void Web

The official, brutalist, console-themed landing page and portal for **Neko Void**.

Built with a terminal aesthetic in mind, optimized for performance, and structured cleanly using modern web standards.

---

## Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/javiercplus/nk-web.git
   cd nk-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the Vite local development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Changes will hot-reload automatically.

### Production Build

To compile and optimize the site for production:

```bash
npm run build
```

The built assets will be generated in the `dist/` folder. You can test the production build locally with:

```bash
npm run preview
```

---

## Project Architecture

The project has been fully refactored from a monolithic codebase into a highly modular, clean design:

```
nk-web/
├── assets/             # Static graphics and branding assets
├── css/
│   ├── base/           # Core styles: variables, reset, and utilities
│   ├── layout/         # Structural styles: grid systems and navigation
│   ├── components/     # Reusable UI styles: cards, gallery, and terminal
│   └── styles.css      # CSS entry point importing all modules
├── js/
│   ├── services/       # Functional logic (release manifest, language detection)
│   ├── components/     # UI component behavior (typewriter, download gate, lightbox)
│   ├── ui/             # Page state controller (tabs and dropdowns)
│   └── app.js          # JavaScript entry point
├── html/               # index.html split into reusable partials
│   ├── head.html       # <head> metadata
│   ├── header.html     # Navbar
│   ├── sections/       # hero, details, gallery, downloads, team
│   └── dialog.html     # Optional support / download dialog
├── public/
│   └── data/
│       └── releases.json   # Single source of truth for edition downloads
├── scripts/
│   └── assemble-html.mjs   # Assembles index.html from partials + releases.json
├── index.html          # HTML template (assembled by the Vite plugin)
├── vite.config.js      # Vite bundler config (includes the HTML assembly plugin)
└── tests/              # node --test suite (validates the assembled page)
```

`index.html` is a small template: a Vite plugin (`vite.config.js`) calls
`scripts/assemble-html.mjs` on every dev/build to splice the `html/` partials
and render the download cards and hero button from
`public/data/releases.json` (see `download.md`).

## Contributing

We welcome all contributions!

---

## License

This project is licensed under the terms of the license details found in this repository.
