import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Edit3, Trash2, X, Plus, Loader2, AlertTriangle, Upload } from "lucide-react";
import { getTeacherAssignmentById, updateAssignment, getTeacherAssignments } from "../../services/assignmentService";
import { fetchClasses } from "../../services/classService";

export default function AssignmentDetailPage() {
    const { assignmentId } = useParams();
    const location = useLocation();
    const classIdFromState = location.state?.classId;
    const assignmentFromState = location.state?.assignment;

    const [assignment, setAssignment] = useState(assignmentFromState || null);
    const [loading, setLoading] = useState(!assignmentFromState);
    const [error, setError] = useState("");
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);
    const [newFiles, setNewFiles] = useState([]);

    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        maxMark: "",
        deadline: "",
    });

    useEffect(() => {
        if (assignmentFromState) return;
        loadAssignment();
    }, [assignmentId]);

    const loadAssignment = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await getTeacherAssignmentById(assignmentId);
            setAssignment(result);
            return;
        } catch {
            // fallback: try fetching from the class list
        }

        try {
            const classes = await fetchClasses();
            const classList = Array.isArray(classes) ? classes : [];
            let targetClassId = classIdFromState;

            if (!targetClassId) {
                for (const cls of classList) {
                    const data = await getTeacherAssignments(cls.id);
                    const list = Array.isArray(data) ? data : [];
                    const found = list.find((a) => String(a.id || a.assignmentId) === String(assignmentId));
                    if (found) {
                        setAssignment({ ...found, id: found.id || found.assignmentId, className: cls.name, classId: cls.id });
                        return;
                    }
                }
                setError("Assignment not found");
                return;
            }

            const data = await getTeacherAssignments(targetClassId);
            const list = Array.isArray(data) ? data : [];
            const found = list.find((a) => String(a.id || a.assignmentId) === String(assignmentId));
            if (found) {
                setAssignment({ ...found, id: found.id || found.assignmentId, classId: targetClassId });
            } else {
                setError("Assignment not found");
            }
        } catch {
            setError("Failed to load assignment details");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = () => {
        setEditForm({
            title: assignment.title || "",
            description: assignment.description || "",
            maxMark: assignment.maxMark ?? "",
            deadline: assignment.deadline || "",
        });
        setNewFiles([]);
        setFormError("");
        setShowEdit(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        const rawTitle = editForm.title?.trim();
        const rawScore = editForm.maxMark || editForm.maxScore || editForm.points;
        const rawDeadline = editForm.deadline;

        if (!rawTitle || !rawScore || !rawDeadline) {
            setFormError("Title, Max Score, and Deadline are required fields.");
            return;
        }

        const parsedMaxMark = parseFloat(rawScore);
        if (isNaN(parsedMaxMark)) {
            console.error("Validation Error: maxMark parsed to NaN!", { rawScore });
            setFormError("Max Score must be a valid number.");
            return;
        }

        let formattedDeadline = rawDeadline;
        if (rawDeadline instanceof Date) {
            formattedDeadline = rawDeadline.toISOString().slice(0, 16);
        } else if (typeof rawDeadline === "string" && rawDeadline.includes(" ")) {
            const d = new Date(rawDeadline);
            if (!isNaN(d.getTime())) {
                formattedDeadline = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            }
        }

        const updatePayload = {
            classId: assignment.classId,
            title: rawTitle,
            description: editForm.description ? editForm.description.trim() : "",
            deadline: formattedDeadline,
            maxMark: parsedMaxMark,
        };

        console.log("=== CRITICAL SUBMIT PAYLOAD ===", updatePayload);

        const formData = new FormData();
        formData.append(
            "data",
            new Blob([JSON.stringify(updatePayload)], { type: "application/json" })
        );

        if (newFiles && newFiles.length > 0) {
            newFiles.forEach((file) => formData.append("files", file));
        }

        setSaving(true);
        try {
            const result = await updateAssignment(assignmentId, formData);
            setAssignment((prev) => ({
                ...prev,
                ...updatePayload,
                maxMark: updatePayload.maxMark,
                id: result.id || result.assignmentId || prev.id,
            }));
            setShowEdit(false);
            setNewFiles([]);
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to update assignment");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        window.location.href = "/teacher/assignments";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="ml-3 text-gray-500 text-sm">Loading assignment...</span>
            </div>
        );
    }

    if (error && !assignment) {
        return (
            <div>
                <Link to="/teacher/assignments" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <div className="text-center py-16 text-gray-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Link to="/teacher/assignments" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-emerald-600">{assignment.className || assignment.classId}</span>
                            <div className="flex gap-2">
                                <button onClick={openEditModal}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setShowDelete(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
                        <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{assignment.description || "No description provided."}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Attached Files</h2>
                        {(!assignment.attachments || assignment.attachments.length === 0) ? (
                            <p className="text-sm text-gray-400 text-center py-6">No files attached yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {(assignment.attachments || []).map((att) => (
                                    <div key={att.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{att.name || att.fileName}</span>
                                        <span className="text-xs font-medium text-indigo-600 cursor-pointer flex-shrink-0">Download</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-gray-500">Due Date</p>
                                <p className="font-medium text-gray-900">
                                    {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Points</p>
                                <p className="font-medium text-gray-900">{assignment.maxMark ?? "-"} pts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowEdit(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Update Assignment</h2>
                            <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{formError}</div>}
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea rows={3} value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                                    <input type="number" value={editForm.maxMark} onChange={(e) => setEditForm((p) => ({ ...p, maxMark: e.target.value }))} min="1" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                    <input type="datetime-local" value={editForm.deadline} onChange={(e) => setEditForm((p) => ({ ...p, deadline: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 [color-scheme:light]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Add Reference/Instruction Files</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-400 transition-colors" onClick={() => document.getElementById("updateAttachFiles").click()}>
                                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                                    <p className="text-xs text-gray-500">{newFiles.length > 0 ? `${newFiles.length} file(s) selected` : "Click to browse (multi-select)"}</p>
                                    <input id="updateAttachFiles" type="file" multiple className="hidden" onChange={(e) => {
                                        const selected = Array.from(e.target.files || []);
                                        setNewFiles((prev) => [...prev, ...selected]);
                                        e.target.value = "";
                                    }} />
                                </div>
                                {newFiles.length > 0 && (
                                    <div className="mt-3 space-y-1.5">
                                        {newFiles.map((f, idx) => (
                                            <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                                                <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                <span className="flex-1 text-xs text-gray-700 truncate">{f.name}</span>
                                                <button type="button" onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== idx))} className="p-0.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer flex-shrink-0">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm cursor-pointer">
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {showDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowDelete(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm z-10 text-center">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete?</h2>
                        <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium cursor-pointer">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium cursor-pointer">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
