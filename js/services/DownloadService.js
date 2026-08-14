const DOWNLOADS_XML_URL = "https://nekovoid.vercel.app/dd/downloads.xml";
const FLAVORS_XML_URL = "https://nekovoid.vercel.app/dd/flavors.xml";

export async function fetchDownloadsData() {
  try {
    const response = await fetch(DOWNLOADS_XML_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const releases = xmlDoc.querySelectorAll("release iso");
    const data = {};

    releases.forEach((iso) => {
      const id = iso.getAttribute("id");
      const sha256 = iso.getAttribute("sha256");
      const url = iso.textContent.trim();

      if (id && url) {
        data[id] = {
          url: url,
          sha256: sha256 || "N/A",
        };
      }
    });

    return data;
  } catch (error) {
    console.error("Error fetching downloads data:", error);
    return {};
  }
}

export async function fetchFlavorsData() {
  try {
    const response = await fetch(FLAVORS_XML_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const flavors = xmlDoc.querySelectorAll("flavors flavor");
    const data = {};

    flavors.forEach((flavor) => {
      const id = flavor.getAttribute("id");
      const sha256 = flavor.getAttribute("sha256");
      const url = flavor.textContent.trim();

      if (id) {
        if (url && url !== ".." && !url.startsWith(".")) {
          data[id] = {
            url: url,
            sha256: sha256 || "N/A",
            available: true,
          };
        } else {
          data[id] = {
            url: null,
            sha256: sha256 || "..",
            available: false,
          };
        }
      }
    });

    return data;
  } catch (error) {
    console.error("Error fetching flavors data:", error);
    return {};
  }
}

export async function loadDownloadLinks() {
  const downloadsData = await fetchDownloadsData();
  const flavorsData = await fetchFlavorsData();

  const bindHashCopy = (hashSpan, sha256) => {
    hashSpan.textContent = `SHA256: ${sha256}`;
    hashSpan.onclick = () => {
      navigator.clipboard
        .writeText(sha256)
        .then(() => {
          const originalText = hashSpan.textContent;
          hashSpan.textContent = "SHA256: Copied!";
          setTimeout(() => {
            hashSpan.textContent = originalText;
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy SHA256:", err);
        });
    };
  };

  for (const [id, data] of Object.entries(downloadsData)) {
    // El enlace es el mismo en todos los modos: con JS se actualiza su
    // href desde el XML; sin JS usa el href estático del HTML.
    const link = document.getElementById(id);
    if (link && data.url) link.href = data.url;

    const hashSpan = document.getElementById(`hash-${id.replace("link-", "")}`);
    if (hashSpan) bindHashCopy(hashSpan, data.sha256 || "N/A");
  }

  for (const [id, data] of Object.entries(flavorsData)) {
    const link = document.getElementById(`flavor-${id}`);
    if (link && data.url) link.href = data.url;

    if (data.available && data.url) {
      let hashSpan = document.getElementById(`hash-${id}`);
      if (!hashSpan) {
        if (!link) continue;
        hashSpan = document.createElement("span");
        hashSpan.id = `hash-${id}`;
        hashSpan.className = "hash-text-inline";
        hashSpan.title = "Click to copy";
        hashSpan.style.cursor = "pointer";
        link.parentElement.appendChild(hashSpan);
      }
      bindHashCopy(hashSpan, data.sha256 || "N/A");
    }
  }
}
