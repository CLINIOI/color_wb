// gradient.js

// -------------------------
// Глобальное состояние
// -------------------------
let colorStopCount = 0;

// -------------------------
// Получение элементов управления
// -------------------------
const gradientType = document.getElementById("gradient-type");
const linearControls = document.getElementById("linear-controls");
const radialControls = document.getElementById("radial-controls");
const conicControls = document.getElementById("conic-controls");
const linearAngle = document.getElementById("linear-angle");
const linearAngleNum = document.getElementById("linear-angle-num");
const conicAngle = document.getElementById("conic-angle");
const conicAngleNum = document.getElementById("conic-angle-num");
const repeatingSelect = document.getElementById("repeating");
const addColorBtn = document.getElementById("add-color");
const colorStopsContainer = document.getElementById("color-stops");
const previewSize = document.getElementById("preview-size");
const animateToggle = document.getElementById("animate-toggle");
const gradientPreview = document.getElementById("gradient-preview");
const cssCode = document.getElementById("css-code");
const cssFormat = document.getElementById("css-format");
const copyCssBtn = document.getElementById("copy-css");
const downloadCssBtn = document.getElementById("download-css");
const downloadPngBtn = document.getElementById("download-png");
const randomGradientBtn = document.getElementById("random-gradient");
const presetGallery = document.getElementById("preset-gallery");

const radialShape = document.getElementById("radial-shape");
const faqBtn = document.getElementById("faqBtn");
// FAQ: открытие модального окна
faqBtn.addEventListener("click", () => {
  $("#faqModal").modal("show");
});
// -------------------------
// Переключение темы
// -------------------------

// -------------------------
// Обработка изменения типа градиента
// -------------------------
gradientType.addEventListener("change", () => {
  const type = gradientType.value;
  linearControls.style.display = type === "linear" ? "block" : "none";
  radialControls.style.display = type === "radial" ? "block" : "none";
  conicControls.style.display = type === "conic" ? "block" : "none";
  updateGradient();
});

// -------------------------
// Синхронизация значений для линейного градиента
// -------------------------
linearAngle.addEventListener("input", () => {
  linearAngleNum.value = linearAngle.value;
  updateGradient();
});
linearAngleNum.addEventListener("input", () => {
  linearAngle.value = linearAngleNum.value;
  updateGradient();
});

// -------------------------
// Синхронизация значений для конического градиента
// -------------------------
conicAngle.addEventListener("input", () => {
  conicAngleNum.value = conicAngle.value;
  updateGradient();
});
conicAngleNum.addEventListener("input", () => {
  conicAngle.value = conicAngleNum.value;
  updateGradient();
});

// -------------------------
// Изменение размера блока предпросмотра
// -------------------------
previewSize.addEventListener("change", () => {
  const size = previewSize.value;
  if (size === "small") {
    gradientPreview.style.height = "150px";
  } else if (size === "medium") {
    gradientPreview.style.height = "250px";
  } else {
    gradientPreview.style.height = "400px";
  }
});

// -------------------------
// Функция создания новой цветовой точки
// -------------------------
function createColorStop(
  color = "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0"),
  pos = 0
) {
  const li = document.createElement("li");
  li.className = "color-stop";
  li.draggable = true;
  li.dataset.index = colorStopCount;

  // Цветовой input
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = color;
  colorInput.addEventListener("input", updateGradient);

  // Позиция
  const posInput = document.createElement("input");
  posInput.type = "number";
  posInput.value = pos;
  posInput.min = 0;
  posInput.max = 100;
  posInput.addEventListener("input", updateGradient);

  // Кнопка удаления
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Удалить";
  deleteBtn.addEventListener("click", () => {
    li.remove();
    updateGradient();
  });

  li.appendChild(colorInput);
  li.appendChild(posInput);
  li.appendChild(deleteBtn);

  // Реализация drag and drop для сортировки
  li.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", li.dataset.index);
    li.style.opacity = "0.5";
  });
  li.addEventListener("dragend", () => {
    li.style.opacity = "1";
  });
  li.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  li.addEventListener("drop", (e) => {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData("text/plain");
    const draggedElem = document.querySelector(
      '[data-index="' + draggedIndex + '"]'
    );
    if (draggedElem && draggedElem !== li) {
      colorStopsContainer.insertBefore(draggedElem, li);
      updateGradient();
    }
  });

  colorStopsContainer.appendChild(li);
  colorStopCount++;
}

// Добавляем две базовые цветовые точки при загрузке
createColorStop("#ff0000", 0);
createColorStop("#0000ff", 100);

// -------------------------
// Добавление новой точки по клику
// -------------------------
addColorBtn.addEventListener("click", () => {
  createColorStop();
});

// -------------------------
// Функция генерации CSS-градиента
// -------------------------
function generateGradientCSS() {
  const type = gradientType.value;
  const repeating = repeatingSelect.value === "repeating" ? "repeating-" : "";
  let gradientValue = "";

  // Сортировка цветовых точек по значению позиции
  let colorStopElems = Array.from(colorStopsContainer.children);
  colorStopElems.sort((a, b) => {
    return (
      parseFloat(a.querySelector('input[type="number"]').value) -
      parseFloat(b.querySelector('input[type="number"]').value)
    );
  });
  const colorStopsArray = colorStopElems
    .map((elem) => {
      const col = elem.querySelector('input[type="color"]').value;
      const pos = elem.querySelector('input[type="number"]').value;
      return col + " " + pos + "%";
    })
    .join(", ");

  if (type === "linear") {
    const angle = linearAngle.value;
    gradientValue = `${repeating}linear-gradient(${angle}deg, ${colorStopsArray})`;
  } else if (type === "radial") {
    const shape = radialShape.value;
    gradientValue = `${repeating}radial-gradient(${shape}, ${colorStopsArray})`;
  } else if (type === "conic") {
    const angle = conicAngle.value;
    gradientValue = `${repeating}conic-gradient(from ${angle}deg, ${colorStopsArray})`;
  }
  return gradientValue;
}

