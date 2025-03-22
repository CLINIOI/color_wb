// ========================
// Функциональность переключения темы
// ========================

// ========================
// Функциональность конструктора clip-path и фильтров
// ========================
const imageArea = document.getElementById("imageArea");
const mainImage = document.getElementById("mainImage");
const imageUpload = document.getElementById("imageUpload");

const filterSelect = document.getElementById("filterSelect");
const filterCustom = document.getElementById("filterCustom");
const outputCss = document.getElementById("outputCss");

const coordXInput = document.getElementById("coordX");
const coordYInput = document.getElementById("coordY");
const selectedPointIndexEl = document.getElementById("selectedPointIndex");

let points = []; // Массив точек {x, y}
let selectedPoint = -1; // Индекс выбранной точки
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
const faqBtn = document.getElementById("faqBtn");
// FAQ: открытие модального окна
faqBtn.addEventListener("click", () => {
  $("#faqModal").modal("show");
});
// Функция для создания правильного многоугольника
function createRegularPolygon(sides, cx, cy, r) {
  const arr = [];
  const startAngle = -Math.PI / 2;
  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (2 * Math.PI * i) / sides;
    arr.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }
  return arr;
}

// Функция для создания звезды с заданным количеством лучей
function createStar(spikes, cx, cy, outerR, innerR) {
  const arr = [];
  let rot = -Math.PI / 2; // Начинаем сверху
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes; i++) {
    // Внешняя точка
    const xOuter = cx + Math.cos(rot) * outerR;
    const yOuter = cy + Math.sin(rot) * outerR;
    arr.push({ x: xOuter, y: yOuter });
    rot += step;
    // Внутренняя точка
    const xInner = cx + Math.cos(rot) * innerR;
    const yInner = cy + Math.sin(rot) * innerR;
    arr.push({ x: xInner, y: yInner });
    rot += step;
  }
  return arr;
}

// Загрузка изображения
imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    mainImage.src = evt.target.result;
    // Сброс точек и обновление UI
    points = [];
    selectedPoint = -1;
    updateUI();
  };
  reader.readAsDataURL(file);
});

// Обработка кликов по пресетам
document.querySelectorAll(".presets button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const preset = btn.getAttribute("data-preset");
    applyPreset(preset);
  });
});

