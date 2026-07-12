import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Plus, X, Calendar, FileText, Trash2, Clock, Search, Filter, BookOpen, Loader2 } from "lucide-react";
import { fetchClasses } from "../../services/classService";
import { createAssignment, getTeacherAssignments } from "../../services/assignmentService";

export default function AssignmentListPage() {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [showDelete, setShowDelete] = useState(null);
    const [form, setForm] = useState({ title: "", description: "", due: "", points: "", classId: "" });
    const [formError, setFormError] = useState("");
    const [creating, setCreating] = useState(false);
    const [files, setFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

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
        setLoading(true);
        getTeacherAssignments(selectedClassId)
            .then((data) => setAssignments(Array.isArray(data) ? data : []))
            .catch(() => setAssignments([]))
            .finally(() => setLoading(false));
    }, [selectedClassId]);

    const hasActiveFilters = searchQuery.trim() !== "";

    const filtered = assignments.filter((a) => {
        const q = searchQuery.trim().toLowerCase();
        return !q || (a.title || "").toLowerCase().includes(q);
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError("");

        const classId = form.classId || selectedClassId;
        if (!form.title.trim() || !classId || !form.points || !form.due) {
            setFormError("Title, Class, Max Score, and Deadline are required fields.");
            return;
        }

        const formData = new FormData();
        const assignmentPayload = {
            classId,
            title: form.title.trim(),
            description: form.description ? form.description.trim() : "",
            deadline: form.due,
            maxMark: parseFloat(form.points),
        };

        formData.append(
            "data",
            new Blob([JSON.stringify(assignmentPayload)], { type: "application/json" })
        );

        if (files && files.length > 0) {
            files.forEach((file) => formData.append("files", file));
        }

        setCreating(true);
        try {
            const result = await createAssignment(formData);
            setAssignments((prev) => [
                {
                    id: result.id || result.assignmentId,
                    title: assignmentPayload.title,
                    maxMark: assignmentPayload.maxMark,
                    deadline: assignmentPayload.deadline,
                    description: assignmentPayload.description,
                },
                ...prev,
            ]);
            setShowCreate(false);
            setForm({ title: "", description: "", due: "", points: "", classId: "" });
            setFiles([]);
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to create assignment");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        setAssignments((prev) => prev.filter((a) => a.id !== id));
        setShowDelete(null);
    };

    const handleFileSelect = (e) => {
        const selected = Array.from(e.target.files || []);
        setFiles((prev) => [...prev, ...selected]);
        e.target.value = "";
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    if (loading && classes.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="ml-3 text-gray-500 text-sm">Loading assignments...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-gray-500 text-sm mt-1">Create and manage assignments</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" /> Create Assignment
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            {/* Class selector & Search */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-56">
                    <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white">
                        <option value="" disabled>Select a class</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name || c.code || c.id}</option>
                        ))}
                    </select>
                </div>
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by assignment title..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" />
                </div>
            </div>

            {/* Results count */}
            {!loading && (
                <p className="text-xs text-gray-400 mb-3">{filtered.length} assignment{filtered.length !== 1 ? "s" : ""} found</p>
            )}

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    <span className="ml-2 text-gray-400 text-sm">Loading...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">No assignments found</p>
                    <p className="text-xs mt-1">Create a new assignment to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((a) => {
                        const assignmentId = a.id || a.assignmentId;
                        return (
                            <div key={assignmentId} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors flex items-start justify-between gap-4">
                                <Link to={`/teacher/assignments/${assignmentId}`} state={{ classId: selectedClassId, assignment: a }} className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">
                                            {classes.find((c) => String(c.id) === String(selectedClassId))?.name || selectedClassId}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {a.deadline ? new Date(a.deadline).toLocaleDateString() : "N/A"}</span>
                                        <span>{a.maxMark || "-"} pts</span>
                                    </div>
                                </Link>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={(e) => { e.preventDefault(); setShowDelete(assignmentId); }} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Create Assignment</h2>
                            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{formError}</div>}
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                    <select value={form.classId || selectedClassId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white">
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name || c.code || c.id}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                                    <input type="number" value={form.points} onChange={(e) => setForm((p) => ({ ...p, points: e.target.value }))} min="1" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                <input type="datetime-local" value={form.due} onChange={(e) => setForm((p) => ({ ...p, due: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 [color-scheme:light]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Files (Instructions)</label>
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
                            <button type="submit" disabled={creating} className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm cursor-pointer">
                                {creating ? "Creating..." : "Create Assignment"}
                            </button>
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
