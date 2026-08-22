import { UIManager } from "./ui/UIManager.js";
import { loadDownloadLinks } from "./services/DownloadService.js";
import { initDownloadGate } from "./components/DownloadGate.js";

document.addEventListener("DOMContentLoaded", () => {
  UIManager.init();
  initDownloadGate();
  loadDownloadLinks();
});
