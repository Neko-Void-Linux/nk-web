const DEFAULT_SUPPORT_URL = "https://linktr.ee/javiercplusx";

export function createDownloadGateController({
  dialog,
  freeDownload,
  supportLink,
}) {
  return {
    open(downloadUrl) {
      if (!downloadUrl) return false;

      freeDownload.href = downloadUrl;
      supportLink.href = dialog.dataset.supportUrl || DEFAULT_SUPPORT_URL;

      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }

      return true;
    },
    close() {
      if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    },
  };
}

function getDownloadAnchor(target) {
  const anchor = target.closest?.(
    "a[data-edition-id], .edition-item a.btn-edition",
  );

  if (
    !anchor ||
    anchor.classList.contains("btn-disabled") ||
    anchor.getAttribute("aria-disabled") === "true"
  ) {
    return null;
  }

  const href = anchor.href || anchor.getAttribute("href");
  return href && !href.startsWith("#") ? anchor : null;
}

export function initDownloadGate(root = document) {
  const dialog = root.querySelector("#download-support-dialog");
  const freeDownload = root.querySelector("[data-free-download]");
  const supportLink = root.querySelector("[data-support-action]");
  const closeButton = root.querySelector("[data-download-gate-close]");

  if (!dialog || !freeDownload || !supportLink || !closeButton) return null;

  const controller = createDownloadGateController({
    dialog,
    freeDownload,
    supportLink,
  });

  root.addEventListener("click", (event) => {
    const anchor = getDownloadAnchor(event.target);
    if (!anchor) return;

    event.preventDefault();
    controller.open(anchor.href);
  });

  closeButton.addEventListener("click", () => controller.close());
  freeDownload.addEventListener("click", () => controller.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) controller.close();
  });

  return controller;
}
