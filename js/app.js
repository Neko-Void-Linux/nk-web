import { UIManager } from "./ui/UIManager.js";
import { loadDownloadLinks } from "./services/DownloadService.js";

document.addEventListener("DOMContentLoaded", () => {
  UIManager.init();
  loadDownloadLinks();
});
