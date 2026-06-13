import { useState, useMemo } from "react";
import { FileText, Download, Search, Clock, CheckCircle, AlertCircle, X, Send, Star, SlidersHorizontal, Filter } from "lucide-react";

const MOCK_SUBMISSIONS = [
    { id: "S001", student: "Nguyen Van A", assignment: "Week 1 - Hello World", class: "CS101", submitted: "2026-02-09T14:30", status: "ontime", file: "hello_world.js", score: null, feedback: "", academicYear: "Spring 2026" },
    { id: "S002", student: "Tran Thi B", assignment: "Week 1 - Hello World", class: "CS101", submitted: "2026-02-11T23:45", status: "late", file: "hello_world_b.js", score: null, feedback: "", academicYear: "Spring 2026" },
    { id: "S003", student: "Le Van C", assignment: "Week 1 - Hello World", class: "CS101", submitted: null, status: "missing", file: null, score: null, feedback: "", academicYear: "Spring 2026" },
    { id: "S004", student: "Pham Thi D", assignment: "Week 2 - Variables", class: "CS101", submitted: "2026-02-16T10:00", status: "ontime", file: "variables.js", score: 9, feedback: "Good work!", academicYear: "Spring 2026" },
    { id: "S005", student: "Nguyen Van E", assignment: "Lab 1 - Data Structures", class: "CS201", submitted: "2026-02-19T15:20", status: "ontime", file: "ds_lab.py", score: 8, feedback: "Well structured.", academicYear: "Fall 2025" },
    { id: "S006", student: "Tran Thi F", assignment: "Lab 1 - Data Structures", class: "CS201", submitted: "2026-02-21T08:00", status: "late", file: "ds_lab_f.py", score: null, feedback: "", academicYear: "Fall 2025" },
    { id: "S007", student: "Le Van G", assignment: "Week 1 - Hello World", class: "CS101", submitted: "2026-02-10T09:00", status: "ontime", file: "hello_world_g.js", score: 7, feedback: "Needs more comments.", academicYear: "Spring 2026" },
    { id: "S008", student: "Pham Thi H", assignment: "Week 2 - Variables", class: "CS101", submitted: "2026-02-18T22:00", status: "late", file: "variables_h.js", score: null, feedback: "", academicYear: "Spring 2026" },
];

