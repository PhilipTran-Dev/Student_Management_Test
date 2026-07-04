import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Megaphone, Users, Plus, X, Edit3, Trash2, Pencil, UserMinus, UserPlus, FileText, Link2, UploadCloud,
    Loader2, Send, User, Paperclip, Download, AlertCircle, CheckCircle, Copy, Eye, EyeOff, Calendar
} from "lucide-react";
import {
    fetchAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
    fetchMaterials,
    uploadMaterial,
    getDownloadUrl,
    deleteMaterial,
    updateClassPassword,
    fetchClasses,
    fetchClassMembers,
} from "../../services/classService";

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

const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "Unknown size";
    if (bytes === 0) return "0 B";
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + " KB";
    return (kb / 1024).toFixed(2) + " MB";
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

    // ── Students state (live from API) ───────────────────────────────────
    const [realStudents, setRealStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState(null);

    // ── Access control state ─────────────────────────────────────────────
    const [classPassword, setClassPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // ── Class data (fetched to get the alphanumeric code) ────────────────
    const [classData, setClassData] = useState(null);

    // The alphanumeric class code from the API response
    const classCode = classData?.code || classId;

    // ── Materials state ──────────────────────────────────────────────────
    const [materials, setMaterials] = useState([]);
    const [matLoading, setMatLoading] = useState(false);
    const [matError, setMatError] = useState(null);
    const [uploadingFile, setUploadingFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState("");
    const [downloadingId, setDownloadingId] = useState(null);
    const fileInputRef = useRef(null);

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

    // ── Fetch class members (students) ───────────────────────────────────
    const loadStudents = useCallback(async () => {
        setStudentsLoading(true);
        setStudentsError(null);
        try {
            const data = await fetchClassMembers(classId);
            setRealStudents(Array.isArray(data) ? data : []);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to load students.";
            setStudentsError(msg);
            setRealStudents([]);
        } finally {
            setStudentsLoading(false);
        }
    }, [classId]);

    // ── Fetch class list and find the matching one for its code ──────────
    useEffect(() => {
        const loadClassCode = async () => {
            try {
                const classes = await fetchClasses();
                const match = Array.isArray(classes) && classes.find((c) => String(c.id) === String(classId));
                if (match) {
                    setClassData(match);
                    if (match.password) {
                        setClassPassword(match.password);
                    }
                }
            } catch {
                // non-critical; uses classId fallback
            }
        };
        loadClassCode();
    }, [classId]);

    useEffect(() => {
        if (tab === "announcements") {
            loadAnnouncements();
        }
        if (tab === "members") {
            loadStudents();
        }
    }, [tab, loadAnnouncements, loadStudents]);

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

    // ── Materials fetch ──────────────────────────────────────────────────
    const loadMaterials = useCallback(async () => {
        setMatLoading(true);
        setMatError(null);
        try {
            const data = await fetchMaterials(classId, userRole);
            setMaterials(Array.isArray(data) ? data : []);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to load materials.";
            setMatError(msg);
            setMaterials([]);
        } finally {
            setMatLoading(false);
        }
    }, [classId, userRole]);

    useEffect(() => {
        if (tab === "materials") {
            loadMaterials();
        }
    }, [tab, loadMaterials]);

    // ── Upload material ──────────────────────────────────────────────────
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingFile(file);
        setUploadSuccess("");
    };

    const handleUpload = async () => {
        if (!uploadingFile) return;
        setUploading(true);
        setUploadSuccess("");
        try {
            const newMaterial = await uploadMaterial(classId, uploadingFile);
            // Prepend the newly uploaded material to the list
            setMaterials((prev) => [newMaterial, ...prev]);
            setUploadSuccess(`"${uploadingFile.name}" uploaded successfully!`);
            setUploadingFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            // Auto-clear success message after 4 seconds
            setTimeout(() => setUploadSuccess(""), 4000);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to upload material.";
            setUploadSuccess(""); // Clear any stale success
            alert(msg);
        } finally {
            setUploading(false);
        }
    };

    const clearSelectedFile = () => {
        setUploadingFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Download material ────────────────────────────────────────────────
    const handleDownload = async (materialId, fileName) => {
        setDownloadingId(materialId);
        try {
            const downloadUrl = await getDownloadUrl(materialId);
            // Open the presigned URL in a new tab to trigger download
            window.open(downloadUrl, "_blank", "noopener,noreferrer");
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                "Failed to get download link.";
            alert(msg);
        } finally {
            setDownloadingId(null);
        }
    };

    // ── Delete material ──────────────────────────────────────────────────
    const handleDeleteMaterial = async (materialId) => {
        try {
            await deleteMaterial(materialId);
            setMaterials((prev) => prev.filter((m) => m.id !== materialId));
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                "Failed to delete material.";
            alert(msg);
        }
    };

    // ── Copy class code to clipboard ─────────────────────────────────────
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(classCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback: silently ignore
        }
    };

    // ── Save / update class password ─────────────────────────────────────
    const handleSavePassword = async () => {
        if (!classPassword.trim()) return;
        setSavingPassword(true);
        setPasswordSuccess("");
        try {
            await updateClassPassword(classId, classPassword.trim());
            setPasswordSuccess("Class password updated successfully!");
            setTimeout(() => setPasswordSuccess(""), 4000);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                "Failed to update password.";
            alert(msg);
        } finally {
            setSavingPassword(false);
        }
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

    // ── Render members tab (live data, premium table) ────────────────────
    const renderMembersTab = () => (
        <div>
            {/* ── Class Access Control Panel ─────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 bg-emerald-50/30">
                    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        Class Access Control
                    </h2>
                </div>

                <div className="p-5 space-y-5">
                    {/* ── Class Code Copy ──────────────────────────────── */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Class Code
                        </label>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-lg font-bold text-gray-800 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg select-all">
                                {classCode}
                            </span>
                            <button
                                onClick={handleCopyCode}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors cursor-pointer"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        <span className="text-emerald-600">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy Code
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">
                            Share this code with students so they can join the class.
                        </p>
                    </div>

                    {/* ── Divider ──────────────────────────────────────── */}
                    <div className="border-t border-gray-100" />

                    {/* ── Class Password ───────────────────────────────── */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Class Password
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 max-w-xs">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={classPassword}
                                    onChange={(e) => setClassPassword(e.target.value)}
                                    placeholder="Enter a secure password"
                                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <button
                                onClick={handleSavePassword}
                                disabled={savingPassword || !classPassword.trim()}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                {savingPassword ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Save Password
                                    </>
                                )}
                            </button>
                        </div>
                        {passwordSuccess && (
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {passwordSuccess}
                            </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1.5">
                            Students must enter this password to join the class.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Enrolled Students Table ─────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-emerald-50/30">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        Enrolled Students ({realStudents.length})
                    </h3>
                </div>

                {studentsLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                        <p className="text-sm">Loading students...</p>
                    </div>
                ) : studentsError ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle className="w-10 h-10 text-red-300 mb-3" />
                        <p className="text-sm font-medium text-gray-900 mb-1">Failed to load students</p>
                        <p className="text-xs text-gray-500 mb-3">{studentsError}</p>
                        <button
                            onClick={loadStudents}
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : realStudents.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                            No students have officially joined this classroom yet.
                        </p>
                        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                            Share the class code and password above to invite them.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Full Name
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Student ID
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Class / Section
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Joined Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {realStudents.map((student, idx) => {
                                    const fullName = student.fullName || student.name || "Unknown";
                                    const studentId = student.studentId || student.id || "—";
                                    const className = student.className || student.section || "—";
                                    const email = student.email || "—";
                                    const joinedAt = student.joinedAt ? formatDate(student.joinedAt) : "—";
                                    const initials = getInitials(fullName);
                                    const avatarColor = getAvatarColor(fullName);

                                    return (
                                        <tr
                                            key={student.id || student.studentId || idx}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
                                                    >
                                                        {initials}
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        {fullName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">
                                                {studentId}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">
                                                {className}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">
                                                {email}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                                                {joinedAt}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <Link to="/teacher/classes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to classes
            </Link>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Class Hub: {classId}</h1>
                <p className="text-gray-500 text-sm mt-1">{realStudents.length} students enrolled</p>
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
                    {/* ── Teacher Upload Panel ───────────────────────────────── */}
                    {isTeacher && (
                        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Upload header */}
                            <div className="px-5 py-4 border-b border-gray-100 bg-emerald-50/30">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <UploadCloud className="w-4 h-4 text-emerald-600" />
                                    Upload Course Material
                                </h3>
                            </div>

                            {/* Upload body */}
                            <div className="p-5">
                                {uploadSuccess && (
                                    <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                        {uploadSuccess}
                                    </div>
                                )}

                                {!uploadingFile ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                                            <UploadCloud className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">
                                            <span className="text-emerald-600 font-semibold">Click to select</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            PDF, PPTX, DOCX, ZIP, images & more (Max 50MB)
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                            accept=".pdf,.pptx,.ppt,.docx,.doc,.xlsx,.xls,.zip,.rar,.png,.jpg,.jpeg,.gif,.svg,.webp,.mp4,.mov"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Selected file preview */}
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${getFileIconColor(getFileIconType(uploadingFile.name))}`}>
                                                {getFileIconLabel(getFileIconType(uploadingFile.name))}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{uploadingFile.name}</p>
                                                <p className="text-xs text-gray-500">{formatFileSize(uploadingFile.size)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={clearSelectedFile}
                                                disabled={uploading}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 cursor-pointer flex-shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleUpload}
                                                disabled={uploading}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold transition-colors cursor-pointer"
                                            >
                                                {uploading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="w-4 h-4" />
                                                        Upload to Class
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={clearSelectedFile}
                                                disabled={uploading}
                                                className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Material List ─────────────────────────────────────── */}
                    {matLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-3" />
                            <p className="text-sm">Loading materials...</p>
                        </div>
                    ) : matError ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <AlertCircle className="w-10 h-10 text-red-300 mb-3" />
                            <p className="text-sm font-medium text-gray-900 mb-1">Failed to load materials</p>
                            <p className="text-xs text-gray-500 mb-3">{matError}</p>
                            <button
                                onClick={loadMaterials}
                                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors cursor-pointer"
                            >
                                Retry
                            </button>
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 mb-1">
                                No lesson materials uploaded yet.
                            </p>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                                Course documents, lecture slides, and tutorials will be published here by your instructor.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {[...materials]
                                .sort((a, b) => new Date(b.createdAt || b.uploadDate || 0) - new Date(a.createdAt || a.uploadDate || 0))
                                .map((material) => {
                                    const fileName = material.fileName || material.name || "Untitled";
                                    const fileSize = material.fileSize || material.size;
                                    const uploadDate = material.createdAt || material.uploadDate || material.date;
                                    const iconType = getFileIconType(fileName);
                                    const materialId = material.id || material.fileId;

                                    return (
                                        <div
                                            key={materialId}
                                            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer group"
                                            onClick={() => handleDownload(materialId, fileName)}
                                        >
                                            {/* File icon */}
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${getFileIconColor(iconType)}`}>
                                                {getFileIconLabel(iconType)}
                                            </div>

                                            {/* File info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {fileName}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    {fileSize && (
                                                        <span className="text-[11px] text-gray-400">
                                                            {formatFileSize(fileSize)}
                                                        </span>
                                                    )}
                                                    {fileSize && uploadDate && (
                                                        <span className="text-[11px] text-gray-300">·</span>
                                                    )}
                                                    {uploadDate && (
                                                        <span className="text-[11px] text-gray-400">
                                                            {formatDate(uploadDate)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Download indicator */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {downloadingId === materialId ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                                ) : (
                                                    <div className="p-1.5 rounded-lg text-gray-300 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                                                        <Download className="w-4 h-4" />
                                                    </div>
                                                )}

                                                {/* Delete button (teacher only) */}
                                                {isTeacher && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMaterial(materialId);
                                                        }}
                                                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                                        title="Delete material"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            )}

            {/* ===== Members Tab ===== */}
            {tab === "members" && renderMembersTab()}
        </div>
    );
}