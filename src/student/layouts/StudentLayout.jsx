import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function StudentLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSignOut = () => {
        // Placeholder: bind to backend auth logout
        // e.g., await axios.post("/api/auth/logout");
        console.log("Signing out...");
        window.location.href = "/login";
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