import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, FileText, Edit3, Trash2, X, Save, Plus } from "lucide-react";

const MOCK = {
    id: "A02", title: "Week 2 - Variables & Types", class: "CS101",
    due: "2026-02-17T23:59", points: 10, submissions: 38,
    description: "Complete exercises on variables, data types, and type conversion.",
    attachments: [
        { id: "att-1", name: "assignment-instructions.pdf" },
    ],
};

export default function AssignmentDetailPage() {
    const { assignmentId } = useParams();
    const [assignment, setAssignment] = useState(MOCK);
    const [showEdit, setShowEdit] = useState(false);
    const [showExtend, setShowExtend] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [editForm, setEditForm] = useState({ title: assignment.title, description: assignment.description, points: assignment.points });
    const [extendForm, setExtendForm] = useState({ newDue: "" });
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault(); setFormError("");
        if (!editForm.title.trim() || !editForm.description.trim() || !editForm.points) { setFormError("All fields required"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 800));
            setAssignment((p) => ({ ...p, title: editForm.title, description: editForm.description, points: parseInt(editForm.points) }));
            setShowEdit(false);
        } finally { setLoading(false); }
    };

    const handleExtend = async (e) => {
        e.preventDefault(); setFormError("");
        if (!extendForm.newDue) { setFormError("Select new deadline"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 500));
            setAssignment((p) => ({ ...p, due: extendForm.newDue }));
            setShowExtend(false);
        } finally { setLoading(false); }
    };

    const handleDelete = () => {
        window.location.href = "/teacher/assignments";
    };

    const handleAddAttachment = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const newAttachments = files.map((f) => ({
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: f.name,
        }));
        setAssignment((prev) => ({
            ...prev,
            attachments: [...(prev.attachments || []), ...newAttachments],
        }));
        e.target.value = "";
    };

    const handleRemoveAttachment = (id) => {
        setAssignment((prev) => ({
            ...prev,
            attachments: (prev.attachments || []).filter((a) => a.id !== id),
        }));
    };

    return (
        <div>
            <Link to="/teacher/assignments" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"><ArrowLeft className="w-4 h-4" /> Back</Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-emerald-600">{assignment.class}</span>
                            <div className="flex gap-2">
                                <button onClick={() => { setShowEdit(true); setEditForm({ title: assignment.title, description: assignment.description, points: assignment.points }); }} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => setShowDelete(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
                        <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{assignment.description}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-900">Attached Files</h2>
                            <div className="relative">
                                <button
                                    onClick={() => document.getElementById("addAttachment").click()}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add File
                                </button>
                                <input
                                    id="addAttachment"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleAddAttachment}
                                />
                            </div>
                        </div>
                        {(assignment.attachments || []).length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">No files attached yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {(assignment.attachments || []).map((att) => (
                                    <div key={att.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{att.name}</span>
                                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer flex-shrink-0">Download</button>
                                        <button
                                            onClick={() => handleRemoveAttachment(att.id)}
                                            className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer flex-shrink-0"
                                            title="Remove file"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
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
                            <div><p className="text-xs text-gray-500">Due Date</p><p className="font-medium text-gray-900">{new Date(assignment.due).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p></div>
                            <div><p className="text-xs text-gray-500">Points</p><p className="font-medium text-gray-900">{assignment.points} pts</p></div>
                            <div><p className="text-xs text-gray-500">Submissions</p><p className="font-medium text-gray-900">{assignment.submissions}</p></div>
                            <div className="pt-3 border-t border-gray-100">
                                <button onClick={() => setShowExtend(true)} className="w-full py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"><Clock className="w-4 h-4" /> Extend Deadline</button>
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
                        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Update Assignment</h2><button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button></div>
                        {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{formError}</div>}
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={4} value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 resize-none" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label><input type="number" value={editForm.points} onChange={(e) => setEditForm((p) => ({ ...p, points: e.target.value }))} min="1" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" /></div>
                            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm cursor-pointer flex items-center justify-center gap-2">{loading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Extend Modal */}
            {showExtend && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowExtend(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10">
                        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Extend Deadline</h2><button onClick={() => setShowExtend(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button></div>
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