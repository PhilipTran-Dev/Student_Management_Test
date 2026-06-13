import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, GraduationCap, TrendingUp, ArrowRight, Calendar, Clock, Bell } from "lucide-react";

const STATS = [
    { label: "Enrolled Classes", value: 4, icon: BookOpen, color: "bg-indigo-50 text-indigo-600", to: "/student/dashboard" },
    { label: "Pending Assignments", value: 3, icon: ClipboardList, color: "bg-amber-50 text-amber-600", to: "/student/assignments" },
    { label: "Overall Average", value: "81.5%", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600", to: "/student/grades" },
    { label: "GPA", value: "3.35", icon: GraduationCap, color: "bg-purple-50 text-purple-600", to: "/student/grades" },
];

const UPCOMING = [
    { title: "Week 2 - Variables & Types", class: "CS101", due: "2026-02-17", status: "todo" },
    { title: "Week 3 - Loops", class: "CS101", due: "2026-02-24", status: "todo" },
    { title: "Calculus HW 1", class: "MA101", due: "2026-02-28", status: "todo" },
];

export default function DashboardPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Welcome back, Nguyen Van A</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {STATS.map((s) => (
                    <Link key={s.label} to={s.to} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className={`p-2.5 rounded-lg ${s.color}`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-3">{s.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </Link>
                ))}
            </div>

            {/* Upcoming & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming deadlines */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Upcoming Deadlines
                    </h2>
                    <div className="space-y-3">
                        {UPCOMING.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                    <p className="text-xs text-gray-400">{item.class} &middot; Due {item.due}</p>
                                </div>
                            </div>
                        ))}
                        <Link to="/student/assignments" className="inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-1">
                            View all assignments →
                        </Link>
                    </div>
                </div>

                {/* Recent activity placeholder */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-500" />
                        Recent Activity
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">Submitted Week 1 assignment</p>
                                <p className="text-xs text-gray-400">CS101 &middot; 2 days ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">Joined class MA101</p>
                                <p className="text-xs text-gray-400">Calculus I &middot; 5 days ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">Joined class EN201</p>
                                <p className="text-xs text-gray-400">Academic English &middot; 1 week ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}