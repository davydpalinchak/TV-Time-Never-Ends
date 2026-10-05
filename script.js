const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 700;

ctx.imageSmoothingEnabled = false;

const playerImage = new Image();
playerImage.src = "assets/kris_spritesheet.png";

const spriteWidth = 19;
const spriteHeight = 38;
const gap = 5;

const scale = 3;
const scaleWidth = spriteWidth * scale;
const scaleHeight = spriteHeight * scale;

const player = {
    x: canvas.width / 2 - scaleWidth / 2,
    y: canvas.height / 2 - scaleHeight / 2,
    baseSpeed: 2.5,
    runSpeed: 3.5,
    hitboxWidth: 30,
    hitboxHeight: 20,
    frameX: 0,
    frameY: 0,
    frameTimer: 0,
    frameInterval: 24,
    isMoving: false,
    facing: "down"
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  run: false
};

window.addEventListener("keyup", (e) => {
  if (e.key in keys) keys[e.key] = false;
  if (["x", "X", "ч", "Ч"].includes(e.key)) keys.run = false;
});

function updatePlayer() {
    player.isMoving = false;

    let moveX = 0;
    let moveY = 0;

    if (keys.ArrowUp) moveY -= 1;
    if (keys.ArrowDown) moveY += 1;
    if (keys.ArrowLeft) moveX -= 1;
    if (keys.ArrowRight) moveX += 1;

    if (moveX === 0 && moveY === 0) {
        player.frameX = 0;
        return;
    }

    player.isMoving = true;

    let currentSpeed = keys.run
        ? player.runSpeed
        : player.baseSpeed;

    if (moveX !== 0 && moveY !== 0) {
        const diagonal = 1 / Math.sqrt(2);

        moveX *= diagonal;
        moveY *= diagonal;
    }

    const newX = player.x + moveX * currentSpeed;
    const newY = player.y + moveY * currentSpeed;

    if (canMoveTo(newX, player.y)) {
        player.x = newX;
    }
    if (canMoveTo(player.x, newY)) {
        player.y = newY;
    }
    if (moveY < 0) {
        player.frameY = 3;
        player.facing = "up";
    }
    else if (moveY > 0) {
        player.frameY = 0;
        player.facing = "down";
    }
    else if (moveX < 0) {
        player.frameY = 1;
        player.facing = "left";
    }
    else if (moveX > 0) {
        player.frameY = 2;
        player.facing = "right";
    }
    player.frameTimer++;

    const currentInterval = keys.run ? 8 : 12;

    if (player.frameTimer >= currentInterval) {
        player.frameTimer = 0;
        player.frameX = (player.frameX + 1) % 4;
    }
}

  player.isMoving = false;
  let currentSpeed = keys.run ? player.runSpeed : player.baseSpeed;
  let moveX = 0;
  let moveY = 0;

  if (keys.ArrowUp) moveY -= 1;
  if (keys.ArrowDown) moveY += 1;
  if (keys.ArrowLeft) moveX -= 1;
  if (keys.ArrowRight) moveX += 1;

  if (moveX !== 0 || moveY !== 0) {
    player.isMoving = true;

    if (moveX !== 0 && moveY !== 0) {
      currentSpeed *= 0.707;
    }

    const newX = player.x + moveX * currentSpeed;
    const newY = player.y + moveY * currentSpeed;

    if (canMoveTo(newX, newY)) {
      player.x = newX;
      player.y = newY;
    }

    if (moveY < 0) {
    player.frameY = 3;
    player.facing = "up";
}
else if (moveY > 0) {
    player.frameY = 0;
    player.facing = "down";
}
else if (moveX < 0) {
    player.frameY = 1;
    player.facing = "left";
}
else if (moveX > 0) {
    player.frameY = 2;
    player.facing = "right";
}
  }


  if (player.isMoving) {
    player.frameTimer++;
    
    const currentInterval = keys.run ? 19 : player.frameInterval;

    if (player.frameTimer % currentInterval === 0) {
      player.frameX = (player.frameX + 1) % 4;
    }
  } else {
    player.frameX = 0;
  }

function drawPlayer() {

  const sourceX = player.frameX * (spriteWidth + gap);
  const sourceY = player.frameY * (spriteHeight + gap);

  ctx.drawImage(
    playerImage,
    sourceX,
    sourceY,
    spriteWidth,
    spriteHeight,
    player.x,
    player.y,
    scaleWidth,
    scaleHeight
  );
}

function animate() {//тимчасово
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();
    updatePlayer();
    drawPlayer();

    requestAnimationFrame(animate);
}

/*function animate() {
  updatePlayer();
  drawPlayer();
  requestAnimationFrame(animate);
}*/

playerImage.onload = () => {
  animate();
};

window.addEventListener("keydown", (e) => {
    if (e.code === "KeyZ") {
        interact();
    }

    if (e.key in keys) keys[e.key] = true;

    if (["x", "X", "ч", "Ч"].includes(e.key)) {
        keys.run = true;
    }
});