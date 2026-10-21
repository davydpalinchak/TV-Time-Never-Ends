
import { useEffect, useRef, useState } from "react";
import { SHOW } from "./showTimeLine";

import HitTheBall from "../minigames/HitTheBall.jsx";
import ShootingGallery from "../minigames/ShootingGallery.jsx";
import RhythmGame from "../minigames/RhythmGame.jsx";
import ChannelSwitcher from "../minigames/ChannelSwitcher.jsx";

import "./ShowManager.css";

const GAMES = [
    { name: "HIT THE BALL", Component: HitTheBall },
    { name: "SHOOTING GALLERY", Component: ShootingGallery },
    { name: "RHYTHM GAME", Component: RhythmGame },
    { name: "CHANNEL SWITCHER", Component: ChannelSwitcher },
];

function createSequence() {
    const result = [];

    for (let i = 0; i < SHOW.regularRounds; i++) {
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

export default function ShowManager() {
    const audioRef = useRef(null);

    const [elapsed, setElapsed] = useState(0);
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [sequence, setSequence] = useState([]);

    useEffect(() => {
        if (!started) return;

        const audio = audioRef.current;
        if (!audio) return;

        let frame;
        let lastSecond = -1;

        function update() {
            const time = audio.currentTime;
            const second = Math.floor(time);

            if (second !== lastSecond) {
                lastSecond = second;
                setElapsed(second);
            }

            if (!audio.ended && time < SHOW.musicEnd) {
                frame = requestAnimationFrame(update);
            }
        }

        frame = requestAnimationFrame(update);

        return () => cancelAnimationFrame(frame);
    }, [started]);

    async function startShow() {
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        audio.currentTime = 0;

        setElapsed(0);
        setSequence(createSequence());
        setFinished(false);

        try {
            await audio.play();
            setStarted(true);
        } catch (error) {
            console.error("Не вдалося запустити музику:", error);
        }
    }

    function handleAudioEnded() {
        setElapsed(SHOW.musicEnd);
        setStarted(false);
        setFinished(true);
    }

    let phase = "ready";

    if (finished) {
        phase = "results";
    } else if (started) {
        if (elapsed < SHOW.roundsStart) {
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
    }

    const roundsElapsed = elapsed - SHOW.roundsStart;
    const round = Math.min(
        SHOW.regularRounds,
        Math.floor(roundsElapsed / SHOW.roundDuration) + 1
    );

    const roundTime = roundsElapsed % SHOW.roundDuration;
    const gameIndex = sequence[round - 1];
    const currentGame = GAMES[gameIndex];
    const CurrentGame = currentGame?.Component;

    return (
        <main className="show-root">
            <audio
                ref={audioRef}
                src="/assets/sfx/tenna_battle.ogg"
                preload="auto"
                onEnded={handleAudioEnded}
            />

            <header className="show-header">
                <span>TV TIME NEVER ENDS</span>
                <span>{formatTime(elapsed)} / 2:46</span>
                {started && (
                    <span>
                        {phase === "rounds"
                            ? `ROUND ${round}/${SHOW.regularRounds}`
                            : phase === "finale"
                              ? "CHANNEL FINALE"
                              : phase === "boss"
                                ? "BOSS BATTLE"
                                : "LIVE"}
                    </span>
                )}
            </header>

            <section className="show-frame">
                {phase === "ready" && (
                    <div className="show-message">
                        <p className="show-label">LIVE BROADCAST</p>
                        <h1>TV TIME NEVER ENDS</h1>
                        <p>ARE YOU READY?</p>
                        <button onClick={startShow}>START SHOW</button>
                    </div>
                )}

                {phase === "intro" && (
                    <div className="show-message">
                        <p className="show-label">PLEASE STAND BY</p>
                        <h1>THE SHOW IS STARTING</h1>
                        <div className="signal-bar" />
                    </div>
                )}

                {phase === "rounds" && roundTime < SHOW.minigameDuration && currentGame && (
                    <div className="show-game">
                        <currentGame.Component key={round} />
                    </div>
                )}

                {phase === "rounds" && roundTime >= SHOW.minigameDuration && (
                    <div className="show-message transition-screen">
                        <p className="show-label">ROUND {round} COMPLETE</p>
                        <h1>CHANGING CHANNEL...</h1>
                        <div className="signal-bar" />
                    </div>
                )}

                {phase === "finale" && (
                    <div className="show-game">
                        {CurrentGame && (
                            <CurrentGame
                                key={`finale-${Math.floor(
                                    (elapsed - SHOW.finaleStart) / 3
                                )}`}
                            />
                        )} 
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
            </section>
        </main>
    );
}
