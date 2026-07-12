import { useState, useEffect, useMemo } from "react";
import { FileText, Download, Search, Clock, CheckCircle, AlertCircle, X, Send, Star, Filter, BookOpen, Loader2, Eye } from "lucide-react";
import { fetchClasses } from "../../services/classService";
import { getTeacherAssignments, getAssignmentSubmissions, gradeSubmission, getAttachmentUrl } from "../../services/assignmentService";

const STATUS_STYLES = {
    ON_TIME: { label: "On Time", color: "text-emerald-600 bg-emerald-50" },
    LATE: { label: "Late", color: "text-amber-600 bg-amber-50" },
    MISSING: { label: "Missing", color: "text-red-600 bg-red-50" },
    TO_DO: { label: "To Do", color: "text-gray-600 bg-gray-100" },
};

export default function SubmissionsPage() {
    const [classes, setClasses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selected, setSelected] = useState(null);
    const [gradeForm, setGradeForm] = useState({ score: "", feedback: "" });
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleFileAction = async (objectName, actionType) => {
        try {
            const response = await getAttachmentUrl(objectName);
            const url = response?.data?.url || response?.url || response;
            if (actionType === "preview") {
                const ext = objectName.split(".").pop()?.toLowerCase();
                const officeExts = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
                if (officeExts.includes(ext)) {
                    window.open("https://view.officeapps.live.com/op/view.aspx?src=" + encodeURIComponent(url), "_blank");
                } else {
                    window.open(url, "_blank");
                }
            } else {
                const a = document.createElement("a");
                a.href = url;
                a.download = "";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch {
            console.error(`Failed to ${actionType} file:`, objectName);
        }
    };

    useEffect(() => {
        fetchClasses()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setClasses(list);
                if (list.length > 0) setSelectedClassId(list[0].id);
            })
            .catch(() => setError("Failed to load classes"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedClassId) return;
        getTeacherAssignments(selectedClassId)
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setAssignments(list);
                if (list.length > 0) {
                    setSelectedAssignmentId(list[0].id || list[0].assignmentId);
                }
            })
            .catch(() => setAssignments([]));
    }, [selectedClassId]);

    useEffect(() => {
        if (!selectedAssignmentId) return;
        setLoading(true);
        setError("");
        getAssignmentSubmissions(selectedAssignmentId, statusFilter === "all" ? null : statusFilter)
            .then((data) => setSubmissions(Array.isArray(data) ? data : []))
            .catch(() => setError("Failed to load submissions"))
            .finally(() => setLoading(false));
    }, [selectedAssignmentId, statusFilter]);

    const hasActiveFilters = searchQuery.trim() !== "";

    const filtered = useMemo(() => {
        return submissions.filter((s) => {
            const q = searchQuery.trim().toLowerCase();
            return !q || (s.studentName || s.student || "").toLowerCase().includes(q) || (s.studentId || "").toLowerCase().includes(q);
        });
    }, [submissions, searchQuery]);

    const handleGrade = async (e) => {
        e.preventDefault();
        setFormError("");
        if (gradeForm.score === "" || parseFloat(gradeForm.score) < 0) {
            setFormError("Enter a valid score");
            return;
        }
        const submissionId = selected.submissionId || selected.id;
        setSaving(true);
        try {
            const response = await gradeSubmission(submissionId, {
                grade: parseFloat(gradeForm.score),
                feedback: gradeForm.feedback,
            });
            const updated = response.data;
            setSubmissions((prev) =>
                prev.map((s) =>
                    (s.submissionId === submissionId || s.id === submissionId)
                        ? { ...s, grade: updated.grade, feedback: updated.feedback }
                        : s
                )
            );
            setSelected(null);
            setGradeForm({ score: "", feedback: "" });
            alert("Grade saved successfully");
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to save grade");
        } finally {
            setSaving(false);
        }
    };

    const openGradeModal = (s) => {
        setSelected(s);
        setGradeForm({ score: s.grade ?? "", feedback: s.feedback || "" });
        setFormError("");
    };

    if (loading && classes.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="ml-3 text-gray-500 text-sm">Loading submissions...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
                <p className="text-gray-500 text-sm mt-1">View and grade student submissions</p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            {/* Class, Assignment & Search */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-48">
                    <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white">
                        <option value="" disabled>Select class</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name || c.code || c.id}</option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full sm:w-56">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select value={selectedAssignmentId} onChange={(e) => setSelectedAssignmentId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white">
                        <option value="" disabled>Select assignment</option>
                        {assignments.map((a) => (
                            <option key={a.id || a.assignmentId} value={a.id || a.assignmentId}>{a.name || a.title}</option>
                        ))}
                    </select>
                </div>
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by student name or ID..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" />
                </div>
                {hasActiveFilters && (
                    <button onClick={() => setSearchQuery("")}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer flex-shrink-0">
                        <X className="w-4 h-4" /> Clear
                    </button>
                )}
            </div>

            {/* Status Pills */}
            <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit flex-wrap">
                {[
                    { key: "all", label: "All", icon: null },
                    { key: "ON_TIME", label: "On Time", icon: CheckCircle },
                    { key: "LATE", label: "Late", icon: Clock },
                    { key: "MISSING", label: "Missing", icon: AlertCircle },
                    { key: "TO_DO", label: "To Do", icon: FileText },
                ].map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setStatusFilter(key)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer capitalize ${statusFilter === key ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {label}
                    </button>
                ))}
            </div>

            {/* Results count */}
            {!loading && (
                <p className="text-xs text-gray-400 mb-3">{filtered.length} submission{filtered.length !== 1 ? "s" : ""} found</p>
            )}

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    <span className="ml-2 text-gray-400 text-sm">Loading...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">No submissions match your filters</p>
                    <p className="text-xs mt-1">Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-5 py-3 font-semibold text-gray-700">Student</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-700">Student ID</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-700">Class</th>
                                    <th className="text-center px-5 py-3 font-semibold text-gray-700">Status</th>
                                    <th className="text-center px-5 py-3 font-semibold text-gray-700">Score</th>
                                    <th className="text-center px-5 py-3 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, idx) => {
                                    const st = STATUS_STYLES[s.status] || STATUS_STYLES.TO_DO;
                                    const isClickable = s.status !== "MISSING" && s.status !== "TO_DO";
                                    return (
                                        <tr key={s.id || s.studentId}
                                            className={`${idx < filtered.length - 1 ? "border-b border-gray-100" : ""} transition-colors`}>
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-gray-900">{s.studentName || s.student}</p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-sm text-gray-600">{s.studentCode || s.studentId}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-sm text-gray-600">{s.className}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${st.color}`}>{st.label}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="font-semibold text-emerald-600">{s.grade !== null ? s.grade : "\u2014"}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => openGradeModal(s)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 cursor-pointer"
                                                        title="View & grade submission">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openGradeModal(s)}
                                                        className={`p-1.5 rounded-lg cursor-pointer ${isClickable ? "text-gray-400 hover:text-emerald-500 hover:bg-emerald-50" : "text-gray-200 cursor-not-allowed"}`}
                                                        disabled={!isClickable}
                                                        title={isClickable ? "Grade submission" : "Cannot grade"}>
                                                        <Star className="w-4 h-4" />
                                                    </button>
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

            {/* Grade / Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => { setSelected(null); setFormError(""); }} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Grade Submission — {selected.studentName || selected.student}</h2>
                            <button onClick={() => { setSelected(null); setFormError(""); }} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Student Info */}
                        <div className="space-y-2 mb-4 p-4 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-gray-500">Student</span>
                                    <p className="font-medium text-gray-900">{selected.studentName || selected.student}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Student ID</span>
                                    <p className="font-medium text-gray-900">{selected.studentCode || selected.studentId}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-gray-500">Class</span>
                                    <p className="font-medium text-gray-900">{selected.className}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Status</span>
                                    <p className="font-medium text-gray-900">{STATUS_STYLES[selected.status]?.label || selected.status}</p>
                                </div>
                            </div>
                        </div>

                        {/* Submitted Files */}
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Submitted Files</h3>
                        {selected.fileUrls && selected.fileUrls.length > 0 ? (
                            <div className="space-y-2 mb-4">
                                {selected.fileUrls.map((fileUrl, index) => {
                                    const cleanFileName = typeof fileUrl === "string" && fileUrl.includes("_")
                                        ? fileUrl.split("_").slice(1).join("_")
                                        : typeof fileUrl === "string" ? fileUrl : `File ${index + 1}`;
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                            <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{cleanFileName}</span>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button type="button" onClick={() => handleFileAction(fileUrl, "preview")}
                                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer">Preview</button>
                                                <button type="button" onClick={() => handleFileAction(fileUrl, "download")}
                                                    className="text-xs font-medium text-emerald-600 hover:text-emerald-800 cursor-pointer">Download</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4 mb-4">No files submitted.</p>
                        )}

                        {/* Grade Form (only if submissionId exists — student actually submitted) */}
                        {selected.submissionId && selected.status !== "MISSING" && selected.status !== "TO_DO" ? (
                            <>
                                {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{formError}</div>}
                                <form onSubmit={handleGrade} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Score / Grade</label>
                                        <input type="number" step="0.5" value={gradeForm.score}
                                            onChange={(e) => setGradeForm((p) => ({ ...p, score: e.target.value }))}
                                            placeholder="Enter score" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                                        <textarea rows={3} value={gradeForm.feedback}
                                            onChange={(e) => setGradeForm((p) => ({ ...p, feedback: e.target.value }))}
                                            placeholder="Write feedback..." className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 resize-none" />
                                    </div>
                                    <button type="submit" disabled={saving}
                                        className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm cursor-pointer flex items-center justify-center gap-2">
                                        {saving ? "Saving..." : <><Send className="w-4 h-4" /> Submit Grade & Feedback</>}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-500 text-center">
                                This student has not submitted yet. Grading is unavailable.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
