// Получение ссылок на DOM-элементы
const fileInput = document.getElementById("file-input");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const color1Input = document.getElementById("color1");
const color2Input = document.getElementById("color2");
const swapColorsBtn = document.getElementById("swapColors");

const thresholdRange = document.getElementById("threshold");
const thresholdValue = document.getElementById("thresholdValue");
const saveBtn = document.getElementById("saveBtn");

// Для хранения загруженного изображения и размеров canvas
let originalImage = new Image();
let canvasWidth = 800;
let canvasHeight = 600;
const faqBtn = document.getElementById("faqBtn");
// FAQ: открытие модального окна
faqBtn.addEventListener("click", () => {
  $("#faqModal").modal("show");
});
// Обновление значения слайдера и применение эффекта при изменении порога
thresholdRange.addEventListener("input", () => {
  thresholdValue.textContent = thresholdRange.value;
  applyTwoColorEffect();
});

// При изменении цветов сразу перерисовываем эффект
color1Input.addEventListener("input", applyTwoColorEffect);
color2Input.addEventListener("input", applyTwoColorEffect);

// Загрузка изображения с помощью file input
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    originalImage = new Image();
    originalImage.onload = () => {
      // Устанавливаем размеры canvas согласно изображению
      canvasWidth = originalImage.width;
      canvasHeight = originalImage.height;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Рисуем изображение и применяем эффект
      ctx.drawImage(originalImage, 0, 0);
      applyTwoColorEffect();
    };
    originalImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Функция перевода HEX в RGB
function hexToRgb(hex) {
  // Преобразование короткого формата (#abc) в полный (#aabbcc)
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Функция применения эффекта двухцветного трафарета
function applyTwoColorEffect() {
  if (!originalImage.src) return;

  // Сначала отрисовываем оригинальное изображение
  ctx.drawImage(originalImage, 0, 0, canvasWidth, canvasHeight);
  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imageData.data;

  const threshold = parseInt(thresholdRange.value);
  const color1 = hexToRgb(color1Input.value);
  const color2 = hexToRgb(color2Input.value);

  // Проходим по всем пикселям
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Вычисляем яркость (grayscale) с использованием стандартной формулы
    const grayscale = 0.299 * r + 0.587 * g + 0.114 * b;

    // Если яркость меньше порога, устанавливаем цвет1, иначе цвет2
    if (grayscale < threshold) {
      data[i] = color1.r;
      data[i + 1] = color1.g;
      data[i + 2] = color1.b;
    } else {
      data[i] = color2.r;
      data[i + 1] = color2.g;
      data[i + 2] = color2.b;
    }
  }
  // Обновляем canvas с изменёнными данными
  ctx.putImageData(imageData, 0, 0);
}

// Смена местами цветов
swapColorsBtn.addEventListener("click", () => {
  const tmp = color1Input.value;
  color1Input.value = color2Input.value;
  color2Input.value = tmp;
  applyTwoColorEffect();
});

// Сохранение изображения
saveBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "two_color_stencil.png";
  link.href = canvas.toDataURL();
  link.click();
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

  // Загружаем стартовое фото в canvas
  const startingImg = document.querySelector("#canvas-container img");
  if (startingImg) {
    originalImage = new Image();
    originalImage.onload = () => {
      canvasWidth = originalImage.width;
      canvasHeight = originalImage.height;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      // Рисуем изображение на canvas и применяем эффект
      ctx.drawImage(originalImage, 0, 0, canvasWidth, canvasHeight);
      applyTwoColorEffect();
    };
    originalImage.src = startingImg.src;
    // Скрываем стартовое фото
    startingImg.style.display = "none";
  }
});

// При загрузке фото пользователя – тоже скрываем стартовое изображение, если оно ещё есть
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    originalImage = new Image();
    originalImage.onload = () => {
      canvasWidth = originalImage.width;
      canvasHeight = originalImage.height;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.drawImage(originalImage, 0, 0, canvasWidth, canvasHeight);
      applyTwoColorEffect();
    };
    originalImage.src = event.target.result;
  };
  reader.readAsDataURL(file);

  // Если элемент стартового фото существует, скрываем его
  const startingImg = document.querySelector("#canvas-container img");
  if (startingImg) {
    startingImg.style.display = "none";
  }
});
