const lightsaber = document.getElementById('lightsaber');
const blade = document.getElementById('blade');
const toggleColor = document.getElementById('toggleColor');
const toggleBlade = document.getElementById('toggleBlade');

let isRed = false;
let bladeOn = true;

// Estado de arraste
let isDragging = false;
let startX, startY;
let currentX = 0, currentY = 0;
let offsetX = 0, offsetY = 0;

// Alternar cor
toggleColor.addEventListener('click', () => {
  isRed = !isRed;
  lightsaber.classList.toggle('red', isRed);
});

// Ligar/desligar sabre
toggleBlade.addEventListener('click', () => {
  bladeOn = !bladeOn;
  blade.style.display = bladeOn ? 'block' : 'none';
  toggleBlade.textContent = bladeOn ? 'Desligar Sabre' : 'Ligar Sabre';
});

// Função para atualizar posição
function updatePosition() {
  lightsaber.style.transform = `translate(${currentX}px, ${currentY}px) rotate(-45deg)`;
}

// Mouse
lightsaber.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  currentX = e.clientX - startX;
  currentY = e.clientY - startY;
  offsetX = currentX;
  offsetY = currentY;
  updatePosition();
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Touch
lightsaber.addEventListener('touchstart', (e) => {
  isDragging = true;
  const touch = e.touches[0];
  startX = touch.clientX - offsetX;
  startY = touch.clientY - offsetY;
});

document.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const touch = e.touches[0];
  currentX = touch.clientX - startX;
  currentY = touch.clientY - startY;
  offsetX = currentX;
  offsetY = currentY;
  updatePosition();
});

document.addEventListener('touchend', () => {
  isDragging = false;
});