// Применение выбранного пресета
function applyPreset(preset) {
  points = [];
  selectedPoint = -1;
  const w = imageArea.clientWidth;
  const h = imageArea.clientHeight;
  switch (preset) {
    case "circle": {
      const circlePoints = 12;
      const r = 0.4 * Math.min(w, h);
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < circlePoints; i++) {
        const angle = (2 * Math.PI * i) / circlePoints;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        points.push({ x, y });
      }
      break;
    }
    case "ellipse": {
      const ellipsePoints = 12;
      const rx = w * 0.4;
      const ry = h * 0.3;
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < ellipsePoints; i++) {
        const angle = (2 * Math.PI * i) / ellipsePoints;
        const x = cx + rx * Math.cos(angle);
        const y = cy + ry * Math.sin(angle);
        points.push({ x, y });
      }
      break;
    }
    case "polygon-star": {
      const outer = 0.4 * Math.min(w, h);
      const inner = 0.2 * Math.min(w, h);
      const cx = w / 2;
      const cy = h / 2;
      points = createStar(5, cx, cy, outer, inner);
      break;
    }
    case "rhombus": {
      points.push({ x: w / 2, y: 10 });
      points.push({ x: w - 10, y: h / 2 });
      points.push({ x: w / 2, y: h - 10 });
      points.push({ x: 10, y: h / 2 });
      break;
    }
    case "triangle": {
      points.push({ x: w / 2, y: 10 });
      points.push({ x: w - 10, y: h - 10 });
      points.push({ x: 10, y: h - 10 });
      break;
    }
    case "pentagon": {
      const r = 0.4 * Math.min(w, h);
      points = createRegularPolygon(5, w / 2, h / 2, r);
      break;
    }
    case "hexagon": {
      const r = 0.4 * Math.min(w, h);
      points = createRegularPolygon(6, w / 2, h / 2, r);
      break;
    }
    case "heptagon": {
      const r = 0.4 * Math.min(w, h);
      points = createRegularPolygon(7, w / 2, h / 2, r);
      break;
    }
    case "octagon": {
      const r = 0.4 * Math.min(w, h);
      points = createRegularPolygon(8, w / 2, h / 2, r);
      break;
    }
    case "nonagon": {
      const r = 0.4 * Math.min(w, h);
      points = createRegularPolygon(9, w / 2, h / 2, r);
      break;
    }
    case "decagon": {
      const r = 0.4 * Math.min(w, h);
      points = createRegularPolygon(10, w / 2, h / 2, r);
      break;
    }
    case "star6": {
      const outer = 0.4 * Math.min(w, h);
      const inner = 0.2 * Math.min(w, h);
      points = createStar(6, w / 2, h / 2, outer, inner);
      break;
    }
    case "star8": {
      const outer = 0.4 * Math.min(w, h);
      const inner = 0.2 * Math.min(w, h);
      points = createStar(8, w / 2, h / 2, outer, inner);
      break;
    }
    case "trapezoid": {
      points.push({ x: w * 0.3, y: 10 });
      points.push({ x: w * 0.7, y: 10 });
      points.push({ x: w - 10, y: h - 10 });
      points.push({ x: 10, y: h - 10 });
      break;
    }
    case "parallelogram": {
      points.push({ x: w * 0.2, y: 10 });
      points.push({ x: w - 10, y: 10 });
      points.push({ x: w * 0.8, y: h - 10 });
      points.push({ x: 10, y: h - 10 });
      break;
    }
    case "arrow-left": {
      points.push({ x: w * 0.3, y: h * 0.2 });
      points.push({ x: w * 0.3, y: h * 0.4 });
      points.push({ x: w * 0.7, y: h * 0.4 });
      points.push({ x: w * 0.7, y: h * 0.6 });
      points.push({ x: w * 0.3, y: h * 0.6 });
      points.push({ x: w * 0.3, y: h * 0.8 });
      points.push({ x: w * 0.1, y: h * 0.5 });
      break;
    }
    case "arrow-right": {
      points.push({ x: w * 0.3, y: h * 0.4 });
      points.push({ x: w * 0.7, y: h * 0.4 });
      points.push({ x: w * 0.7, y: h * 0.2 });
      points.push({ x: w * 0.9, y: h * 0.5 });
      points.push({ x: w * 0.7, y: h * 0.8 });
      points.push({ x: w * 0.7, y: h * 0.6 });
      points.push({ x: w * 0.3, y: h * 0.6 });
      break;
    }
    case "arrow-up": {
      points.push({ x: w * 0.4, y: h * 0.3 });
      points.push({ x: w * 0.4, y: h * 0.7 });
      points.push({ x: w * 0.2, y: h * 0.7 });
      points.push({ x: w * 0.5, y: h * 0.9 });
      points.push({ x: w * 0.8, y: h * 0.7 });
      points.push({ x: w * 0.6, y: h * 0.7 });
      points.push({ x: w * 0.6, y: h * 0.3 });
      break;
    }
    case "arrow-down": {
      points.push({ x: w * 0.4, y: h * 0.3 });
      points.push({ x: w * 0.6, y: h * 0.3 });
      points.push({ x: w * 0.6, y: h * 0.7 });
      points.push({ x: w * 0.8, y: h * 0.7 });
      points.push({ x: w * 0.5, y: h * 0.9 });
      points.push({ x: w * 0.2, y: h * 0.7 });
      points.push({ x: w * 0.4, y: h * 0.7 });
      break;
    }
    case "cross": {
      const margin = 0.15;
      points.push({ x: w * margin, y: h * 0.35 });
      points.push({ x: w * 0.35, y: h * 0.35 });
      points.push({ x: w * 0.35, y: h * margin });
      points.push({ x: w * 0.65, y: h * margin });
      points.push({ x: w * 0.65, y: h * 0.35 });
      points.push({ x: w * (1 - margin), y: h * 0.35 });
      points.push({ x: w * (1 - margin), y: h * 0.65 });
      points.push({ x: w * 0.65, y: h * 0.65 });
      points.push({ x: w * 0.65, y: h * (1 - margin) });
      points.push({ x: w * 0.35, y: h * (1 - margin) });
      points.push({ x: w * 0.35, y: h * 0.65 });
      points.push({ x: w * margin, y: h * 0.65 });
      break;
    }
    case "plus": {
      const thick = 0.15;
      points.push({ x: w * 0.4, y: h * thick });
      points.push({ x: w * 0.6, y: h * thick });
      points.push({ x: w * 0.6, y: h * 0.4 });
      points.push({ x: w * (1 - thick), y: h * 0.4 });
      points.push({ x: w * (1 - thick), y: h * 0.6 });
      points.push({ x: w * 0.6, y: h * 0.6 });
      points.push({ x: w * 0.6, y: h * (1 - thick) });
      points.push({ x: w * 0.4, y: h * (1 - thick) });
      points.push({ x: w * 0.4, y: h * 0.6 });
      points.push({ x: w * thick, y: h * 0.6 });
      points.push({ x: w * thick, y: h * 0.4 });
      points.push({ x: w * 0.4, y: h * 0.4 });
      break;
    }
    case "heart": {
      const cx = w / 2;
      const cy = h / 2;
      const topOffset = 0.2 * h;
      const leftOffset = 0.2 * w;
      points.push({ x: cx, y: cy + h * 0.3 });
      points.push({ x: cx + w * 0.3, y: cy });
      points.push({ x: cx + w * 0.25, y: cy - topOffset });
      points.push({ x: cx, y: cy - topOffset * 0.8 });
      points.push({ x: cx - w * 0.25, y: cy - topOffset });
      points.push({ x: cx - w * 0.3, y: cy });
      points.push({ x: cx - leftOffset, y: cy + h * 0.25 });
      points.push({ x: cx, y: cy + h * 0.35 });
      break;
    }
    case "wave": {
      points.push({ x: 0, y: h * 0.4 });
      points.push({ x: w * 0.2, y: h * 0.3 });
      points.push({ x: w * 0.4, y: h * 0.5 });
      points.push({ x: w * 0.6, y: h * 0.3 });
      points.push({ x: w * 0.8, y: h * 0.5 });
      points.push({ x: w, y: h * 0.4 });
      points.push({ x: w, y: h });
      points.push({ x: 0, y: h });
      break;
    }
    case "shield": {
      points.push({ x: w * 0.3, y: 10 });
      points.push({ x: w * 0.7, y: 10 });
      points.push({ x: w - 10, y: h * 0.3 });
      points.push({ x: w * 0.8, y: h - 10 });
      points.push({ x: w * 0.2, y: h - 10 });
      points.push({ x: 10, y: h * 0.3 });
      break;
    }
    case "frame": {
      points.push({ x: 0, y: 0 });
      points.push({ x: w, y: 0 });
      points.push({ x: w, y: h });
      points.push({ x: 0, y: h });
      points.push({ x: w * 0.7, y: h * 0.3 });
      points.push({ x: w * 0.7, y: h * 0.7 });
      points.push({ x: w * 0.3, y: h * 0.7 });
      points.push({ x: w * 0.3, y: h * 0.3 });
      break;
    }
    case "chevron-left": {
      points.push({ x: w * 0.6, y: h * 0.1 });
      points.push({ x: w * 0.4, y: h * 0.1 });
      points.push({ x: w * 0.1, y: h * 0.5 });
      points.push({ x: w * 0.4, y: h * 0.9 });
      points.push({ x: w * 0.6, y: h * 0.9 });
      points.push({ x: w * 0.3, y: h * 0.5 });
      break;
    }
    case "chevron-right": {
      points.push({ x: w * 0.4, y: h * 0.1 });
      points.push({ x: w * 0.6, y: h * 0.1 });
      points.push({ x: w * 0.9, y: h * 0.5 });
      points.push({ x: w * 0.6, y: h * 0.9 });
      points.push({ x: w * 0.4, y: h * 0.9 });
      points.push({ x: w * 0.7, y: h * 0.5 });
      break;
    }
    case "chevron-up": {
      points.push({ x: w * 0.1, y: h * 0.6 });
      points.push({ x: w * 0.1, y: h * 0.4 });
      points.push({ x: w * 0.5, y: h * 0.1 });
      points.push({ x: w * 0.9, y: h * 0.4 });
      points.push({ x: w * 0.9, y: h * 0.6 });
      points.push({ x: w * 0.5, y: h * 0.3 });
      break;
    }
    case "chevron-down": {
      points.push({ x: w * 0.1, y: h * 0.4 });
      points.push({ x: w * 0.1, y: h * 0.6 });
      points.push({ x: w * 0.5, y: h * 0.9 });
      points.push({ x: w * 0.9, y: h * 0.6 });
      points.push({ x: w * 0.9, y: h * 0.4 });
      points.push({ x: w * 0.5, y: h * 0.7 });
      break;
    }
    case "cylinder": {
      points.push({ x: w * 0.3, y: 10 });
      points.push({ x: w * 0.7, y: 10 });
      points.push({ x: w * 0.7, y: h - 10 });
      points.push({ x: w * 0.3, y: h - 10 });
      break;
    }
    case "ticket": {
      points.push({ x: 0, y: 0 });
      points.push({ x: w, y: 0 });
      points.push({ x: w, y: h * 0.4 });
      points.push({ x: w * 0.8, y: h * 0.4 });
      points.push({ x: w * 0.8, y: h * 0.6 });
      points.push({ x: w, y: h * 0.6 });
      points.push({ x: w, y: h });
      points.push({ x: 0, y: h });
      points.push({ x: 0, y: h * 0.6 });
      points.push({ x: w * 0.2, y: h * 0.6 });
      points.push({ x: w * 0.2, y: h * 0.4 });
      points.push({ x: 0, y: h * 0.4 });
      break;
    }
    case "tag": {
      points.push({ x: 10, y: 10 });
      points.push({ x: w - 50, y: 10 });
      points.push({ x: w - 10, y: h * 0.5 });
      points.push({ x: w - 50, y: h - 10 });
      points.push({ x: 10, y: h - 10 });
      break;
    }
    case "drop": {
      points.push({ x: w / 2, y: 10 });
      points.push({ x: w * 0.7, y: h * 0.3 });
      points.push({ x: w * 0.6, y: h * 0.7 });
      points.push({ x: w * 0.4, y: h * 0.7 });
      points.push({ x: w * 0.3, y: h * 0.3 });
      break;
    }
    case "diamond": {
      points.push({ x: w * 0.5, y: 0 });
      points.push({ x: w, y: h * 0.5 });
      points.push({ x: w * 0.5, y: h });
      points.push({ x: 0, y: h * 0.5 });
      break;
    }
    case "star10": {
      const outer = 0.4 * Math.min(w, h);
      const inner = 0.2 * Math.min(w, h);
      points = createStar(10, w / 2, h / 2, outer, inner);
      break;
    }
    default:
      break;
  }
  updateUI();
}

