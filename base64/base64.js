// ========================
// Функциональность переключения темы
// ========================

// ========================
// Функциональность конвертера изображений в Base64
// ========================
const imageInput = document.getElementById("imageInput");
const base64Output = document.getElementById("base64Output");
const previewImg = document.getElementById("previewImg");
const imageDetails = document.getElementById("imageDetails");
const bgCheckbox = document.getElementById("bgCheckbox");
const copyBtn = document.getElementById("copyBtn");

let base64Data = ""; // Хранит Base64-строку
const faqBtn = document.getElementById("faqBtn");
// FAQ: открытие модального окна
faqBtn.addEventListener("click", () => {
  $("#faqModal").modal("show");
});
// При выборе файла
imageInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  // Предпросмотр изображения
  const reader = new FileReader();
  reader.onload = function (e) {
    previewImg.src = e.target.result;
    previewImg.style.display = "block";
  };
  reader.readAsDataURL(file);

  // Чтение файла и получение Base64-данных
  const base64Reader = new FileReader();
  base64Reader.onload = function (evt) {
    base64Data = evt.target.result; // Пример: "data:image/jpeg;base64,..."
    updateOutput();

    // Расчёт размеров
    const originalSizeKB = (file.size / 1024).toFixed(2);
    const base64WithoutPrefix = base64Data.split(",")[1] || "";
    const base64SizeBytes = base64WithoutPrefix.length * 0.75;
    const base64SizeKB = (base64SizeBytes / 1024).toFixed(2);

    // Вывод информации о файле
    imageDetails.style.display = "block";
    imageDetails.innerHTML = `
      <strong>Имя:</strong> ${file.name} <br>
      <strong>Исходный размер:</strong> ${originalSizeKB} КБ <br>
      <strong>Полученный размер:</strong> ${base64SizeKB} КБ <br>
      <strong>Тип:</strong> ${file.type}
    `;
  };
  base64Reader.readAsDataURL(file);
});

// Функция обновления содержимого окна с кодом
function updateOutput() {
  if (bgCheckbox.checked && base64Data) {
    base64Output.value = `background-image: url("${base64Data}");`;
  } else {
    base64Output.value = base64Data;
  }
}

// При переключении галочки обновляем содержимое
bgCheckbox.addEventListener("change", updateOutput);

// Кнопка копирования кода
copyBtn.addEventListener("click", function () {
  base64Output.select();
  base64Output.setSelectionRange(0, 99999);
  document.execCommand("copy");
  alert("Код скопирован в буфер обмена!");
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
