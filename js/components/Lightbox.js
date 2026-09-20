const LIGHTBOX_LABELS = Object.freeze({
  en: {
    close: "Close image",
    previous: "Previous image",
    next: "Next image",
  },
  es: {
    close: "Cerrar imagen",
    previous: "Imagen anterior",
    next: "Imagen siguiente",
  },
  ja: { close: "画像を閉じる", previous: "前の画像", next: "次の画像" },
});

export function initLightbox() {
  const triggers = [...document.querySelectorAll(".gallery-trigger")];
  if (!triggers.length) return;

  // With no JavaScript, the links still open each full-resolution image.
  const lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.setAttribute("aria-labelledby", "lightbox-caption");
  lightbox.innerHTML = `
    <div class="lightbox-dialog">
      <button class="lightbox-close" type="button">&times;</button>
      <button class="lightbox-nav lightbox-prev" type="button">&#8249;</button>
      <figure class="lightbox-figure">
        <img class="lightbox-content" id="lightbox-img" alt="" />
        <figcaption class="lightbox-caption" id="lightbox-caption" aria-live="polite"></figcaption>
      </figure>
      <button class="lightbox-nav lightbox-next" type="button">&#8250;</button>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector("#lightbox-img");
  const caption = lightbox.querySelector("#lightbox-caption");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const previousBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");
  let currentIndex = 0;
  let returnFocus = null;

  const getLanguage = () => {
    const lang = document.documentElement.lang;
    return LIGHTBOX_LABELS[lang] ? lang : "en";
  };

  const updateLabels = () => {
    const labels = LIGHTBOX_LABELS[getLanguage()];
    closeBtn.setAttribute("aria-label", labels.close);
    previousBtn.setAttribute("aria-label", labels.previous);
    nextBtn.setAttribute("aria-label", labels.next);
  };

  const renderImage = (index) => {
    currentIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[currentIndex];
    const image = trigger.querySelector("img");
    const card = trigger.closest(".gallery-item");
    const name =
      card?.querySelector(".gallery-name")?.textContent?.trim() || "Neko Void";
    const session = card
      ?.querySelector(".gallery-session")
      ?.textContent?.trim();

    lightboxImg.src = trigger.href;
    lightboxImg.alt = image?.alt || name;
    caption.textContent = [name, session].filter(Boolean).join(" · ");
  };

  const open = (index, trigger) => {
    returnFocus = trigger;
    updateLabels();
    renderImage(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    closeBtn.focus();
  };

  const close = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.removeAttribute("src");
    returnFocus?.focus();
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      open(index, trigger);
    });
  });

  closeBtn.addEventListener("click", close);
  previousBtn.addEventListener("click", () => renderImage(currentIndex - 1));
  nextBtn.addEventListener("click", () => renderImage(currentIndex + 1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") renderImage(currentIndex - 1);
    if (event.key === "ArrowRight") renderImage(currentIndex + 1);
  });
}
