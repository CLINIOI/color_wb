// scripts.js

document.addEventListener("DOMContentLoaded", function () {
  // Реализуем плавную прокрутку для внутренних ссылок (например, для кнопки "Попробовать инструменты")
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});
