import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Megaphone, Users, FileText, Download, Loader2, AlertTriangle, CheckCircle,
    Calendar, User, LogOut, ExternalLink, BookOpen, Clock, MapPin, GraduationCap, UserCheck,
    Bell, MessageSquare
} from "lucide-react";
import classApi from "../../services/classApi";

const TABS = [
    { key: "overview", label: "Overview", icon: BookOpen },
    { key: "announcements", label: "Announcements", icon: Megaphone },
    { key: "members", label: "Class Members", icon: Users },
    { key: "documents", label: "Documents", icon: FileText },
];

const TYPE_ICONS = {
    pdf: { bg: "bg-red-50", text: "text-red-600", icon: FileText },
    pptx: { bg: "bg-orange-50", text: "text-orange-600", icon: FileText },
    docx: { bg: "bg-blue-50", text: "text-blue-600", icon: FileText },
    xlsx: { bg: "bg-green-50", text: "text-green-600", icon: FileText },
    image: { bg: "bg-purple-50", text: "text-purple-600", icon: FileText },
    video: { bg: "bg-pink-50", text: "text-pink-600", icon: FileText },
    file: { bg: "bg-gray-50", text: "text-gray-600", icon: FileText },
    link: { bg: "bg-blue-50", text: "text-blue-600", icon: ExternalLink },
};

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

const getTypeStyle = (name) => {
    const type = getFileIconType(name);
    return TYPE_ICONS[type] || TYPE_ICONS.file;
};

