import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
    const [mode, setMode] = useState("register");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        try {
            const enterSound = new Audio(`${import.meta.env.BASE_URL}assets/sfx/snd_ftext_enter.wav`);
            enterSound.volume = 0.5;
            enterSound.play().catch(() => {});
        } catch (err) {
            void err;
        }

        navigate("/hub");
    };

    return (
        <div className="login-container">
            <div className="login-overlay" />

            <div className="login-box-4-3">
                <header className="login-header">
                    <h1 className="login-title">TV Time Never Ends</h1>
                    <p className="login-subtitle">
                        {mode === "register"
                            ? "реєстрація нового учасника"
                            : "вхід в акаунт учасника"}
                    </p>
                </header>

                <div className="auth-tabs">
                    <button
                        type="button"
                        className={`auth-tab ${mode === "register" ? "active" : ""}`}
                        onClick={() => setMode("register")}
                    >
                        РЕЄСТРАЦІЯ
                    </button>
                    <button
                        type="button"
                        className={`auth-tab ${mode === "login" ? "active" : ""}`}
                        onClick={() => setMode("login")}
                    >
                        ВХІД
                    </button>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="nickname">
                            ▶ Нікнейм:
                        </label>
                        <input
                            id="nickname"
                            className="login-input"
                            type="text"
                            placeholder="Введіть ваш нік..."
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                            autoFocus
                            autoComplete="username"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="password">
                            ▶ Пароль:
                        </label>
                        <input
                            id="password"
                            className="login-input"
                            type="password"
                            placeholder="Введіть пароль..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="login-btn">
                        {mode === "register" ? "ЗАРЕЄСТРУВАТИСЬ І ПОЧАТИ" : "УВІЙТИ В ШОУ"}
                    </button>

                    <button
                        type="button"
                        className="login-btn-secondary"
                        onClick={() => navigate("/instructions")}
                    >
                        ІНСТРУКЦІЯ
                    </button>
                </form>

                <footer className="login-footer"></footer>
            </div>
        </div>
    );
}
