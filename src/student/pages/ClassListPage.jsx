import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus, X, LogOut, Users, UserCheck, AlertTriangle, Eye, Calendar, Search, Filter } from "lucide-react";

const MOCK_CLASSES = [
    { id: "CS101", name: "Introduction to Programming", code: "CS101-2026-S1", instructor: "Dr. Tran Van B", semester: "Spring 2026", students: 45, color: "indigo" },
    { id: "CS201", name: "Data Structures & Algorithms", code: "CS201-2026-S1", instructor: "Prof. Le Thi C", semester: "Spring 2026", students: 38, color: "emerald" },
    { id: "MA101", name: "Calculus I", code: "MA101-2026-S1", instructor: "Dr. Pham Van D", semester: "Spring 2026", students: 52, color: "amber" },
    { id: "EN201", name: "Academic English", code: "EN201-2026-S1", instructor: "Ms. Nguyen Thi E", semester: "Fall 2025", students: 30, color: "rose" },
    { id: "PH101", name: "Physics for Engineers", code: "PH101-2026-S1", instructor: "Dr. Hoang Van F", semester: "Spring 2026", students: 41, color: "purple" },
];

const COLOR_MAP = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
    rose: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", badge: "bg-rose-100 text-rose-700" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-100 text-purple-700" },
};

export default function ClassListPage() {
    const [classes, setClasses] = useState(MOCK_CLASSES);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);
    const [joinCode, setJoinCode] = useState("");
    const [joinError, setJoinError] = useState("");
    const [joinLoading, setJoinLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("all");

    const semesters = [...new Set(classes.map((c) => c.semester))].sort();

    const filtered = classes.filter((c) => {
        const q = searchQuery.trim().toLowerCase();
        const matchSearch = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
        const matchSemester = semesterFilter === "all" || c.semester === semesterFilter;
        return matchSearch && matchSemester;
    });

    const hasActiveFilters = searchQuery.trim() !== "" || semesterFilter !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setSemesterFilter("all");
    };

    const handleJoinClass = async (e) => {
        e.preventDefault();
        setJoinError("");
        if (!joinCode.trim()) {
            setJoinError("Please enter a class code");
            return;
        }
        setJoinLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 1000));
            setClasses((prev) => [
                ...prev,
                { id: joinCode.toUpperCase(), name: `New Class (${joinCode.toUpperCase()})`, code: joinCode.toUpperCase(), instructor: "Pending", semester: "Spring 2026", students: 1, color: "indigo" },
            ]);
            setJoinCode("");
            setShowJoinModal(false);
        } catch (err) {
            setJoinError(err.response?.data?.message || "Invalid class code. Please try again.");
        } finally {
            setJoinLoading(false);
        }
    };

    const handleLeaveClass = (classId) => {
        setClasses((prev) => prev.filter((c) => c.id !== classId));
        setShowLeaveConfirm(null);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Enrolled Classes</h1>
                    <p className="text-gray-500 text-sm mt-1">View all classes you are currently enrolled in</p>
                </div>
                <button
                    onClick={() => setShowJoinModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Join Class
                </button>
            </div>

            {/* Search & Filter Row */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by course name, code, or instructor..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400"
                    />
                </div>
                <div className="relative w-full sm:w-48">
                    <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={semesterFilter}
                        onChange={(e) => setSemesterFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400 appearance-none bg-white"
                    >
                        <option value="all">All Semesters</option>
                        {semesters.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Results count */}
            <p className="text-xs text-gray-400 mb-3">{filtered.length} class{filtered.length !== 1 ? "es" : ""} found</p>

            {/* Class Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">No classes match your search criteria</p>
                    <p className="text-xs mt-1">Try adjusting your search or filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((cls) => {
                        const colors = COLOR_MAP[cls.color] || COLOR_MAP.indigo;
                        return (
                            <div
                                key={cls.id}
                                className={`group relative bg-white rounded-xl border ${colors.border} shadow-sm hover:shadow-md transition-shadow`}
                            >
                                <div className="p-5">
                                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-3`}>
                                        <BookOpen className={`w-5 h-5 ${colors.text}`} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{cls.name}</h3>
                                    <p className="text-xs text-gray-500 mb-2">Code: {cls.code}</p>
                                    <div className="space-y-1.5 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
                                            {cls.instructor}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                            {cls.semester}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5 flex-shrink-0" />
                                            {cls.students} students
                                        </span>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            to={`/student/classes/${cls.id}`}
                                            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${colors.bg} ${colors.text} hover:opacity-80`}
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => setShowLeaveConfirm(cls.id)}
                                            className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                            title="Leave class"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Join Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowJoinModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Join a Class</h2>
                            <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {joinError && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{joinError}</div>
                        )}
                        <form onSubmit={handleJoinClass}>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Code</label>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => { setJoinCode(e.target.value); setJoinError(""); }}
                                placeholder="Enter class code (e.g. CS101)"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 mb-4"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={joinLoading}
                                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm transition-colors cursor-pointer"
                            >
                                {joinLoading ? "Joining..." : "Join Class"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Leave Confirmation */}
            {showLeaveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowLeaveConfirm(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm z-10 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Leave Class?</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to leave this class? You may need a new code to re-join.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLeaveConfirm(null)}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleLeaveClass(showLeaveConfirm)}
                                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors cursor-pointer"
                            >
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}