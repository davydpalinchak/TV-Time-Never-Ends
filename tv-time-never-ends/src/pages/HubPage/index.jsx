import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import GameCanvas from "./GameCanvas.jsx";
import styles from "./HubPage.module.css";

export default function HubPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/", { replace: true });
    }

    return (
        <div className={styles["game-container"]}>
            <div className={styles["hub-user-bar"]}>
                <span>{user?.nickname}</span>
                <button type="button" onClick={handleLogout}>
                    ВИЙТИ
                </button>
            </div>
            <GameCanvas />
        </div>
    );
}
