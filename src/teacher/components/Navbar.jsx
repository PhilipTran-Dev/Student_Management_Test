import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, User, LogOut, ChevronDown, Settings } from "lucide-react";

export default function Navbar({ onMenuToggle, notificationCount = 0 }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="flex items-center justify-between px-4 md:px-6 h-16">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuToggle}
                        className="md:hidden text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="hidden md:flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">SMS</span>
                        </div>
                        <span className="font-semibold text-sm text-gray-800">Teacher Portal</span>
                    </div>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-3">
                    <button className="relative text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                        <Bell className="w-5 h-5" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {notificationCount > 9 ? "9+" : notificationCount}
                            </span>
                        )}
                    </button>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="hidden sm:inline font-medium">Teacher</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                <Link
                                    to="/teacher/profile"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <User className="w-4 h-4 text-gray-400" />
                                    Profile
                                </Link>
                                <Link
                                    to="/teacher/classes"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-gray-400" />
                                    Settings
                                </Link>
                                <hr className="my-1 border-gray-100" />
                                <button
                                    onClick={() => { setProfileOpen(false); window.location.href = "/teacher/login"; }}
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