import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { player, SPRITE } from "./game/player";
import { canMoveTo } from "./game/collisions";
import { TILE, TILE_SIZE, gameMap } from "./game/map";
import { createDialogue } from "./game/dialogue";
import { dialogues } from "./game/dialogues";

export default function GameCanvas() {
    const canvasRef = useRef(null);
    const navigate = useNavigate();

    const [showTenna7, setShowTenna7] = useState(false);
    const [isBlackScreen, setIsBlackScreen] = useState(false);

    const showTenna7Ref = useRef(false);
    const isBlackScreenRef = useRef(false);

    useEffect(() => {
        showTenna7Ref.current = showTenna7;
    }, [showTenna7]);

    useEffect(() => {
        isBlackScreenRef.current = isBlackScreen;
    }, [isBlackScreen]);

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

        let cutsceneTriggered = false;

        function triggerMainDoorCutscene() {
            if (cutsceneTriggered) return;
            cutsceneTriggered = true;

            keys.ArrowUp = false;
            keys.ArrowDown = false;
            keys.ArrowLeft = false;
            keys.ArrowRight = false;
            keys.run = false;
            player.isMoving = false;
            player.facing = "up";
            player.frameY = 3;
            player.frameX = 0;

            setShowTenna7(true);

            const mainDialogue = dialogues.mainDoor;
            dialogue.start(mainDialogue.lines, mainDialogue.voice, () => {
                setIsBlackScreen(true);

                music.pause();
                music.currentTime = 0;

                const lockerSound = new Audio(`${import.meta.env.BASE_URL}assets/sfx/snd_locker.wav`);
                lockerSound.volume = 0.85;
                lockerSound.play().catch((err) => {
                    console.log("Locker sound error:", err);
                });

                let transitioned = false;
                const goToShow = () => {
                    if (transitioned) return;
                    transitioned = true;
                    cancelAnimationFrame(animationId);
                    navigate("/show");
                };

                lockerSound.onended = goToShow;
                setTimeout(goToShow, 1000);
            });
        }

        function checkDoorTrigger() {
            if (cutsceneTriggered) return;

            const hitboxX = player.x + (SPRITE.drawWidth - player.hitboxWidth) / 2;
            const hitboxY = player.y + SPRITE.drawHeight - player.hitboxHeight;
            const hitboxCenterX = hitboxX + player.hitboxWidth / 2;
            const hitboxTop = hitboxY;

            const tileX = Math.floor(hitboxCenterX / TILE_SIZE);
            const tileY = Math.floor(hitboxTop / TILE_SIZE);

            const atMainDoorTile = tileY <= 3 && tileX >= 9 && tileX <= 11;
            const approachingMainDoor = hitboxTop <= 258 && hitboxCenterX >= 570 && hitboxCenterX <= 768;

            if (atMainDoorTile || approachingMainDoor) {
                triggerMainDoorCutscene();
            }
        }

        function interact() {
            if (cutsceneTriggered) return;

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
                } else if (!cutsceneTriggered) {
                    interact();
                }

                return;
            }

            if (e.code === "KeyX" && !e.repeat) {
                e.preventDefault();

                if (dialogue.isActive()) {
                    dialogue.skip();
                } else if (!cutsceneTriggered) {
                    keys.run = true;
                }

                return;
            }

            if (cutsceneTriggered) return;

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
            if (dialogue.isActive() || cutsceneTriggered) return;

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

            checkDoorTrigger();
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
            if (showTenna7Ref.current) return;

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
            music.pause();
            cancelAnimationFrame(animationId);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [navigate]);

    return (
        <div className="canvas-wrapper" style={{ position: "relative" }}>
            <canvas ref={canvasRef} width={960} height={700} />

            {showTenna7 && (
                <img
                    src={`${import.meta.env.BASE_URL}assets/tenna7.gif`}
                    alt="Tenna Active"
                    style={{
                        position: "absolute",
                        left: `${(652 / 960) * 100}%`,
                        top: `${(71 / 700) * 100}%`,
                        width: `${(297 / 960) * 100}%`,
                        height: `${(350 / 700) * 100}%`,
                        pointerEvents: "none",
                        imageRendering: "pixelated",
                        zIndex: 2,
                    }}
                />
            )}

            {isBlackScreen && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "#000000",
                        zIndex: 99,
                        pointerEvents: "none",
                    }}
                />
            )}
        </div>
    );
}
