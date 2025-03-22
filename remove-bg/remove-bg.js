// Глобальные переменные
let images = []; // Загруженные изображения для пакетной обработки
let currentImageIndex = 0;
let processedImages = []; // Для хранения данных обработанных изображений
let regions = []; // Регионы для текущего изображения
let currentMode = "original"; // Режим просмотра: original, mask, overlay
let advancedMode = false;

// DOM-элементы
const imageInput = document.getElementById("imageInput");
const thresholdSlider = document.getElementById("thresholdSlider");
const thresholdValue = document.getElementById("thresholdValue");
const claritySlider = document.getElementById("claritySlider");
const clarityValue = document.getElementById("clarityValue");
const brightnessSlider = document.getElementById("brightnessSlider");
const brightnessValue = document.getElementById("brightnessValue");
const saturationSlider = document.getElementById("saturationSlider");
const saturationValue = document.getElementById("saturationValue");
const bgColorPicker = document.getElementById("bgColorPicker");
const colorToleranceSlider = document.getElementById("colorToleranceSlider");
const colorToleranceValue = document.getElementById("colorToleranceValue");
const minAreaInput = document.getElementById("minAreaInput");
const rotationInput = document.getElementById("rotationInput");
const cropXInput = document.getElementById("cropX");
const cropYInput = document.getElementById("cropY");
const cropWidthInput = document.getElementById("cropWidth");
const cropHeightInput = document.getElementById("cropHeight");
const formatSelect = document.getElementById("formatSelect");
const jpgQualitySlider = document.getElementById("jpgQualitySlider");
const jpgQualityValue = document.getElementById("jpgQualityValue");
const processBtn = document.getElementById("processBtn");
const saveBtn = document.getElementById("saveBtn");
const toggleModeBtn = document.getElementById("toggleModeBtn");
const faqBtn = document.getElementById("faqBtn");
const progressIndicator = document.getElementById("progressIndicator");
const dropArea = document.getElementById("dropArea");
const viewModeSelect = document.getElementById("viewModeSelect");
const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");
const hiddenCanvas = document.getElementById("hiddenCanvas");
const hiddenCtx = hiddenCanvas.getContext("2d");
const objectGallery = document.getElementById("objectGallery");

// Обновление значений слайдеров
thresholdSlider.addEventListener("input", () => {
  thresholdValue.textContent = thresholdSlider.value;
});
claritySlider.addEventListener("input", () => {
  clarityValue.textContent = claritySlider.value + "%";
});
brightnessSlider.addEventListener("input", () => {
  brightnessValue.textContent = brightnessSlider.value + "%";
});
saturationSlider.addEventListener("input", () => {
  saturationValue.textContent = saturationSlider.value + "%";
});
colorToleranceSlider.addEventListener("input", () => {
  colorToleranceValue.textContent = colorToleranceSlider.value;
});
jpgQualitySlider.addEventListener("input", () => {
  jpgQualityValue.textContent = jpgQualitySlider.value;
});

// Переключение простого/расширенного режима
toggleModeBtn.addEventListener("click", () => {
  advancedMode = !advancedMode;
  document.querySelectorAll(".advanced").forEach((el) => {
    el.style.display = advancedMode ? "block" : "none";
  });
  toggleModeBtn.textContent = advancedMode
    ? "Переключить режим: Простой"
    : "Переключить режим: Расширенный";
});

// Поддержка drag-and-drop
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.style.backgroundColor = "#f0f0f0";
});
dropArea.addEventListener("dragleave", () => {
  dropArea.style.backgroundColor = "";
});
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.style.backgroundColor = "";
  const files = e.dataTransfer.files;
  handleFiles(files);
});

// Загрузка изображений через input
imageInput.addEventListener("change", (e) => {
  const files = e.target.files;
  handleFiles(files);
});

