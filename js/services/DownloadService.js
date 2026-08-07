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

  for (const [id, data] of Object.entries(downloadsData)) {
    const button = document.getElementById(id);
    const hashSpan = document.getElementById(`hash-${id.replace("link-", "")}`);

    if (button) {
      button.classList.remove("btn-disabled");
      button.disabled = false;
      button.onclick = () => {
        window.open(data.url, "_blank", "noopener noreferrer");
      };
    }

    if (hashSpan) {
      hashSpan.textContent = `SHA256: ${data.sha256}`;
      hashSpan.onclick = () => {
        navigator.clipboard
          .writeText(data.sha256)
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
    }
  }

  for (const [id, data] of Object.entries(flavorsData)) {
    const button = document.getElementById(`flavor-${id}`);

    if (button) {
      if (data.available && data.url) {
        button.classList.remove("btn-disabled");
        button.classList.add("btn-primary");
        button.disabled = false;
        button.innerHTML = `
                    <span class="en">Download</span>
                    <span class="es">Descargar</span>
                    <span class="ja">ダウンロード</span>
                `;
        button.onclick = () => {
          window.open(data.url, "_blank", "noopener noreferrer");
        };

        let hashSpan = document.getElementById(`hash-${id}`);
        if (!hashSpan) {
          const actionsDiv = button.parentElement;
          hashSpan = document.createElement("span");
          hashSpan.id = `hash-${id}`;
          hashSpan.className = "hash-text-inline";
          hashSpan.title = "Click to copy";
          hashSpan.style.cursor = "pointer";
          actionsDiv.appendChild(hashSpan);
        }
        hashSpan.textContent = `SHA256: ${data.sha256}`;
        hashSpan.onclick = () => {
          navigator.clipboard
            .writeText(data.sha256)
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
      } else {
        button.classList.add("btn-disabled");
        button.disabled = true;
      }
    }
  }
}
