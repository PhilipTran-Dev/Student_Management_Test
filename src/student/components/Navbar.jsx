import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, Menu, User, LogOut, ChevronDown, Settings } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Navbar({ onMenuToggle, notificationCount = 0 }) {
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
                await axios.post(`${API_URL}/api/v1/auth/logout`, { refreshToken });
            }
        } catch (err) {
            console.error("Logout API error:", err.response?.data?.message || err.message);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("role");
            localStorage.removeItem("user");
            navigate("/student/login");
        }
    };

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="flex items-center justify-between px-4 md:px-6 h-16">
                {/* Left: hamburger on mobile + logo */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuToggle}
                        className="md:hidden text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="hidden md:flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">SMS</span>
                        </div>
                        <span className="font-semibold text-sm text-gray-800">Student Management</span>
                    </div>
                </div>

                <div className="flex-1" />

                {/* Right: notifications + avatar with dropdown */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button className="relative text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                        <Bell className="w-5 h-5" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {notificationCount > 9 ? "9+" : notificationCount}
                            </span>
                        )}
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="hidden sm:inline font-medium">Student</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                <Link
                                    to="/student/profile"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <User className="w-4 h-4 text-gray-400" />
                                    Profile
                                </Link>
                                <Link
                                    to="/student/dashboard"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-gray-400" />
                                    Settings
                                </Link>
                                <hr className="my-1 border-gray-100" />
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