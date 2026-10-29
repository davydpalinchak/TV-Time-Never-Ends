import { useEffect, useRef, useState } from "react";

const ROUND_TIME = 7;
const CHANNEL_COUNT = 5;

export default function ChannelSwitcher() {
    const [channel, setChannel] = useState(1);
    const [target, setTarget] = useState(3);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
    const [finished, setFinished] = useState(false);
    const [message, setMessage] = useState("Знайди потрібний канал!");

    const gameRef = useRef({
        channel: 1,
        target: 3,
        score: 0,
        timeLeft: ROUND_TIME,
        finished: false,
    });

    useEffect(() => {
        const game = gameRef.current;

        function handleKeyDown(event) {
            if (game.finished || event.repeat) return;

            if (event.key === "ArrowLeft") {
                game.channel =
                    game.channel === 1
                        ? CHANNEL_COUNT
                        : game.channel - 1;

                setChannel(game.channel);
            }

            if (event.key === "ArrowRight") {
                game.channel =
                    game.channel === CHANNEL_COUNT
                        ? 1
                        : game.channel + 1;

                setChannel(game.channel);
            }

            if (event.key.toLowerCase() === "z") {
                if (game.channel === game.target) {
                    game.score += 2;
                    setMessage("Правильний канал! +2");

                    let nextTarget;
                    do {
                        nextTarget =
                            Math.floor(Math.random() * CHANNEL_COUNT) + 1;
                    } while (nextTarget === game.target);

                    game.target = nextTarget;
                    setTarget(nextTarget);
                } else {
                    game.score -= 1;
                    setMessage("Не той канал! -1");
                    window.dispatchEvent(new CustomEvent("tv-penalty"));
                }

                setScore(game.score);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        const timer = setInterval(() => {
            if (game.finished) return;

            game.timeLeft = Math.max(0, game.timeLeft - 1);
            setTimeLeft(game.timeLeft);

            if (game.timeLeft <= 0) {
                game.finished = true;
                setFinished(true);
            }
        }, 1000);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            clearInterval(timer);
        };
    }, []);

    function restartGame() {
        const game = gameRef.current;

        game.channel = 1;
        game.target = 3;
        game.score = 0;
        game.timeLeft = ROUND_TIME;
        game.finished = false;

        setChannel(1);
        setTarget(3);
        setScore(0);
        setTimeLeft(ROUND_TIME);
        setFinished(false);
        setMessage("Знайди потрібний канал!");
    }

    return (
        <main className="hit-game">
            <h1>CHANNEL SWITCHER</h1>

            <p>Цільовий канал: {target}</p>

            <section
                style={{
                    width: "min(640px, 100%)",
                    minHeight: "250px",
                    boxSizing: "border-box",
                    border: "2px solid #fff",
                    background: "#17152b",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "20px",
                    textAlign: "center",
                }}
            >
                <h2 style={{ fontSize: "48px", margin: 0 }}>
                    📺 CH {channel}
                </h2>

                <p>{message}</p>

                <p>
                    SCORE: {score} | TIME: {timeLeft}
                </p>
            </section>

            {finished ? (
                <>
                    <h2>ROUND OVER</h2>
                    <p>Фінальний рахунок: {score}</p>
                    <button onClick={restartGame}>Грати ще раз</button>
                </>
            ) : (
                <p>← → — перемикати канали | Z — підтвердити</p>
            )}
        </main>
    );
}
