import { useState, useCallback, useEffect } from "react";

const FALLBACK_SCORES_KEY = "tv_time_scores";

const DEFAULT_SCORES = [
    { id: 1, nickname: "TENNA", score: 24, date: "2026-11-05" },
    { id: 2, nickname: "KRIS", score: 18, date: "2026-11-05" },
];

export function useScores() {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchScores = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/scores");
            const contentType = response.headers.get("content-type") || "";

            if (!response.ok || !contentType.includes("application/json")) {
                throw new Error("FALLBACK_LOCAL");
            }

            const data = await response.json();
            setScores(data);
        } catch {
            const local = JSON.parse(
                localStorage.getItem(FALLBACK_SCORES_KEY) ||
                    JSON.stringify(DEFAULT_SCORES)
            );
            const sorted = [...local]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            setScores(sorted);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveScore = useCallback(async (nickname, score) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/scores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nickname, score }),
            });

            const contentType = response.headers.get("content-type") || "";
            if (!response.ok || !contentType.includes("application/json")) {
                throw new Error("FALLBACK_LOCAL");
            }

            const updatedScores = await response.json();
            setScores(updatedScores);
            return updatedScores;
        } catch {
            const local = JSON.parse(
                localStorage.getItem(FALLBACK_SCORES_KEY) ||
                    JSON.stringify(DEFAULT_SCORES)
            );
            local.push({
                id: Date.now(),
                nickname: nickname || "GUEST",
                score: Number(score) || 0,
                date: new Date().toISOString().slice(0, 10),
            });
            localStorage.setItem(FALLBACK_SCORES_KEY, JSON.stringify(local));
            const sorted = [...local]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
            setScores(sorted);
            return sorted;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchScores();
    }, [fetchScores]);

    return {
        scores,
        loading,
        error,
        fetchScores,
        saveScore,
    };
}

