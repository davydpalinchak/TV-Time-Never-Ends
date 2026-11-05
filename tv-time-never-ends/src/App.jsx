import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import HubPage from "./pages/HubPage/index.jsx";
import ShowPage from "./pages/ShowPage/index.jsx";
import InstructionsPage from "./pages/InstructionsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/instructions" element={<InstructionsPage />} />
            <Route
                path="/hub"
                element={
                    <ProtectedRoute>
                        <HubPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/show"
                element={
                    <ProtectedRoute>
                        <ShowPage />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