export default function ClassDetailPage() {
    const { classId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const [classInfo, setClassInfo] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [students, setStudents] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [downloadStates, setDownloadStates] = useState({});
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        if (classId) {
            fetchAllData();
        }
    }, [classId]);

    const fetchAllData = async () => {
        setLoading(true);
        setError("");
        try {
            const [classRes, announcementRes, studentsRes, documentsRes] = await Promise.all([
                classApi.get(`/api/v1/classes/${classId}`),
                classApi.get(`/api/v1/classes/${classId}/announcements`),
                classApi.get(`/api/v1/classes/${classId}/students`),
                classApi.get(`/api/v1/classes/${classId}/documents`),
            ]);
            setClassInfo(classRes.data || {});
            setAnnouncements(announcementRes.data || []);
            setStudents(studentsRes.data || []);
            setDocuments(documentsRes.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load class details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (doc) => {
        const docId = doc.id || doc.documentId;
        setDownloadStates((prev) => ({ ...prev, [docId]: true }));
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
        } finally {
            setDownloadStates((prev) => ({ ...prev, [docId]: false }));
        }
    };

    const handleLeaveClass = async () => {
        setLeaveLoading(true);
        try {
            await classApi.delete(`/api/v1/classes/${classId}/leave`);
            showToast("You have left the class");
            setTimeout(() => {
                window.location.href = "/student/classes";
            }, 1000);
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to leave class", "error");
        } finally {
            setLeaveLoading(false);
        }
    };

    const getInitials = (name) => {
        return name?.split(" ").pop()[0] || "?";
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading class details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-20">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-red-500">{error}</p>
                <Link to="/student/classes" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm cursor-pointer">
                    Back to Classes
                </Link>
            </div>
        );
    }

    const cls = classInfo || {};
    const className = cls.name || cls.className || classId;
    const classCode = cls.code || cls.classCode || "";
    const instructor = cls.instructor || cls.teacherName || "";
    const semester = cls.semester || cls.semesterId || "";
    const studentCount = cls.studentCount || cls.students || students.length || 0;
    const description = cls.description || "";

    return (
        <div>
            {/* Toast notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${toast.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
                    {toast.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {toast.message}
                </div>
            )}

            {/* Back link & Leave button */}
            <div className="flex items-center justify-between mb-4">
                <Link to="/student/classes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to classes
                </Link>
                <button
                    onClick={() => setShowLeaveConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors cursor-pointer"
                >
                    <LogOut className="w-4 h-4" />
                    Leave Class
                </button>
            </div>

            {/* Class Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-gray-900">{className}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {classCode && `${classCode} · `}{semester && `${semester} · `}Instructor: {instructor || "N/A"}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {studentCount} student{studentCount !== 1 ? "s" : ""} enrolled
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit flex-wrap">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab.key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        <tab.icon className="w-4 h-4 inline mr-1.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ===== Overview Tab ===== */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    {/* Course Description */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-500" />
                            Course Description
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {description || "No description provided for this class."}
                        </p>
                    </div>

                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-indigo-50">
                                <UserCheck className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{instructor || "N/A"}</p>
                                <p className="text-xs text-gray-500">Instructor</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-emerald-50">
                                <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{studentCount}</p>
                                <p className="text-xs text-gray-500">Students</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-amber-50">
                                <GraduationCap className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{semester || "N/A"}</p>
                                <p className="text-xs text-gray-500">Semester</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Announcements Tab (Read-Only) ===== */}
            {activeTab === "announcements" && (
                <div className="space-y-4">
                    {announcements.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3" />
                            <p className="text-sm font-medium">No announcements yet</p>
                            <p className="text-xs mt-1">Check back later for class updates.</p>
                        </div>
                    ) : (
                        [...announcements]
                            .sort((a, b) => {
                                const dateA = new Date(a.createdAt || a.date || 0);
                                const dateB = new Date(b.createdAt || b.date || 0);
                                return dateB - dateA;
                            })
                            .map((item) => {
                                const announcementId = item.id || item.announcementId;
                                const isPinned = item.pinned || false;
                                const date = item.createdAt || item.date || "";
                                const author = item.author || item.createdBy || instructor || "Teacher";
                                return (
                                    <div
                                        key={announcementId}
                                        className={`bg-white rounded-xl border p-5 ${isPinned ? "border-indigo-200 bg-indigo-50/30" : "border-gray-200"}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${isPinned ? "bg-indigo-100" : "bg-gray-100"}`}>
                                                {isPinned ? (
                                                    <Bell className="w-4 h-4 text-indigo-600" />
                                                ) : (
                                                    <Megaphone className="w-4 h-4 text-gray-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                                                    {isPinned && (
                                                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold">Pinned</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap">{item.content}</p>
                                                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {author}
                                                    </span>
                                                    {date && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(date).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>
            )}

            {/* ===== Members Tab (Read-Only) ===== */}
            {activeTab === "members" && (
                <div className="space-y-6">
                    {/* Students Section */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-indigo-50/30">
                            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600" />
                                Classmates ({students.length})
                            </h2>
                        </div>
                        {students.length === 0 ? (
                            <div className="px-5 py-10 text-center text-gray-400 text-sm">
                                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                No classmates data available.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {students.map((student, idx) => {
                                    const studentId = student.id || student.studentId || student.userId || idx;
                                    const name = student.name || student.fullName || student.username || "Unknown";
                                    const email = student.email || "";
                                    return (
                                        <div key={studentId} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                                                {getInitials(name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{name}</p>
                                                {email && <p className="text-xs text-gray-400">{email}</p>}
                                            </div>
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                                                Student
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== Documents Tab (Read-Only, Download-Only) ===== */}
            {activeTab === "documents" && (
                <div className="space-y-3">
                    {documents.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-3" />
                            <p className="text-sm font-medium">No documents available</p>
                            <p className="text-xs mt-1">Course materials will appear here when the instructor uploads them.</p>
                        </div>
                    ) : (
                        documents.map((doc) => {
                            const docId = doc.id || doc.documentId;
                            const fileName = doc.fileName || doc.name || doc.title || "Untitled";
                            const typeStyle = getTypeStyle(fileName);
                            const IconComp = typeStyle.icon;
                            const isDownloading = downloadStates[docId];
                            const date = doc.createdAt || doc.uploadDate || "";
                            return (
                                <div
                                    key={docId}
                                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-gray-300 transition-colors"
                                >
                                    <div className={`p-2.5 rounded-lg ${typeStyle.bg}`}>
                                        <IconComp className={`w-5 h-5 ${typeStyle.text}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{doc.title || fileName}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {fileName}
                                            {date && ` · ${new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(doc)}
                                        disabled={isDownloading}
                                        className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        title="Download"
                                    >
                                        {isDownloading ? (
                                            <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Leave Confirmation Modal */}
            {showLeaveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowLeaveConfirm(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm z-10 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Leave Class?</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to leave this class? You may need a new code to re-join.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLeaveConfirm(false)}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLeaveClass}
                                disabled={leaveLoading}
                                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                            >
                                {leaveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}