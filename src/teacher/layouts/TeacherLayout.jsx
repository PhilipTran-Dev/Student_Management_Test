import { useState } from "react";
import { Outlet } from "react-router-dom";
import { userApi } from "../../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function TeacherLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSignOut = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        try {
            if (refreshToken) {
                await userApi.post("/v1/auth/logout", { refreshToken });
            }
        } catch (err) {
            console.error("Logout API error:", err.response?.data?.message || err.message);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("role");
            localStorage.removeItem("user");
            window.location.href = "/teacher/login";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar
                mobileOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onSignOut={handleSignOut}
            />

            <div className="md:ml-64 flex flex-col min-h-screen">
                <Navbar onMenuToggle={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}