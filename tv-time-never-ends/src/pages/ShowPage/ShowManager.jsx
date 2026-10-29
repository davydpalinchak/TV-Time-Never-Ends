import { useEffect, useRef, useState } from "react";
import { SHOW } from "./showTimeLine";

import HitTheBall from "./minigames/HitTheBall.jsx";
import ShootingGallery from "./minigames/ShootingGallery.jsx";
import RhythmGame from "./minigames/RhythmGame.jsx";
import ChannelSwitcher from "./minigames/ChannelSwitcher.jsx";

import "./ShowManager.css";

const GAMES = [
    { name: "HIT THE BALL", Component: HitTheBall },
    { name: "SHOOTING GALLERY", Component: ShootingGallery },
    { name: "RHYTHM GAME", Component: RhythmGame },
    { name: "CHANNEL SWITCHER", Component: ChannelSwitcher },
];

const STAGE_TENNAS = ["tenna3.gif", "tenna6.gif", "tenna7.gif"];

const FINALE_DURATIONS = [
    3.4, 3.0, 2.6, 2.3, 2.0, 1.8, 1.7, 1.6, 1.5, 1.4, 1.4, 1.4, 1.4, 1.5,
];

function getFinaleSlotInfo(finaleElapsed) {
    let accumulated = 0;
    for (let i = 0; i < FINALE_DURATIONS.length; i++) {
        const dur = FINALE_DURATIONS[i];
        if (finaleElapsed < accumulated + dur) {
            return {
                slot: i,
                slotTime: finaleElapsed - accumulated,
                slotDuration: dur,
            };
        }
        accumulated += dur;
    }
    return {
        slot: FINALE_DURATIONS.length - 1,
        slotTime: 0,
        slotDuration: 1.4,
    };
}

function createSequence(totalCount = 40) {
    const result = [];

    for (let i = 0; i < totalCount; i++) {
        let next;

        do {
            next = Math.floor(Math.random() * GAMES.length);
        } while (next === result[i - 1]);

        result.push(next);
    }

    return result;
}

