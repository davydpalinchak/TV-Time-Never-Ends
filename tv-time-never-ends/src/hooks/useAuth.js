import { useState, useCallback } from "react";

const SESSION_KEY = "tv_time_session";
const FALLBACK_USERS_KEY = "tv_time_users";

function getStoredSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function clearStoredSession() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("tv_time_current_user");
}

export function useAuth() {
    const [user, setUser] = useState(() => getStoredSession());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const saveSession = useCallback((userData, token) => {
        const sessionData = { ...userData, token };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        setUser(sessionData);
    }, []);

    const verifySession = useCallback(async () => {
        const session = getStoredSession();
        if (!session?.token) return false;

        try {
            const response = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${session.token}` },
            });

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                throw new Error("FALLBACK_LOCAL");
            }

            if (!response.ok) {
                clearStoredSession();
                return false;
            }

            return true;
        } catch {
            const users = JSON.parse(
                localStorage.getItem(FALLBACK_USERS_KEY) || "[]"
            );
            const valid = users.some(
                (u) => `tv-token-${u.id}` === session.token
            );

            if (!valid) clearStoredSession();
            return valid;
        }
    }, []);

    const register = useCallback(
        async (nickname, password) => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nickname, password }),
                });

                const contentType = response.headers.get("content-type") || "";
                if (!contentType.includes("application/json")) {
                    throw new Error("FALLBACK_LOCAL");
                }

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || "Помилка реєстрації");
                    setLoading(false);
                    return false;
                }

                saveSession(data.user, data.token);
                setLoading(false);
                return true;
            } catch (err) {
                if (err.message === "FALLBACK_LOCAL" || err.name === "TypeError") {
                    const users = JSON.parse(
                        localStorage.getItem(FALLBACK_USERS_KEY) || "[]"
                    );
                    const exists = users.find(
                        (u) =>
                            u.nickname.toLowerCase() ===
                            nickname.trim().toLowerCase()
                    );

                    if (exists) {
                        setError("Цей нікнейм вже зайнятий!");
                        setLoading(false);
                        return false;
                    }

                    const newUser = {
                        id: Date.now(),
                        nickname: nickname.trim(),
                        password,
                    };
                    users.push(newUser);
                    localStorage.setItem(
                        FALLBACK_USERS_KEY,
                        JSON.stringify(users)
                    );
                    saveSession(
                        { id: newUser.id, nickname: newUser.nickname },
                        `tv-token-${newUser.id}`
                    );
                    setLoading(false);
                    return true;
                }

                setError("Помилка з'єднання з сервером");
                setLoading(false);
                return false;
            }
        },
        [saveSession]
    );

    const login = useCallback(
        async (nickname, password) => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nickname, password }),
                });

                const contentType = response.headers.get("content-type") || "";
                if (!contentType.includes("application/json")) {
                    throw new Error("FALLBACK_LOCAL");
                }

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || "Невірний нікнейм або пароль!");
                    setLoading(false);
                    return false;
                }

                saveSession(data.user, data.token);
                setLoading(false);
                return true;
            } catch (err) {
                if (err.message === "FALLBACK_LOCAL" || err.name === "TypeError") {
                    const users = JSON.parse(
                        localStorage.getItem(FALLBACK_USERS_KEY) || "[]"
                    );
                    const found = users.find(
                        (u) =>
                            u.nickname.toLowerCase() ===
                                nickname.trim().toLowerCase() &&
                            u.password === password
                    );

                    if (!found) {
                        setError("Невірний нікнейм або пароль!");
                        setLoading(false);
                        return false;
                    }

                    saveSession(
                        { id: found.id, nickname: found.nickname },
                        `tv-token-${found.id}`
                    );
                    setLoading(false);
                    return true;
                }

                setError("Помилка з'єднання з сервером");
                setLoading(false);
                return false;
            }
        },
        [saveSession]
    );

    const logout = useCallback(() => {
        clearStoredSession();
        setUser(null);
    }, []);

    return {
        user,
        loading,
        error,
        setError,
        register,
        login,
        logout,
        verifySession,
    };
}