// Создание/обновление точек в DOM
function updateUI() {
  // Удаляем старые точки
  const oldPoints = document.querySelectorAll(".point");
  oldPoints.forEach((p) => p.remove());
  // Добавляем новые точки
  points.forEach((pt, index) => {
    const pointEl = document.createElement("div");
    pointEl.className = "point";
    pointEl.style.left = pt.x + "px";
    pointEl.style.top = pt.y + "px";
    // Номер точки
    const labelEl = document.createElement("div");
    labelEl.className = "point-label";
    labelEl.innerText = index + 1;
    pointEl.appendChild(labelEl);
    // Обработчик события для выбора точки
    pointEl.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectedPoint = index;
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      updateCoordInputs();
    });
    imageArea.appendChild(pointEl);
  });
  updateClipPath();
  updateCoordInputs();
}

// Движение точки
imageArea.addEventListener("mousemove", (e) => {
  if (!isDragging || selectedPoint < 0) return;
  const rect = imageArea.getBoundingClientRect();
  const x = e.clientX - rect.left - offsetX;
  const y = e.clientY - rect.top - offsetY;
  points[selectedPoint].x = x;
  points[selectedPoint].y = y;
  updateUI();
});
imageArea.addEventListener("mouseup", () => {
  isDragging = false;
});
imageArea.addEventListener("mouseleave", () => {
  isDragging = false;
});