// Обработка списка файлов
function handleFiles(files) {
  images = [];
  for (let file of files) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        images.push(img);
        if (images.length === files.length) {
          currentImageIndex = 0;
          processCurrentImage();
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Обработка текущего изображения (в рамках пакетной обработки)
function processCurrentImage() {
  if (!images[currentImageIndex]) return;
  regions = [];
  let img = images[currentImageIndex];
  let rotation = Number(rotationInput.value);
  let cropX = Number(cropXInput.value);
  let cropY = Number(cropYInput.value);
  let cropW = Number(cropWidthInput.value);
  let cropH = Number(cropHeightInput.value);
  if (cropW === 0 || cropH === 0) {
    cropX = 0;
    cropY = 0;
    cropW = img.width;
    cropH = img.height;
  }
  hiddenCanvas.width = cropW;
  hiddenCanvas.height = cropH;
  hiddenCtx.save();
  hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
  // Применяем поворот и кадрирование
  hiddenCtx.translate(cropW / 2, cropH / 2);
  hiddenCtx.rotate((rotation * Math.PI) / 180);
  hiddenCtx.translate(-cropW / 2, -cropH / 2);
  hiddenCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  hiddenCtx.restore();
  imageData = hiddenCtx.getImageData(
    0,
    0,
    hiddenCanvas.width,
    hiddenCanvas.height
  );
  processImage();
  drawPreview();
  updateProgress();
  buildGallery();
}

// Функция сравнения цвета: сравниваем пиксель с выбранным цветом с учетом допустимого отклонения
function isColorToRemove(x, y, width, data) {
  const index = (y * width + x) * 4;
  const r = data[index],
    g = data[index + 1],
    b = data[index + 2];
  const targetColor = hexToRgb(bgColorPicker.value);
  const tolerance = Number(colorToleranceSlider.value);
  const dist = Math.sqrt(
    (r - targetColor.r) ** 2 +
      (g - targetColor.g) ** 2 +
      (b - targetColor.b) ** 2
  );
  return dist < tolerance * 2.55;
}

// Преобразование HEX в RGB
function hexToRgb(hex) {
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Поиск объектов на изображении: обход пикселей и применение flood fill
function processImage() {
  if (!imageData) return;
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const visited = new Uint8Array(width * height);
  regions = [];
  const minArea = Number(minAreaInput.value);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!visited[y * width + x] && !isColorToRemove(x, y, width, data)) {
        const region = floodFill(x, y, width, height, data, visited);
        const regionWidth = region.maxX - region.minX + 1;
        const regionHeight = region.maxY - region.minY + 1;
        if (regionWidth * regionHeight >= minArea) {
          regions.push(region);
        }
      }
    }
  }
  console.log("Найдено объектов:", regions.length);
}

// Алгоритм flood fill
function floodFill(x, y, width, height, data, visited) {
  const stack = [[x, y]];
  let minX = x,
    minY = y,
    maxX = x,
    maxY = y;
  visited[y * width + x] = true;
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < minX) minX = cx;
    if (cy < minY) minY = cy;
    if (cx > maxX) maxX = cx;
    if (cy > maxY) maxY = cy;
    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];
    neighbors.forEach(([nx, ny]) => {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (
          !visited[ny * width + nx] &&
          !isColorToRemove(nx, ny, width, data)
        ) {
          visited[ny * width + nx] = true;
          stack.push([nx, ny]);
        }
      }
    });
  }
  return { minX, minY, maxX, maxY };
}

// Отрисовка превью с учётом выбранных фильтров и режима просмотра
function drawPreview() {
  if (!imageData) return;
  const width = hiddenCanvas.width;
  const height = hiddenCanvas.height;
  const scale = Math.min(
    previewCanvas.width / width,
    previewCanvas.height / height
  );
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  const offsetX = (previewCanvas.width - drawWidth) / 2;
  const offsetY = (previewCanvas.height - drawHeight) / 2;
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  const contrast = claritySlider.value;
  const brightness = brightnessSlider ? brightnessSlider.value : 100;
  const saturation = saturationSlider ? saturationSlider.value : 100;
  previewCtx.filter = `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%)`;
  if (currentMode === "original") {
    previewCtx.drawImage(
      hiddenCanvas,
      0,
      0,
      width,
      height,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight
    );
  } else if (currentMode === "mask") {
    let maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    let maskCtx = maskCanvas.getContext("2d");
    maskCtx.drawImage(hiddenCanvas, 0, 0);
    let maskData = maskCtx.getImageData(0, 0, width, height);
    for (let i = 0; i < maskData.data.length; i += 4) {
      const r = maskData.data[i],
        g = maskData.data[i + 1],
        b = maskData.data[i + 2];
      const targetColor = hexToRgb(bgColorPicker.value);
      const tolerance = Number(colorToleranceSlider.value);
      const dist = Math.sqrt(
        (r - targetColor.r) ** 2 +
          (g - targetColor.g) ** 2 +
          (b - targetColor.b) ** 2
      );
      if (dist < tolerance * 2.55) {
        maskData.data[i + 3] = 0;
      }
    }
    maskCtx.putImageData(maskData, 0, 0);
    previewCtx.drawImage(
      maskCanvas,
      0,
      0,
      width,
      height,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight
    );
  } else if (currentMode === "overlay") {
    previewCtx.drawImage(
      hiddenCanvas,
      0,
      0,
      width,
      height,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight
    );
    previewCtx.lineWidth = 2;
    regions.forEach((region, index) => {
      previewCtx.strokeStyle = `hsl(${(index * 30) % 360}, 100%, 50%)`;
      previewCtx.strokeRect(
        region.minX * scale + offsetX,
        region.minY * scale + offsetY,
        (region.maxX - region.minX + 1) * scale,
        (region.maxY - region.minY + 1) * scale
      );
    });
  }
  previewCtx.filter = "none";
}

