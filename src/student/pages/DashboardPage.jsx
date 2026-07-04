import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, GraduationCap, TrendingUp, ArrowRight, Calendar, Clock, Bell } from "lucide-react";
import { fetchStudentClasses, fetchAnnouncements } from "../../services/classService";

const STATS = [
    { label: "Enrolled Classes", value: "loading", icon: BookOpen, color: "bg-indigo-50 text-indigo-600", to: "/student/dashboard" },
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
    const [enrolledClasses, setEnrolledClasses] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                const classes = await fetchStudentClasses();
                const classList = Array.isArray(classes) ? classes : [];
                setEnrolledClasses(classList);

                const activityResults = await Promise.all(
                    classList.map(async (classroom) => {
                        const announcements = await fetchAnnouncements(classroom.id, "student");
                        return (Array.isArray(announcements) ? announcements : []).map((item) => ({
                            ...item,
                            className: classroom.name || classroom.className || "Class",
                        }));
                    })
                );

                const flattenedActivities = activityResults.flat().sort((a, b) => {
                    const aDate = new Date(a.createdAt || a.date || 0);
                    const bDate = new Date(b.createdAt || b.date || 0);
                    return bDate - aDate;
                });

                setRecentActivities(flattenedActivities.slice(0, 5));
            } catch (error) {
                console.error("Failed to load dashboard data", error);
                setEnrolledClasses([]);
                setRecentActivities([]);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const stats = STATS.map((stat) =>
        stat.label === "Enrolled Classes"
            ? { ...stat, value: loading ? "..." : enrolledClasses.length }
            : stat
    );

    const formatActivityDate = (value) => {
        if (!value) return "Recently published";
        try {
            return new Date(value).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            });
        } catch {
            return value;
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Welcome back, Nguyen Van A</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((s) => (
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

                {/* Recent activity */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-500" />
                        Recent Activity
                    </h2>
                    <div className="space-y-3">
                        {recentActivities.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                                No recent activities or announcements found from your enrolled classes.
                            </div>
                        ) : recentActivities.map((item, idx) => {
                            const content = item.title || item.content || "New class update";
                            const className = item.className || "Class";
                            return (
                                <div key={`${item.id || idx}-${className}`} className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-2" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                                                [{className}]
                                            </span>
                                            <p className="text-sm font-medium text-gray-900">{content}</p>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{formatActivityDate(item.createdAt || item.date)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}