const STATUS_STYLES = {
    ontime: { label: "On Time", color: "text-emerald-600 bg-emerald-50" },
    late: { label: "Late", color: "text-amber-600 bg-amber-50" },
    missing: { label: "Missing", color: "text-red-600 bg-red-50" },
};

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [assignmentFilter, setAssignmentFilter] = useState("all");
    const [selected, setSelected] = useState(null);
    const [gradeForm, setGradeForm] = useState({ score: "", feedback: "" });
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    // Derived filter options
    const filterOptions = useMemo(() => {
        const classes = [...new Set(submissions.map((s) => s.class))].sort();
        const assignments = [...new Set(submissions.map((s) => s.assignment))].sort();
        return { classes, assignments };
    }, [submissions]);

    const hasActiveFilters = searchQuery.trim() !== "" || classFilter !== "all" || assignmentFilter !== "all" || statusFilter !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setClassFilter("all");
        setAssignmentFilter("all");
        setStatusFilter("all");
    };

    // Combined filtering
    const filtered = useMemo(() => {
        return submissions.filter((s) => {
            const q = searchQuery.trim().toLowerCase();
            const matchSearch = !q || s.student.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
            const matchClass = classFilter === "all" || s.class === classFilter;
            const matchAssignment = assignmentFilter === "all" || s.assignment === assignmentFilter;
            const matchStatus = statusFilter === "all" || s.status === statusFilter;
            return matchSearch && matchClass && matchAssignment && matchStatus;
        });
    }, [submissions, searchQuery, classFilter, assignmentFilter, statusFilter]);

    const handleGrade = async (e) => {
        e.preventDefault(); setFormError("");
        if (gradeForm.score === "" || gradeForm.score < 0) { setFormError("Enter a valid score"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 800));
            setSubmissions((p) => p.map((s) => s.id === selected.id ? { ...s, score: parseFloat(gradeForm.score), feedback: gradeForm.feedback } : s));
            setSelected(null); setGradeForm({ score: "", feedback: "" });
        } finally { setLoading(false); }
    };

    const openGradeModal = (s) => {
        if (s.status === "missing") return;
        setSelected(s);
        setGradeForm({ score: s.score ?? "", feedback: s.feedback });
        setFormError("");
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
                <p className="text-gray-500 text-sm mt-1">View and grade student submissions</p>
            </div>

            {/* Search & Filter Bar */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by student name or ID..."
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
                        {filterOptions.classes.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full sm:w-44">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={assignmentFilter}
                        onChange={(e) => setAssignmentFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white"
                    >
                        <option value="all">All Assignments</option>
                        {filterOptions.assignments.map((a) => (
                            <option key={a} value={a}>{a}</option>
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

            {/* Status Pills */}
            <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit flex-wrap">
                {[
                    { key: "all", label: "All", icon: null },
                    { key: "ontime", label: "On Time", icon: CheckCircle },
                    { key: "late", label: "Late", icon: Clock },
                    { key: "missing", label: "Missing", icon: AlertCircle },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer capitalize ${statusFilter === key ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
                    >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {label}
                    </button>
                ))}
            </div>

            {/* Results count */}
            <p className="text-xs text-gray-400 mb-3">{filtered.length} submission{filtered.length !== 1 ? "s" : ""} found</p>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400"><FileText className="w-12 h-12 mx-auto mb-3" /><p className="text-sm font-medium">No submissions match your filters</p><p className="text-xs mt-1">Try adjusting your search or filter criteria.</p></div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-5 py-3 font-semibold text-gray-700">Student</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-700">Assignment</th>
                                    <th className="text-center px-5 py-3 font-semibold text-gray-700">Status</th>
                                    <th className="text-center px-5 py-3 font-semibold text-gray-700">Score</th>
                                    <th className="text-center px-5 py-3 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, idx) => {
                                    const st = STATUS_STYLES[s.status];
                                    const isClickable = s.status !== "missing";
                                    return (
                                        <tr
                                            key={s.id}
                                            onClick={() => openGradeModal(s)}
                                            className={`${idx < filtered.length - 1 ? "border-b border-gray-100" : ""} ${isClickable ? "hover:bg-gray-50 cursor-pointer" : ""} transition-colors`}
                                        >
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-gray-900">{s.student}</p>
                                                <p className="text-xs text-gray-400">{s.id}</p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-gray-900">{s.assignment}</p>
                                                <p className="text-xs text-gray-400">{s.class}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${st.color}`}>{st.label}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {s.score !== null ? (
                                                    <span className="font-semibold text-emerald-600">{s.score}</span>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openGradeModal(s)}
                                                        className={`p-1.5 rounded-lg cursor-pointer ${isClickable ? "text-gray-400 hover:text-emerald-500 hover:bg-emerald-50" : "text-gray-200 cursor-not-allowed"}`}
                                                        disabled={!isClickable}
                                                        title={isClickable ? "Grade submission" : "Cannot grade missing submission"}
                                                    >
                                                        <Star className="w-4 h-4" />
                                                    </button>
                                                    {s.file && (
                                                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 cursor-pointer" title="Download file">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Grade Modal */}
            {selected && selected.status !== "missing" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => { setSelected(null); setFormError(""); }} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Grade Submission</h2>
                            <button onClick={() => { setSelected(null); setFormError(""); }} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{selected.student}</p>
                            <p className="text-xs text-gray-500">{selected.assignment} &middot; {selected.class}</p>
                            {selected.file && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-indigo-600">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="font-medium">{selected.file}</span>
                                    <button className="hover:text-indigo-800 cursor-pointer"><Download className="w-3.5 h-3.5" /></button>
                                </div>
                            )}
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{formError}</div>}
                        <form onSubmit={handleGrade} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                                <input type="number" step="0.5" value={gradeForm.score} onChange={(e) => setGradeForm((p) => ({ ...p, score: e.target.value }))} placeholder="0-10" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                                <textarea rows={3} value={gradeForm.feedback} onChange={(e) => setGradeForm((p) => ({ ...p, feedback: e.target.value }))} placeholder="Write feedback..." className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 resize-none" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm cursor-pointer flex items-center justify-center gap-2">
                                {loading ? "Saving..." : <><Send className="w-4 h-4" /> Submit Grade & Feedback</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}