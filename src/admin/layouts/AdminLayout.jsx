import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSignOut = () => {
        console.log("Admin signing out...");
        window.location.href = "/admin/login";
    };

    return (
        <div className="min-h-screen bg-zinc-50">
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