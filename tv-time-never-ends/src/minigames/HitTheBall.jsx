import { useEffect, useRef, useState } from "react";

const ROUND_TIME = 7;
const BALL_SPEED = 340;

export default function HitTheBall() {
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState("Відбий м'яч клавішею Z!");
    const [finished, setFinished] = useState(false);

    const gameRef = useRef(null);
    const stateRef = useRef({
        ballX: 560,
        ballY: 180,
        lastTime: 0,
        hit: false,
        missed: false,
        finished: false,
        score: 0,
        timeLeft: ROUND_TIME,
        message: "Відбий м'яч клавішею Z!",
    });

    useEffect(() => {
        const canvas = gameRef.current;
        const ctx = canvas.getContext("2d");
        const state = stateRef.current;

        let animationId;
        let previousTimestamp = 0;
        let timerAccumulator = 0;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Підлога
            ctx.fillStyle = "#252525";
            ctx.fillRect(0, 260, canvas.width, 60);

            // Тимчасовий персонаж
            ctx.fillStyle = "#eeeeee";
            ctx.fillRect(70, 155, 35, 80);
            ctx.fillRect(65, 235, 18, 25);
            ctx.fillRect(92, 235, 18, 25);

            // Бита
            ctx.fillStyle = state.hit ? "#ffcc55" : "#aaaaaa";
            ctx.fillRect(105, 190, 65, 8);

            // М'яч
            if (!state.hit && !state.missed) {
                ctx.fillStyle = "#ff5555";
                ctx.beginPath();
                ctx.arc(state.ballX, state.ballY, 12, 0, Math.PI * 2);
                ctx.fill();
            }

            // Інтерфейс
            ctx.fillStyle = "#ffffff";
            ctx.font = "18px monospace";
            ctx.fillText(`SCORE: ${state.score}`, 20, 30);
            ctx.fillText(`TIME: ${Math.ceil(state.timeLeft)}`, 20, 55);

            ctx.font = "16px monospace";
            ctx.fillText(state.message, 20, 295);

            if (state.finished) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "#ffffff";
                ctx.font = "28px monospace";
                ctx.textAlign = "center";
                ctx.fillText("ROUND OVER", canvas.width / 2, 140);

                ctx.font = "20px monospace";
                ctx.fillText(
                    `SCORE: ${state.score}`,
                    canvas.width / 2,
                    180
                );
                ctx.textAlign = "left";
            }
        }

        function update(timestamp) {
            if (!previousTimestamp) previousTimestamp = timestamp;

            const delta = Math.min(
                (timestamp - previousTimestamp) / 1000,
                0.05
            );
            previousTimestamp = timestamp;

            if (!state.finished) {
                // Рух м'яча
                if (!state.hit && !state.missed) {
                    state.ballX -= BALL_SPEED * delta;

                    // М'яч пролетів повз персонажа
                    if (state.ballX < 150) {
                        state.missed = true;
                        state.score -= 1;
                        state.message = "Промах! -1 очко";

                    }
                }

                // Через коротку паузу з'являється новий м'яч
                if (state.hit || state.missed) {
                    state.lastTime += delta;

                    if (state.lastTime >= 0.6) {
                        state.ballX = 560;
                        state.ballY = 180;
                        state.hit = false;
                        state.missed = false;
                        state.lastTime = 0;
                        state.message = "Готуйся до удару!";
                    }
                }

                timerAccumulator += delta;

                if (timerAccumulator >= 1) {
                    const seconds = Math.floor(timerAccumulator);
                    timerAccumulator -= seconds;
                    state.timeLeft = Math.max(0, state.timeLeft - seconds);

                    if (state.timeLeft <= 0) {
                        state.finished = true;
                        setFinished(true);
                    }

                    setTimeLeft(state.timeLeft);
                }

                setScore(state.score);
                setMessage(state.message);
            }

            draw();
            if (!state.finished) {
                animationId = requestAnimationFrame(update);
            }
        }

        function handleKeyDown(event) {
            if (event.repeat || state.finished) return;

            if (event.key.toLowerCase() === "z") {
                // Влучити можна лише коли м'яч близько
                if (
                    !state.hit &&
                    !state.missed &&
                    state.ballX >= 115 &&
                    state.ballX <= 205
                ) {
                    state.hit = true;
                    state.score += 2;
                    state.message = "ВЛУЧАННЯ! +2 очки";
                    state.lastTime = 0;
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        animationId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    function restartGame() {
        stateRef.current = {
            ballX: 560,
            ballY: 180,
            lastTime: 0,
            hit: false,
            missed: false,
            finished: false,
            score: 0,
            timeLeft: ROUND_TIME,
            message: "Відбий м'яч клавішею Z!",
        };

        setTimeLeft(ROUND_TIME);
        setScore(0);
        setMessage("Відбий м'яч клавішею Z!");
        setFinished(false);

        // Перезапускаємо компонент, щоб запустити ігровий цикл заново
        setRestartKey((value) => value + 1);
    }

    const [restartKey, setRestartKey] = useState(0);

    return (
        <main className="hit-game">
            <h1>HIT THE BALL</h1>

            <canvas
                key={restartKey}
                ref={gameRef}
                width={640}
                height={320}
            />

            {finished && (
                <button onClick={restartGame}>
                    Грати ще раз
                </button>
            )}
        </main>
    );
}
