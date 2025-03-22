// Получение элементов страницы
const dropArea = document.getElementById("drop-area");
const fileElem = document.getElementById("fileElem");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
const colorCountSlider = document.getElementById("colorCount");
const colorCountDisplay = document.getElementById("colorCountDisplay");
const generatePaletteBtn = document.getElementById("generatePalette");
const paletteContainer = document.getElementById("palette");

const downloadPNGBtn = document.getElementById("downloadPNG");
const downloadJSONBtn = document.getElementById("downloadJSON");
const downloadCSSBtn = document.getElementById("downloadCSS");
const exportFigmaBtn = document.getElementById("exportFigma");
const exportAdobeBtn = document.getElementById("exportAdobe");
const exportCoolorsBtn = document.getElementById("exportCoolors");

let currentImage = null;
let paletteColors = [];

// Обновление значения слайдера количества цветов
if (colorCountSlider && colorCountDisplay) {
  colorCountSlider.addEventListener("input", () => {
    colorCountDisplay.textContent = colorCountSlider.value;
  });
}

// Обработка выбора файла через input
if (fileElem) {
  fileElem.addEventListener("change", handleFiles, false);
}

// Drag & drop события для области загрузки
if (dropArea) {
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("highlight");
  });
  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("highlight");
  });
  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("highlight");
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
  });
}

// Функция загрузки изображения
function handleFiles(e) {
  const files = e.target.files;
  if (files.length === 0) return;
  const file = files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      currentImage = img;
      // Устанавливаем размеры canvas под изображение
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// Ручной выбор цвета по клику на canvas
if (canvas) {
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const rgb = [pixel[0], pixel[1], pixel[2]];
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    addColorToPalette(rgb, hex, hsl);
  });
}

// Преобразование RGB в HEX
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// Преобразование RGB в HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Добавление цвета в палитру
function addColorToPalette(rgb, hex, hsl) {
  paletteColors.push({ rgb, hex, hsl });
  renderPalette();
}

// Отрисовка палитры
function renderPalette() {
  paletteContainer.innerHTML = "";
  paletteColors.forEach((color) => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color.hex;

    const info = document.createElement("div");
    info.className = "color-info";
    info.innerHTML = `
      HEX: ${color.hex}<br>
      RGB: (${color.rgb.join(", ")})<br>
      HSL: (${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)
    `;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Копировать";
    copyBtn.addEventListener("click", () => {
      copyToClipboard(color.hex);
    });

    swatch.appendChild(info);
    swatch.appendChild(copyBtn);
    paletteContainer.appendChild(swatch);
  });
}

// Копирование текста в буфер обмена
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Цвет скопирован: " + text);
  });
}

// Генерация палитры по изображению с использованием ColorThief
if (generatePaletteBtn) {
  generatePaletteBtn.addEventListener("click", () => {
    if (!currentImage) {
      alert("Сначала загрузите изображение.");
      return;
    }
    const colorCount = parseInt(colorCountSlider.value);
    const colorThief = new ColorThief();
    try {
      const palette = colorThief.getPalette(canvas, colorCount);
      paletteColors = [];
      palette.forEach((rgb) => {
        const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
        const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
        addColorToPalette(rgb, hex, hsl);
      });
    } catch (error) {
      console.error(error);
      alert("Ошибка при генерации палитры.");
    }
  });
}

// Функция для скачивания файлов
function downloadFile(filename, content, mimeType) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:" + mimeType + ";charset=utf-8," + encodeURIComponent(content)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Скачивание JSON с палитрой
if (downloadJSONBtn) {
  downloadJSONBtn.addEventListener("click", () => {
    const json = JSON.stringify(paletteColors, null, 2);
    downloadFile("palette.json", json, "application/json");
  });
}

// Скачивание CSS с определением переменных для палитры
if (downloadCSSBtn) {
  downloadCSSBtn.addEventListener("click", () => {
    let css = ":root {\n";
    paletteColors.forEach((color, index) => {
      css += `  --color-${index + 1}: ${color.hex};\n`;
    });
    css += "}";
    downloadFile("palette.css", css, "text/css");
  });
}

