const $ = (s) => document.querySelector(s);

const poster = $("#poster");
const portrait = $("#portrait");
const photoFrame = $("#photoFrame");
const leftLogo = $("#leftLogo");
const rightLogo = $("#rightLogo");

const textMap = {
  collegeInput: "collegeText",
  committeeInput: "committeeText",
  nameInput: "nameText",
  roleInput: "roleText",
  batchInput: "batchText",
  departmentInput: "departmentText"
};

const photoState = { scale: 1, x: 0, y: 0 };
const defaultPhoto = "portrait.png";

function fitDomText(el, minPx = 10) {
  const max = parseFloat(getComputedStyle(el).fontSize);
  let size = max;
  el.style.fontSize = `${size}px`;
  while (el.scrollWidth > el.clientWidth && size > minPx) {
    size -= 0.35;
    el.style.fontSize = `${size}px`;
  }
}

function updateText(id, value) {
  const el = $("#" + textMap[id]);
  el.textContent = value || "";
  requestAnimationFrame(() => fitDomText(el));
}

Object.keys(textMap).forEach(id => {
  const input = $("#" + id);
  updateText(id, input.value);
  input.addEventListener("input", () => updateText(id, input.value));
});

function applyPhotoTransform() {
  portrait.style.transform =
    `translate(-50%,-50%) translate(${photoState.x}px,${photoState.y}px) scale(${photoState.scale})`;
}
function photoAction(action) {
  if (action === "zoomIn") photoState.scale = Math.min(3, photoState.scale + 0.1);
  if (action === "zoomOut") photoState.scale = Math.max(0.5, photoState.scale - 0.1);
  if (action === "left") photoState.x -= 12;
  if (action === "right") photoState.x += 12;
  if (action === "up") photoState.y -= 12;
  if (action === "down") photoState.y += 12;
  if (action === "reset") { photoState.scale = 1; photoState.x = 0; photoState.y = 0; }
  applyPhotoTransform();
}
document.querySelectorAll("[data-photo]").forEach(btn => {
  btn.addEventListener("click", () => photoAction(btn.dataset.photo));
});

