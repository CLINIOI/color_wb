// Словарь вариантов конвертации для каждого формата файла
const conversionOptions = {
  // Документы
  doc: ["docx", "pdf", "txt"],
  docx: ["doc", "pdf", "txt"],
  pdf: ["doc", "docx", "txt"],
  txt: ["doc", "docx", "pdf"],
  ppt: ["pptx", "pdf"],
  pptx: ["ppt", "pdf"],
  xls: ["xlsx", "csv", "pdf"],
  xlsx: ["xls", "csv", "pdf"],
  csv: ["xls", "xlsx"],
  // Изображения
  jpg: ["png", "webp", "gif", "bmp", "tiff"],
  jpeg: ["png", "webp", "gif", "bmp", "tiff"],
  png: ["jpg", "webp", "gif", "bmp", "tiff"],
  webp: ["jpg", "png", "gif", "bmp", "tiff"],
  gif: ["jpg", "png", "webp", "bmp", "tiff"],
  bmp: ["jpg", "png", "webp", "gif", "tiff"],
  tiff: ["jpg", "png", "webp", "gif", "bmp"],
  // Аудио
  mp3: ["wav", "ogg", "aac", "flac"],
  wav: ["mp3", "ogg", "aac", "flac"],
  ogg: ["mp3", "wav", "aac", "flac"],
  aac: ["mp3", "wav", "ogg", "flac"],
  flac: ["mp3", "wav", "ogg", "aac"],
  // Видео
  mp4: ["avi", "mkv", "mov", "wmv"],
  avi: ["mp4", "mkv", "mov", "wmv"],
  mkv: ["mp4", "avi", "mov", "wmv"],
  mov: ["mp4", "avi", "mkv", "wmv"],
  wmv: ["mp4", "avi", "mkv", "mov"],
  // Архивы
  zip: ["rar", "7z", "tar", "gz"],
  rar: ["zip", "7z", "tar", "gz"],
  "7z": ["zip", "rar", "tar", "gz"],
  tar: ["zip", "rar", "7z", "gz"],
  gz: ["zip", "rar", "7z", "tar"],
  // Код и электронные книги
  html: ["pdf", "txt"],
  json: ["xml", "csv"],
  xml: ["json", "csv"],
  epub: ["pdf", "mobi"],
  mobi: ["pdf", "epub"],
};

// Получение элементов страницы
const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileElem");
const fileSelectBtn = document.getElementById("fileSelect");
const fileList = document.getElementById("fileList");

// Функция предотвращения стандартного поведения (drag & drop)
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Прикрепляем обработчики для drag and drop событий
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

// Добавляем/удаляем класс hover при перетаскивании файлов
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(
    eventName,
    () => dropArea.classList.add("hover"),
    false
  );
});
["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(
    eventName,
    () => dropArea.classList.remove("hover"),
    false
  );
});

// Обработка события drop
dropArea.addEventListener("drop", handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

// При клике на кнопку выбора файлов открываем input
fileSelectBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => handleFiles(fileInput.files));

// Обработка массива загруженных файлов
function handleFiles(files) {
  const filesArr = [...files]; // Преобразуем FileList в массив
  filesArr.forEach((file) => processFile(file));
}

// Функция обработки отдельного файла
function processFile(file) {
  const fileEntry = document.createElement("div");
  fileEntry.classList.add("file-entry");

  // Отображение информации о файле
  const fileInfo = document.createElement("p");
  fileInfo.innerHTML = `<strong>Имя файла:</strong> ${file.name} <br>
                          <strong>Размер:</strong> ${Math.round(
                            file.size / 1024
                          )} КБ <br>
                          <strong>Тип:</strong> ${file.type || "Не определён"}`;
  fileEntry.appendChild(fileInfo);

  // Определяем расширение файла
  const ext = file.name.split(".").pop().toLowerCase();
  const availableConversions = conversionOptions[ext] || [];

  // Если конвертация доступна
  if (availableConversions.length > 0) {
    const formatInfo = document.createElement("p");
    formatInfo.innerHTML = `<strong>Доступные форматы конвертации:</strong> `;
    // Создаем выпадающий список с вариантами конвертации
    const select = document.createElement("select");
    availableConversions.forEach((format) => {
      const option = document.createElement("option");
      option.value = format;
      option.textContent = format.toUpperCase();
      select.appendChild(option);
    });
    formatInfo.appendChild(select);
    fileEntry.appendChild(formatInfo);

    // Кнопка для запуска конвертации
    const convertBtn = document.createElement("button");
    convertBtn.textContent = "Конвертировать";
    convertBtn.classList.add("btn", "btn-sm", "btn-secondary", "mt-1");
    fileEntry.appendChild(convertBtn);

    // Контейнер для ссылки скачивания результата
    const downloadDiv = document.createElement("div");
    fileEntry.appendChild(downloadDiv);

    convertBtn.addEventListener("click", () => {
      const targetFormat = select.value;
      simulateConversion(file, ext, targetFormat, downloadDiv);
    });
  } else {
    const formatInfo = document.createElement("p");
    formatInfo.innerHTML = `<strong>Конвертация не поддерживается для данного формата.</strong>`;
    fileEntry.appendChild(formatInfo);
  }
  fileList.appendChild(fileEntry);
}

// Функция имитации процесса конвертации файла
function simulateConversion(file, sourceExt, targetFormat, downloadDiv) {
  downloadDiv.innerHTML = `<em>Конвертация...</em>`;
  // Задержка 1 секунда для имитации обработки
  setTimeout(() => {
    // Генерация нового имени файла с новым расширением
    const newFileName = file.name.replace(
      new RegExp(sourceExt + "$", "i"),
      targetFormat
    );
    const finalFileName =
      newFileName === file.name ? file.name + "." + targetFormat : newFileName;

    // Создаем ссылку для скачивания (имитируем конвертацию тем же файлом)
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = finalFileName;
    downloadLink.textContent =
      "Скачать конвертированный файл (" + finalFileName + ")";
    downloadLink.classList.add("download-link");

    downloadDiv.innerHTML = "";
    downloadDiv.appendChild(downloadLink);
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");

  // Применение сохранённой темы при загрузке
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "Сменить тему";
  } else {
    document.body.classList.remove("dark-theme");
    themeToggle.textContent = "Сменить тему";
  }

  // Обработчик переключения темы
  themeToggle.addEventListener("click", () => {
    if (document.body.classList.contains("dark-theme")) {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "Сменить тему";
    } else {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "Сменить тему";
    }
  });
});
