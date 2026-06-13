import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Megaphone, Users, Plus, X, Edit3, Trash2, Pencil, UserMinus, UserPlus, FileText, Link2, UploadCloud } from "lucide-react";

const MOCK_ANNOUNCEMENTS = [
    { id: 1, title: "Welcome!", content: "Please check the syllabus for this semester.", date: "2026-01-10", pinned: true },
    { id: 2, title: "Midterm Review", content: "Review session on March 10th at 3 PM.", date: "2026-02-20", pinned: false },
];

const MOCK_STUDENTS = [
    { id: "S001", name: "Nguyen Van A", email: "a@student.edu" },
    { id: "S002", name: "Tran Thi B", email: "b@student.edu" },
    { id: "S003", name: "Le Van C", email: "c@student.edu" },
    { id: "S004", name: "Pham Thi D", email: "d@student.edu" },
];

const getFileIconType = (name) => {
    const ext = name?.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(ext)) return "pdf";
    if (["pptx", "ppt"].includes(ext)) return "pptx";
    if (["docx", "doc"].includes(ext)) return "docx";
    if (["xlsx", "xls"].includes(ext)) return "xlsx";
    if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) return "image";
    if (["mp4", "mov", "avi", "mkv"].includes(ext)) return "video";
    return "file";
};

const getFileIconColor = (type) => {
    const map = { pdf: "text-red-500 bg-red-50", pptx: "text-orange-500 bg-orange-50", docx: "text-blue-500 bg-blue-50", xlsx: "text-green-500 bg-green-50", image: "text-purple-500 bg-purple-50", video: "text-pink-500 bg-pink-50", file: "text-gray-500 bg-gray-100" };
    return map[type] || map.file;
};

const getFileIconLabel = (type) => {
    const map = { pdf: "PDF", pptx: "PPTX", docx: "DOCX", xlsx: "XLSX", image: "IMG", video: "VID", file: "FILE" };
    return map[type] || map.file;
};