function formatTime(seconds) {
    const total = Math.floor(seconds);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function WhiteNoise({ opacity = 1 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animId;

        function renderNoise() {
            const w = canvas.width;
            const h = canvas.height;
            const imgData = ctx.createImageData(w, h);
            const data = imgData.data;

            for (let i = 0; i < data.length; i += 4) {
                const v = Math.random() * 255;
                data[i] = v;
                data[i + 1] = v;
                data[i + 2] = v;
                data[i + 3] = 255;
            }

            ctx.putImageData(imgData, 0, 0);
            animId = requestAnimationFrame(renderNoise);
        }

        animId = requestAnimationFrame(renderNoise);
        return () => cancelAnimationFrame(animId);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={160}
            height={100}
            className="white-noise-canvas"
            style={{ opacity }}
        />
    );
}

export default function ShowManager() {
    const audioRef = useRef(null);
    const impactTriggeredRef = useRef(false);
    const roundRef = useRef(1);

    const [elapsed, setElapsed] = useState(0);
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [shaking, setShaking] = useState(false);
    const [penaltyRound, setPenaltyRound] = useState(null);
    const [sequence, setSequence] = useState(() => createSequence(40));

    async function startShow() {
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        audio.currentTime = 0;
        impactTriggeredRef.current = false;
        roundRef.current = 1;

        setElapsed(0);
        setPenaltyRound(null);
        setSequence(createSequence(40));
        setFinished(false);
        setStarted(true);

        try {
            await audio.play();
        } catch (error) {
            console.error("Не вдалося запустити музику:", error);
        }
    }

    useEffect(() => {
        startShow();
    }, []);

    useEffect(() => {
        function handlePenalty() {
            setPenaltyRound(roundRef.current);
        }

        window.addEventListener("tv-penalty", handlePenalty);
        return () => {
            window.removeEventListener("tv-penalty", handlePenalty);
        };
    }, []);

    useEffect(() => {
        if (!started) return;

        const audio = audioRef.current;
        if (!audio) return;

        let frame;
        let fallbackStart = performance.now();

        function update(now) {
            const time = !audio.paused
                ? audio.currentTime
                : (now - fallbackStart) / 1000;

            setElapsed(time);

            if (time >= 1.4 && !impactTriggeredRef.current) {
                impactTriggeredRef.current = true;
                setShaking(true);
                setTimeout(() => setShaking(false), 480);

                const lockerSound = new Audio(
                    `${import.meta.env.BASE_URL}assets/sfx/snd_locker.wav`
                );
                lockerSound.volume = 0.85;
                lockerSound.play().catch(() => {});
            }

            if (time >= SHOW.musicEnd) {
                setElapsed(SHOW.musicEnd);
                setStarted(false);
                setFinished(true);
                return;
            }

            if (!audio.ended && time < SHOW.musicEnd) {
                frame = requestAnimationFrame(update);
            }
        }

        frame = requestAnimationFrame(update);

        return () => cancelAnimationFrame(frame);
    }, [started]);

    function handleAudioEnded() {
        setElapsed(SHOW.musicEnd);
        setStarted(false);
        setFinished(true);
    }

    let phase;

    if (finished) {
        phase = "results";
    } else if (elapsed < SHOW.roundsStart) {
        phase = "intro";
    } else if (elapsed < SHOW.finaleStart) {
        phase = "rounds";
    } else if (elapsed < SHOW.bossStart) {
        phase = "finale";
    } else if (elapsed < SHOW.resultsStart) {
        phase = "boss";
    } else {
        phase = "ending";
    }

    const roundsElapsed = Math.max(0, elapsed - SHOW.roundsStart);
    const round = Math.min(
        SHOW.regularRounds,
        Math.floor(roundsElapsed / SHOW.roundDuration) + 1
    );

    useEffect(() => {
        roundRef.current = round;
    }, [round]);

    const isPenaltyActive = penaltyRound === round;

    const roundTime = roundsElapsed % SHOW.roundDuration;
    const gameIndex = sequence[round - 1] ?? 0;
    const currentGame = GAMES[gameIndex];

    const finaleElapsed = Math.max(0, elapsed - SHOW.finaleStart);
    const { slot: finaleSlot, slotTime: finaleSubTime, slotDuration: finaleDur } =
        getFinaleSlotInfo(finaleElapsed);
    const finaleGameIndex =
        sequence[(SHOW.regularRounds + finaleSlot) % sequence.length] ?? 0;
    const FinaleGame = GAMES[finaleGameIndex]?.Component;

    let tvClass;
    if (phase === "intro") {
        if (elapsed < 1.0) {
            tvClass = "tv-hidden-top";
        } else if (elapsed < 1.44) {
            tvClass = "tv-impact";
        } else if (elapsed < 4.1) {
            tvClass = "tv-dropped";
        } else {
            tvClass = "tv-zoomed";
        }
    } else if (phase === "rounds") {
        if (roundTime < SHOW.minigameDuration) {
            tvClass = "tv-zoomed";
        } else if (roundTime < SHOW.roundDuration - 0.65) {
            tvClass = "tv-dropped";
        } else {
            tvClass = "tv-zoomed";
        }
    } else if (phase === "finale") {
        tvClass = "tv-zoomed";
    } else {
        tvClass = "tv-dropped";
    }

    const showGameFull =
        (phase === "rounds" && roundTime < SHOW.minigameDuration) ||
        phase === "finale";

    const showFinaleNoise =
        phase === "finale" &&
        (finaleSubTime < 0.25 || finaleSubTime > finaleDur - 0.2);

    const cyclicTenna =
        STAGE_TENNAS[(round + Math.floor(elapsed / 3)) % STAGE_TENNAS.length];
    const activeStageTenna = isPenaltyActive ? "tenna4.gif" : cyclicTenna;

    return (
        <main className="show-root">
            <audio
                ref={audioRef}
                src={`${import.meta.env.BASE_URL}assets/sfx/tenna_battle.ogg`}
                preload="auto"
                onEnded={handleAudioEnded}
            />

            <section className={`show-frame ${shaking ? "show-shake" : ""}`}>
                <header className="show-header">
                    <span>TV TIME NEVER ENDS</span>
                    <span>{formatTime(elapsed)} / 2:46</span>
                    <span>
                        {phase === "rounds"
                            ? `ROUND ${round}/${SHOW.regularRounds}`
                            : phase === "finale"
                              ? "CHANNEL FINALE"
                              : phase === "boss"
                                ? "BOSS BATTLE"
                                : "LIVE"}
                    </span>
                </header>

                <div className="show-stage">
                    <img
                        className="show-stage-bg"
                        src={`${import.meta.env.BASE_URL}assets/tvtime.png`}
                        alt=""
                    />

                    <img
                        className="show-tenna show-tenna-left"
                        src={`${import.meta.env.BASE_URL}assets/${activeStageTenna}`}
                        alt=""
                    />

                    <img
                        className="show-tenna show-tenna-right"
                        src={`${import.meta.env.BASE_URL}assets/${activeStageTenna}`}
                        alt=""
                    />

                    {showGameFull && (
                        <div className="show-game-layer">
                            {phase === "rounds" && currentGame && (
                                <div className="show-game">
                                    <currentGame.Component key={round} />
                                </div>
                            )}

                            {phase === "finale" && FinaleGame && (
                                <div className="show-game">
                                    <FinaleGame key={`finale-${finaleSlot}`} />
                                </div>
                            )}

                            {showFinaleNoise && <WhiteNoise opacity={0.95} />}
                        </div>
                    )}

                    {(phase === "intro" || phase === "rounds" || phase === "finale") && (
                        <div className={`tv-assembly ${tvClass}`}>
                            <div className="tv-inner-screen">
                                {!showGameFull && <WhiteNoise opacity={0.9} />}
                            </div>

                            <img
                                className="tv-bezel-img"
                                src={`${import.meta.env.BASE_URL}assets/tv.png`}
                                alt=""
                            />
                        </div>
                    )}

                    {phase === "boss" && (
                        <div className="show-message boss-screen">
                            <p className="show-label">SPECIAL BROADCAST</p>
                            <h1>TENNAVIDUMICH</h1>
                            <p>THE BOSS BATTLE WILL BEGIN HERE.</p>
                        </div>
                    )}

                    {phase === "ending" && (
                        <div className="show-message">
                            <p className="show-label">BROADCAST ENDING</p>
                            <h1>THANK YOU FOR WATCHING</h1>
                        </div>
                    )}

                    {phase === "results" && (
                        <div className="show-message">
                            <p className="show-label">BROADCAST ENDED</p>
                            <h1>THAT'S THE SHOW!</h1>
                            <p>FINAL TIME: {formatTime(elapsed)}</p>
                            <button onClick={startShow}>PLAY AGAIN</button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