// -------------------------
// Обновление предпросмотра и CSS-кода
// -------------------------
function updateGradient() {
  const gradientCSS = generateGradientCSS();
  gradientPreview.style.transition = animateToggle.checked
    ? "all 2s ease"
    : "none";
  gradientPreview.style.background = gradientCSS;

  let codeOutput = "";
  if (cssFormat.value === "short") {
    codeOutput = "background: " + gradientCSS + ";";
  } else {
    codeOutput =
      "-webkit-background: " +
      gradientCSS +
      ";\n" +
      "-moz-background: " +
      gradientCSS +
      ";\n" +
      "background: " +
      gradientCSS +
      ";";
  }
  cssCode.textContent = codeOutput;
}

// -------------------------
// События для всех input и select
// -------------------------
document.querySelectorAll("input, select").forEach((elem) => {
  elem.addEventListener("input", updateGradient);
});
updateGradient();

// -------------------------
// Копирование CSS в буфер обмена
// -------------------------
copyCssBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(cssCode.textContent).then(() => {
    alert("CSS скопирован в буфер обмена!");
  });
});

// -------------------------
// Скачивание CSS-файла
// -------------------------
downloadCssBtn.addEventListener("click", () => {
  const cssContent = cssCode.textContent;
  const blob = new Blob([cssContent], { type: "text/css" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gradient.css";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// -------------------------
// Скачивание PNG-изображения градиента
// -------------------------
downloadPngBtn.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.width = gradientPreview.clientWidth;
  canvas.height = gradientPreview.clientHeight;
  const ctx = canvas.getContext("2d");
  const gradientCSS = generateGradientCSS();

  // Создаем временный блок для рендеринга градиента
  const tempDiv = document.createElement("div");
  tempDiv.style.width = canvas.width + "px";
  tempDiv.style.height = canvas.height + "px";
  tempDiv.style.background = gradientCSS;
  document.body.appendChild(tempDiv);

  // Используем html2canvas для создания скриншота
  html2canvas(tempDiv)
    .then((canvas2) => {
      const imgURL = canvas2.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgURL;
      a.download = "gradient.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      document.body.removeChild(tempDiv);
    })
    .catch((err) => {
      alert("Ошибка при сохранении PNG");
      document.body.removeChild(tempDiv);
    });
});

// -------------------------
// Генерация случайного градиента
// -------------------------
randomGradientBtn.addEventListener("click", () => {
  // Случайный угол для линейного и конического градиентов
  if (gradientType.value === "linear") {
    const randAngle = Math.floor(Math.random() * 361);
    linearAngle.value = randAngle;
    linearAngleNum.value = randAngle;
  }
  if (gradientType.value === "conic") {
    const randAngle = Math.floor(Math.random() * 361);
    conicAngle.value = randAngle;
    conicAngleNum.value = randAngle;
  }
  // Обновление случайных цветов и позиций для каждой цветовой точки
  Array.from(colorStopsContainer.children).forEach((li) => {
    li.querySelector('input[type="color"]').value =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
    li.querySelector('input[type="number"]').value = Math.floor(
      Math.random() * 101
    );
  });
  updateGradient();
});

// -------------------------
// Обработка клика по элементам галереи пресетов
// -------------------------
presetGallery.addEventListener("click", (e) => {
  if (e.target.classList.contains("preset")) {
    const presetGradient = e.target.dataset.gradient;
    // Очищаем список цветовых точек
    colorStopsContainer.innerHTML = "";
    // Устанавливаем настройки и добавляем базовые точки в зависимости от пресета
    if (presetGradient.includes("linear-gradient")) {
      gradientType.value = "linear";
      linearControls.style.display = "block";
      radialControls.style.display = "none";
      conicControls.style.display = "none";
      linearAngle.value = 45;
      linearAngleNum.value = 45;
      createColorStop("#ff9a9e", 0);
      createColorStop("#fad0c4", 100);
    } else if (presetGradient.includes("radial-gradient")) {
      gradientType.value = "radial";
      linearControls.style.display = "none";
      radialControls.style.display = "block";
      conicControls.style.display = "none";
      radialShape.value = "circle";
      createColorStop("#a18cd1", 0);
      createColorStop("#fbc2eb", 100);
    } else if (presetGradient.includes("conic-gradient")) {
      gradientType.value = "conic";
      linearControls.style.display = "none";
      radialControls.style.display = "none";
      conicControls.style.display = "block";
      conicAngle.value = 0;
      conicAngleNum.value = 0;
      createColorStop("#ffecd2", 0);
      createColorStop("#fcb69f", 100);
    }
    updateGradient();
  }
});

// -------------------------
// Подключение html2canvas (если еще не загружена)
// -------------------------
(function () {
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  script.onload = () => {
    console.log("html2canvas загружен");
  };
  document.head.appendChild(script);
})();
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
