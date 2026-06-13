import { NavLink } from "react-router-dom";
import { Users, Building2, BookOpen, Calendar, LogOut, X, Shield, ChevronRight } from "lucide-react";

const NAV_SECTIONS = [
    {
        label: "User Management",
        items: [{ to: "/admin/users", icon: Users, label: "User Management" }],
    },
    {
        label: "Data Management",
        items: [
            { to: "/admin/faculties", icon: Building2, label: "Faculties" },
            { to: "/admin/courses", icon: BookOpen, label: "Courses" },
            { to: "/admin/semesters", icon: Calendar, label: "Semesters" },
        ],
    },
];

export default function Sidebar({ mobileOpen, onClose, onSignOut }) {
    return (
        <>
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white/90 backdrop-blur-xl border-r border-zinc-200/60 flex flex-col transition-all duration-300 ease-in-out md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Brand */}
                <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className="font-semibold text-sm text-zinc-900">Admin</span>
                            <span className="font-semibold text-sm text-zinc-400">Console</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="md:hidden text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-6">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label}>
                            <p className="px-3 mb-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em]">
                                {section.label}
                            </p>
                            <div className="space-y-0.5">
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out ${isActive
                                                ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-full" />
                                                )}
                                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-indigo-600" : "text-zinc-400"
                                                    }`} />
                                                <span>{item.label}</span>
                                                <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-all duration-200 ${isActive ? "opacity-100 text-indigo-400" : "opacity-0 group-hover:opacity-50"
                                                    }`} />
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Sign Out */}
                <div className="px-3 py-4 border-t border-zinc-100">
                    <button
                        onClick={onSignOut}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer group"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}