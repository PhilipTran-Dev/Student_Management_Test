import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen, Plus, X, LogOut, Users, UserCheck, AlertTriangle, Eye, Calendar, Search, Filter,
    Loader2, CheckCircle, ArrowRight
} from "lucide-react";
import classApi from "../../services/classApi";

const COLOR_MAP = [
    { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700" },
    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
    { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
    { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", badge: "bg-rose-100 text-rose-700" },
    { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-100 text-purple-700" },
];

export default function ClassListPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinError, setJoinError] = useState("");
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("all");
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await classApi.get("/api/v1/classes/student");
            setClasses(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load your classes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const semesters = useMemo(() =>
        [...new Set(classes.map((c) => c.semester || c.semesterId))].filter(Boolean).sort(),
        [classes]
    );

    const filtered = classes.filter((c) => {
        const q = searchQuery.trim().toLowerCase();
        const name = c.name || c.className || "";
        const code = c.code || c.classCode || "";
        const instructor = c.instructor || c.teacherName || "";
        const matchSearch = !q || name.toLowerCase().includes(q) || code.toLowerCase().includes(q) || instructor.toLowerCase().includes(q);
        const sem = c.semester || c.semesterId || "";
        const matchSemester = semesterFilter === "all" || sem === semesterFilter;
        return matchSearch && matchSemester;
    });

    const hasActiveFilters = searchQuery.trim() !== "" || semesterFilter !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setSemesterFilter("all");
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleJoinClass = async (e) => {
        e.preventDefault();
        setJoinError("");

        const code = joinCode.trim();
        if (!code) {
            setJoinError("Please enter a class code");
            return;
        }
        if (code.length !== 6) {
            setJoinError("Class code must be exactly 6 characters");
            return;
        }

        setJoinLoading(true);
        try {
            await classApi.post("/api/v1/classes/join", { code: code.toUpperCase() });
            setJoinCode("");
            showToast("Successfully joined the class!");
            await fetchClasses();
        } catch (err) {
            const msg = err.response?.data?.message || "Invalid class code. Please try again.";
            setJoinError(msg);
        } finally {
            setJoinLoading(false);
        }
    };

    const handleLeaveClass = async (classId) => {
        setLeaveLoading(true);
        try {
            await classApi.delete(`/api/v1/classes/${classId}/leave`);
            setClasses((prev) => prev.filter((c) => (c.id || c.classId) !== classId));
            setShowLeaveConfirm(null);
            showToast("You have left the class");
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to leave class", "error");
        } finally {
            setLeaveLoading(false);
        }
    };

    const getColor = (index) => COLOR_MAP[index % COLOR_MAP.length];

    // Loading state
    if (loading && classes.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading your classes...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${toast.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
                    {toast.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Enrolled Classes</h1>
                    <p className="text-gray-500 text-sm mt-1">View all classes you are currently enrolled in</p>
                </div>
            </div>

            {/* Join Class by Code - Prominent Search Bar */}
            <div className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1 w-full">
                        <label htmlFor="joinCode" className="block text-sm font-medium text-indigo-800 mb-1.5">
                            <BookOpen className="w-4 h-4 inline mr-1" />
                            Join class with code
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="joinCode"
                                type="text"
                                value={joinCode}
                                onChange={(e) => { setJoinCode(e.target.value.toUpperCase().slice(0, 6)); setJoinError(""); }}
                                placeholder="Enter 6-character class code"
                                className="w-full px-4 py-2.5 rounded-lg border border-indigo-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 uppercase tracking-widest"
                                maxLength={6}
                                autoComplete="off"
                            />
                            <button
                                onClick={handleJoinClass}
                                disabled={joinLoading || joinCode.trim().length !== 6}
                                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium text-sm transition-colors cursor-pointer inline-flex items-center gap-2 flex-shrink-0"
                            >
                                {joinLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Join <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                        {joinError && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {joinError}
                            </p>
                        )}
                    </div>
                </div>
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
            <p className="text-xs text-gray-400 mb-3">
                {error ? "" : `${filtered.length} class${filtered.length !== 1 ? "es" : ""} found`}
            </p>

            {/* Error state */}
            {error && !loading && (
                <div className="text-center py-16 text-gray-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                    <p className="text-sm font-medium text-red-500">{error}</p>
                    <button onClick={fetchClasses} className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 underline cursor-pointer">
                        Try again
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!error && filtered.length === 0 && !loading && (
                <div className="text-center py-16 text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">No classes found</p>
                    <p className="text-xs mt-1">Use the search bar above to join a class with its code.</p>
                </div>
            )}

            {/* Class Grid */}
            {filtered.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((cls, idx) => {
                        const colors = getColor(idx);
                        const classId = cls.id || cls.classId;
                        const name = cls.name || cls.className || "";
                        const code = cls.code || cls.classCode || "";
                        const instructor = cls.instructor || cls.teacherName || "";
                        const sem = cls.semester || cls.semesterId || "";
                        const studentCount = cls.studentCount || cls.students || 0;
                        return (
                            <div key={classId} className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-5">
                                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-3`}>
                                        <BookOpen className={`w-5 h-5 ${colors.text}`} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{name}</h3>
                                    {code && <p className="text-xs text-gray-500 mb-2">Code: {code}</p>}
                                    <div className="space-y-1.5 text-xs text-gray-500">
                                        {instructor && (
                                            <span className="flex items-center gap-1">
                                                <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
                                                {instructor}
                                            </span>
                                        )}
                                        {sem && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                                {sem}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5 flex-shrink-0" />
                                            {studentCount} students
                                        </span>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            to={`/student/classes/${classId}`}
                                            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${colors.bg} ${colors.text} hover:opacity-80`}
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => setShowLeaveConfirm(classId)}
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
                                disabled={leaveLoading}
                                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                            >
                                {leaveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}