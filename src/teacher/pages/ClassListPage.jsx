import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus, X, Users, School, Search, Filter, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import classApi from "../../services/classApi";

const COLORS = [
    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
    { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
];

export default function ClassListPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: "", courseId: "", semesterId: "" });
    const [formError, setFormError] = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [createdCode, setCreatedCode] = useState("");
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
            const res = await classApi.get("/api/v1/teacher/classes");
            setClasses(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load classes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const semesters = useMemo(() => [...new Set(classes.map((c) => c.semester || c.semesterId))].filter(Boolean).sort(), [classes]);

    const filtered = classes.filter((c) => {
        const q = searchQuery.trim().toLowerCase();
        const name = c.name || c.className || "";
        const code = c.code || c.classCode || "";
        const matchSearch = !q || name.toLowerCase().includes(q) || code.toLowerCase().includes(q);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError("");
        setCreatedCode("");

        if (!form.name.trim()) {
            setFormError("Class name is required");
            return;
        }
        if (!form.courseId.trim()) {
            setFormError("Course ID is required");
            return;
        }
        if (!form.semesterId.trim()) {
            setFormError("Semester ID is required");
            return;
        }

        setFormLoading(true);
        try {
            const res = await classApi.post("/api/v1/teacher/classes", {
                name: form.name.trim(),
                courseId: form.courseId.trim(),
                semesterId: form.semesterId.trim(),
            });
            const newClassCode = res.data?.classCode || res.data?.code || "";
            setCreatedCode(newClassCode);
            showToast(`Class created successfully! Code: ${newClassCode}`, "success");
            await fetchClasses();
            setForm({ name: "", courseId: "", semesterId: "" });
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to create class. Please try again.";
            setFormError(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const getColor = (index) => COLORS[index % COLORS.length];

    // Loading state
    if (loading && classes.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading your classes...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Toast notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all animate-slide-in ${toast.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
                    {toast.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage the classes you teach</p>
                </div>
                <button
                    onClick={() => { setShowCreate(true); setFormError(""); setCreatedCode(""); setForm({ name: "", courseId: "", semesterId: "" }); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Create New Class
                </button>
            </div>

            {/* Search & Filter Row */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by class name or code..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400"
                    />
                </div>
                <div className="relative w-full sm:w-44">
                    <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={semesterFilter}
                        onChange={(e) => setSemesterFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white"
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
                        Clear
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
                    <button onClick={fetchClasses} className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 underline cursor-pointer">
                        Try again
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!error && filtered.length === 0 && !loading && (
                <div className="text-center py-16 text-gray-400">
                    <School className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">No classes found</p>
                    <p className="text-xs mt-1">Click "Create New Class" to get started.</p>
                </div>
            )}

            {/* Cards */}
            {filtered.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((cls, idx) => {
                        const c = getColor(idx);
                        const classId = cls.id || cls.classId;
                        const name = cls.name || cls.className || "";
                        const code = cls.code || cls.classCode || "";
                        const studentCount = cls.studentCount || cls.students || 0;
                        const sem = cls.semester || cls.semesterId || "";
                        return (
                            <div key={classId} className={`bg-white rounded-xl border ${c.border} shadow-sm hover:shadow-md transition-shadow group relative`}>
                                <Link to={`/teacher/classes/${classId}`} className="block p-5">
                                    <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
                                        <BookOpen className={`w-5 h-5 ${c.text}`} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
                                    {code && <p className="text-xs text-gray-500 mt-0.5">Code: {code}</p>}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{studentCount} students</span>
                                    </div>
                                    {sem && <p className="text-[10px] text-gray-400 mt-1.5">{sem}</p>}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Create New Class</h2>
                            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>

                        {formError && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                {formError}
                            </div>
                        )}

                        {createdCode && (
                            <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                                <div className="flex items-center gap-2 font-semibold mb-1">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    Class Created Successfully!
                                </div>
                                <p className="text-emerald-700">
                                    Your class code is: <span className="font-bold text-lg tracking-wider">{createdCode}</span>
                                </p>
                                <p className="text-emerald-600 text-xs mt-1">Share this code with students to join.</p>
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="mt-3 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm cursor-pointer"
                                >
                                    Done
                                </button>
                            </div>
                        )}

                        {!createdCode && (
                            <form onSubmit={handleCreate}>
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Name <span className="text-red-400">*</span></label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Advanced Programming"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Course ID <span className="text-red-400">*</span></label>
                                    <input
                                        name="courseId"
                                        value={form.courseId}
                                        onChange={handleChange}
                                        placeholder="e.g. CS101"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Semester ID <span className="text-red-400">*</span></label>
                                    <input
                                        name="semesterId"
                                        value={form.semesterId}
                                        onChange={handleChange}
                                        placeholder="e.g. SPRING2026"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : "Create Class"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}