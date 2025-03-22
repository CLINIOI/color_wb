document.addEventListener("DOMContentLoaded", () => {
  // Элементы страницы для генератора ASCII-арта
  const fileInput = document.getElementById("fileInput");
  const dropZone = document.getElementById("dropZone");
  const resizeSlider = document.getElementById("resizeSlider");
  const resizeValue = document.getElementById("resizeValue");
  const resolutionSelect = document.getElementById("resolutionSelect");
  const asciiSetSelect = document.getElementById("asciiSetSelect");
  const customAsciiInput = document.getElementById("customAsciiInput");
  const colorAscii = document.getElementById("colorAscii");
  const invertColors = document.getElementById("invertColors");
  const htmlOutput = document.getElementById("htmlOutput");
  const fontSelect = document.getElementById("fontSelect");
  const imageUrlInput = document.getElementById("imageUrlInput");
  const loadUrlButton = document.getElementById("loadUrlButton");
  const imagePreview = document.getElementById("imagePreview");
  const imageCanvas = document.getElementById("imageCanvas");
  const asciiResult = document.getElementById("asciiResult");
  const copyButton = document.getElementById("copyButton");
  const downloadButton = document.getElementById("downloadButton");
  const fontSizeInput = document.getElementById("fontSizeInput");
  const fontSizeValue = document.getElementById("fontSizeValue");

  const customAsciiContainer = document.getElementById("customAsciiContainer");

  let currentImage = new Image();
  const faqBtn = document.getElementById("faqBtn");
  // FAQ: открытие модального окна
  faqBtn.addEventListener("click", () => {
    $("#faqModal").modal("show");
  });
  // Загружаем стартовое изображение из <img id="imagePreview"> и скрываем его
  const startingImg = document.getElementById("imagePreview");
  if (startingImg) {
    currentImage = new Image();
    currentImage.onload = () => {
      convertImageToAscii(currentImage);
    };
    currentImage.src = startingImg.src;
    startingImg.style.display = "none";
  }

  // Обновление значения слайдера для изменения размера изображения
  resizeSlider.addEventListener("input", () => {
    resizeValue.textContent = resizeSlider.value + "%";
    if (currentImage.src) {
      convertImageToAscii(currentImage);
    }
  });

  // Обработка изменения разрешения ASCII-арта в реальном времени
  resolutionSelect.addEventListener("change", () => {
    if (currentImage.src) {
      convertImageToAscii(currentImage);
    }
  });

  // Обработка изменения набора символов ASCII
  asciiSetSelect.addEventListener("change", () => {
    if (asciiSetSelect.value === "") {
      customAsciiInput.style.display = "block";
    } else {
      customAsciiInput.style.display = "none";
      if (currentImage.src) {
        convertImageToAscii(currentImage);
      }
    }
  });

  // Обработка ввода кастомного набора символов
  customAsciiInput.addEventListener("input", () => {
    if (currentImage.src) {
      convertImageToAscii(currentImage);
    }
  });

  // Изменение шрифта результата
  fontSelect.addEventListener("change", () => {
    asciiResult.style.fontFamily = fontSelect.value;
    // При необходимости можно вызвать convertImageToAscii, если шрифт влияет на отображение.
  });

  // Обработка режимов в реальном времени:
  // Цветной ASCII-арт (ANSI)
  colorAscii.addEventListener("change", () => {
    if (currentImage.src) convertImageToAscii(currentImage);
  });
  // Инверсия цветов
  invertColors.addEventListener("change", () => {
    if (currentImage.src) convertImageToAscii(currentImage);
  });
  // Генерация ASCII в HTML (<pre>)
  htmlOutput.addEventListener("change", () => {
    if (currentImage.src) convertImageToAscii(currentImage);
  });

  // Обработка загрузки файла через input
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      loadImageFile(e.target.files[0]);
    }
  });

  // Обработка drag & drop
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("hover");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("hover");
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("hover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadImageFile(e.dataTransfer.files[0]);
    }
  });

  // Загрузка изображения по URL
  loadUrlButton.addEventListener("click", () => {
    const url = imageUrlInput.value.trim();
    if (url) {
      loadImageFromUrl(url);
    }
  });

  // Функция загрузки изображения из файла
  function loadImageFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentImage = new Image();
      currentImage.onload = () => {
        imagePreview.src = currentImage.src;
        convertImageToAscii(currentImage);
      };
      currentImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Функция загрузки изображения по URL
  function loadImageFromUrl(url) {
    currentImage = new Image();
    currentImage.crossOrigin = "Anonymous";
    currentImage.onload = () => {
      imagePreview.src = currentImage.src;
      convertImageToAscii(currentImage);
    };
    currentImage.onerror = () => {
      alert("Не удалось загрузить изображение по указанной ссылке.");
    };
    currentImage.src = url;
  }

  // Основная функция преобразования изображения в ASCII
  function convertImageToAscii(img) {
    // Выбранное разрешение (размер в символах по ширине/высоте)
    const res = parseInt(resolutionSelect.value);
    // Коэффициент изменения из слайдера (процент от выбранного разрешения)
    const scale = parseInt(resizeSlider.value) / 100;
    const width = Math.max(1, Math.floor(res * scale));
    const height = Math.max(1, Math.floor(res * scale));

    // Настройка canvas для преобразования
    imageCanvas.width = width;
    imageCanvas.height = height;
    const ctx = imageCanvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height).data;

    // Получение набора символов ASCII (либо стандартный, либо кастомный)
    let asciiSet = asciiSetSelect.value;
    if (asciiSet === "") {
      asciiSet = customAsciiInput.value.trim() || "@#%*+=-:. ";
    }

    let asciiArt = "";
    let htmlArt = "";

    // Обработка каждого пикселя изображения
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        let brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        if (invertColors.checked) {
          brightness = 255 - brightness;
        }
        const charIndex = Math.floor(
          (brightness / 255) * (asciiSet.length - 1)
        );
        const asciiChar = asciiSet[charIndex];
        asciiArt += asciiChar;

        if (colorAscii.checked) {
          htmlArt += `<span style="color: rgb(${r}, ${g}, ${b})">${asciiChar}</span>`;
        } else {
          htmlArt += asciiChar;
        }
      }
      asciiArt += "\n";
      htmlArt += "\n";
    }
    // Вывод результата в формате HTML или plain text
    if (htmlOutput.checked) {
      asciiResult.innerHTML = htmlArt;
    } else {
      asciiResult.textContent = asciiArt;
    }
  }

  // Копирование результата в буфер обмена
  copyButton.addEventListener("click", () => {
    const temp = document.createElement("textarea");
    temp.value = htmlOutput.checked
      ? asciiResult.innerText
      : asciiResult.textContent;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
    alert("Результат скопирован в буфер обмена!");
  });

  // Скачать результат в виде TXT-файла
  downloadButton.addEventListener("click", () => {
    const text = htmlOutput.checked
      ? asciiResult.innerText
      : asciiResult.textContent;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-art.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
// Элементы для изменения размера шрифта

// Обновление размера шрифта в реальном времени
fontSizeInput.addEventListener("input", () => {
  const newSize = fontSizeInput.value + "px";
  fontSizeValue.textContent = newSize;
  asciiResult.style.fontSize = newSize;
});
// Обработка изменения набора символов ASCII
asciiSetSelect.addEventListener("change", () => {
  if (asciiSetSelect.value === "") {
    // Показываем контейнер для кастомного ввода
    customAsciiContainer.style.display = "block";
  } else {
    // Скрываем контейнер для кастомного ввода
    customAsciiContainer.style.display = "none";
    if (currentImage.src) {
      convertImageToAscii(currentImage);
    }
  }
});
// Обработка изменения набора символов ASCII
asciiSetSelect.addEventListener("change", () => {
  if (asciiSetSelect.value === "") {
    // Показываем контейнер для кастомного ввода, если выбраны "Кастомные..."
    customAsciiContainer.style.display = "block";
  } else {
    // Скрываем контейнер для кастомного ввода
    customAsciiContainer.style.display = "none";
    if (currentImage.src) {
      convertImageToAscii(currentImage);
    }
  }
});
asciiSetSelect.addEventListener("change", () => {
  console.log("Выбрано значение:", asciiSetSelect.value);
  if (asciiSetSelect.value === "") {
    document.getElementById("customAsciiContainer").style.display = "block";
    console.log("Кастомное поле отображается");
  } else {
    customAsciiContainer.style.display = "none";
    console.log("Кастомное поле скрыто");
    if (currentImage.src) {
      convertImageToAscii(currentImage);
    }
  }
});
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
});
