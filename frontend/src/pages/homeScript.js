// File: src/pages/homeScript.js

window.addEventListener("scroll", () => {
  const handsImg = document.querySelector(".hands-img");
  const title = document.querySelector(".project-title");
  const textBlocks = document.querySelectorAll(".text-block");

  const scrollY = window.scrollY;
  handsImg.style.transform = `translateY(${scrollY * 0.3}px) scale(${1 - scrollY / 1500})`;
  title.style.opacity = 1 - scrollY / 300;

  textBlocks.forEach((block) => {
    const rect = block.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      block.classList.add("visible");
    }
  });
});