export default function ClassDetailPage() {
    const { classId } = useParams();
    const [tab, setTab] = useState("announcements");
    const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
    const [students, setStudents] = useState(MOCK_STUDENTS);
    const [showPost, setShowPost] = useState(false);
    const [showEditPost, setShowEditPost] = useState(null);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showRemoveStudent, setShowRemoveStudent] = useState(null);
    const [postForm, setPostForm] = useState({ title: "", content: "" });
    const [addStudentForm, setAddStudentForm] = useState({ code: "" });
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    // Materials state
    const [materials, setMaterials] = useState([]);
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [attachments, setAttachments] = useState([{ id: 1, name: "", type: "file", file: null, url: "" }]);
    const [materialTitle, setMaterialTitle] = useState("");

    const attachmentIdCounter = useRef(attachments.length);

    const handlePost = async (e) => {
        e.preventDefault(); setFormError("");
        if (!postForm.title.trim() || !postForm.content.trim()) { setFormError("All fields required"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 500));
            setAnnouncements((p) => [{ id: Date.now(), title: postForm.title, content: postForm.content, date: new Date().toISOString().split("T")[0], pinned: false }, ...p]);
            setShowPost(false); setPostForm({ title: "", content: "" });
        } finally { setLoading(false); }
    };

    const handleEditPost = async (e) => {
        e.preventDefault(); setFormError("");
        if (!postForm.title.trim() || !postForm.content.trim()) { setFormError("All fields required"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 500));
            setAnnouncements((p) => p.map((a) => a.id === showEditPost.id ? { ...a, title: postForm.title, content: postForm.content } : a));
            setShowEditPost(null); setPostForm({ title: "", content: "" });
        } finally { setLoading(false); }
    };

    const handleDeletePost = (id) => setAnnouncements((p) => p.filter((a) => a.id !== id));

    const handleAddStudent = async (e) => {
        e.preventDefault(); setFormError("");
        if (!addStudentForm.code.trim()) { setFormError("Enter a student code"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 500));
            setStudents((p) => [...p, { id: addStudentForm.code.toUpperCase(), name: `Student (${addStudentForm.code.toUpperCase()})`, email: `${addStudentForm.code.toLowerCase()}@student.edu` }]);
            setShowAddStudent(false); setAddStudentForm({ code: "" });
        } finally { setLoading(false); }
    };

    const handleRemoveStudent = (id) => { setStudents((p) => p.filter((s) => s.id !== id)); setShowRemoveStudent(null); };

    // Material handlers
    const openAddMaterial = () => {
        setMaterialTitle("");
        setAttachments([{ id: 1, name: "", type: "file", file: null, url: "" }]);
        setFormError("");
        setShowAddMaterial(true);
    };

    const addAttachmentRow = () => {
        attachmentIdCounter.current += 1;
        setAttachments((prev) => [...prev, { id: attachmentIdCounter.current, name: "", type: "file", file: null, url: "" }]);
    };

    const removeAttachment = (id) => {
        setAttachments((prev) => prev.filter((a) => a.id !== id));
    };

    const updateAttachment = (id, field, value) => {
        setAttachments((prev) => prev.map((a) => a.id === id ? { ...a, [field]: value } : a));
    };

    const handleFileSelect = (id, files) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        updateAttachment(id, "file", file);
        updateAttachment(id, "name", file.name);
    };

    const handleSubmitMaterials = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!materialTitle.trim()) {
            setFormError("Please provide a title for this material set.");
            return;
        }

        const validAttachments = attachments.filter((a) => {
            if (a.type === "file") return a.file !== null;
            return a.url.trim() !== "" && a.name.trim() !== "";
        });

        if (validAttachments.length === 0) {
            setFormError("Please add at least one file or link.");
            return;
        }

        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 500));

            const newMaterials = validAttachments.map((a) => {
                const iconType = a.type === "file"
                    ? getFileIconType(a.file?.name || a.name)
                    : getFileIconType(a.name);
                return {
                    id: Date.now() + Math.random(),
                    title: materialTitle,
                    name: a.type === "file" ? (a.file?.name || a.name) : a.name,
                    type: a.type,
                    file: a.file,
                    url: a.url,
                    iconType,
                    date: new Date().toISOString().split("T")[0],
                };
            });

            setMaterials((prev) => [...newMaterials, ...prev]);
            setShowAddMaterial(false);
            setMaterialTitle("");
            setAttachments([{ id: 1, name: "", type: "file", file: null, url: "" }]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMaterial = (id) => {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
    };

    return (
        <div>
            <Link to="/teacher/classes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to classes</Link>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Class Hub: {classId}</h1>
                <p className="text-gray-500 text-sm mt-1">{students.length} students enrolled</p>
            </div>

            <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit flex-wrap">
                <button onClick={() => setTab("announcements")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "announcements" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}><Megaphone className="w-4 h-4 inline mr-1.5" />Manage Feed</button>
                <button onClick={() => setTab("materials")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "materials" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}><FileText className="w-4 h-4 inline mr-1.5" />Materials</button>
                <button onClick={() => setTab("members")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "members" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}><Users className="w-4 h-4 inline mr-1.5" />Members</button>
            </div>

            {tab === "announcements" ? (
                <div>
                    <button onClick={() => { setShowPost(true); setPostForm({ title: "", content: "" }); }} className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Post Announcement</button>
                    <div className="space-y-4">
                        {announcements.map((a) => (
                            <div key={a.id} className={`bg-white rounded-xl border p-5 ${a.pinned ? "border-emerald-200 bg-emerald-50/30" : "border-gray-200"}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${a.pinned ? "bg-emerald-100" : "bg-gray-100"}`}><Megaphone className={`w-4 h-4 ${a.pinned ? "text-emerald-600" : "text-gray-500"}`} /></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                                            {a.pinned && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">Pinned</span>}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1.5">{a.content}</p>
                                        <p className="text-xs text-gray-400 mt-2">{a.date}</p>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button onClick={() => { setShowEditPost(a); setPostForm({ title: a.title, content: a.content }); }} className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeletePost(a.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Post Modal */}
                    {(showPost || showEditPost) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-black/40" onClick={() => { setShowPost(false); setShowEditPost(null); }} />
                            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">{showEditPost ? "Edit" : "Post"} Announcement</h2>
                                    <button onClick={() => { setShowPost(false); setShowEditPost(null); }} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
                                </div>
                                {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{formError}</div>}
                                <form onSubmit={showEditPost ? handleEditPost : handlePost} className="space-y-4">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input name="title" value={postForm.title} onChange={(e) => setPostForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Content</label><textarea name="content" rows={4} value={postForm.content} onChange={(e) => setPostForm((p) => ({ ...p, content: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 resize-none" /></div>
                                    <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm cursor-pointer">{loading ? "Saving..." : showEditPost ? "Save Changes" : "Post"}</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            ) : tab === "materials" ? (
                <div>
                    <button onClick={openAddMaterial} className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer"><UploadCloud className="w-4 h-4" /> Add Course Material</button>

                    {materials.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No materials uploaded yet.</p>
                            <p className="text-gray-400 text-xs mt-1">Click the button above to add files or links.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {materials.map((m) => (
                                <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${getFileIconColor(m.iconType)}`}>
                                        {getFileIconLabel(m.iconType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[11px] text-gray-400">{m.date}</span>
                                            {m.type === "link" && (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-blue-500"><Link2 className="w-3 h-3" />External Link</span>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteMaterial(m.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Material Modal */}
                    {showAddMaterial && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-black/40" onClick={() => setShowAddMaterial(false)} />
                            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl z-10 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Add Course Material</h2>
                                    <button onClick={() => setShowAddMaterial(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
                                </div>

                                {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{formError}</div>}

                                <form onSubmit={handleSubmitMaterials} className="space-y-5">
                                    {/* Material Set Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Material Title <span className="text-red-400">*</span></label>
                                        <input
                                            value={materialTitle}
                                            onChange={(e) => setMaterialTitle(e.target.value)}
                                            placeholder="e.g. Week 1 - Introduction"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400"
                                        />
                                    </div>

                                    {/* Attachment Rows */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Attachments</label>
                                        <div className="space-y-3">
                                            {attachments.map((att, idx) => (
                                                <div key={att.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 relative">
                                                    {/* Row header */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs font-medium text-gray-500">Attachment #{idx + 1}</span>
                                                        {attachments.length > 1 && (
                                                            <button type="button" onClick={() => removeAttachment(att.id)} className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Toggle Type */}
                                                    <div className="flex gap-2 mb-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateAttachment(att.id, "type", "file")}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${att.type === "file" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500 hover:text-gray-700"}`}
                                                        >
                                                            <UploadCloud className="w-3.5 h-3.5 inline mr-1" />Local File
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateAttachment(att.id, "type", "link")}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${att.type === "link" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500 hover:text-gray-700"}`}
                                                        >
                                                            <Link2 className="w-3.5 h-3.5 inline mr-1" />External URL / Link
                                                        </button>
                                                    </div>

                                                    {att.type === "file" ? (
                                                        <div>
                                                            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors">
                                                                <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                                                                <span className="text-xs text-gray-500 font-medium">Click to select a file</span>
                                                                <span className="text-[10px] text-gray-400 mt-0.5">Supports PDF, PPTX, DOCX, images, and more</span>
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    onChange={(e) => handleFileSelect(att.id, e.target.files)}
                                                                />
                                                            </label>
                                                            {att.file && (
                                                                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg text-xs text-emerald-700">
                                                                    <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                                                                    <span className="truncate">{att.file.name}</span>
                                                                    <span className="text-emerald-400 flex-shrink-0">({(att.file.size / 1024).toFixed(1)} KB)</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <input
                                                                value={att.name}
                                                                onChange={(e) => updateAttachment(att.id, "name", e.target.value)}
                                                                placeholder="Link title (e.g. Python Documentation)"
                                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400"
                                                            />
                                                            <div className="relative">
                                                                <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                                <input
                                                                    value={att.url}
                                                                    onChange={(e) => updateAttachment(att.id, "url", e.target.value)}
                                                                    placeholder="https://example.com/documentation"
                                                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addAttachmentRow}
                                            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors cursor-pointer w-full justify-center"
                                        >
                                            <Plus className="w-4 h-4" /> Add Another Attachment
                                        </button>
                                    </div>

                                    {/* Preview List */}
                                    {attachments.filter((a) => (a.type === "file" && a.file) || (a.type === "link" && a.url.trim() && a.name.trim())).length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Preview ({attachments.filter((a) => (a.type === "file" && a.file) || (a.type === "link" && a.url.trim() && a.name.trim())).length} items)</label>
                                            <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                                                {attachments.filter((a) => (a.type === "file" && a.file) || (a.type === "link" && a.url.trim() && a.name.trim())).map((a) => (
                                                    <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${getFileIconColor(a.type === "file" ? getFileIconType(a.file?.name || a.name) : getFileIconType(a.name))}`}>
                                                            {getFileIconLabel(a.type === "file" ? getFileIconType(a.file?.name || a.name) : getFileIconType(a.name))}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{a.type === "file" ? a.file?.name : a.name}</p>
                                                            <p className="text-xs text-gray-400 truncate">{a.type === "link" ? a.url : `${(a.file?.size / 1024).toFixed(1)} KB`}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAttachment(a.id)}
                                                            className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer flex-shrink-0"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm cursor-pointer"
                                    >
                                        {loading ? "Saving..." : "Upload Materials"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <button onClick={() => setShowAddStudent(true)} className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer"><UserPlus className="w-4 h-4" /> Add Student</button>
                    <div className="bg-white rounded-xl border border-gray-200">
                        {students.map((s, idx) => (
                            <div key={s.id} className={`flex items-center gap-3 px-5 py-3.5 ${idx < students.length - 1 ? "border-b border-gray-100" : ""}`}>
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">{s.name.split(" ").pop()[0]}</div>
                                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-400">{s.email}</p></div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">{s.id}</span>
                                <button onClick={() => setShowRemoveStudent(s.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer" title="Remove"><UserMinus className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>

                    {showAddStudent && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-black/40" onClick={() => setShowAddStudent(false)} />
                            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10">
                                <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Add Student</h2><button onClick={() => setShowAddStudent(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button></div>
                                {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{formError}</div>}
                                <form onSubmit={handleAddStudent}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Student Code</label>
                                    <input value={addStudentForm.code} onChange={(e) => setAddStudentForm({ code: e.target.value })} placeholder="e.g. S005" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 mb-4" autoFocus />
                                    <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm cursor-pointer">{loading ? "Adding..." : "Add to Class"}</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {showRemoveStudent && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-black/40" onClick={() => setShowRemoveStudent(null)} />
                            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm z-10 text-center">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Remove Student?</h2>
                                <p className="text-sm text-gray-500 mb-6">This student will be removed from this class.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowRemoveStudent(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium cursor-pointer">Cancel</button>
                                    <button onClick={() => handleRemoveStudent(showRemoveStudent)} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium cursor-pointer">Remove</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}