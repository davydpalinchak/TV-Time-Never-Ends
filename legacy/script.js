const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const bgMusic = new Audio("assets/sfx/greenroom_detune.ogg");

bgMusic.loop = true;
bgMusic.volume = 1.0;

function startMusic() {
    bgMusic.play()
        .then(() => {
            window.removeEventListener("keydown", startMusic);
        })
        .catch(error => {
        });
}

window.addEventListener("keydown", startMusic);

let lastTime = 0;
let deltaTime = 0;
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
    baseSpeed: 3.0,
    runSpeed: 5.5,
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

function updatePlayer(frameScale) {
    if (dialogueActive) return;

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

    const newX = player.x + moveX * currentSpeed * frameScale;
    const newY = player.y + moveY * currentSpeed * frameScale;

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
    player.frameTimer+= frameScale;

    const currentInterval = keys.run ? 8 : 12;

    if (player.frameTimer >= currentInterval) {
        player.frameTimer = 0;
        player.frameX = (player.frameX + 1) % 4;
    }
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

function animate(timestamp) {
    if (lastTime === 0) {
        lastTime = timestamp;
    }
    deltaTime = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    const frameScale = deltaTime * 60;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawtvMan(730, 90, 140, 326);
    updatePlayer(frameScale);
    drawPlayer();
    Dialogue(frameScale);
    textboxUpdate();
    requestAnimationFrame(animate);
}

playerImage.onload = () => {
    animate();
};

window.addEventListener("keydown", (e) => {
    if (e.code === "KeyZ" && !e.repeat) {
        if (!dialogueActive) {
            interact();
        } else {
            nextDialogue();
        }
    }
    if (e.code === "KeyX" && !e.repeat) {
        if (dialogueActive) {
            skipDialogue();
        }
    }

    if (e.key in keys) keys[e.key] = true;

    if (!dialogueActive && ["x", "X", "ч", "Ч"].includes(e.key)) {
        keys.run = true;
    }
});


const mapImage = new Image();
mapImage.src = "assets/hub.png";

function drawMap() {
    if (!mapImage.complete || mapImage.naturalWidth === 0) {
        return;
    }

    ctx.drawImage(
        mapImage,
        0,
        0,
        canvas.width,
        canvas.height
    );
}

const tvMan = new Image();
tvMan.src = "assets/tenna1.png";
let tvManAngle = 0;
let tvManVelocity = 0;

let tvManTime = 0;

function drawtvMan(x, y, width, height) {
    tvManTime += 0.08;

    const angle = Math.sin(tvManTime) * 0.05;

    ctx.save();

    ctx.translate(x + width / 2, y + height);
    ctx.rotate(angle);

    if (tvMan.complete && tvMan.naturalWidth > 0) {
        ctx.drawImage(
            tvMan,
            -width / 2,
            -height,
            width,
            height
        );
    }

    ctx.restore();
}