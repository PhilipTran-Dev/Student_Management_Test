import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Megaphone, Users, FileText, Plus, X, Edit3, Trash2, Pencil, UserMinus, UploadCloud,
    Loader2, CheckCircle, AlertTriangle, Download, Link2, MessageSquare, Calendar, User, Paperclip
} from "lucide-react";
import classApi from "../../services/classApi";

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
    const map = {
        pdf: "text-red-500 bg-red-50",
        pptx: "text-orange-500 bg-orange-50",
        docx: "text-blue-500 bg-blue-50",
        xlsx: "text-green-500 bg-green-50",
        image: "text-purple-500 bg-purple-50",
        video: "text-pink-500 bg-pink-50",
        file: "text-gray-500 bg-gray-100"
    };
    return map[type] || map.file;
};

const getFileIconLabel = (type) => {
    const map = {
        pdf: "PDF",
        pptx: "PPTX",
        docx: "DOCX",
        xlsx: "XLSX",
        image: "IMG",
        video: "VID",
        file: "FILE"
    };
    return map[type] || map.file;
};

export default function ClassDetailPage() {
    const { classId } = useParams();
    const [tab, setTab] = useState("announcements");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [className, setClassName] = useState("");

    // Announcements state
    const [announcements, setAnnouncements] = useState([]);
    const [showPost, setShowPost] = useState(false);
    const [showEditPost, setShowEditPost] = useState(null);
    const [postForm, setPostForm] = useState({ title: "", content: "" });
    const [postLoading, setPostLoading] = useState(false);
    const [postError, setPostError] = useState("");

    // Members state
    const [students, setStudents] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [showKickConfirm, setShowKickConfirm] = useState(null);
    const [kickLoading, setKickLoading] = useState(false);

    // Documents state
    const [documents, setDocuments] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    // Toast
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        if (classId) {
            fetchClassDetails();
            fetchAnnouncements();
            fetchStudents();
            fetchDocuments();
        }
    }, [classId]);

    const fetchClassDetails = async () => {
        try {
            const res = await classApi.get(`/api/v1/classes/${classId}`);
            const data = res.data || {};
            setClassName(data.name || data.className || classId);
        } catch {
            setClassName(classId);
        }
    };

    // ========== ANNOUNCEMENTS ==========
    const fetchAnnouncements = async () => {
        try {
            const res = await classApi.get(`/api/v1/classes/${classId}/announcements`);
            setAnnouncements(res.data || []);
        } catch {
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        setPostError("");
        if (!postForm.title.trim() || !postForm.content.trim()) {
            setPostError("All fields are required");
            return;
        }
        setPostLoading(true);
        try {
            const res = await classApi.post(`/api/v1/classes/${classId}/announcements`, {
                title: postForm.title.trim(),
                content: postForm.content.trim(),
            });
            setAnnouncements((prev) => [res.data || { id: Date.now(), title: postForm.title, content: postForm.content, createdAt: new Date().toISOString() }, ...prev]);
            setShowPost(false);
            setPostForm({ title: "", content: "" });
            showToast("Announcement posted successfully");
        } catch (err) {
            setPostError(err.response?.data?.message || "Failed to post announcement");
        } finally {
            setPostLoading(false);
        }
    };

    const handleEditAnnouncement = async (e) => {
        e.preventDefault();
        setPostError("");
        if (!postForm.title.trim() || !postForm.content.trim()) {
            setPostError("All fields are required");
            return;
        }
        setPostLoading(true);
        try {
            await classApi.put(`/api/v1/classes/${classId}/announcements/${showEditPost.id}`, {
                title: postForm.title.trim(),
                content: postForm.content.trim(),
            });
            setAnnouncements((prev) =>
                prev.map((a) => a.id === showEditPost.id ? { ...a, title: postForm.title, content: postForm.content } : a)
            );
            setShowEditPost(null);
            setPostForm({ title: "", content: "" });
            showToast("Announcement updated successfully");
        } catch (err) {
            setPostError(err.response?.data?.message || "Failed to update announcement");
        } finally {
            setPostLoading(false);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        try {
            await classApi.delete(`/api/v1/classes/${classId}/announcements/${id}`);
            setAnnouncements((prev) => prev.filter((a) => a.id !== id));
            showToast("Announcement deleted");
        } catch {
            showToast("Failed to delete announcement", "error");
        }
    };

    // ========== MEMBERS ==========
    const fetchStudents = async () => {
        setMembersLoading(true);
        try {
            const res = await classApi.get(`/api/v1/classes/${classId}/students`);
            setStudents(res.data || []);
        } catch {
            setStudents([]);
        } finally {
            setMembersLoading(false);
        }
    };

    const handleKickStudent = async (studentId) => {
        setKickLoading(true);
        try {
            await classApi.delete(`/api/v1/classes/${classId}/students/${studentId}`);
            setStudents((prev) => prev.filter((s) => (s.id || s.studentId) !== studentId));
            setShowKickConfirm(null);
            showToast("Student removed from class");
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to remove student", "error");
        } finally {
            setKickLoading(false);
        }
    };

    // ========== DOCUMENTS ==========
    const fetchDocuments = async () => {
        setDocsLoading(true);
        try {
            const res = await classApi.get(`/api/v1/classes/${classId}/documents`);
            setDocuments(res.data || []);
        } catch {
            setDocuments([]);
        } finally {
            setDocsLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setUploadFile(e.target.files[0]);
        }
    };

    const handleUploadDocument = async (e) => {
        e.preventDefault();
        setUploadError("");

        if (!uploadTitle.trim()) {
            setUploadError("Document title is required");
            return;
        }
        if (!uploadFile) {
            setUploadError("Please select a file to upload");
            return;
        }

        setUploadLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", uploadTitle.trim());
            formData.append("file", uploadFile);

            const res = await classApi.post(`/api/v1/classes/${classId}/documents`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setDocuments((prev) => [res.data || { id: Date.now(), title: uploadTitle, fileName: uploadFile.name, createdAt: new Date().toISOString() }, ...prev]);
            setShowUpload(false);
            setUploadTitle("");
            setUploadFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            showToast("Document uploaded successfully");
        } catch (err) {
            setUploadError(err.response?.data?.message || "Failed to upload document");
        } finally {
            setUploadLoading(false);
        }
    };

    const handleDeleteDocument = async (docId) => {
        try {
            await classApi.delete(`/api/v1/classes/${classId}/documents/${docId}`);
            setDocuments((prev) => prev.filter((d) => (d.id || d.documentId) !== docId));
            showToast("Document deleted");
        } catch {
            showToast("Failed to delete document", "error");
        }
    };

    const handleDownloadDocument = async (doc) => {
        const docId = doc.id || doc.documentId;
        try {
            const res = await classApi.get(`/api/v1/classes/${classId}/documents/${docId}/download`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.download = doc.fileName || doc.name || "document";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            showToast("Failed to download document", "error");
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading class details...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${toast.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
                    {toast.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {toast.message}
                </div>
            )}

            <Link to="/teacher/classes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to classes
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{className}</h1>
                <p className="text-gray-500 text-sm mt-1">{students.length} students enrolled</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit flex-wrap">
                <button
                    onClick={() => setTab("announcements")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "announcements" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
                >
                    <Megaphone className="w-4 h-4 inline mr-1.5" />Stream / Bulletin Board
                </button>
                <button
                    onClick={() => setTab("members")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "members" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
                >
                    <Users className="w-4 h-4 inline mr-1.5" />Members
                </button>
                <button
                    onClick={() => setTab("documents")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "documents" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
                >
                    <FileText className="w-4 h-4 inline mr-1.5" />Documents
                </button>
            </div>

            {/* ============ TAB 1: ANNOUNCEMENTS / STREAM ============ */}
            {tab === "announcements" && (
                <div>
                    <button
                        onClick={() => { setShowPost(true); setShowEditPost(null); setPostForm({ title: "", content: "" }); setPostError(""); }}
                        className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Post Announcement
                    </button>

                    {announcements.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm font-medium">No announcements yet</p>
                            <p className="text-gray-400 text-xs mt-1">Click the button above to publish the first announcement.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((a) => {
                                const announcementId = a.id || a.announcementId;
                                const date = a.createdAt || a.date || "";
                                const isPinned = a.pinned || false;
                                return (
                                    <div
                                        key={announcementId}
                                        className={`bg-white rounded-xl border p-5 ${isPinned ? "border-emerald-200 bg-emerald-50/30" : "border-gray-200"}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${isPinned ? "bg-emerald-100" : "bg-gray-100"}`}>
                                                <Megaphone className={`w-4 h-4 ${isPinned ? "text-emerald-600" : "text-gray-500"}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                                                    {isPinned && (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">Pinned</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap">{a.content}</p>
                                                {date && (
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {new Date(date).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => { setShowEditPost(a); setPostForm({ title: a.title, content: a.content }); setShowPost(false); }}
                                                    className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAnnouncement(announcementId)}
                                                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Post / Edit Announcement Modal */}
                    {(showPost || showEditPost) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-black/40" onClick={() => { setShowPost(false); setShowEditPost(null); }} />
                            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {showEditPost ? "Edit Announcement" : "Post Announcement"}
                                    </h2>
                                    <button onClick={() => { setShowPost(false); setShowEditPost(null); }} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                {postError && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                        {postError}
                                    </div>
                                )}
                                <form onSubmit={showEditPost ? handleEditAnnouncement : handleCreateAnnouncement} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            name="title"
                                            value={postForm.title}
                                            onChange={(e) => setPostForm((p) => ({ ...p, title: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400"
                                            placeholder="Announcement title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                        <textarea
                                            name="content"
                                            rows={4}
                                            value={postForm.content}
                                            onChange={(e) => setPostForm((p) => ({ ...p, content: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 resize-none"
                                            placeholder="Write your announcement..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={postLoading}
                                        className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm cursor-pointer inline-flex items-center justify-center gap-2"
                                    >
                                        {postLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : showEditPost ? "Save Changes" : "Post Announcement"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ============ TAB 2: MEMBERS ============ */}
            {tab === "members" && (
                <div>
                    {membersLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm font-medium">No students enrolled yet</p>
                            <p className="text-gray-400 text-xs mt-1">Students can join using the class code.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                                <p className="text-sm font-medium text-gray-700">{students.length} Student{students.length !== 1 ? "s" : ""} Enrolled</p>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {students.map((s, idx) => {
                                    const studentId = s.id || s.studentId || s.userId;
                                    const name = s.name || s.fullName || s.username || "Unknown";
                                    const email = s.email || "";
                                    return (
                                        <div key={studentId || idx} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                                                {name.split(" ").pop()[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{name}</p>
                                                {email && <p className="text-xs text-gray-400">{email}</p>}
                                            </div>
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                                                {studentId}
                                            </span>
                                            <button
                                                onClick={() => setShowKickConfirm(studentId)}
                                                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                                                title="Kick student"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Kick Confirm */}
                    {showKickConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-black/40" onClick={() => setShowKickConfirm(null)} />
                            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm z-10 text-center">
                                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Remove Student?</h2>
                                <p className="text-sm text-gray-500 mb-6">This student will be removed from this class.</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowKickConfirm(null)}
                                        className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleKickStudent(showKickConfirm)}
                                        disabled={kickLoading}
                                        className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium cursor-pointer inline-flex items-center justify-center gap-2"
                                    >
                                        {kickLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ============ TAB 3: DOCUMENTS ============ */}
            {tab === "documents" && (
                <div>
                    <button
                        onClick={() => { setShowUpload(true); setUploadTitle(""); setUploadFile(null); setUploadError(""); }}
                        className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer"
                    >
                        <UploadCloud className="w-4 h-4" /> Upload Document
                    </button>

                    {docsLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm font-medium">No documents uploaded yet</p>
                            <p className="text-gray-400 text-xs mt-1">Click the button above to upload course resources.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {documents.map((doc) => {
                                const docId = doc.id || doc.documentId;
                                const fileName = doc.fileName || doc.name || doc.title || "Untitled";
                                const iconType = getFileIconType(fileName);
                                const date = doc.createdAt || doc.uploadDate || "";
                                return (
                                    <div key={docId} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-gray-300 transition-colors">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${getFileIconColor(iconType)}`}>
                                            {getFileIconLabel(iconType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{doc.title || fileName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[11px] text-gray-400">{fileName}</span>
                                                {date && (
                                                    <>
                                                        <span className="text-[11px] text-gray-300">·</span>
                                                        <span className="text-[11px] text-gray-400">
                                                            {new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleDownloadDocument(doc)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDocument(docId)}
                                                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Upload Document Modal */}
                    {showUpload && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-black/40" onClick={() => setShowUpload(false)} />
                            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
                                    <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {uploadError && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                        {uploadError}
                                    </div>
                                )}

                                <form onSubmit={handleUploadDocument} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Title <span className="text-red-400">*</span></label>
                                        <input
                                            value={uploadTitle}
                                            onChange={(e) => setUploadTitle(e.target.value)}
                                            placeholder="e.g. Week 1 - Lecture Slides"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">File <span className="text-red-400">*</span></label>
                                        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors">
                                            <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500 font-medium">Click to select a file</span>
                                            <span className="text-xs text-gray-400 mt-0.5">PDF, DOCX, PPTX, images, etc.</span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />
                                        </label>
                                        {uploadFile && (
                                            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg text-xs text-emerald-700">
                                                <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{uploadFile.name}</span>
                                                <span className="text-emerald-400 flex-shrink-0">({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={uploadLoading}
                                        className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm cursor-pointer inline-flex items-center justify-center gap-2"
                                    >
                                        {uploadLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : "Upload Document"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}