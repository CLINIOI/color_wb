const faqBtn = document.getElementById("faqBtn");
// FAQ: открытие модального окна
faqBtn.addEventListener("click", () => {
  $("#faqModal").modal("show");
});

// -------------------------------------------------------------------------

// ФУНКЦИИ КОНВЕРТАЦИИ ЦВЕТОВ
// -------------------------------------------------------------------------
function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    // Укороченный формат (#abc -> #aabbcc)
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
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

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x) => {
    const hexVal = Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
    return hexVal;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

// -------------------------------------------------------------------------
// ОСНОВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ ОТТЕНКОВ
// -------------------------------------------------------------------------
function updateShades() {
  const baseHex = document.getElementById("colorInput").value;
  const rows = parseInt(document.getElementById("rowsInput").value, 10);
  const cols = parseInt(document.getElementById("colsInput").value, 10);
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);

  // Обновляем поля с информацией о базовом цвете
  document.getElementById("hexOutput").value = baseHex;
  document.getElementById("rgbOutput").value = `rgb(${r}, ${g}, ${b})`;
  document.getElementById("hslOutput").value = `hsl(${h}°, ${s}%, ${l}%)`;

  // Определяем диапазон яркости от 10 до 90, чтобы избежать чистого черного или белого
  const MIN_L = 10;
  const MAX_L = 90;

  const shadesTable = document.getElementById("shadesTable");
  shadesTable.innerHTML = "";

  for (let i = 0; i < rows; i++) {
    const fractionRowStart = i / rows;
    const fractionRowEnd = (i + 1) / rows;
    const rowStartL = MIN_L + fractionRowStart * (MAX_L - MIN_L);
    const rowEndL = MIN_L + fractionRowEnd * (MAX_L - MIN_L);

    const tr = document.createElement("tr");

    for (let j = 0; j < cols; j++) {
      const fractionCol = cols > 1 ? j / (cols - 1) : 0;
      const cellL = rowStartL + fractionCol * (rowEndL - rowStartL);
      const cellHex = hslToHex(h, s, cellL);

      const td = document.createElement("td");
      td.style.backgroundColor = cellHex;

      // Вычисляем параметры цвета для ячейки
      const { r: cellR, g: cellG, b: cellB } = hexToRgb(cellHex);
      const {
        h: cellH,
        s: cellS,
        l: cellLComputed,
      } = rgbToHsl(cellR, cellG, cellB);

      // Создаем элемент с информацией (HEX, RGB, HSL)
      const cellInfo = document.createElement("div");
      cellInfo.className = "cell-info";
      cellInfo.innerHTML = `
          ${cellHex}<br>
          rgb(${cellR}, ${cellG}, ${cellB})<br>
          hsl(${cellH}°, ${cellS}%, ${cellLComputed}%)
        `;
      td.appendChild(cellInfo);
      tr.appendChild(td);
    }
    shadesTable.appendChild(tr);
  }
}

// Генерация оттенков при загрузке страницы
window.addEventListener("DOMContentLoaded", updateShades);

// ФУНКЦИИ КОНВЕРТАЦИИ ЦВЕТОВ
function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    // Преобразуем укороченный формат (#abc -> #aabbcc)
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = 0;
    s = 0;
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

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

// Функция для прикрепления обработчика клика к плитке (td)
function attachTileClickHandler(
  td,
  cellHex,
  cellR,
  cellG,
  cellB,
  cellH,
  cellS,
  cellLComputed
) {
  td.addEventListener("click", function () {
    const selectedTileInfo = document.getElementById("selectedTileInfo");
    selectedTileInfo.innerHTML = `
      
        <p><strong>HEX:</strong> ${cellHex}</p>
        <p><strong>RGB:</strong> rgb(${cellR}, ${cellG}, ${cellB})</p>
        <p><strong>HSL:</strong> hsl(${cellH}°, ${cellS}%, ${cellLComputed}%)</p>
      `;
  });
}

// Основная функция генерации оттенков и создания плиток
function updateShades() {
  const baseHex = document.getElementById("colorInput").value;
  const rows = parseInt(document.getElementById("rowsInput").value, 10);
  const cols = parseInt(document.getElementById("colsInput").value, 10);
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);

  // Обновляем поля с информацией о базовом цвете
  document.getElementById("hexOutput").value = baseHex;
  document.getElementById("rgbOutput").value = `rgb(${r}, ${g}, ${b})`;
  document.getElementById("hslOutput").value = `hsl(${h}°, ${s}%, ${l}%)`;

  // Задаем диапазон яркости для оттенков
  const MIN_L = 10;
  const MAX_L = 90;

  const shadesTable = document.getElementById("shadesTable");
  shadesTable.innerHTML = "";

  for (let i = 0; i < rows; i++) {
    const fractionRowStart = i / rows;
    const fractionRowEnd = (i + 1) / rows;
    const rowStartL = MIN_L + fractionRowStart * (MAX_L - MIN_L);
    const rowEndL = MIN_L + fractionRowEnd * (MAX_L - MIN_L);
    const tr = document.createElement("tr");

    for (let j = 0; j < cols; j++) {
      const fractionCol = cols > 1 ? j / (cols - 1) : 0;
      const cellL = rowStartL + fractionCol * (rowEndL - rowStartL);
      const cellHex = hslToHex(h, s, cellL);
      const td = document.createElement("td");
      td.style.backgroundColor = cellHex;

      // Вычисляем информацию для данной плитки
      const { r: cellR, g: cellG, b: cellB } = hexToRgb(cellHex);
      const {
        h: cellH,
        s: cellS,
        l: cellLComputed,
      } = rgbToHsl(cellR, cellG, cellB);

      // Создаем элемент с информацией внутри плитки (скрыт по умолчанию)
      const cellInfo = document.createElement("div");
      cellInfo.className = "cell-info";
      cellInfo.innerHTML = `
          ${cellHex}<br>
          rgb(${cellR}, ${cellG}, ${cellB})<br>
          hsl(${cellH}°, ${cellS}%, ${cellLComputed}%)
        `;
      td.appendChild(cellInfo);

      // Прикрепляем обработчик клика для обновления блока с информацией
      attachTileClickHandler(
        td,
        cellHex,
        cellR,
        cellG,
        cellB,
        cellH,
        cellS,
        cellLComputed
      );

      tr.appendChild(td);
    }
    shadesTable.appendChild(tr);
  }
}

// Генерация оттенков при загрузке страницы и при изменении параметров
window.addEventListener("DOMContentLoaded", updateShades);
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