function readImage(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

$("#photoUpload").addEventListener("change", e => {
  readImage(e.target.files[0], src => {
    portrait.src = src;
    photoState.scale = 1;
    photoState.x = 0;
    photoState.y = 0;
    applyPhotoTransform();
  });
});
$("#leftLogoUpload").addEventListener("change", e => {
  readImage(e.target.files[0], src => { leftLogo.src = src; });
});
$("#rightLogoUpload").addEventListener("change", e => {
  readImage(e.target.files[0], src => { rightLogo.src = src; });
});

function dataUrlFromCssBackground() {
  const bg = getComputedStyle(poster).backgroundImage;
  const match = bg.match(/url\(["']?(.*?)["']?\)/);
  return match ? match[1] : null;
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
function pct(v, total) { return v * total / 100; }

function drawTextFitted(ctx, text, box, baseFontPx, color, shadow, family = 'Georgia, "Times New Roman", serif') {
  let size = baseFontPx;
  ctx.font = `700 ${size}px ${family}`;
  while (ctx.measureText(text).width > box.w && size > 11) {
    size -= 0.35;
    ctx.font = `700 ${size}px ${family}`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (shadow) {
    ctx.shadowColor = "rgba(0,0,0,.75)";
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  ctx.fillStyle = color;
  ctx.fillText(text, box.x + box.w/2, box.y + box.h/2);
  ctx.shadowColor = "transparent";
}

function fillMask(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(pct(x, ctx.canvas.width), pct(y, ctx.canvas.height),
               pct(w, ctx.canvas.width), pct(h, ctx.canvas.height));
}

function drawContain(ctx, img, box, background = null) {
  const bw = box.w, bh = box.h;
  const scale = Math.min(bw / img.naturalWidth, bh / img.naturalHeight);
  const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
  const x = box.x + (bw - w)/2, y = box.y + (bh - h)/2;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(box.x, box.y, bw, bh);
  }
  ctx.drawImage(img, x, y, w, h);
}

function drawPhoto(ctx, img, frame) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(frame.x, frame.y, frame.w, frame.h);
  ctx.clip();

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const fit = Math.max(frame.w / iw, frame.h / ih);
  const dw = iw * fit, dh = ih * fit;
  let x = frame.x + (frame.w - dw)/2 + photoState.x;
  let y = frame.y + (frame.h - dh)/2 + photoState.y;

  const cx = frame.x + frame.w/2;
  const cy = frame.y + frame.h/2;
  ctx.translate(cx, cy);
  ctx.scale(photoState.scale, photoState.scale);
  ctx.translate(-cx, -cy);
  ctx.drawImage(img, x, y, dw, dh);
  ctx.restore();
}

function drawExport(ctx, images) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.drawImage(images.base, 0, 0, W, H);

  // Replace the original editable text areas while leaving all fixed artwork untouched.
  fillMask(ctx, 29.0, 20.25, 43.0, 3.0, "#082e58");
  fillMask(ctx, 27.5, 25.4, 45.0, 3.2, "#f1d18b");
  fillMask(ctx, 16.0, 70.65, 68.0, 4.7, "#07335d");
  fillMask(ctx, 33.7, 77.35, 32.5, 2.3, "#f4dfae");
  fillMask(ctx, 29.0, 83.05, 52.0, 3.6, "#ffffff");
  fillMask(ctx, 29.0, 90.0, 53.0, 3.6, "#ffffff");

  // Logo replacement masks.
  fillMask(ctx, 4.0, 7.2, 18.5, 15.5, "#ffffff");
  fillMask(ctx, 76.7, 6.0, 20.0, 18.0, "#ffffff");

  // Photo is clipped to the original inner frame only.
  drawPhoto(ctx, images.portrait, {
    x: pct(25.2,W), y: pct(34.05,H), w: pct(49.6,W), h: pct(32.0,H)
  });

  drawContain(ctx, images.leftLogo, {
    x: pct(4.2,W), y: pct(7.0,H), w: pct(19.0,W), h: pct(18.0,H)
  });
  drawContain(ctx, images.rightLogo, {
    x: pct(77.0,W), y: pct(6.3,H), w: pct(19.0,W), h: pct(18.0,H)
  });

  const texts = [
    {id:"collegeInput", x:29.0,y:20.2,w:43.0,h:3.3, size:25, color:"#fff", shadow:true},
    {id:"committeeInput", x:27.5,y:25.35,w:45.0,h:3.4, size:29, color:"#092e58", shadow:false},
    {id:"nameInput", x:16.0,y:70.35,w:68.0,h:5.5, size:41, color:"#f7e9c7", shadow:true},
    {id:"roleInput", x:33.7,y:77.2,w:32.5,h:2.7, size:26, color:"#092e58", shadow:false},
    {id:"batchInput", x:29.0,y:82.9,w:52.0,h:3.9, size:22, color:"#0d315b", shadow:false},
    {id:"departmentInput", x:29.0,y:89.8,w:53.0,h:3.9, size:21, color:"#0d315b", shadow:false}
  ];
  for (const t of texts) {
    const value = $("#" + t.id).value || "";
    drawTextFitted(ctx, value, {
      x:pct(t.x,W), y:pct(t.y,H), w:pct(t.w,W), h:pct(t.h,H)
    }, t.size, t.color, t.shadow);
  }
}

async function renderPngBlob() {
  const W = 1024, H = 1536;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d", { alpha:false });

  const baseSrc = dataUrlFromCssBackground();
  const [base, p, l, r] = await Promise.all([
    loadImage(baseSrc),
    loadImage(portrait.src || defaultPhoto),
    loadImage(leftLogo.src),
    loadImage(rightLogo.src)
  ]);
  drawExport(ctx, {base, portrait:p, leftLogo:l, rightLogo:r});

  return await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}

async function downloadPng() {
  const btn = $("#downloadBtn");
  btn.disabled = true;
  btn.textContent = "RENDERING…";
  $("#fallbackBtn").classList.add("hidden");

  try {
    const blob = await renderPngBlob();
    if (!blob) throw new Error("PNG blob creation failed");

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "political-science-forum-card.png";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 15000);
  } catch (err) {
    console.error(err);
    $("#fallbackBtn").classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "DOWNLOAD PNG";
  }
}

$("#downloadBtn").addEventListener("click", downloadPng);

$("#fallbackBtn").addEventListener("click", async () => {
  try {
    const blob = await renderPngBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "political-science-forum-card.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch (e) {
    alert("PNG could not be generated in this browser. Please try Chrome or Edge.");
  }
});

window.addEventListener("resize", () => {
  Object.keys(textMap).forEach(id => fitDomText($("#" + textMap[id])));
});
