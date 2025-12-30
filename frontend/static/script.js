const canvas = document.getElementById("area");
const ctx = canvas.getContext("2d");

const alarm = document.getElementById("alarm");

// Rover position & movement
let x = 300;
let y = 150;
let dx = 0;
let dy = 0;
const speed = 0.5;

// Scan state
let autoScan = false;

// Surveillance boundary
const boundary = {
  x: 40,
  y: 40,
  width: 520,
  height: 220
};

/* =========================
   DRAW ROVER & AREA
========================= */
function drawRover() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Surveillance boundary
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(boundary.x, boundary.y, boundary.width, boundary.height);

  // Title
  ctx.font = "14px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(
    "SURVEILLANCE AREA",
    boundary.x + boundary.width / 2 - 70,
    boundary.y - 10
  );

  // Rover body
  ctx.fillStyle = "orange";
  ctx.fillRect(x - 25, y - 15, 50, 30);

  // Sensor head
  ctx.beginPath();
  ctx.arc(x, y - 25, 8, 0, Math.PI * 2);
  ctx.fillStyle = "skyblue";
  ctx.fill();

  // Wheels
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x - 15, y + 15, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + 15, y + 15, 6, 0, Math.PI * 2);
  ctx.fill();
}

/* =========================
   MOVEMENT CONTROLS
========================= */
function move(direction) {
  fetch("/move");
  autoScan = true;

  if (direction === "up") { dx = 0; dy = -speed; }
  if (direction === "down") { dx = 0; dy = speed; }
  if (direction === "left") { dx = -speed; dy = 0; }
  if (direction === "right") { dx = speed; dy = 0; }

  document.getElementById("status").innerText = "Rover Moving";
}

function stop() {
  fetch("/stop");
  dx = 0;
  dy = 0;
  autoScan = false;

  alarm.pause();
  alarm.currentTime = 0;

  document.getElementById("alertBox").innerText = "STATUS:Rover Stopped ";
  document.getElementById("alertBox").className ="safe";
    "Motion: -- | Fire: -- | CO: --";
}

function scan() {
  autoScan = true;
}

/* =========================
   MOVEMENT LOOP
========================= */
setInterval(() => {
  x += dx;
  y += dy;

  // Keep rover inside surveillance boundary
  x = Math.max(
    boundary.x + 30,
    Math.min(boundary.x + boundary.width - 30, x)
  );
  y = Math.max(
    boundary.y + 30,
    Math.min(boundary.y + boundary.height - 30, y)
  );

  drawRover();
}, 30);

/* =========================
   AUTO SCAN LOOP
========================= */
setInterval(() => {
  if (!autoScan) return;

  fetch("/scan")
    .then(res => res.json())
    .then(data => {
      if (!data.active) return;

      const alertBox = document.getElementById("alertBox");

let hazard = false;

// CO handling
let coText = data.co;
if (data.co > 200) {
  coText = `${data.co} (HIGH)`;
  hazard = true;
}

// Fire or motion detection
if (data.fire === "DETECTED" || data.motion === "DETECTED") {
  hazard = true;
}

// Update sensor text
document.getElementById("sensors").innerText =
  `Motion: ${data.motion} | Fire: ${data.fire} | CO: ${coText}`;

// Visual alert
if (hazard) {
  alertBox.innerText = "⚠ HAZARD DETECTED";
  alertBox.className = "danger";
  alarm.play();
} else {
  alertBox.innerText = "✅ AREA SAFE";
  alertBox.className = "safe";
  alarm.pause();
  alarm.currentTime = 0;
}

    });
}, 2000);

// Initial render
drawRover();
