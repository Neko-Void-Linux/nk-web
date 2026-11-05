import { defineConfig } from "vite";
import {
  assembleIndexHtml,
  PARTIALS_DIR,
  MANIFEST_PATH,
} from "./scripts/assemble-html.mjs";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    {
      name: "nk-web:assemble-html",
      transformIndexHtml: {
        order: "pre",
        handler() {
          return assembleIndexHtml();
        },
      },
      configureServer(server) {
        const reloadOnChange = (file) => {
          const withinPartials =
            file.startsWith(PARTIALS_DIR) || file === MANIFEST_PATH;
          if (withinPartials) server.ws.send({ type: "full-reload" });
        };
        server.watcher.on("change", reloadOnChange);
        server.watcher.on("add", reloadOnChange);
        server.watcher.on("unlink", reloadOnChange);
      },
    },
  ],
});
