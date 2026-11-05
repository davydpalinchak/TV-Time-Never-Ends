import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
    const { user, verifySession } = useAuth();
    const [status, setStatus] = useState(user ? "checking" : "denied");

    useEffect(() => {
        if (!user) return;

        let active = true;

        verifySession().then((valid) => {
            if (active) setStatus(valid ? "allowed" : "denied");
        });

        return () => {
            active = false;
        };
    }, [user, verifySession]);

    if (status === "denied") {
        return <Navigate to="/" replace />;
    }

    if (status === "checking") {
        return null;
    }

    return children;
}