// Обновление clip-path и фильтра
function updateClipPath() {
  const polygonStr = points.map((pt) => pt.x + "px " + pt.y + "px").join(", ");
  if (points.length > 2) {
    mainImage.style.clipPath = `polygon(${polygonStr})`;
  } else {
    mainImage.style.clipPath = "none";
  }
  const filterVal =
    filterCustom.value.trim() || filterSelect.value.trim() || "none";
  mainImage.style.filter = filterVal;
  let cssCode = `/* CSS */\n`;
  cssCode += `clip-path: polygon(${polygonStr});\n`;
  if (filterVal && filterVal !== "none") {
    cssCode += `filter: ${filterVal};\n`;
  }
  outputCss.value = cssCode;
}

// Изменение фильтра
filterSelect.addEventListener("change", updateClipPath);
filterCustom.addEventListener("input", updateClipPath);

// Обновление координат выбранной точки
function updateCoordInputs() {
  if (selectedPoint >= 0 && points[selectedPoint]) {
    coordXInput.value = Math.round(points[selectedPoint].x);
    coordYInput.value = Math.round(points[selectedPoint].y);
    selectedPointIndexEl.textContent = selectedPoint + 1;
  } else {
    coordXInput.value = 0;
    coordYInput.value = 0;
    selectedPointIndexEl.textContent = "-";
  }
}
coordXInput.addEventListener("change", () => {
  if (selectedPoint >= 0 && points[selectedPoint]) {
    points[selectedPoint].x = parseInt(coordXInput.value, 10);
    updateUI();
  }
});
coordYInput.addEventListener("change", () => {
  if (selectedPoint >= 0 && points[selectedPoint]) {
    points[selectedPoint].y = parseInt(coordYInput.value, 10);
    updateUI();
  }
});

