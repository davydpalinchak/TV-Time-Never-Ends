import { useNavigate } from "react-router-dom";
import "./LoginPage/LoginPage.css";

export default function InstructionsPage() {
    const navigate = useNavigate();

    return (
        <div className="login-container">
            <div className="login-overlay" />

            <div className="login-box-4-3 instructions-box">
                <div className="instructions-content"></div>

                <button
                    type="button"
                    className="login-btn-secondary"
                    onClick={() => navigate("/")}
                >
                    ПОВЕРНУТИСЬ ДО РЕЄСТРАЦІЇ
                </button>
            </div>
        </div>
    );
}
