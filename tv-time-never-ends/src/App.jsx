import { Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import HubPage from "./pages/HubPage/index.jsx";
import ShowPage from "./pages/ShowPage/index.jsx";
import InstructionsPage from "./pages/InstructionsPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/hub" element={<HubPage />} />
            <Route path="/show" element={<ShowPage />} />
            <Route path="/instructions" element={<InstructionsPage />} />
        </Routes>
    );
}
