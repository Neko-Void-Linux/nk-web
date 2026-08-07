export function initTypewriter() {
  const textElement = document.getElementById("typewriter-text");
  if (!textElement) return;
  const fullText = "Into the void";
  let currentIndex = 0;
  textElement.textContent = "";
  setTimeout(() => {
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        textElement.textContent += fullText[currentIndex];
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        const cursor = textElement.nextElementSibling;
        if (cursor && cursor.classList.contains("cursor")) {
          cursor.style.animation = "none";
          cursor.style.opacity = "1";
        }
      }
    }, 100);
  }, 800);
}

export function initQuoteHover(uiManager) {
  const quoteBox = document.getElementById("quote-box");
  const quoteTypewriter = document.getElementById("quote-typewriter");
  if (!quoteBox || !quoteTypewriter) return;

  quoteBox.addEventListener("mouseenter", () => {
    if (
      quoteBox.dataset.typing === "true" ||
      quoteBox.dataset.complete === "true"
    )
      return;
    quoteBox.dataset.typing = "true";

    const currentLang = uiManager.currentLang;
    let targetText = "Simplicity is prerequisite for reliability";
    if (currentLang === "es")
      targetText = "La simplicidad es un requisito previo para la fiabilidad";
    if (currentLang === "ja")
      targetText = "「シンプルさは信頼性の前提条件である」";

    quoteTypewriter.textContent = "";
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < targetText.length) {
        quoteTypewriter.textContent += targetText[i];
        i++;
      } else {
        clearInterval(typingInterval);
        quoteBox.dataset.typing = "false";
        quoteBox.dataset.complete = "true";
      }
    }, 50);
  });
}
