import { useEffect, useRef } from "react";
import { player, SPRITE } from "../game/player";
import { canMoveTo } from "../game/collisions";
import { TILE, TILE_SIZE, gameMap } from "../game/map";
import { createDialogue } from "../game/dialogue";
import { dialogues } from "../game/dialogues";

export default function GameCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = 960;
        canvas.height = 700;
        ctx.imageSmoothingEnabled = false;


        const background = new Image();
        background.src = `${import.meta.env.BASE_URL}assets/hub.png`;

        const heroImage = new Image();
        heroImage.src = `${import.meta.env.BASE_URL}assets/kris_spritesheet.png`;

        const tennaImage = new Image();
        tennaImage.src = `${import.meta.env.BASE_URL}assets/tenna1.png`;

        const dialogue = createDialogue(ctx, canvas);

        const music = new Audio(`${import.meta.env.BASE_URL}assets/sfx/castle_funk_long.ogg`);
        music.loop = true;
        music.volume = 0.3;

        let musicStarted = false;

        function startMusic() {
            if (musicStarted) return;
                musicStarted = true;
            music.play().catch((error) => {
            console.log("Не вдалося запустити музику:", error);
            });
        }

        const keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            run: false,
        };

        let animationId;
        let lastTime = 0;
        let tennaTime = 0;


        function interact() {
            const hitboxX =
                player.x + (SPRITE.drawWidth - player.hitboxWidth) / 2;

            const hitboxY =
                player.y + SPRITE.drawHeight - player.hitboxHeight;

            const left = Math.floor(hitboxX / TILE_SIZE);
            const right = Math.floor(
                (hitboxX + player.hitboxWidth - 1) / TILE_SIZE
            );
            const top = Math.floor(hitboxY / TILE_SIZE);
            const bottom = Math.floor(
                (hitboxY + player.hitboxHeight - 1) / TILE_SIZE
            );

            for (let y = top - 1; y <= bottom + 1; y++) {
                for (let x = left - 1; x <= right + 1; x++) {
                    if (gameMap[y]?.[x] !== TILE.INTERACTION) continue;

                    let dialogueId = null;

                    switch (true) {
                        case x === 12 && y >= 4 && y <= 5:
                            dialogueId = "tenna";
                            break;

                        case x === 1 && y >= 8 && y <= 9:
                            dialogueId = "cactusApple";
                            break;

                        case x === 13 && y >= 8 && y <= 9:
                            dialogueId = "cactusEmpty";
                            break;
                    }

                    if (dialogueId) {
                        const selectedDialogue = dialogues[dialogueId];

                        dialogue.start(
                            selectedDialogue.lines,
                            selectedDialogue.voice
                        );
                    }

                    return;
                }
            }
        }



        function handleKeyDown(e) {
            if (!musicStarted) {
                startMusic();
            }
            if (e.code === "KeyZ" && !e.repeat) {
                e.preventDefault();

                if (dialogue.isActive()) {
                    dialogue.next();
                } else {
                    interact();
                }

                return;
            }
            if (e.code === "KeyX" && !e.repeat) {
                e.preventDefault();

                if (dialogue.isActive()) {
                    dialogue.skip();
                } else {
                    keys.run = true;
                }

                return;
            }

            if (e.key in keys) {
                keys[e.key] = true;
                e.preventDefault();
            }
        }



        function handleKeyUp(e) {
            if (e.key in keys) keys[e.key] = false;
            if (e.code === "KeyX") keys.run = false;
        }

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        function update(frameScale) {
            if (dialogue.isActive()) return;

            player.isMoving = false;

            let moveX = 0;
            let moveY = 0;

            if (keys.ArrowUp) moveY--;
            if (keys.ArrowDown) moveY++;
            if (keys.ArrowLeft) moveX--;
            if (keys.ArrowRight) moveX++;

            if (moveX === 0 && moveY === 0) {
                player.frameX = 0;
                return;
            }

            player.isMoving = true;

            if (moveX !== 0 && moveY !== 0) {
                moveX *= Math.SQRT1_2;
                moveY *= Math.SQRT1_2;
            }

            const speed = keys.run ? player.runSpeed : player.baseSpeed;

            const newX = player.x + moveX * speed * frameScale;
            const newY = player.y + moveY * speed * frameScale;

            if (canMoveTo(newX, player.y)) player.x = newX;
            if (canMoveTo(player.x, newY)) player.y = newY;

            if (moveY < 0) {
                player.frameY = 3;
                player.facing = "up";
            } else if (moveY > 0) {
                player.frameY = 0;
                player.facing = "down";
            } else if (moveX < 0) {
                player.frameY = 1;
                player.facing = "left";
            } else if (moveX > 0) {
                player.frameY = 2;
                player.facing = "right";
            }

            player.frameTimer += frameScale;

            if (player.frameTimer >= (keys.run ? 8 : 12)) {
                player.frameTimer = 0;
                player.frameX = (player.frameX + 1) % 4;
            }
        }

        function drawPlayer() {
            if (!heroImage.complete || !heroImage.naturalWidth) return;

            ctx.drawImage(
                heroImage,
                player.frameX * (SPRITE.width + SPRITE.gap),
                player.frameY * (SPRITE.height + SPRITE.gap),
                SPRITE.width,
                SPRITE.height,
                player.x,
                player.y,
                SPRITE.drawWidth,
                SPRITE.drawHeight
            );
        }

        function drawTenna() {
            if (!tennaImage.complete || !tennaImage.naturalWidth) return;

            const x = 730;
            const y = 90;
            const width = 140;
            const height = 326;

            ctx.save();
            ctx.translate(x + width / 2, y + height);
            ctx.rotate(Math.sin(tennaTime) * 0.05);
            ctx.drawImage(tennaImage, -width / 2, -height, width, height);
            ctx.restore();
        }

        function animate(timestamp) {
            if (!lastTime) lastTime = timestamp;

            const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.05);
            const frameScale = deltaTime * 60;
            lastTime = timestamp;
            tennaTime += 0.08 * frameScale;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (background.complete && background.naturalWidth) {
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            }

            drawTenna();
            update(frameScale);
            drawPlayer();

            dialogue.update(frameScale);
            dialogue.draw();

            animationId = requestAnimationFrame(animate);
        }

        animationId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return <canvas ref={canvasRef} width={960} height={700} />;
}