// Добавление и удаление точек
const addPointBtn = document.getElementById("addPointBtn");
const removePointBtn = document.getElementById("removePointBtn");

addPointBtn.addEventListener("click", () => {
  const width = imageArea.clientWidth;
  const height = imageArea.clientHeight;
  let x = width / 2;
  let y = height / 2;
  if (selectedPoint >= 0) {
    x = points[selectedPoint].x + 10;
    y = points[selectedPoint].y + 10;
  }
  points.push({ x, y });
  selectedPoint = points.length - 1;
  updateUI();
});

removePointBtn.addEventListener("click", () => {
  if (selectedPoint >= 0 && points[selectedPoint]) {
    points.splice(selectedPoint, 1);
    if (selectedPoint >= points.length) {
      selectedPoint = points.length - 1;
    }
    updateUI();
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");

  // Функция для обновления иконок пресетов в зависимости от темы
  function updatePresetIcons(theme) {
    document.querySelectorAll(".presets img").forEach((img) => {
      const lightSrc = img.getAttribute("data-light");
      const darkSrc = img.getAttribute("data-dark");
      if (theme === "dark" && darkSrc) {
        img.src = darkSrc;
      } else if (lightSrc) {
        img.src = lightSrc;
      }
    });
  }

  // Проверка сохранённой темы (по умолчанию "light")
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️";
    updatePresetIcons("dark");
  } else {
    document.body.classList.remove("dark-theme");
    themeToggle.textContent = "🌙";
    updatePresetIcons("light");
  }

  // Обработчик переключения темы
  themeToggle.addEventListener("click", () => {
    if (document.body.classList.contains("dark-theme")) {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "🌙";
      updatePresetIcons("light");
    } else {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "☀️";
      updatePresetIcons("dark");
    }
  });
});
