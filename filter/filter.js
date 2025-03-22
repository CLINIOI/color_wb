// =========================
// Тема (светлая/тёмная)
// =========================

// При загрузке проверяем сохранённую тему в localStorage
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

// =========================
// Фильтры
// =========================

// Получаем элементы слайдеров
const grayscaleRange = document.getElementById("grayscaleRange");
const sepiaRange = document.getElementById("sepiaRange");
const blurRange = document.getElementById("blurRange");
const brightnessRange = document.getElementById("brightnessRange");
const hueRange = document.getElementById("hueRange");
const saturateRange = document.getElementById("saturateRange");
const contrastRange = document.getElementById("contrastRange");
const invertRange = document.getElementById("invertRange");

// Получаем элементы для отображения числовых значений
const grayscaleValue = document.getElementById("grayscaleValue");
const sepiaValue = document.getElementById("sepiaValue");
const blurValue = document.getElementById("blurValue");
const brightnessValue = document.getElementById("brightnessValue");
const hueValue = document.getElementById("hueValue");
const saturateValue = document.getElementById("saturateValue");
const contrastValue = document.getElementById("contrastValue");
const invertValue = document.getElementById("invertValue");

// Изображения (оригинал и превью)
const originalImage = document.getElementById("originalImage");
const previewImage = document.getElementById("previewImage");

// Текстовое поле с итоговым CSS
const filterCSSTextarea = document.getElementById("filterCSS");
const faqBtn = document.getElementById("faqBtn");

// FAQ: открытие модального окна (если используется Bootstrap)
faqBtn.addEventListener("click", () => {
  $("#faqModal").modal("show");
});

// Функция для обновления фильтров
function updateFilters() {
  const grayscale = grayscaleRange.value;
  const sepia = sepiaRange.value;
  const blur = blurRange.value;
  const brightness = brightnessRange.value;
  const hue = hueRange.value;
  const saturate = saturateRange.value;
  const contrast = contrastRange.value;
  const invert = invertRange.value;

  // Обновляем текст рядом со слайдерами
  grayscaleValue.textContent = grayscale + "%";
  sepiaValue.textContent = sepia + "%";
  blurValue.textContent = blur + "px";
  brightnessValue.textContent = brightness + "%";
  hueValue.textContent = hue + "deg";
  saturateValue.textContent = saturate + "%";
  contrastValue.textContent = contrast + "%";
  invertValue.textContent = invert + "%";

  // Формируем строку фильтра
  const filterString = `
    grayscale(${grayscale}%)
    sepia(${sepia}%)
    blur(${blur}px)
    brightness(${brightness}%)
    hue-rotate(${hue}deg)
    saturate(${saturate}%)
    contrast(${contrast}%)
    invert(${invert}%)
  `
    .replace(/\s+/g, " ")
    .trim();

  // Применяем фильтр к отфильтрованному изображению
  previewImage.style.filter = filterString;

  // Записываем итоговый CSS в <textarea>
  filterCSSTextarea.value = `filter: ${filterString};`;
}

// Навешиваем слушатели на все слайдеры
[
  grayscaleRange,
  sepiaRange,
  blurRange,
  brightnessRange,
  hueRange,
  saturateRange,
  contrastRange,
  invertRange,
].forEach((range) => {
  range.addEventListener("input", updateFilters);
});

// Инициализируем начальное состояние
updateFilters();

