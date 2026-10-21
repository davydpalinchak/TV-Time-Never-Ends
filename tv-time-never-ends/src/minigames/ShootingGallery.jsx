import { useEffect, useRef, useState } from "react";

const ROUND_TIME = 7;

const START_TARGETS = [
    { x: 120, y: 100, good: false },
    { x: 280, y: 160, good: true },
    { x: 440, y: 100, good: false },
    { x: 520, y: 200, good: false },
];

export default function ShootingGallery() {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
    const [message, setMessage] = useState("Стріляй у звичайні цілі!");
    const [finished, setFinished] = useState(false);

    const gameRef = useRef({
        targets: START_TARGETS.map((target) => ({ ...target, alive: true })),
        score: 0,
        timeLeft: ROUND_TIME,
        finished: false,
        message: "Стріляй у звичайні цілі!",
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const game = gameRef.current;

        let animationId;
        let previousTime = 0;
        let timerAccumulator = 0;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Тимчасовий фон
            ctx.fillStyle = "#202020";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Мішені
            for (const target of game.targets) {
                if (!target.alive) continue;

                ctx.fillStyle = target.good ? "#55cc88" : "#eeeeee";
                ctx.fillRect(target.x - 18, target.y - 25, 36, 50);

                ctx.fillStyle = "#111111";
                ctx.fillRect(target.x - 9, target.y - 12, 5, 5);
                ctx.fillRect(target.x + 4, target.y - 12, 5, 5);
            }

            // Інтерфейс
            ctx.fillStyle = "#ffffff";
            ctx.font = "18px monospace";
            ctx.fillText(`SCORE: ${game.score}`, 15, 25);
            ctx.fillText(`TIME: ${Math.ceil(game.timeLeft)}`, 15, 50);
            ctx.fillText(game.message, 15, 295);

            if (game.finished) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "#ffffff";
                ctx.textAlign = "center";
                ctx.font = "28px monospace";
                ctx.fillText("ROUND OVER", 320, 140);
                ctx.font = "20px monospace";
                ctx.fillText(`SCORE: ${game.score}`, 320, 180);
                ctx.textAlign = "left";
            }
        }

        function update(timestamp) {
            if (!previousTime) previousTime = timestamp;

            const delta = Math.min(
                (timestamp - previousTime) / 1000,
                0.05
            );
            previousTime = timestamp;

            if (!game.finished) {
                timerAccumulator += delta;

                if (timerAccumulator >= 1) {
                    const seconds = Math.floor(timerAccumulator);
                    timerAccumulator -= seconds;
                    game.timeLeft = Math.max(0, game.timeLeft - seconds);

                    setTimeLeft(game.timeLeft);

                    if (game.timeLeft <= 0) {
                        game.finished = true;
                        setFinished(true);
                    }
                }
            }

            draw();

            if (!game.finished) {
                animationId = requestAnimationFrame(update);
            }
        }

        function handleClick(event) {
            if (game.finished) return;

            const rect = canvas.getBoundingClientRect();
            const mouseX =
                (event.clientX - rect.left) * (canvas.width / rect.width);
            const mouseY =
                (event.clientY - rect.top) * (canvas.height / rect.height);

            const target = game.targets.find(
                (item) =>
                    item.alive &&
                    mouseX >= item.x - 18 &&
                    mouseX <= item.x + 18 &&
                    mouseY >= item.y - 25 &&
                    mouseY <= item.y + 25
            );

            if (!target) {
                game.message = "Промах!";
                setMessage(game.message);
                draw();
                return;
            }

            target.alive = false;

            if (target.good) {
                game.score -= 3;
                game.message = "Це була хороша ціль! -3";
            } else {
                game.score += 2;
                game.message = "Влучання! +2";
            }

            setScore(game.score);
            setMessage(game.message);
            draw();
        }

        canvas.addEventListener("click", handleClick);
        animationId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(animationId);
            canvas.removeEventListener("click", handleClick);
        };
    }, []);

    function restartGame() {
        gameRef.current = {
            targets: START_TARGETS.map((target) => ({ ...target, alive: true })),
            score: 0,
            timeLeft: ROUND_TIME,
            finished: false,
            message: "Стріляй у звичайні цілі!",
        };

        setScore(0);
        setTimeLeft(ROUND_TIME);
        setMessage("Стріляй у звичайні цілі!");
        setFinished(false);
    }

    return (
        <main className="hit-game">
            <h1>SHOOTING GALLERY</h1>

            <canvas
                ref={canvasRef}
                width={640}
                height={320}
                style={{ cursor: "crosshair" }}
            />

            <p>{message}</p>

            {finished && (
                <button onClick={restartGame}>
                    Грати ще раз
                </button>
            )}
        </main>
    );
}
