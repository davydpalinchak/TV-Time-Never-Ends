import { useEffect, useState } from "react";

import HitTheBall from "../minigames/HitTheBall.jsx";
import ShootingGallery from "../minigames/ShootingGallery.jsx";
import RhythmGame from "../minigames/RhythmGame.jsx";
import ChannelSwitcher from "../minigames/ChannelSwitcher.jsx";

const GAMES = [
    { name: "HIT THE BALL", component: HitTheBall },
    { name: "SHOOTING GALLERY", component: ShootingGallery },
    { name: "RHYTHM GAME", component: RhythmGame },
    { name: "CHANNEL SWITCHER", component: ChannelSwitcher },
];

const TOTAL_ROUNDS = 8;
const GAME_TIME = 7000;
const TRANSITION_TIME = 2000;

function createSequence() {
    const sequence = [];

    for (let i = 0; i < TOTAL_ROUNDS; i++) {
        let next;

        do {
            next = Math.floor(Math.random() * GAMES.length);
        } while (next === sequence[i - 1]);

        sequence.push(next);
    }

    return sequence;
}

export default function MiniGameShow() {
    const [phase, setPhase] = useState("ready");
    const [sequence, setSequence] = useState([]);
    const [round, setRound] = useState(0);

    function startShow() {
        setSequence(createSequence());
        setRound(0);
        setPhase("playing");
    }

    useEffect(() => {
        if (phase === "playing") {
            const timer = setTimeout(() => {
                setPhase("transition");
            }, GAME_TIME);

            return () => clearTimeout(timer);
        }

        if (phase === "transition") {
            const timer = setTimeout(() => {
                if (round + 1 >= TOTAL_ROUNDS) {
                    setPhase("done");
                } else {
                    setRound((previous) => previous + 1);
                    setPhase("playing");
                }
            }, TRANSITION_TIME);

            return () => clearTimeout(timer);
        }
    }, [phase, round]);

    if (phase === "ready") {
        return (
            <main className="show-screen">
                <p className="show-small">WELCOME TO</p>
                <h1>TV TIME NEVER ENDS</h1>
                <p>8 ROUNDS. NO BREAKS.</p>
                <button onClick={startShow}>START SHOW</button>
            </main>
        );
    }

    if (phase === "done") {
        return (
            <main className="show-screen">
                <p className="show-small">BROADCAST ENDED</p>
                <h1>THAT'S THE SHOW!</h1>
                <button onClick={startShow}>PLAY AGAIN</button>
            </main>
        );
    }

    if (phase === "transition") {
        return (
            <main className="show-screen transition-screen">
                <p className="show-small">ROUND {round + 1} COMPLETE</p>
                <h1>SWITCHING CHANNEL...</h1>
                <div className="signal-bar" />
                <p>NEXT UP: ANYTHING COULD HAPPEN.</p>
            </main>
        );
    }

    const Game = GAMES[sequence[round]].component;
    const gameName = GAMES[sequence[round]].name;

    return (
        <div className="show-playing">
            <header className="show-hud">
                <span>TV TIME NEVER ENDS</span>
                <span>ROUND {round + 1}/{TOTAL_ROUNDS}</span>
                <span>{gameName}</span>
            </header>

            <Game key={`${round}-${sequence[round]}`} />
        </div>
    );
}
