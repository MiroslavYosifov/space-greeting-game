import { drawSpeechBubble } from "./speech_bubble.js";
import { Ghost } from "./ghost.js";
import { Cake } from "./cake.js";
import { Asteroid } from "./asteroid.js";
import { Bullet } from "./bullet.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}
resizeCanvas();

window.addEventListener("resize", resizeCanvas);

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMessage = document.getElementById("overlayMessage");
const restartBtn = document.getElementById("restartBtn");
const timeSurvivedSpan = document.getElementById("timeSurvived");
const destroyedSpan = document.getElementById("destroyedCount");

const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");
const btnFire = document.getElementById("btnFire");

let touchLeft = false;
let touchRight = false;
let touchFire = false;

function attachTouch(el, setter) {
  el.addEventListener("touchstart", (e) => {
    e.preventDefault();
    setter(true);
  });
  el.addEventListener("touchend", (e) => {
    e.preventDefault();
    setter(false);
  });
  el.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    setter(false);
  });
}

attachTouch(btnLeft, (v) => (touchLeft = v));
attachTouch(btnRight, (v) => (touchRight = v));
attachTouch(btnFire, (v) => (touchFire = v));

// Game state
let player;
let bullets;
let asteroids;
let ghosts;
let cake = null;
let cakeSpawned = false;
let waterMode = false;

let lastTime = 0;
let gameRunning = true;
let totalTime = 0;
let destroyedCount = 0;

const CAKE_SPAWN_TIME = 18; // след колко секунди се появява тортата

const keys = {
  left: false,
  right: false,
  fire: false,
};

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
  if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
  if (e.code === "Space") {
    e.preventDefault();
    keys.fire = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
  if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
  if (e.code === "Space") keys.fire = false;
});

function resetGame() {
  const startX = canvas.width / window.devicePixelRatio / 2;
  const startY = canvas.height / window.devicePixelRatio - 70;

  player = {
    x: startX - 20,
    y: startY,
    width: 40,
    height: 40,
    speed: 5,
    cooldown: 0,
    bubble: null,
    bubbleTimer: 0,
  };

  bullets = [];
  asteroids = [];
  ghosts = [];
  cake = null;
  cakeSpawned = false;
  waterMode = false;

  lastTime = 0;
  gameRunning = true ;
  totalTime = 0;
  destroyedCount = 0;
  overlay.classList.remove("visible");
  timeSurvivedSpan.textContent = "0.0";
  destroyedSpan.textContent = "0";
}

resetGame();

function spawnAsteroid() {
  const w = 26 + Math.random() * 24;
  const x = Math.random() * (canvas.width / window.devicePixelRatio - w);
  const y = -w;
  const speed = 1.5 + Math.random() * 2.5;
  const radius = w / 2;
  const segments = 10 + Math.floor(Math.random() * 4);
  const wobble = Array.from({ length: segments }, () => 0.8 + Math.random() * 0.4);
  asteroids.push(new Asteroid(x, y, radius, speed, segments, wobble));
}

function spawnGhost() {
  const x = Math.random() * (canvas.width / window.devicePixelRatio - 40);
  const y = -40;
  ghosts.push(new Ghost(x, y, canvas));
}

function spawnCake()   {
  cake = new Cake(canvas);
}

function spawnBullet() {
  if (player.cooldown > 0) return;
  player.cooldown = 180; // ms
  const x = player.x + player.width / 2 - 3;
  const y = player.y;
  const width = 6;
  const height = 18;
  const speed = waterMode ? 6 : 7;
  bullets.push(new Bullet(x, y, width, height, speed, canvas));
}

function rectsIntersect(a, b) {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
  );
}

