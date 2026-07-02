import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Megaphone, Users, Plus, X, Edit3, Trash2, Pencil, UserMinus, UserPlus, FileText, Link2, UploadCloud,
    Loader2, Send, User
} from "lucide-react";
import {
    fetchAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
} from "../../services/classService";

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

// ── Avatar initials helper ───────────────────────────────────────────────
const AVATAR_COLORS = [
    "bg-rose-500", "bg-blue-500", "bg-amber-500", "bg-emerald-500",
    "bg-purple-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
];

const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name) => {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatDate = (dateStr) => {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr || "Unknown date";
    }
};

export default function ClassDetailPage() {
    const { classId } = useParams();
    const userRole = localStorage.getItem("role") || "TEACHER";
    const isTeacher = userRole.toUpperCase() === "TEACHER";

    const [tab, setTab] = useState("announcements");

    // ── Announcements state ──────────────────────────────────────────────
    const [announcements, setAnnouncements] = useState([]);
    const [annLoading, setAnnLoading] = useState(true);
    const [annError, setAnnError] = useState(null);
    const [postExpanded, setPostExpanded] = useState(false);
    const [postTitle, setPostTitle] = useState("");
    const [postContent, setPostContent] = useState("");
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState("");
    const postInputRef = useRef(null);

    // ── Students state ───────────────────────────────────────────────────
    const [students, setStudents] = useState(MOCK_STUDENTS);
    const [showEditPost, setShowEditPost] = useState(null);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showRemoveStudent, setShowRemoveStudent] = useState(null);
    const [addStudentForm, setAddStudentForm] = useState({ code: "" });
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    // ── Materials state ──────────────────────────────────────────────────
    const [materials, setMaterials] = useState([]);
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [attachments, setAttachments] = useState([{ id: 1, name: "", type: "file", file: null, url: "" }]);
    const [materialTitle, setMaterialTitle] = useState("");
    const attachmentIdCounter = useRef(attachments.length);

    // ── Fetch announcements ──────────────────────────────────────────────
    const loadAnnouncements = useCallback(async () => {
        setAnnLoading(true);
        setAnnError(null);
        try {
            const data = await fetchAnnouncements(classId, userRole);
            setAnnouncements(Array.isArray(data) ? data : []);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to load announcements.";
            setAnnError(msg);
            setAnnouncements([]);
        } finally {
            setAnnLoading(false);
        }
    }, [classId, userRole]);

    useEffect(() => {
        if (tab === "announcements") {
            loadAnnouncements();
        }
    }, [tab, loadAnnouncements]);

    // ── Post announcement ────────────────────────────────────────────────
    const handlePost = async (e) => {
        e.preventDefault();
        setPostError("");
        const trimmedTitle = postTitle.trim();
        const trimmedContent = postContent.trim();
        if (!trimmedTitle || !trimmedContent) {
            setPostError("Both title and content are required.");
            return;
        }
        setPosting(true);
        try {
            const payload = { title: trimmedTitle, content: trimmedContent };
            await createAnnouncement(classId, payload);
            setPostTitle("");
            setPostContent("");
            setPostExpanded(false);
            // Re-fetch to show the new post at the top
            await loadAnnouncements();
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to post announcement.";
            setPostError(msg);
        } finally {
            setPosting(false);
        }
    };

    // ── Delete announcement ──────────────────────────────────────────────
    const handleDeletePost = async (id) => {
        try {
            await deleteAnnouncement(id);
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            console.error("Failed to delete announcement:", err);
        }
    };

    // ── Legacy handlers (unchanged) ──────────────────────────────────────
    const handleEditPost = async (e) => {
        e.preventDefault(); setFormError("");
        if (!postTitle.trim() || !postContent.trim()) { setFormError("All fields required"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 500));
            setAnnouncements((p) => p.map((a) => a.id === showEditPost.id ? { ...a, title: postTitle, content: postContent } : a));
            setShowEditPost(null); setPostTitle(""); setPostContent("");
        } finally { setLoading(false); }
    };

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

    // ── Material handlers ────────────────────────────────────────────────
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

    // ── Announcements feed (shared render) ───────────────────────────────
    const renderAnnouncementsFeed = () => (
        <div>
            {/* ── Teacher Post Creation Box ──────────────────────────────── */}
            {isTeacher && (
                <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {!postExpanded ? (
                        <button
                            onClick={() => {
                                setPostExpanded(true);
                                setTimeout(() => postInputRef.current?.focus(), 100);
                            }}
                            className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Megaphone className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span>Announce something to your class...</span>
                        </button>
                    ) : (
                        <div className="p-5">
                            <form onSubmit={handlePost}>
                                <input
                                    ref={postInputRef}
                                    value={postTitle}
                                    onChange={(e) => setPostTitle(e.target.value)}
                                    placeholder="Title"
                                    className="w-full px-0 py-1.5 text-sm font-semibold text-gray-900 border-0 border-b border-gray-200 outline-none focus:border-emerald-400 placeholder:text-gray-400 mb-3"
                                    disabled={posting}
                                />
                                <textarea
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    placeholder="What's on your mind?"
                                    rows={3}
                                    className="w-full px-0 py-1.5 text-sm text-gray-700 border-0 outline-none resize-none placeholder:text-gray-400"
                                    disabled={posting}
                                />
                                {postError && (
                                    <p className="text-xs text-red-500 mt-1">{postError}</p>
                                )}
                                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPostExpanded(false);
                                            setPostTitle("");
                                            setPostContent("");
                                            setPostError("");
                                        }}
                                        disabled={posting}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={posting}
                                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold transition-colors cursor-pointer"
                                    >
                                        {posting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Posting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Post
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* ── Feed list ──────────────────────────────────────────────── */}
            {annLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-3" />
                    <p className="text-sm">Loading announcements...</p>
                </div>
            ) : annError ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Megaphone className="w-10 h-10 text-red-300 mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">Failed to load announcements</p>
                    <p className="text-xs text-gray-500 mb-3">{annError}</p>
                    <button
                        onClick={loadAnnouncements}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                        <Megaphone className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                        Welcome to the class feed stream!
                    </p>
                    <p className="text-xs mt-1 max-w-xs mx-auto text-gray-400">
                        Announcements, updates, and discussions from your instructor will appear right here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {[...announcements]
                        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                        .map((item) => {
                            const authorName = item.authorName || item.author || "Instructor";
                            const initials = getInitials(authorName);
                            const avatarColor = getAvatarColor(authorName);
                            const timestamp = formatDate(item.createdAt || item.date);
                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group"
                                >
                                    {/* Delete button (teacher only) */}
                                    {isTeacher && (
                                        <button
                                            onClick={() => handleDeletePost(item.id)}
                                            className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                            title="Delete announcement"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}

                                    <div className="p-5">
                                        {/* Author header */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
                                            >
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {authorName}
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    {timestamp}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        {item.title && (
                                            <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                                                {item.title}
                                            </h3>
                                        )}

                                        {/* Content with preserved line breaks */}
                                        {item.content && (
                                            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                                                {item.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );

    return (
        <div>
            <Link to="/teacher/classes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to classes
            </Link>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Class Hub: {classId}</h1>
                <p className="text-gray-500 text-sm mt-1">{students.length} students enrolled</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit flex-wrap">
                <button onClick={() => setTab("announcements")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "announcements" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
                    <Megaphone className="w-4 h-4 inline mr-1.5" />Manage Feed
                </button>
                <button onClick={() => setTab("materials")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "materials" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
                    <FileText className="w-4 h-4 inline mr-1.5" />Materials
                </button>
                <button onClick={() => setTab("members")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "members" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
                    <Users className="w-4 h-4 inline mr-1.5" />Members
                </button>
            </div>

            {/* ===== Announcements Tab ===== */}
            {tab === "announcements" && renderAnnouncementsFeed()}

            {/* ===== Materials Tab ===== */}
            {tab === "materials" && (
                <div>
                    <button onClick={openAddMaterial} className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer">
                        <UploadCloud className="w-4 h-4" /> Add Course Material
                    </button>

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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Material Title <span className="text-red-400">*</span></label>
                                        <input value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} placeholder="e.g. Week 1 - Introduction" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Attachments</label>
                                        <div className="space-y-3">
                                            {attachments.map((att, idx) => (
                                                <div key={att.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 relative">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs font-medium text-gray-500">Attachment #{idx + 1}</span>
                                                        {attachments.length > 1 && (
                                                            <button type="button" onClick={() => removeAttachment(att.id)} className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2 mb-3">
                                                        <button type="button" onClick={() => updateAttachment(att.id, "type", "file")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${att.type === "file" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500 hover:text-gray-700"}`}>
                                                            <UploadCloud className="w-3.5 h-3.5 inline mr-1" />Local File
                                                        </button>
                                                        <button type="button" onClick={() => updateAttachment(att.id, "type", "link")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${att.type === "link" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500 hover:text-gray-700"}`}>
                                                            <Link2 className="w-3.5 h-3.5 inline mr-1" />External URL / Link
                                                        </button>
                                                    </div>

                                                    {att.type === "file" ? (
                                                        <div>
                                                            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors">
                                                                <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                                                                <span className="text-xs text-gray-500 font-medium">Click to select a file</span>
                                                                <span className="text-[10px] text-gray-400 mt-0.5">Supports PDF, PPTX, DOCX, images, and more</span>
                                                                <input type="file" className="hidden" onChange={(e) => handleFileSelect(att.id, e.target.files)} />
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
                                                            <input value={att.name} onChange={(e) => updateAttachment(att.id, "name", e.target.value)} placeholder="Link title (e.g. Python Documentation)" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" />
                                                            <div className="relative">
                                                                <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                                <input value={att.url} onChange={(e) => updateAttachment(att.id, "url", e.target.value)} placeholder="https://example.com/documentation" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <button type="button" onClick={addAttachmentRow} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors cursor-pointer w-full justify-center">
                                            <Plus className="w-4 h-4" /> Add Another Attachment
                                        </button>
                                    </div>

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
                                                        <button type="button" onClick={() => removeAttachment(a.id)} className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer flex-shrink-0"><X className="w-4 h-4" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm cursor-pointer">
                                        {loading ? "Saving..." : "Upload Materials"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ===== Members Tab ===== */}
            {tab === "members" && (
                <div>
                    <button onClick={() => setShowAddStudent(true)} className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer">
                        <UserPlus className="w-4 h-4" /> Add Student
                    </button>
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