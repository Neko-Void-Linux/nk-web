const RELEASES_URL = "./data/releases.json";

function getReleaseList(manifest) {
  if (!manifest || !Array.isArray(manifest.editions)) {
    throw new Error("Invalid release manifest");
  }

  return manifest.editions.filter((edition) => edition && edition.id);
}

export async function fetchReleasesData() {
  try {
    const response = await fetch(RELEASES_URL, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return getReleaseList(await response.json());
  } catch (error) {
    console.error("Error fetching release manifest:", error);
    return [];
  }
}

function bindHashCopy(hashSpan, sha256) {
  if (!hashSpan || !sha256) return;

  hashSpan.textContent = `SHA256: ${sha256}`;
  hashSpan.setAttribute("role", "button");
  hashSpan.setAttribute("tabindex", "0");
  hashSpan.title = "Click to copy";

  const copyHash = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(sha256)
      .then(() => {
        const originalText = hashSpan.textContent;
        hashSpan.textContent = "SHA256: Copied!";
        setTimeout(() => {
          hashSpan.textContent = originalText;
        }, 2000);
      })
      .catch((error) => console.error("Failed to copy SHA256:", error));
  };

  hashSpan.onclick = copyHash;
  hashSpan.onkeydown = (event) => {
    if (event.key === "Enter" || event.key === " ") copyHash();
  };
}

function setTextIfPresent(root, selector, value) {
  const element = root.querySelector(selector);
  if (element && value) element.textContent = value;
}

export function bindReleaseData(editions) {
  const byId = new Map(editions.map((edition) => [edition.id, edition]));

  document.querySelectorAll("[data-edition-id]").forEach((element) => {
    const edition = byId.get(element.dataset.editionId);
    if (!edition) return;

    if (element.matches("a") && edition.url) {
      element.href = edition.url;
    }

    const card = element.matches(".edition-item")
      ? element
      : element.closest(".edition-item");
    if (!card) return;

    const link = card.querySelector("a.btn-edition");
    if (link && edition.url) {
      link.href = edition.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    if (!edition.url) {
      if (link) {
        link.removeAttribute("href");
        link.classList.remove("btn-primary");
        link.classList.add("btn-disabled");
        link.setAttribute("aria-disabled", "true");
      }
      return;
    }

    let hashSpan = card.querySelector(".hash-text-inline");
    if (!hashSpan) {
      hashSpan = document.createElement("span");
      hashSpan.className = "hash-text-inline";
      card.querySelector(".edition-actions")?.appendChild(hashSpan);
    }
    bindHashCopy(hashSpan, edition.sha256);
    setTextIfPresent(card, "[data-release-version]", edition.version);
  });

  const recommended = editions.find(
    (edition) => edition.recommended && edition.url,
  );
  if (recommended) {
    document
      .querySelectorAll('[data-edition-id="' + recommended.id + '"]')
      .forEach((element) => {
        if (element.matches("a")) element.href = recommended.url;
      });
  }

  return editions;
}

export async function loadDownloadLinks() {
  const editions = await fetchReleasesData();
  if (editions.length) bindReleaseData(editions);
  return editions;
}
