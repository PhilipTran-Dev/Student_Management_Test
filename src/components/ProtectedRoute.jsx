import { Navigate, Outlet } from "react-router-dom";

const ROLE_LOGIN_MAP = {
    STUDENT: "/student/login",
    TEACHER: "/teacher/login",
    ADMIN: "/admin/login",
};

export default function ProtectedRoute({ allowedRole }) {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    // No token — not authenticated at all
    if (!token) {
        const loginPath = ROLE_LOGIN_MAP[allowedRole];
        return <Navigate to={loginPath} replace />;
    }

    // Token exists but role mismatch — prevent cross-portal injection
    if (!storedRole || storedRole.toUpperCase() !== allowedRole.toUpperCase()) {
        const loginPath = ROLE_LOGIN_MAP[allowedRole];
        return <Navigate to={loginPath} replace />;
    }

    // Authenticated and authorized
    return <Outlet />;
}