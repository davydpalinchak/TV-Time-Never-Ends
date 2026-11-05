import { useNavigate } from "react-router-dom";
import loginStyles from "../LoginPage/LoginPage.module.css";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className={loginStyles["login-container"]}>
            <div className={loginStyles["login-overlay"]} />

            <div className={loginStyles["login-box-4-3"]}>
                <header className={loginStyles["login-header"]}>
                    <h1 className={loginStyles["login-title"]}>TV Time Never Ends</h1>
                    <p className={loginStyles["login-subtitle"]}>
                        помилка 404 • сигнал втрачено
                    </p>
                </header>

                <div className={styles["notfound-content"]}>
                    <div className={styles["notfound-code"]}>404</div>
                    <p className={styles["notfound-status"]}>КАНАЛ НЕ ЗНАЙДЕНО</p>
                    <p className={styles["notfound-desc"]}>
                        Схоже, цей телеканал не транслюється або адреса введена неправильно. Перемкніться назад на головну сітку мовлення!
                    </p>
                </div>

                <button
                    type="button"
                    className={loginStyles["login-btn"]}
                    onClick={() => navigate("/", { replace: true })}
                >
                    ПОВЕРНУТИСЬ НА ГОЛОВНУ
                </button>

                <footer className={loginStyles["login-footer"]}>
                    ▶ КАНАЛ НЕ ВІДПОВІДАЄ • ПЕРЕВІРТЕ АДРЕСУ
                </footer>
            </div>
        </div>
    );
}

