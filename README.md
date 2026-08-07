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
│   ├── services/       # Functional logic (timezone language detection)
│   ├── components/     # UI component behavior (typewriter, gallery lightbox)
│   ├── ui/             # Page state controller (tabs and dropdowns)
│   └── app.js          # JavaScript entry point
├── index.html          # HTML5 layout
└── vite.config.js      # Vite bundler configurations
```

## Contributing

We welcome all contributions!

---

## License

This project is licensed under the terms of the license details found in this repository.