// Скачивание PNG с ячейками палитры
if (downloadPNGBtn) {
  downloadPNGBtn.addEventListener("click", () => {
    const swatchSize = 100;
    const cols = Math.min(paletteColors.length, 10);
    const rows = Math.ceil(paletteColors.length / cols);
    const paletteCanvas = document.createElement("canvas");
    paletteCanvas.width = cols * swatchSize;
    paletteCanvas.height = rows * swatchSize;
    const pctx = paletteCanvas.getContext("2d");
    paletteColors.forEach((color, index) => {
      const x = (index % cols) * swatchSize;
      const y = Math.floor(index / cols) * swatchSize;
      pctx.fillStyle = color.hex;
      pctx.fillRect(x, y, swatchSize, swatchSize);
    });
    const dataURL = paletteCanvas.toDataURL("image/png");
    const element = document.createElement("a");
    element.setAttribute("href", dataURL);
    element.setAttribute("download", "palette.png");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  });
}

// Экспорт в внешние сервисы
if (exportFigmaBtn) {
  exportFigmaBtn.addEventListener("click", () => {
    window.open("https://www.figma.com/", "_blank");
  });
}
if (exportAdobeBtn) {
  exportAdobeBtn.addEventListener("click", () => {
    window.open("https://color.adobe.com/create", "_blank");
  });
}
if (exportCoolorsBtn) {
  exportCoolorsBtn.addEventListener("click", () => {
    window.open("https://coolors.co/", "_blank");
  });
}

/* Реализация упрощенной версии ColorThief */
class ColorThief {
  getPalette(sourceCanvas, colorCount = 5) {
    const imageData = this.getImageData(sourceCanvas);
    const pixels = imageData.data;
    const pixelArray = [];
    // Собираем массив пикселей, пропуская прозрачные
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 125) continue;
      pixelArray.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
    }
    // Если уникальных цветов меньше требуемого, возвращаем их
    const unique = [];
    pixelArray.forEach((p) => {
      const hex = rgbToHex(p[0], p[1], p[2]);
      if (!unique.some((u) => u.hex === hex)) {
        unique.push({ rgb: p, hex });
      }
    });
    if (unique.length <= colorCount) {
      return unique.map((u) => u.rgb);
    }
    // Инициализация кластеров случайными пикселями
    let clusters = [];
    for (let i = 0; i < colorCount; i++) {
      clusters.push(pixelArray[Math.floor(Math.random() * pixelArray.length)]);
    }
    let iterations = 10;
    while (iterations--) {
      let clusterAssignments = new Array(pixelArray.length);
      // Назначаем каждому пикселю ближайший кластер
      for (let i = 0; i < pixelArray.length; i++) {
        let minDist = Infinity,
          bestCluster = 0;
        for (let j = 0; j < clusters.length; j++) {
          const dist = this.distance(pixelArray[i], clusters[j]);
          if (dist < minDist) {
            minDist = dist;
            bestCluster = j;
          }
        }
        clusterAssignments[i] = bestCluster;
      }
      // Пересчитываем центры кластеров
      let sums = clusters.map(() => [0, 0, 0]);
      let counts = clusters.map(() => 0);
      for (let i = 0; i < pixelArray.length; i++) {
        let cluster = clusterAssignments[i];
        sums[cluster][0] += pixelArray[i][0];
        sums[cluster][1] += pixelArray[i][1];
        sums[cluster][2] += pixelArray[i][2];
        counts[cluster]++;
      }
      for (let j = 0; j < clusters.length; j++) {
        if (counts[j] === 0) continue;
        clusters[j] = [
          Math.round(sums[j][0] / counts[j]),
          Math.round(sums[j][1] / counts[j]),
          Math.round(sums[j][2] / counts[j]),
        ];
      }
    }
    return clusters;
  }
  getImageData(canvas) {
    const ctx = canvas.getContext("2d");
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
  distance(c1, c2) {
    return Math.sqrt(
      Math.pow(c1[0] - c2[0], 2) +
        Math.pow(c1[1] - c2[1], 2) +
        Math.pow(c1[2] - c2[2], 2)
    );
  }
}
