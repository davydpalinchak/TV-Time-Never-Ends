import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
    const [mode, setMode] = useState("register");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const { register, login, loading, error, setError } = useAuth();
    const navigate = useNavigate();

    const switchMode = (newMode) => {
        setMode(newMode);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const success =
            mode === "register"
                ? await register(nickname, password)
                : await login(nickname, password);

        if (!success) return;

        try {
            const enterSound = new Audio(
                `${import.meta.env.BASE_URL}assets/sfx/snd_ftext_enter.wav`
            );
            enterSound.volume = 0.5;
            enterSound.play().catch(() => {});
        } catch (err) {
            void err;
        }

        navigate("/hub");
    };

    return (
        <div className={styles["login-container"]}>
            <div className={styles["login-overlay"]} />

            <div className={styles["login-box-4-3"]}>
                <header className={styles["login-header"]}>
                    <h1 className={styles["login-title"]}>TV Time Never Ends</h1>
                    <p className={styles["login-subtitle"]}>
                        {mode === "register"
                            ? "реєстрація нового учасника"
                            : "вхід в акаунт учасника"}
                    </p>
                </header>

                <div className={styles["auth-tabs"]}>
                    <button
                        type="button"
                        className={`${styles["auth-tab"]} ${mode === "register" ? styles.active : ""}`}
                        onClick={() => switchMode("register")}
                    >
                        РЕЄСТРАЦІЯ
                    </button>
                    <button
                        type="button"
                        className={`${styles["auth-tab"]} ${mode === "login" ? styles.active : ""}`}
                        onClick={() => switchMode("login")}
                    >
                        ВХІД
                    </button>
                </div>

                <form className={styles["login-form"]} onSubmit={handleSubmit}>
                    {error && <div className={styles["auth-error"]}>{error}</div>}

                    <div className={styles["input-group"]}>
                        <label className={styles["input-label"]} htmlFor="nickname">
                            ▶ Нікнейм:
                        </label>
                        <input
                            id="nickname"
                            className={styles["login-input"]}
                            type="text"
                            placeholder="Введіть ваш нік..."
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                            autoFocus
                            autoComplete="username"
                        />
                    </div>

                    <div className={styles["input-group"]}>
                        <label className={styles["input-label"]} htmlFor="password">
                            ▶ Пароль:
                        </label>
                        <input
                            id="password"
                            className={styles["login-input"]}
                            type="password"
                            placeholder="Введіть пароль..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles["login-btn"]}
                        disabled={loading}
                    >
                        {loading
                            ? "ЗАВАНТАЖЕННЯ..."
                            : mode === "register"
                              ? "ЗАРЕЄСТРУВАТИСЬ І ПОЧАТИ"
                              : "УВІЙТИ В ШОУ"}
                     </button>

                    <button
                        type="button"
                        className={styles["login-btn-secondary"]}
                        onClick={() => navigate("/instructions")}
                    >
                        ІНСТРУКЦІЯ
                    </button>
                </form>

                <footer className={styles["login-footer"]}></footer>
            </div>
        </div>
    );
}
