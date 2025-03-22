const faqBtn = document.getElementById("faqBtn");
// FAQ: открытие модального окна
faqBtn.addEventListener("click", () => {
  $("#faqModal").modal("show");
});
// Инициализация QRCodeStyling
let qrCode = new QRCodeStyling({
  width: 300,
  height: 300,
  data: "https://example.com",
  margin: 0,
  qrOptions: {
    errorCorrectionLevel: "Q",
  },
  dotsOptions: {
    type: "square",
    color: "#000000",
  },
  cornersSquareOptions: {
    type: "square",
    color: "#000000",
  },
  cornersDotOptions: {
    type: "dot",
    color: "#000000",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 10,
    imageSize: 0.2,
    hideBackgroundDots: false,
  },
});
qrCode.append(document.getElementById("qrCode"));

// Функция обрезки прозрачных полей вокруг изображения
function trimTransparentPixels(dataUrl) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = function () {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imageData.data;
      let top = 0,
        left = 0,
        right = canvas.width - 1,
        bottom = canvas.height - 1;
      outerTop: for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          let alpha = data[(y * canvas.width + x) * 4 + 3];
          if (alpha !== 0) {
            top = y;
            break outerTop;
          }
        }
      }
      outerBottom: for (let y = canvas.height - 1; y >= 0; y--) {
        for (let x = 0; x < canvas.width; x++) {
          let alpha = data[(y * canvas.width + x) * 4 + 3];
          if (alpha !== 0) {
            bottom = y;
            break outerBottom;
          }
        }
      }
      outerLeft: for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
          let alpha = data[(y * canvas.width + x) * 4 + 3];
          if (alpha !== 0) {
            left = x;
            break outerLeft;
          }
        }
      }
      outerRight: for (let x = canvas.width - 1; x >= 0; x--) {
        for (let y = 0; y < canvas.height; y++) {
          let alpha = data[(y * canvas.width + x) * 4 + 3];
          if (alpha !== 0) {
            right = x;
            break outerRight;
          }
        }
      }
      let trimWidth = right - left + 1;
      let trimHeight = bottom - top + 1;
      if (trimWidth <= 0 || trimHeight <= 0) {
        return resolve(dataUrl);
      }
      let trimmedCanvas = document.createElement("canvas");
      let trimmedCtx = trimmedCanvas.getContext("2d");
      trimmedCanvas.width = trimWidth;
      trimmedCanvas.height = trimHeight;
      trimmedCtx.drawImage(
        canvas,
        left,
        top,
        trimWidth,
        trimHeight,
        0,
        0,
        trimWidth,
        trimHeight
      );
      resolve(trimmedCanvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Функция для скачивания Base64-данных как файла
function downloadBase64AsFile(base64, fileName) {
  const link = document.createElement("a");
  link.href = base64;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Функция обработки логотипа (с поворотом)
function processLogoFile(file) {
  return new Promise((resolve, reject) => {
    let rotation = parseInt(document.getElementById("logoRotation").value) || 0;
    let reader = new FileReader();
    reader.onload = function (e) {
      let img = new Image();
      img.onload = function () {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        let width = img.width;
        let height = img.height;
        let radians = (rotation * Math.PI) / 180;
        let cos = Math.abs(Math.cos(radians));
        let sin = Math.abs(Math.sin(radians));
        let newWidth = Math.floor(width * cos + height * sin);
        let newHeight = Math.floor(width * sin + height * cos);
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(radians);
        ctx.drawImage(img, -width / 2, -height / 2);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Основная функция обновления QR-кода
function updateQRCode() {
  // 1. Тип содержимого и данные
  let contentType = document.getElementById("contentType").value;
  let qrData = document.getElementById("qrData").value.trim();
  let data = qrData || "https://example.com";

  // 2. Уровень коррекции ошибок
  let errorCorrection = document.getElementById("errorCorrection").value;

  // 3. Стиль точек
  let dotsType = document.getElementById("qrStyle").value;

  // 4. Настройки углов
  let cornersSquareType = document.getElementById("cornersSquareType").value;
  let cornersSquareColor = document.getElementById("cornersSquareColor").value;
  let cornersDotType = document.getElementById("cornersDotType").value;
  let cornersDotColor = document.getElementById("cornersDotColor").value;

  // 5. Цвета QR и фона
  let colorType = document.querySelector(
    'input[name="colorType"]:checked'
  ).value;
  let transparentBg = document.getElementById("transparentBg").checked;
  let dotsOptions = { type: dotsType };
  let backgroundOptions = {};
  if (transparentBg) {
    backgroundOptions.color = "rgba(0,0,0,0)";
  } else if (colorType === "solid") {
    dotsOptions.color = document.getElementById("qrColor").value;
    backgroundOptions.color = document.getElementById("bgColor").value;
  } else {
    let qrGradStart = document.getElementById("qrGradientStart").value;
    let qrGradEnd = document.getElementById("qrGradientEnd").value;
    let qrRotation =
      parseInt(document.getElementById("qrGradientRotation").value) || 0;
    let bgGradStart = document.getElementById("bgGradientStart").value;
    let bgGradEnd = document.getElementById("bgGradientEnd").value;
    let bgRotation =
      parseInt(document.getElementById("bgGradientRotation").value) || 0;
    dotsOptions.gradient = {
      type: "linear",
      rotation: qrRotation,
      colorStops: [
        { offset: 0, color: qrGradStart },
        { offset: 1, color: qrGradEnd },
      ],
    };
    backgroundOptions.gradient = {
      type: "linear",
      rotation: bgRotation,
      colorStops: [
        { offset: 0, color: bgGradStart },
        { offset: 1, color: bgGradEnd },
      ],
    };
  }

  // 6. Логотип
  let logoFile = document.getElementById("logoUpload").files[0];
  let logoScale = parseInt(document.getElementById("logoScale").value) / 100;
  let logoMargin = parseInt(document.getElementById("logoMargin").value);
  let hideBackgroundDots = document.getElementById("excavateLogo").checked;

  // 7. Дополнительные настройки
  let resolution = parseInt(document.getElementById("qrResolution").value);
  let qrMargin = parseInt(document.getElementById("qrMargin").value);

  // Собираем новые опции для QR-кода
  let newOptions = {
    width: resolution,
    height: resolution,
    data: data,
    margin: qrMargin,
    qrOptions: {
      errorCorrectionLevel: errorCorrection,
    },
    dotsOptions: dotsOptions,
    cornersSquareOptions: {
      type: cornersSquareType,
      color: cornersSquareColor,
    },
    cornersDotOptions: {
      type: cornersDotType,
      color: cornersDotColor,
    },
    backgroundOptions: backgroundOptions,
    imageOptions: {
      crossOrigin: "anonymous",
      margin: logoMargin,
      imageSize: logoScale,
      hideBackgroundDots: hideBackgroundDots,
    },
  };

  // Функция применения опций (с логотипом, если он есть)
  function applyNewOptions(logoDataURL) {
    newOptions.image = logoDataURL || "";
    qrCode.update(newOptions);

    // Подпись
    document.getElementById("qrCaptionPreview").innerText =
      document.getElementById("qrCaption").value;

    // Рамка вокруг QR-кода
    if (document.getElementById("qrFrame").checked) {
      document.getElementById("qrCode").style.border = "5px solid #000";
    } else {
      document.getElementById("qrCode").style.border = "none";
    }

    // Обновляем постоянную ссылку и HTML-код для вставки
    qrCode.getRawData("png").then((dataUrl) => {
      document.getElementById("permanentLink").value = dataUrl;
      document.getElementById(
        "embedCode"
      ).value = `<a href="${dataUrl}" target="_blank"><img src="${dataUrl}" alt="QR code" /></a>`;
    });
  }

  // Если логотип загружен, обрабатываем его
  if (logoFile) {
    processLogoFile(logoFile)
      .then((processedDataURL) => {
        applyNewOptions(processedDataURL);
      })
      .catch((err) => {
        console.error("Ошибка обработки логотипа:", err);
        applyNewOptions("");
      });
  } else {
    applyNewOptions("");
  }
}

// События обновления формы
document.getElementById("qrForm").addEventListener("input", updateQRCode);
document.getElementById("qrForm").addEventListener("change", updateQRCode);

// Переключение между однотонным и градиентным режимом
document.querySelectorAll('input[name="colorType"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    if (this.value === "gradient") {
      document.getElementById("solidColors").style.display = "none";
      document.getElementById("gradientColors").style.display = "block";
    } else {
      document.getElementById("solidColors").style.display = "block";
      document.getElementById("gradientColors").style.display = "none";
    }
  });
});

// Отображение значений range-полей
document.getElementById("logoScale").addEventListener("input", function () {
  document.getElementById("logoScaleValue").innerText = this.value + "%";
});
document.getElementById("logoMargin").addEventListener("input", function () {
  document.getElementById("logoMarginValue").innerText = this.value + "px";
});
document.getElementById("qrMargin").addEventListener("input", function () {
  document.getElementById("qrMarginValue").innerText = this.value + "px";
});
document.getElementById("logoRotation").addEventListener("input", function () {
  document.getElementById("logoRotationValue").innerText = this.value + "°";
});

// Кнопка "Генерировать QR-код"
document.getElementById("generateBtn").addEventListener("click", updateQRCode);

// Кнопка "Сброс настроек"
document.getElementById("resetBtn").addEventListener("click", function () {
  document.getElementById("qrForm").reset();
  document.getElementById("solidColors").style.display = "block";
  document.getElementById("gradientColors").style.display = "none";
  document.getElementById("logoScaleValue").innerText = "20%";
  document.getElementById("logoMarginValue").innerText = "10px";
  document.getElementById("qrMarginValue").innerText = "0px";
  document.getElementById("logoRotationValue").innerText = "0°";
  qrCode.update({
    width: 300,
    height: 300,
    data: "https://example.com",
    margin: 0,
    qrOptions: { errorCorrectionLevel: "Q" },
    dotsOptions: { type: "square", color: "#000000" },
    cornersSquareOptions: { type: "square", color: "#000000" },
    cornersDotOptions: { type: "dot", color: "#000000" },
    backgroundOptions: { color: "#ffffff" },
    image: "",
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 10,
      imageSize: 0.2,
      hideBackgroundDots: false,
    },
  });
  document.getElementById("qrCaptionPreview").innerText = "";
  document.getElementById("qrCode").style.border = "none";
  document.getElementById("permanentLink").value = "";
  document.getElementById("embedCode").value = "";
});

// Кнопка "Скачать"
document.getElementById("downloadBtn").addEventListener("click", function () {
  let format = document.getElementById("downloadFormat").value;
  let trimBg = document.getElementById("trimBackground").checked;
  if (format === "pdf") {
    qrCode.getRawData("png").then((dataUrl) => {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [qrCode.options.width, qrCode.options.height],
      });
      pdf.addImage(
        dataUrl,
        "PNG",
        0,
        0,
        qrCode.options.width,
        qrCode.options.height
      );
      pdf.save("qr-code.pdf");
    });
  } else if (format === "png") {
    if (trimBg) {
      qrCode.getRawData("png").then((dataUrl) => {
        trimTransparentPixels(dataUrl).then((trimmedDataUrl) => {
          downloadBase64AsFile(trimmedDataUrl, "qr-code.png");
        });
      });
    } else {
      qrCode.download({ name: "qr-code", extension: "png" });
    }
  } else {
    qrCode.download({ name: "qr-code", extension: format });
  }
});

// Кнопка "Копировать в буфер"
document.getElementById("copyBtn").addEventListener("click", function () {
  qrCode.getRawData("png").then((dataUrl) => {
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard
          .write([item])
          .then(() => alert("QR-код скопирован в буфер обмена!"))
          .catch((err) => alert("Ошибка копирования: " + err));
      });
  });
});

// Первоначальный рендер QR-кода
updateQRCode();
