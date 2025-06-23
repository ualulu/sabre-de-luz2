// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Game State
let score = 0;
let lives = 3;
let gameRunning = true;
let modoDesvio = false;
const modeText = document.getElementById('mode');
let keys = {};

// Difficulty control
let enemyDirection = 1;
let enemyDropDistance = 20;
let enemySpeed = 1; // velocidade inicial dos inimigos
let lastShot = 0;
const shootCooldown = 250;

const playerImage = new Image();
playerImage.src = 'nave.png'; // ajuste o caminho se necessário

// Classes
class Player {
  constructor() {
    this.width = 80;
    this.height = 70;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 10;
    this.speed = 5;
  }

  update() {
    if ((keys['ArrowLeft'] || keys['a']) && this.x > 0) {
      this.x -= this.speed;
    }
    if ((keys['ArrowRight'] || keys['d']) && this.x < canvas.width - this.width) {
      this.x += this.speed;
    }
  }

  draw() {
  ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 20;
    this.speed = enemySpeed;
  }

  update() {
    // Movimento individual controlado pela lógica geral
  }

  draw() {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x + 5, this.y + 5, 5, 5);
    ctx.fillRect(this.x + 20, this.y + 5, 5, 5);
  }
}

class Bullet {
  constructor(x, y, isPlayerBullet = true) {
    this.x = x;
    this.y = y;
    this.width = 3;
    this.height = 10;
    this.speed = isPlayerBullet ? -7 : 3;
    this.isPlayerBullet = isPlayerBullet;
  }

  update() {
    this.y += this.speed;
  }

  draw() {
    ctx.fillStyle = this.isPlayerBullet ? '#00ff00' : '#ff0000';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  isOffScreen() {
    return this.y < 0 || this.y > canvas.height;
  }
}

// Game Objects
const player = new Player();
const enemies = [];
const bullets = [];

// Create Enemies
function createEnemies() {
  enemies.length = 0;
  const rows = 5;
  const cols = 10;
  const spacing = 50;
  const startX = 50;
  const startY = 50;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * spacing;
      const y = startY + row * spacing;
      enemies.push(new Enemy(x, y));
    }
  }
}

// Collision Detection
function checkCollision(r1, r2) {
  return r1.x < r2.x + r2.width &&
         r1.x + r1.width > r2.x &&
         r1.y < r2.y + r2.height &&
         r1.y + r1.height > r2.y;
}

// Controls
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;

  if (e.key === ' ' && gameRunning) {
    e.preventDefault();
    const now = Date.now();
    if (now - lastShot > shootCooldown) {
      bullets.push(new Bullet(player.x + player.width / 2, player.y));
      lastShot = now;
    }
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Update Enemies
function updateEnemies() {
  if (enemies.length === 0) return;

  let shouldDrop = false;

  for (const enemy of enemies) {
    if ((enemy.x <= 0 && enemyDirection === -1) ||
        (enemy.x + enemy.width >= canvas.width && enemyDirection === 1)) {
      shouldDrop = true;
      break;
    }
  }

  if (shouldDrop) {
    enemyDirection *= -1;
    enemies.forEach(enemy => {
      enemy.y += enemyDropDistance;
    });
  }

  enemies.forEach(enemy => {
    enemy.x += enemyDirection * enemy.speed;
    enemy.update();
  });

  for (const enemy of enemies) {
    if (enemy.y + enemy.height >= player.y) {
      gameOver();
      return;
    }
  }
}

// Update Bullets
function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.update();

    if (bullet.isOffScreen()) {
      bullets.splice(i, 1);
      continue;
    }

    if (bullet.isPlayerBullet) {
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (checkCollision(bullet, enemy)) {
          bullets.splice(i, 1);
          enemies.splice(j, 1);
          score += 10;
          updateScore();
          break;
        }
      }
    }
  }
}

// Update Score
function updateScore() {
  scoreElement.textContent = score.toString();

  if (enemies.length === 0) {
    createEnemies();
    enemyDropDistance += 2;
    enemySpeed += 0.3;

    enemies.forEach(enemy => {
      enemy.speed = enemySpeed;
    });
  }
}

// Game Over
function gameOver() {
  gameRunning = false;
  finalScoreElement.textContent = score.toString();
  gameOverElement.style.display = 'block';
}

// Restart
window.restartGame = function() {
  gameRunning = true;
  score = 0;
  lives = 3;
  enemyDirection = 1;
  enemyDropDistance = 20;
  enemySpeed = 1;

  player.x = canvas.width / 2 - player.width / 2;
  bullets.length = 0;
  createEnemies();
  updateScore();
  livesElement.textContent = lives.toString();
  gameOverElement.style.display = 'none';
};

// Background Stars
const stars = [];

function createStars() {
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 2 + 0.5
    });
  }
}

function drawStars() {
  ctx.fillStyle = '#fff';
  stars.forEach(star => {
    ctx.fillRect(star.x, star.y, 1, 1);
    star.y += star.speed;

    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });
}

// Game Loop
function gameLoop() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (gameRunning) {
    player.update();
    updateEnemies();
    updateBullets();

    player.draw();
    enemies.forEach(enemy => enemy.draw());
    bullets.forEach(bullet => bullet.draw());

    drawStars();
  }

  requestAnimationFrame(gameLoop);
}

// Start
createEnemies();
createStars();
updateScore();
livesElement.textContent = lives.toString();

playerImage.onload = () => {
  gameLoop(); // inicia o jogo só depois que a imagem da nave está carregada
};


