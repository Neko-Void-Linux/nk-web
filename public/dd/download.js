const RELEASES_URL = "../data/releases.json";

const HASH_TO_EDITION = Object.freeze({
  "#icejwm": "icewm-jwm",
  "#kde": "kde",
  "#labwc": "labwc",
  "#lxqt": "lxqt",
  "#niri": "niri",
  "#xfce": "xfce",
  "#xlibre": "mate-xlibre",
  "#xorg": "mate-xorg",
});

export function resolveEditionUrl(editions, hash) {
  const editionId = HASH_TO_EDITION[hash];
  if (!editionId || !Array.isArray(editions)) return null;

  return editions.find((edition) => edition.id === editionId)?.url || null;
}

export async function startDownload({
  fetchImpl = fetch,
  location = window.location,
  root = document,
} = {}) {
  const status = root.getElementById("status");
  const manual = root.getElementById("manual-download");

  try {
    const response = await fetchImpl(RELEASES_URL, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const manifest = await response.json();
    const url = resolveEditionUrl(manifest.editions, location.hash);
    if (!url) {
      status.textContent = "No se encontró esa edición";
      manual.href = "../#descargas";
      manual.textContent = "Volver a descargas";
      manual.removeAttribute("download");
      manual.hidden = false;
      return false;
    }

    status.textContent = "La descarga debería comenzar ahora";
    manual.href = url;
    manual.hidden = false;
    location.replace(url);
    return true;
  } catch (error) {
    console.error("No se pudo cargar el manifiesto de descargas:", error);
    status.textContent = "No se pudo preparar la descarga";
    manual.href = "../#descargas";
    manual.textContent = "Volver a descargas";
    manual.removeAttribute("download");
    manual.hidden = false;
    return false;
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  window.addEventListener("load", () => startDownload());
}
