import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen, Plus, X, LogOut, Users, UserCheck, AlertTriangle, Eye, EyeOff, Calendar, Search, Filter, CheckCircle
} from "lucide-react";
import { joinClass, fetchStudentClasses } from "../../services/classService";

// ── Course & Semester lookup tables (numeric ID → human-readable label) ──
const COURSES = [
    { id: 101, name: "Java Backend Development" },
    { id: 102, name: "Distributed Systems" },
];

const SEMESTERS = [
    { id: 1, name: "Semester 1 (Fall 2026)" },
    { id: 2, name: "Semester 2 (Spring 2027)" },
];

const COLOR_MAP = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
    rose: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", badge: "bg-rose-100 text-rose-700" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-100 text-purple-700" },
};

export default function ClassListPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(null);
    const [joinCode, setJoinCode] = useState("");
    const [joinPassword, setJoinPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [joinError, setJoinError] = useState("");
    const [joinSuccess, setJoinSuccess] = useState("");
    const [joinLoading, setJoinLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("all");

    // ── Fetch student classes on mount ──────────────────────────────────
    const loadClasses = async () => {
        setLoading(true);
        try {
            const data = await fetchStudentClasses();
            setClasses(Array.isArray(data) ? data : []);
        } catch {
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClasses();
    }, []);

    // ── Resolve semester display names for filter ───────────────────────
    const resolvedSemesters = classes
        .map((c) => {
            const sem = SEMESTERS.find((s) => s.id === c.semesterId);
            return sem ? sem.name : "";
        })
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort();

    const filtered = classes.filter((c) => {
        const q = searchQuery.trim().toLowerCase();
        const name = c.name || c.className || "";
        const instructor = c.teacherName || c.instructor || "";
        const course = COURSES.find((co) => co.id === c.courseId);
        const courseName = course ? course.name.toLowerCase() : "";
        const matchSearch = !q || name.toLowerCase().includes(q) || instructor.toLowerCase().includes(q) || courseName.includes(q);
        const sem = SEMESTERS.find((s) => s.id === c.semesterId);
        const semName = sem ? sem.name : "";
        const matchSemester = semesterFilter === "all" || semName === semesterFilter;
        return matchSearch && matchSemester;
    });

    const hasActiveFilters = searchQuery.trim() !== "" || semesterFilter !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setSemesterFilter("all");
    };

    // ── Join class handler ──────────────────────────────────────────────
    const handleJoinClass = async (e) => {
        e.preventDefault();
        setJoinError("");
        setJoinSuccess("");
        const trimmedCode = joinCode.trim().toUpperCase();
        if (!trimmedCode) {
            setJoinError("Please enter a class code");
            return;
        }
        setJoinLoading(true);
        try {
            await joinClass(trimmedCode, joinPassword.trim() || undefined);
            setJoinSuccess("Successfully joined the class!");
            setJoinCode("");
            setJoinPassword("");
            setShowPassword(false);
            setTimeout(() => {
                setShowJoinModal(false);
                setJoinSuccess("");
                loadClasses();
            }, 1200);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to join class. Please check your code and try again.";
            setJoinError(msg);
        } finally {
            setJoinLoading(false);
        }
    };

    const handleLeaveClass = (classId) => {
        setClasses((prev) => prev.filter((c) => c.id !== classId));
        setShowLeaveConfirm(null);
    };

    // ── Helper to get display fields ────────────────────────────────────
    const getClassId = (c) => c.id || c.classId;
    const getClassName = (c) => c.name || c.className || "Untitled Class";
    const getCourseName = (c) => {
        const course = COURSES.find((co) => co.id === c.courseId);
        return course ? course.name : c.courseTitle || c.subject || c.courseName || "";
    };
    const getSemesterName = (c) => {
        const sem = SEMESTERS.find((s) => s.id === c.semesterId);
        return sem ? sem.name : c.semester || c.semesterCode || "";
    };
    const getTeacherName = (c) => c.teacherName || c.instructor || "";
    const getTeacherEmail = (c) => c.teacherEmail || "";

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
                        placeholder="Search by course name or instructor..."
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
                        {resolvedSemesters.map((s) => (
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
            {loading ? (
                <div className="text-center py-16 text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                    <p className="text-sm font-medium">Loading your classes...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">No classes match your search criteria</p>
                    <p className="text-xs mt-1">Try adjusting your search or filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((cls) => {
                        const cid = getClassId(cls);
                        const courseName = getCourseName(cls);
                        const semesterName = getSemesterName(cls);
                        const teacherName = getTeacherName(cls);
                        const teacherEmail = getTeacherEmail(cls);
                        return (
                            <div
                                key={cid}
                                className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-5">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                                        <BookOpen className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{getClassName(cls)}</h3>
                                    {courseName && (
                                        <p className="text-xs text-gray-500 mb-3">{courseName}</p>
                                    )}
                                    <div className="space-y-1.5 text-xs text-gray-500">
                                        {teacherName && (
                                            <span className="flex items-center gap-1">
                                                <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
                                                {teacherName}
                                            </span>
                                        )}
                                        {teacherEmail && (
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                                                {teacherEmail}
                                            </span>
                                        )}
                                        {semesterName && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                                {semesterName}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            to={`/student/classes/${cid}`}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors bg-indigo-50 text-indigo-700 hover:opacity-80"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => setShowLeaveConfirm(cid)}
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
                        {joinSuccess && (
                            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                {joinSuccess}
                            </div>
                        )}
                        <form onSubmit={handleJoinClass}>
                            {/* Class Code */}
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Code</label>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); setJoinSuccess(""); }}
                                placeholder="Enter class code (e.g. CS101)"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 mb-4"
                                autoFocus
                            />

                            {/* Class Password */}
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Password <span className="text-gray-400 font-normal">(optional)</span></label>
                            <div className="relative mb-4">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={joinPassword}
                                    onChange={(e) => { setJoinPassword(e.target.value); setJoinError(""); setJoinSuccess(""); }}
                                    placeholder="Enter class password"
                                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

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