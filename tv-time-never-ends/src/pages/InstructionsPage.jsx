import { useNavigate } from "react-router-dom";
import styles from "./LoginPage/LoginPage.module.css";

export default function InstructionsPage() {
    const navigate = useNavigate();

    return (
        <div className={styles["login-container"]}>
            <div className={styles["login-overlay"]} />

            <div className={`${styles["login-box-4-3"]} ${styles["instructions-box"]}`}>
                <div className={styles["instructions-content"]}>
                    <img
                        className={styles["instructions-image"]}
                        src={`${import.meta.env.BASE_URL}assets/instructions.png`}
                        alt="Інструкція"
                    />
                </div>

                <button
                    type="button"
                    className={styles["login-btn-secondary"]}
                    onClick={() => navigate("/")}
                >
                    ПОВЕРНУТИСЬ ДО РЕЄСТРАЦІЇ
                </button>
            </div>
        </div>
    );
}