function circleRectIntersect(circle, rect) {
  const distX = Math.abs(circle.x - (rect.x + rect.width / 2));
  const distY = Math.abs(circle.y - (rect.y + rect.height / 2));

  if (distX > rect.width / 2 + circle.radius) return false;
  if (distY > rect.height / 2 + circle.radius) return false;

  if (distX <= rect.width / 2) return true;
  if (distY <= rect.height / 2) return true;

  const dx = distX - rect.width / 2;
  const dy = distY - rect.height / 2;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function endGame({ success = false, messageOverride = null } = {}) {
  gameRunning = false;
  if (success) {
    overlayTitle.textContent = "🎉 ТОРТАТА Е ИЗГАСЕНА!";
    overlayMessage.textContent =
      messageOverride || "Great job! You saved the day!";
  } else if (messageOverride) {
    overlayMessage.textContent = messageOverride;
  }
  overlay.classList.add("visible");
}

function maybePlayerSpeak() {
  if (!player) return;
  if (player.bubbleTimer > 0) {
    player.bubbleTimer--;
    if (player.bubbleTimer <= 0) player.bubble = null;
    return;
  }
  if (Math.random() < 0.002) {
    const lines = ["화이팅!", "가보자!", "좋았어!", "ㅋㅋㅋ"];
    player.bubble = lines[Math.floor(Math.random() * lines.length)];
    player.bubbleTimer = 100;
  }
}

// check for collisions, update positions
function update(delta) {
  if (!gameRunning) return;

  const dt = delta / 1000;
  totalTime += dt;
  timeSurvivedSpan.textContent = totalTime.toFixed(1);

  // Спауниране на тортата + включване на water-mode
  if (!cakeSpawned && totalTime >= CAKE_SPAWN_TIME) {
    cakeSpawned = true;
    spawnCake();
    waterMode = true;
  }

  // движение на кораба
  let moveX = 0;
  if (keys.left || touchLeft) moveX -= 1;
  if (keys.right || touchRight) moveX += 1;

  player.x += moveX * player.speed;
  const maxX = canvas.width / window.devicePixelRatio - player.width;
  if (player.x < 0) player.x = 0;
  if (player.x > maxX) player.x = maxX;

  if ((keys.fire || touchFire) && gameRunning) {
    spawnBullet();
  }
  if (player.cooldown > 0) {
    player.cooldown -= delta;
    if (player.cooldown < 0) player.cooldown = 0;
  }

  maybePlayerSpeak();

  // spawn-и
  if (Math.random() < 0.035) spawnAsteroid();
  if (Math.random() < 0.02) spawnGhost();

  // bullets
  bullets.forEach((b) => { b.update(delta) });
  bullets = bullets.filter((b) => b.y + b.height > -10);

  const canvasHeight = canvas.height / window.devicePixelRatio;

  // asteroids
  asteroids.forEach((a) => { a.update(delta) });
  asteroids = asteroids.filter((a) => a.y - a.radius < canvasHeight + 60);

  // ghosts
  ghosts.forEach((g) => g.update(delta));
  ghosts = ghosts.filter((g) => g.y < canvasHeight + 60);

  // cake
  if (cake) cake.update(delta);

  // bullets vs asteroids
  bullets.forEach((b, bi) => {
    asteroids.forEach((a, ai) => {
      const circle = { x: a.x + a.radius, y: a.y + a.radius, radius: a.radius };
      if (circleRectIntersect(circle, b)) {
        asteroids.splice(ai, 1);
        bullets.splice(bi, 1);
        destroyedCount++;
        destroyedSpan.textContent = destroyedCount;
      }
    });
  });

  // bullets vs ghosts
  bullets.forEach((b, bi) => {
    ghosts.forEach((g, gi) => {
      const rectG = { x: g.x, y: g.y, width: g.width, height: g.height };
      if (rectsIntersect(b, rectG)) {
        ghosts.splice(gi, 1);
        bullets.splice(bi, 1);
        destroyedCount++;
        destroyedSpan.textContent = destroyedCount;
      }
    });
  });

  if (cake) {
    bullets.forEach((b, bi) => {
      if (!cake) return;
      const rectC = { x: cake.x, y: cake.y, width: cake.width, height: cake.height };
      if (rectsIntersect(b, rectC)) {
        bullets.splice(bi, 1);
        cake.hp -= 1;

        if (cake.hp > 0) {
          cake.bubbleTimer = 60;
          const faces = ["🔥?!", "앗!", "😳", "헉?!"];
          cake.bubble = faces[Math.floor(Math.random() * faces.length)];

          if (cake.hp / cake.maxHp < 0.3 && Math.random() < 0.3) {
            cake.bubble = "🥵🔥";
            cake.bubbleTimer = 90;
          }
        }

        if (cake.hp <= 0) {
          destroyedCount += 5;
          destroyedSpan.textContent = destroyedCount;
          cake = null;
          endGame({ success: true });
        }
      }
    });
  }

  // collisions с играча
  const playerRect = {
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height,
  };

  for (const a of asteroids) {
    const circle = { x: a.x + a.radius, y: a.y + a.radius, radius: a.radius };
    if (circleRectIntersect(circle, playerRect)) { endGame(); return; }
  }

  for (const g of ghosts) {
    const rectG = { x: g.x, y: g.y, width: g.width, height: g.height };
    if (rectsIntersect(playerRect, rectG)) { endGame(); return; }
  }

  if (cake) {
    const rectC = { x: cake.x, y: cake.y, width: cake.width, height: cake.height };
    if (rectsIntersect(playerRect, rectC)) { endGame(); return; }
  }
}

function draw() {
  const w = canvas.width / window.devicePixelRatio;
  const h = canvas.height / window.devicePixelRatio;

  ctx.clearRect(0, 0, w, h);

  // фон
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
  for (let i = 0; i < 40; i++) {
    const x = (i * 73) % w;
    const y = ((i * 151) % h + (Date.now() / 30)) % h;
    const r = (i % 3) + 1;
    ctx.globalAlpha = 0.2 + (i % 10) / 50;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // кораб
  ctx.save();
  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(14, 16);
  ctx.lineTo(0, 8);
  ctx.lineTo(-14, 16);
  ctx.closePath();
  ctx.fill();

  // cockpit
  ctx.fillStyle = "#e0f2fe";
  ctx.beginPath();
  ctx.arc(0, -6, 5, 0, Math.PI * 2);
  ctx.fill();

  // engine glow
  ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
  ctx.beginPath();
  ctx.moveTo(-6, 16);
  ctx.lineTo(0, 26 + Math.sin(Date.now() / 90) * 4);
  ctx.lineTo(6, 16);
  ctx.closePath();
  ctx.fill();

  // nozzle в waterMode
  if (waterMode) {
    ctx.fillStyle = "#60a5fa";
    ctx.beginPath();
    ctx.rect(-4, -20, 8, 10);
    ctx.fill();
  }
  ctx.restore();

  // bubble на player-а
  if (player.bubble && player.bubbleTimer > 0) {
    drawSpeechBubble(
      ctx,
      player.x + player.width / 2 - 30,
      player.y - 40,
      player.bubble
    );
  }

  bullets.forEach((b) => { b.draw(ctx, waterMode)}); // bullets
  asteroids.forEach((a) => { a.draw(ctx) }); // asteroids
  ghosts.forEach((g) => g.draw(ctx)); // ghost
  if (cake) cake.draw(ctx); // cake
}

function gameLoop(timestamp) {

  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  update(delta);
  draw();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

restartBtn.addEventListener("click", () => {
  resetGame();
}); 