// Формирование галереи объектов для выбора и переименования
function buildGallery() {
  objectGallery.innerHTML = "";
  regions.forEach((region, index) => {
    const regionWidth = region.maxX - region.minX + 1;
    const regionHeight = region.maxY - region.minY + 1;
    const regionCanvas = document.createElement("canvas");
    regionCanvas.width = regionWidth;
    regionCanvas.height = regionHeight;
    const regionCtx = regionCanvas.getContext("2d");
    regionCtx.drawImage(
      hiddenCanvas,
      region.minX,
      region.minY,
      regionWidth,
      regionHeight,
      0,
      0,
      regionWidth,
      regionHeight
    );
    let regionData = regionCtx.getImageData(0, 0, regionWidth, regionHeight);
    for (let j = 0; j < regionData.data.length; j += 4) {
      const r = regionData.data[j],
        g = regionData.data[j + 1],
        b = regionData.data[j + 2];
      const targetColor = hexToRgb(bgColorPicker.value);
      const tolerance = Number(colorToleranceSlider.value);
      const dist = Math.sqrt(
        (r - targetColor.r) ** 2 +
          (g - targetColor.g) ** 2 +
          (b - targetColor.b) ** 2
      );
      if (dist < tolerance * 2.55) {
        regionData.data[j + 3] = 0;
      }
    }
    regionCtx.putImageData(regionData, 0, 0);
    const dataURL = regionCanvas.toDataURL("image/png");
    const div = document.createElement("div");
    div.className = "gallery-item";
    const imgEl = document.createElement("img");
    imgEl.src = dataURL;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.className = "object-checkbox";
    const renameInput = document.createElement("input");
    renameInput.type = "text";
    renameInput.value = "object_" + String(index + 1).padStart(3, "0");
    div.appendChild(checkbox);
    div.appendChild(imgEl);
    div.appendChild(renameInput);
    objectGallery.appendChild(div);
  });
}

// Обновление индикатора прогресса пакетной обработки
function updateProgress() {
  progressIndicator.textContent = `Обрабатывается ${currentImageIndex + 1} из ${
    images.length
  }`;
}

// Обработчик кнопки "Обработать изображение(и)"
processBtn.addEventListener("click", () => {
  if (images.length === 0) {
    alert("Сначала загрузите изображения!");
    return;
  }
  processCurrentImage();
});

// Переключение режима просмотра
viewModeSelect.addEventListener("change", (e) => {
  currentMode = e.target.value;
  drawPreview();
});

// Обработчик кнопки "Сохранить выбранные объекты"
saveBtn.addEventListener("click", () => {
  if (regions.length === 0) {
    alert("Объекты не обнаружены. Обработайте изображение(и).");
    return;
  }
  const zip = new JSZip();
  // Сохраняем объекты, отмеченные в галерее
  const galleryItems = objectGallery.querySelectorAll(".gallery-item");
  galleryItems.forEach((item, index) => {
    const checkbox = item.querySelector("input[type='checkbox']");
    const renameInput = item.querySelector("input[type='text']");
    if (checkbox.checked) {
      const region = regions[index];
      const regionWidth = region.maxX - region.minX + 1;
      const regionHeight = region.maxY - region.minY + 1;
      const regionCanvas = document.createElement("canvas");
      regionCanvas.width = regionWidth;
      regionCanvas.height = regionHeight;
      const regionCtx = regionCanvas.getContext("2d");
      regionCtx.drawImage(
        hiddenCanvas,
        region.minX,
        region.minY,
        regionWidth,
        regionHeight,
        0,
        0,
        regionWidth,
        regionHeight
      );
      let regData = regionCtx.getImageData(0, 0, regionWidth, regionHeight);
      for (let j = 0; j < regData.data.length; j += 4) {
        const r = regData.data[j],
          g = regData.data[j + 1],
          b = regData.data[j + 2];
        const targetColor = hexToRgb(bgColorPicker.value);
        const tolerance = Number(colorToleranceSlider.value);
        const dist = Math.sqrt(
          (r - targetColor.r) ** 2 +
            (g - targetColor.g) ** 2 +
            (b - targetColor.b) ** 2
        );
        if (dist < tolerance * 2.55) {
          regData.data[j + 3] = 0;
        }
      }
      regionCtx.putImageData(regData, 0, 0);
      // Определяем формат вывода
      let format = formatSelect.value;
      let mime = "image/png";
      if (format === "jpg") {
        mime = "image/jpeg";
      } else if (format === "webp") {
        mime = "image/webp";
      }
      let dataURL;
      if (format === "jpg") {
        const quality = Number(jpgQualitySlider.value) / 100;
        dataURL = regionCanvas.toDataURL(mime, quality);
      } else {
        dataURL = regionCanvas.toDataURL(mime);
      }
      const base64 = dataURL.replace(
        /^data:image\/(png|jpeg|webp);base64,/,
        ""
      );
      const fileName =
        renameInput.value || "object_" + String(index + 1).padStart(3, "0");
      zip.file(fileName + "." + format, base64, { base64: true });
    }
  });
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, "extracted_objects.zip");
  });
});

// FAQ: открытие модального окна
faqBtn.addEventListener("click", () => {
  $("#faqModal").modal("show");
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
