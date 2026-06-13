import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Plus, X, Calendar, FileText, Trash2, Clock, Search, Filter } from "lucide-react";

const MOCK = [
    { id: "A01", title: "Week 1 - Hello World", class: "CS101", due: "2026-02-10T23:59", points: 10, submissions: 42, totalStudents: 45 },
    { id: "A02", title: "Week 2 - Variables", class: "CS101", due: "2026-02-17T23:59", points: 10, submissions: 38, totalStudents: 45 },
    { id: "A03", title: "Lab 1 - Data Structures", class: "CS201", due: "2026-02-20T23:59", points: 20, submissions: 35, totalStudents: 38 },
    { id: "A04", title: "Midterm Exam", class: "CS101", due: "2026-03-15T23:59", points: 100, submissions: 45, totalStudents: 45 },
    { id: "A05", title: "Calculus Quiz 1", class: "MA101", due: "2026-02-28T23:59", points: 15, submissions: 48, totalStudents: 52 },
];

export default function AssignmentListPage() {
    const [assignments, setAssignments] = useState(MOCK);
    const [showCreate, setShowCreate] = useState(false);
    const [showExtend, setShowExtend] = useState(null);
    const [showDelete, setShowDelete] = useState(null);
    const [form, setForm] = useState({ title: "", classId: "", due: "", points: "" });
    const [extendForm, setExtendForm] = useState({ newDue: "" });
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [gradingFilter, setGradingFilter] = useState("all");

    const classOptions = useMemo(() => [...new Set(assignments.map((a) => a.class))].sort(), [assignments]);

    const hasActiveFilters = searchQuery.trim() !== "" || classFilter !== "all" || gradingFilter !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setClassFilter("all");
        setGradingFilter("all");
    };

    const filtered = assignments.filter((a) => {
        const q = searchQuery.trim().toLowerCase();
        const matchSearch = !q || a.title.toLowerCase().includes(q);
        const matchClass = classFilter === "all" || a.class === classFilter;
        let matchGrading = gradingFilter === "all";
        if (gradingFilter === "pending") matchGrading = a.submissions < a.totalStudents;
        if (gradingFilter === "graded") matchGrading = a.submissions >= a.totalStudents;
        return matchSearch && matchClass && matchGrading;
    });

    const handleCreate = async (e) => {
        e.preventDefault(); setFormError("");
        if (!form.title.trim() || !form.classId.trim() || !form.due || !form.points) { setFormError("All fields required"); return; }
        if (parseInt(form.points) < 1) { setFormError("Points must be at least 1"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 800));
            setAssignments((p) => [{ id: `A${Date.now()}`, title: form.title, class: form.classId, due: form.due, points: parseInt(form.points), submissions: 0, totalStudents: 0 }, ...p]);
            setShowCreate(false); setForm({ title: "", classId: "", due: "", points: "" }); setFiles([]);
        } finally { setLoading(false); }
    };

    const handleExtend = async (e) => {
        e.preventDefault(); setFormError("");
        if (!extendForm.newDue) { setFormError("Select a new deadline"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 500));
            setAssignments((p) => p.map((a) => a.id === showExtend.id ? { ...a, due: extendForm.newDue } : a));
            setShowExtend(null); setExtendForm({ newDue: "" });
        } finally { setLoading(false); }
    };

    const handleDelete = (id) => { setAssignments((p) => p.filter((a) => a.id !== id)); setShowDelete(null); };

    const handleFileSelect = (e) => {
        const selected = Array.from(e.target.files || []);
        setFiles((prev) => [...prev, ...selected]);
        e.target.value = "";
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div><h1 className="text-2xl font-bold text-gray-900">Assignments</h1><p className="text-gray-500 text-sm mt-1">Create and manage assignments</p></div>
                <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Create Assignment</button>
            </div>

            {/* Search & Filter Row */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by assignment title..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400"
                    />
                </div>
                <div className="relative w-full sm:w-40">
                    <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white"
                    >
                        <option value="all">All Classes</option>
                        {classOptions.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full sm:w-40">
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={gradingFilter}
                        onChange={(e) => setGradingFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white"
                    >
                        <option value="all">All Tasks</option>
                        <option value="pending">Has Pending Submissions</option>
                        <option value="graded">Fully Graded</option>
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
            <p className="text-xs text-gray-400 mb-3">{filtered.length} assignment{filtered.length !== 1 ? "s" : ""} found</p>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400"><ClipboardList className="w-12 h-12 mx-auto mb-3" /><p className="text-sm font-medium">No assignments match your criteria</p><p className="text-xs mt-1">Try adjusting your search or filters.</p></div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((a) => (
                        <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors flex items-start justify-between gap-4">
                            <Link to={`/teacher/assignments/${a.id}`} className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">{a.class}</span>
                                    {a.submissions < a.totalStudents ? (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-semibold">Pending</span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">Graded</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {new Date(a.due).toLocaleDateString()}</span>
                                    <span>{a.points} pts</span>
                                    <span>{a.submissions}/{a.totalStudents} submissions</span>
                                </div>
                            </Link>
                            <div className="flex gap-1 flex-shrink-0">
                                <button onClick={(e) => { e.preventDefault(); setShowExtend(a); setExtendForm({ newDue: "" }); }} className="p-1.5 rounded-lg text-gray-300 hover:text-amber-500 hover:bg-amber-50 cursor-pointer" title="Extend deadline"><Clock className="w-4 h-4" /></button>
                                <button onClick={(e) => { e.preventDefault(); setShowDelete(a.id); }} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Create Assignment</h2><button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button></div>
                        {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{formError}</div>}
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input name="title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Class ID</label><input name="classId" value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} placeholder="e.g. CS101" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label><input type="number" name="points" value={form.points} onChange={(e) => setForm((p) => ({ ...p, points: e.target.value }))} min="1" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" /></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label><input type="datetime-local" name="due" value={form.due} onChange={(e) => setForm((p) => ({ ...p, due: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 [color-scheme:light]" /></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Files</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-400 transition-colors" onClick={() => document.getElementById("attachFiles").click()}>
                                    <FileText className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                                    <p className="text-xs text-gray-500">{files.length > 0 ? `${files.length} file(s) selected` : "Click to browse (multi-select)"}</p>
                                    <input id="attachFiles" type="file" multiple className="hidden" onChange={handleFileSelect} />
                                </div>
                                {files.length > 0 && (
                                    <div className="mt-3 space-y-1.5">
                                        {files.map((f, idx) => (
                                            <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                                                <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                <span className="flex-1 text-xs text-gray-700 truncate">{f.name}</span>
                                                <span className="text-[10px] text-gray-400 flex-shrink-0">{(f.size / 1024).toFixed(1)} KB</span>
                                                <button type="button" onClick={() => removeFile(idx)} className="p-0.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer flex-shrink-0">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm cursor-pointer">{loading ? "Creating..." : "Create Assignment"}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Extend Modal */}
            {showExtend && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowExtend(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10">
                        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Extend Deadline</h2><button onClick={() => setShowExtend(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button></div>
                        {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{formError}</div>}
                        <form onSubmit={handleExtend}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Deadline</label>
                            <input type="datetime-local" value={extendForm.newDue} onChange={(e) => setExtendForm({ newDue: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 mb-4 [color-scheme:light]" />
                            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold text-sm cursor-pointer">{loading ? "Extending..." : "Extend Deadline"}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {showDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowDelete(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm z-10 text-center">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Assignment?</h2>
                        <p className="text-sm text-gray-500 mb-6">All submissions for this assignment will also be removed.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDelete(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium cursor-pointer">Cancel</button>
                            <button onClick={() => handleDelete(showDelete)} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium cursor-pointer">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}