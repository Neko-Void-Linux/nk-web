export function initLightbox() {
  // La lightbox solo existe con JS: se crea aquí para no ensuciar la
  // salida de navegadores de terminal ni el modo sin JS.
  const lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  lightbox.className = "lightbox";
  lightbox.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <img class="lightbox-content" id="lightbox-img" alt="Lightbox Image" />
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = lightbox.querySelector(".lightbox-close");

  if (!lightboxImg) return;

  document.querySelectorAll(".gallery-item img").forEach((img) => {
    img.addEventListener("click", () => {
      lightbox.style.display = "flex";
      lightboxImg.src = img.src;
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      lightbox.style.display = "none";
    });
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.style.display = "none";
  });
}
