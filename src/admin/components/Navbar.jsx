import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userApi } from "../../services/api";
import { Bell, Menu, User, LogOut, ChevronDown, Settings, Shield } from "lucide-react";

export default function Navbar({ onMenuToggle, notificationCount = 3 }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setProfileOpen(false);
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
            navigate("/admin/login");
        }
    };

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
            <div className="flex items-center justify-between px-4 md:px-6 h-16">
                <div className="flex items-center gap-3">
                    <button onClick={onMenuToggle} className="md:hidden text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="hidden md:flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-sm text-zinc-800">Admin Console</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 ml-3 pl-3 border-l border-zinc-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-zinc-400">System Online</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button className="relative p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all duration-200 cursor-pointer">
                        <Bell className="w-5 h-5" />
                        {notificationCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-zinc-50 transition-all duration-200 cursor-pointer group"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-sm">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-medium text-zinc-900">Admin</p>
                                <p className="text-[10px] text-zinc-400">Super Admin</p>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-all hidden sm:block ${profileOpen ? "rotate-180" : ""}`} />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-100 py-1 z-50">
                                <Link
                                    to="/admin/users"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                                >
                                    <User className="w-4 h-4 text-zinc-400" />
                                    Profile
                                </Link>
                                <Link
                                    to="/admin/users"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-zinc-400" />
                                    Settings
                                </Link>
                                <hr className="my-1 border-zinc-100" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}