import { useEffect, useRef, useState } from "react";

const ROUND_TIME = 7;
const HIT_LINE_Y = 245;
const NOTE_SPEED = 180;
const HIT_WINDOW = 22;

export default function RhythmGame() {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
    const [message, setMessage] = useState("Натискай Z у ритм!");
    const [finished, setFinished] = useState(false);

    const gameRef = useRef({
        notes: [
            { y: 30, resolved: false },
            { y: -120, resolved: false },
            { y: -270, resolved: false },
            { y: -420, resolved: false },
        ],
        score: 0,
        timeLeft: ROUND_TIME,
        finished: false,
        message: "Натискай Z у ритм!",
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
            ctx.fillStyle = "#17152b";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Лінія, де треба натискати
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, HIT_LINE_Y, canvas.width, 4);

            // Ноти
            for (const note of game.notes) {
                if (note.resolved) continue;

                ctx.fillStyle = "#ffdd55";
                ctx.fillRect(300, note.y, 40, 18);
            }

            ctx.fillStyle = "#ffffff";
            ctx.font = "18px monospace";
            ctx.fillText(`SCORE: ${game.score}`, 15, 25);
            ctx.fillText(`TIME: ${Math.ceil(game.timeLeft)}`, 15, 50);
            ctx.fillText("Z", 315, HIT_LINE_Y + 35);
            ctx.fillText(game.message, 15, 295);

            if (game.finished) {
                ctx.fillStyle = "rgba(0,0,0,0.8)";
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
                for (const note of game.notes) {
                    if (note.resolved) continue;

                    note.y += NOTE_SPEED * delta;

                    if (note.y > HIT_LINE_Y + HIT_WINDOW) {
                        note.resolved = true;
                        game.score -= 1;
                        game.message = "Пропущена нота! -1";
                        setScore(game.score);
                        setMessage(game.message);
                    }
                }

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

        function handleKeyDown(event) {
            if (event.repeat || game.finished) return;
            if (event.key.toLowerCase() !== "z") return;

            const note = game.notes.find(
                (item) =>
                    !item.resolved &&
                    Math.abs(item.y - HIT_LINE_Y) <= HIT_WINDOW
            );

            if (note) {
                note.resolved = true;
                game.score += 2;
                game.message = "В ритм! +2";
            } else {
                game.score -= 1;
                game.message = "Не в ритм! -1";
            }

            setScore(game.score);
            setMessage(game.message);
        }

        window.addEventListener("keydown", handleKeyDown);
        animationId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    function restartGame() {
        gameRef.current = {
            notes: [
                { y: 30, resolved: false },
                { y: -120, resolved: false },
                { y: -270, resolved: false },
                { y: -420, resolved: false },
            ],
            score: 0,
            timeLeft: ROUND_TIME,
            finished: false,
            message: "Натискай Z у ритм!",
        };

        setScore(0);
        setTimeLeft(ROUND_TIME);
        setMessage("Натискай Z у ритм!");
        setFinished(false);
    }

    return (
        <main className="hit-game">
            <h1>RHYTHM GAME</h1>

            <canvas
                ref={canvasRef}
                width={640}
                height={320}
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