// =========================
// Пресеты фильтров (словарь)
// =========================
const presets = {
  Стандарт: {
    grayscale: 0,
    sepia: 0,
    blur: 0,
    brightness: 100,
    hue: 0,
    saturate: 100,
    contrast: 100,
    invert: 0,
  },
  Сепия: {
    grayscale: 0,
    sepia: 100,
    blur: 0,
    brightness: 100,
    hue: 0,
    saturate: 100,
    contrast: 100,
    invert: 0,
  },
  "Черно-белый": {
    grayscale: 100,
    sepia: 0,
    blur: 0,
    brightness: 100,
    hue: 0,
    saturate: 100,
    contrast: 100,
    invert: 0,
  },
  Яркий: {
    grayscale: 0,
    sepia: 0,
    blur: 0,
    brightness: 150,
    hue: 0,
    saturate: 100,
    contrast: 120,
    invert: 0,
  },
  Мягкий: {
    grayscale: 0,
    sepia: 0,
    blur: 2,
    brightness: 120,
    hue: 0,
    saturate: 100,
    contrast: 90,
    invert: 0,
  },
  Ночной: {
    grayscale: 50,
    sepia: 20,
    blur: 1,
    brightness: 80,
    hue: 180,
    saturate: 150,
    contrast: 110,
    invert: 0,
  },
  Холодный: {
    grayscale: 0,
    sepia: 0,
    blur: 0,
    brightness: 100,
    hue: 240,
    saturate: 80,
    contrast: 90,
    invert: 0,
  },
  Тёплый: {
    grayscale: 0,
    sepia: 30,
    blur: 0,
    brightness: 110,
    hue: 30,
    saturate: 120,
    contrast: 105,
    invert: 0,
  },
  Ретро: {
    grayscale: 20,
    sepia: 50,
    blur: 0,
    brightness: 90,
    hue: 0,
    saturate: 110,
    contrast: 100,
    invert: 0,
  },
  Кинематограф: {
    grayscale: 0,
    sepia: 20,
    blur: 0,
    brightness: 100,
    hue: 15,
    saturate: 130,
    contrast: 115,
    invert: 0,
  },
  "Светлая дымка": {
    grayscale: 10,
    sepia: 10,
    blur: 5,
    brightness: 120,
    hue: 0,
    saturate: 80,
    contrast: 95,
    invert: 0,
  },
  Монохром: {
    grayscale: 100,
    sepia: 0,
    blur: 0,
    brightness: 100,
    hue: 0,
    saturate: 100,
    contrast: 100,
    invert: 0,
  },
  Глянцевый: {
    grayscale: 0,
    sepia: 0,
    blur: 0,
    brightness: 130,
    hue: 0,
    saturate: 150,
    contrast: 120,
    invert: 0,
  },
  Винтаж: {
    grayscale: 20,
    sepia: 70,
    blur: 1,
    brightness: 85,
    hue: 0,
    saturate: 90,
    contrast: 95,
    invert: 0,
  },
  Пастель: {
    grayscale: 0,
    sepia: 20,
    blur: 0,
    brightness: 110,
    hue: 0,
    saturate: 70,
    contrast: 90,
    invert: 0,
  },
  Суровый: {
    grayscale: 0,
    sepia: 0,
    blur: 0,
    brightness: 90,
    hue: 0,
    saturate: 100,
    contrast: 130,
    invert: 0,
  },
  "Эффект кино": {
    grayscale: 0,
    sepia: 20,
    blur: 0,
    brightness: 105,
    hue: 0,
    saturate: 125,
    contrast: 115,
    invert: 0,
  },
  Сияние: {
    grayscale: 0,
    sepia: 0,
    blur: 0,
    brightness: 140,
    hue: 0,
    saturate: 140,
    contrast: 110,
    invert: 0,
  },
  Туман: {
    grayscale: 0,
    sepia: 0,
    blur: 10,
    brightness: 80,
    hue: 0,
    saturate: 100,
    contrast: 100,
    invert: 0,
  },
  Акварель: {
    grayscale: 20,
    sepia: 10,
    blur: 2,
    brightness: 105,
    hue: 0,
    saturate: 150,
    contrast: 85,
    invert: 0,
  },
};

// Функция для применения выбранного пресета
function applyPreset(presetName) {
  const preset = presets[presetName];
  if (!preset) return;

  grayscaleRange.value = preset.grayscale;
  sepiaRange.value = preset.sepia;
  blurRange.value = preset.blur;
  brightnessRange.value = preset.brightness;
  hueRange.value = preset.hue;
  saturateRange.value = preset.saturate;
  contrastRange.value = preset.contrast;
  invertRange.value = preset.invert;

  updateFilters();
}

// =========================
// Кнопки управления
// =========================

// Кнопка "Загрузить фотографию"
const uploadPhotoButton = document.getElementById("uploadPhoto");
uploadPhotoButton.addEventListener("click", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        originalImage.src = event.target.result;
        previewImage.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
  fileInput.click();
});

// Кнопка "Сохранить фотографию" (пример)
const savePhotoButton = document.getElementById("savePhoto");
savePhotoButton.addEventListener("click", () => {
  alert(
    "Здесь может быть логика сохранения изображения на сервер или скачивания."
  );
});

// Кнопка "Добавить в буфер CSS"
const copyCSSButton = document.getElementById("copyCSS");
copyCSSButton.addEventListener("click", () => {
  navigator.clipboard
    .writeText(filterCSSTextarea.value)
    .then(() => alert("CSS-код успешно скопирован!"))
    .catch((err) => console.error("Ошибка копирования:", err));
});
