document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");

  // Применение сохранённой темы при загрузке
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("dark-theme");
    themeToggle.textContent = "🌙";
  }

  // Обработчик переключения темы
  themeToggle.addEventListener("click", () => {
    if (document.body.classList.contains("dark-theme")) {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "🌙";
    } else {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "☀️";
    }
  });

  // ---------------------
  // Остальной существующий код для работы конвертера:
  const uploadImage = document.getElementById("uploadImage");
  const widthRange = document.getElementById("widthRange");
  const widthValue = document.getElementById("widthValue");
  const dotRadiusRange = document.getElementById("dotRadiusRange");
  const dotRadiusValue = document.getElementById("dotRadiusValue");
  const brightnessRange = document.getElementById("brightnessRange");
  const brightnessValue = document.getElementById("brightnessValue");
  const contrastRange = document.getElementById("contrastRange");
  const contrastValue = document.getElementById("contrastValue");
  const bgColorRadios = document.querySelectorAll('input[name="bgColor"]');
  const dotsModeRadios = document.querySelectorAll('input[name="dotsMode"]');
  const dotColorInput = document.getElementById("dotColor");

  const resultCanvas = document.getElementById("resultCanvas");
  const ctx = resultCanvas.getContext("2d");

  const dotsXText = document.getElementById("dotsX");
  const dotsYText = document.getElementById("dotsY");
  const dotsTotalText = document.getElementById("dotsTotal");

  const cssFilterCode = document.getElementById("cssFilterCode");
  const saveImageBtn = document.getElementById("saveImageBtn");
  const faqBtn = document.getElementById("faqBtn");
  // FAQ: открытие модального окна
  faqBtn.addEventListener("click", () => {
    $("#faqModal").modal("show");
  });
  let originalImage = new Image();
  let imageLoaded = false;

  // Функция обновления значений UI и генерации CSS-фильтра
  function updateUIValues() {
    widthValue.textContent = widthRange.value;
    dotRadiusValue.textContent = dotRadiusRange.value;
    brightnessValue.textContent = brightnessRange.value;
    contrastValue.textContent = contrastRange.value;

    const brightnessVal = brightnessRange.value;
    const contrastVal = contrastRange.value;
    const filterString = `filter: brightness(${brightnessVal}) contrast(${contrastVal});`;
    cssFilterCode.value = filterString;
  }

  // Определяем выбранный фон
  function getSelectedBackgroundClass() {
    let value = "white";
    bgColorRadios.forEach((radio) => {
      if (radio.checked) {
        value = radio.value;
      }
    });
    return value;
  }

  // Определяем режим точек (bw или color)
  function getDotsMode() {
    let mode = "bw";
    dotsModeRadios.forEach((radio) => {
      if (radio.checked) {
        mode = radio.value;
      }
    });
    return mode;
  }

  // Рисование изображения точками
  function drawDottedImage() {
    if (!imageLoaded) return;

    const desiredWidth = parseInt(widthRange.value, 10);
    const aspectRatio = originalImage.height / originalImage.width;
    const desiredHeight = Math.floor(desiredWidth * aspectRatio);

    resultCanvas.width = desiredWidth;
    resultCanvas.height = desiredHeight;

    // Вспомогательный canvas для обработки яркости и контраста
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = desiredWidth;
    tempCanvas.height = desiredHeight;
    const tctx = tempCanvas.getContext("2d");

    tctx.filter = `brightness(${brightnessRange.value}) contrast(${contrastRange.value})`;
    tctx.drawImage(originalImage, 0, 0, desiredWidth, desiredHeight);

    const imageData = tctx.getImageData(0, 0, desiredWidth, desiredHeight);
    const data = imageData.data;

    const radius = parseInt(dotRadiusRange.value, 10);
    const diameter = radius * 2;

    const dotsCountX = Math.ceil(desiredWidth / diameter);
    const dotsCountY = Math.ceil(desiredHeight / diameter);

    dotsXText.textContent = dotsCountX;
    dotsYText.textContent = dotsCountY;
    dotsTotalText.textContent = dotsCountX * dotsCountY;

    // Заливаем фон
    const bgClass = getSelectedBackgroundClass();
    ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    let bgFillColor = "#FFFFFF";
    switch (bgClass) {
      case "white":
        bgFillColor = "#FFFFFF";
        break;
      case "light":
        bgFillColor = "#F5F5F5";
        break;
      case "dark":
        bgFillColor = "#404040";
        break;
      case "black":
        bgFillColor = "#000000";
        break;
      case "var1":
        bgFillColor = "#fef8e7";
        break;
      case "var2":
        bgFillColor = "#ffe7f8";
        break;
      case "var3":
        bgFillColor = "#e7fff2";
        break;
      case "var4":
        bgFillColor = "#e7f0ff";
        break;
      case "var5":
        bgFillColor = "#faf0ff";
        break;
      default:
        bgFillColor = "#FFFFFF";
    }
    ctx.fillStyle = bgFillColor;
    ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);

    // Режим точек
    const mode = getDotsMode();
    const customColor = dotColorInput.value;

    for (let y = 0; y < desiredHeight; y += diameter) {
      for (let x = 0; x < desiredWidth; x += diameter) {
        const pixelIndex = (y * desiredWidth + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const a = data[pixelIndex + 3];

        let dotColor;
        if (mode === "bw") {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          dotColor = `rgba(${gray}, ${gray}, ${gray}, ${a / 255})`;
        } else {
          dotColor = hexToRGBA(customColor, a / 255);
        }

        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Преобразование HEX в RGBA
  function hexToRGBA(hex, alpha = 1) {
    hex = hex.replace(/^#/, "");
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Сохранение результата с canvas
  function saveCanvasImage() {
    const link = document.createElement("a");
    link.download = "dotted_image.png";
    link.href = resultCanvas.toDataURL("image/png");
    link.click();
  }

  // ---------------------
  // Добавляем обработчик загрузки файла
  uploadImage.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      originalImage.src = evt.target.result;
    };
    reader.readAsDataURL(file);

    // Скрываем стартовое изображение, если оно отображается
    const startingImg = document.querySelector(".preview img");
    if (startingImg) {
      startingImg.style.display = "none";
    }
  });

  // Когда загружается изображение (либо стартовое, либо из файла),
  // устанавливаем флаг и запускаем отрисовку
  originalImage.onload = () => {
    imageLoaded = true;
    drawDottedImage();
  };

  // ---------------------
  // Обновление настроек при изменении ползунков и переключателей
  widthRange.addEventListener("input", () => {
    updateUIValues();
    drawDottedImage();
  });
  dotRadiusRange.addEventListener("input", () => {
    updateUIValues();
    drawDottedImage();
  });
  brightnessRange.addEventListener("input", () => {
    updateUIValues();
    drawDottedImage();
  });
  contrastRange.addEventListener("input", () => {
    updateUIValues();
    drawDottedImage();
  });

  bgColorRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      drawDottedImage();
    });
  });
  dotsModeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      drawDottedImage();
    });
  });
  dotColorInput.addEventListener("input", () => {
    drawDottedImage();
  });

  saveImageBtn.addEventListener("click", () => {
    saveCanvasImage();
  });

  // Изначальное обновление UI
  updateUIValues();

  // ---------------------
  // Загружаем стартовое изображение из разметки и скрываем его
  const startingImg = document.querySelector(".preview img");
  if (startingImg) {
    // Если пользователь ещё не загрузил фото, используем стартовое
    originalImage.src = startingImg.src;
    startingImg.style.display = "none";
  }
});
