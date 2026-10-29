import { useEffect, useRef, useState } from "react";

const ROUND_TIME = 7;
const BALL_SPEED = 650;

export default function HitTheBall() {
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState("Відбий м'яч клавішею Z!");
    const [finished, setFinished] = useState(false);
    const [ballPos, setBallPos] = useState({ x: 520, y: 236, visible: true });
    const [swinging, setSwinging] = useState(false);
    const [swingKey, setSwingKey] = useState(0);

    const idleCanvasRef = useRef(null);
    const swingTimeoutRef = useRef(null);

    const stateRef = useRef({
        ballX: 520,
        ballY: 236,
        lastTime: 0,
        hit: false,
        missed: false,
        finished: false,
        score: 0,
        timeLeft: ROUND_TIME,
        message: "Відбий м'яч клавішею Z!",
    });

    useEffect(() => {
        const canvas = idleCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        const img = new Image();
        img.src = `${import.meta.env.BASE_URL}assets/baseball.gif`;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    }, []);

    useEffect(() => {
        const state = stateRef.current;
        let animationId;
        let previousTimestamp = 0;
        let timerAccumulator = 0;

        function update(timestamp) {
            if (!previousTimestamp) previousTimestamp = timestamp;

            const delta = Math.min(
                (timestamp - previousTimestamp) / 1000,
                0.05
            );
            previousTimestamp = timestamp;

            if (!state.finished) {
                if (!state.hit && !state.missed) {
                    state.ballX -= BALL_SPEED * delta;

                    if (state.ballX < 115) {
                        state.missed = true;
                        state.score -= 1;
                        state.message = "Промах! -1 очко";
                        window.dispatchEvent(new CustomEvent("tv-penalty"));
                    }
                } else if (state.hit) {
                    state.ballX += BALL_SPEED * 1.5 * delta;
                    state.ballY -= 360 * delta;
                }

                if (state.hit || state.missed) {
                    state.lastTime += delta;

                    if (state.lastTime >= 0.4) {
                        state.ballX = 520;
                        state.ballY = 236;
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
                setBallPos({
                    x: state.ballX,
                    y: state.ballY,
                    visible: !state.missed,
                });
            }

            if (!state.finished) {
                animationId = requestAnimationFrame(update);
            }
        }

        function handleKeyDown(event) {
            if (event.repeat || state.finished) return;

            if (event.key.toLowerCase() === "z") {
                setSwinging(true);
                setSwingKey((k) => k + 1);
                if (swingTimeoutRef.current) {
                    clearTimeout(swingTimeoutRef.current);
                }
                swingTimeoutRef.current = setTimeout(() => {
                    setSwinging(false);
                }, 420);

                if (
                    !state.hit &&
                    !state.missed &&
                    state.ballX >= 115 &&
                    state.ballX <= 245
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
            if (swingTimeoutRef.current) {
                clearTimeout(swingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                backgroundColor: "#2e8b57",
                fontFamily: '"Determination", monospace',
                color: "#ffffff",
                userSelect: "none",
                imageRendering: "pixelated",
            }}
        >
            <img
                src={`${import.meta.env.BASE_URL}assets/baseballbackground.png`}
                alt=""
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "126%",
                    objectFit: "fill",
                    imageRendering: "pixelated",
                    pointerEvents: "none",
                }}
            />

            <canvas
                ref={idleCanvasRef}
                width={63}
                height={50}
                style={{
                    position: "absolute",
                    left: "11.5%",
                    top: "54%",
                    width: "23%",
                    height: "27.3%",
                    imageRendering: "pixelated",
                    pointerEvents: "none",
                    display: swinging ? "none" : "block",
                }}
            />

            {swinging && (
                <img
                    key={swingKey}
                    src={`${import.meta.env.BASE_URL}assets/baseball.gif?s=${swingKey}`}
                    alt="Batter Swing"
                    style={{
                        position: "absolute",
                        left: "11.5%",
                        top: "54%",
                        width: "23%",
                        height: "27.3%",
                        objectFit: "fill",
                        imageRendering: "pixelated",
                        pointerEvents: "none",
                    }}
                />
            )}

            {ballPos.visible && !finished && (
                <img
                    src={`${import.meta.env.BASE_URL}assets/ball.gif`}
                    alt="Ball"
                    style={{
                        position: "absolute",
                        left: `${(ballPos.x / 640) * 100}%`,
                        top: `${(ballPos.y / 320) * 100}%`,
                        width: "5.5%",
                        height: "8.5%",
                        objectFit: "contain",
                        imageRendering: "pixelated",
                        pointerEvents: "none",
                        transform: "translate(-50%, -50%)",
                    }}
                />
            )}

            <div
                style={{
                    position: "absolute",
                    top: "12px",
                    left: "16px",
                    fontSize: "22px",
                    textShadow: "2px 2px #000",
                    zIndex: 3,
                }}
            >
                <div>SCORE: {score}</div>
                <div>TIME: {Math.ceil(timeLeft)}</div>
            </div>

            <div
                style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "16px",
                    fontSize: "20px",
                    textShadow: "2px 2px #000",
                    zIndex: 3,
                }}
            >
                {message}
            </div>

            {finished && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.78)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        zIndex: 5,
                    }}
                >
                    <div style={{ fontSize: "32px" }}>ROUND OVER</div>
                    <div style={{ fontSize: "22px" }}>SCORE: {score}</div>
                </div>
            )}
        </div>
    );
}
