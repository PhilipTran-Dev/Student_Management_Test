import { NavLink } from "react-router-dom";
import {
    BookOpen,
    ClipboardList,
    GraduationCap,
    User,
    LogOut,
    X,
    School,
    FileCheck,
} from "lucide-react";

const NAV_ITEMS = [
    { to: "/teacher/classes", icon: BookOpen, label: "Classes" },
    { to: "/teacher/assignments", icon: ClipboardList, label: "Assignments" },
    { to: "/teacher/submissions", icon: FileCheck, label: "Submissions" },
    { to: "/teacher/grades", icon: GraduationCap, label: "Grades" },
    { to: "/teacher/profile", icon: User, label: "Profile" },
];

export default function Sidebar({ mobileOpen, onClose, onSignOut }) {
    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Brand */}
                <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <School className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                            Teacher Portal
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="md:hidden text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Sign Out */}
                <div className="px-3 py-4 border-t border-gray-100">
                    <button
                        onClick={onSignOut}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}