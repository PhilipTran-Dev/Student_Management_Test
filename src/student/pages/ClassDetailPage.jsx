import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Bell, Users, FileText, Download, Megaphone, User, Calendar,
    BookOpen, Clock, MapPin, UserCheck, GraduationCap, ExternalLink, FileType,
    DownloadCloud, Loader2, AlertCircle, Paperclip
} from "lucide-react";
import {
    fetchAnnouncements,
    fetchMaterials,
    fetchClassMembers,
    fetchClassById,
    getDownloadUrl,
} from "../../services/classService";

const TABS = [
    { key: "overview", label: "Overview", icon: BookOpen },
    { key: "members", label: "Class Members", icon: Users },
    { key: "announcements", label: "Announcements", icon: Megaphone },
    { key: "materials", label: "Course Materials", icon: FileText },
];

// ── File type helpers ────────────────────────────────────────────────────
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
        file: "text-gray-500 bg-gray-100",
    };
    return map[type] || map.file;
};

const getFileIconLabel = (type) => {
    const map = { pdf: "PDF", pptx: "PPTX", docx: "DOCX", xlsx: "XLSX", image: "IMG", video: "VID", file: "FILE" };
    return map[type] || map.file;
};

// ── Avatar helpers ───────────────────────────────────────────────────────
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
    const userRole = localStorage.getItem("role") || "STUDENT";
    const [activeTab, setActiveTab] = useState("overview");
    const [classDetail, setClassDetail] = useState(null);
    const [classDetailLoading, setClassDetailLoading] = useState(false);

    // ── Announcements state ──────────────────────────────────────────────
    const [announcements, setAnnouncements] = useState([]);
    const [annLoading, setAnnLoading] = useState(false);
    const [annError, setAnnError] = useState(null);

    // ── Materials state ──────────────────────────────────────────────────
    const [materials, setMaterials] = useState([]);
    const [matLoading, setMatLoading] = useState(false);
    const [matError, setMatError] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);

    // ── Enrolled students state (live from API) ──────────────────────────
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState(null);

    // ── Fetch class metadata ─────────────────────────────────────────────
    const loadClassInfo = useCallback(async () => {
        setClassDetailLoading(true);
        try {
            const data = await fetchClassById(classId);
            setClassDetail(data || null);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to load class details.";
            console.error(msg);
            setClassDetail(null);
        } finally {
            setClassDetailLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        loadClassInfo();
    }, [loadClassInfo]);

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
        if (activeTab === "overview" || activeTab === "announcements") {
            loadAnnouncements();
        }
    }, [activeTab, loadAnnouncements]);

    // ── Fetch materials ──────────────────────────────────────────────────
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
        if (activeTab === "overview" || activeTab === "materials") {
            loadMaterials();
        }
    }, [activeTab, loadMaterials]);

    // ── Fetch enrolled students via API ──────────────────────────────────
    const loadStudents = useCallback(async () => {
        setStudentsLoading(true);
        setStudentsError(null);
        try {
            const data = await fetchClassMembers(classId);
            setEnrolledStudents(Array.isArray(data) ? data : []);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to load students.";
            setStudentsError(msg);
            setEnrolledStudents([]);
        } finally {
            setStudentsLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        if (activeTab === "overview" || activeTab === "members") {
            loadStudents();
        }
    }, [activeTab, loadStudents]);

    const classTitle = classDetail?.name || "Class Details";
    const instructorName = classDetail?.teacherName || classDetail?.instructorName || "Instructor";
    const instructorEmail = classDetail?.teacherEmail || classDetail?.instructorEmail || "";
    const courseName = classDetail?.courseName || classDetail?.course?.name || classDetail?.courseId || "Course details";
    const semesterName = classDetail?.semesterName || classDetail?.semester?.name || classDetail?.semesterId || "Semester details";

    // ── Download material via presigned URL ───────────────────────────────
    const handleDownload = async (materialId) => {
        setDownloadingId(materialId);
        try {
            const downloadUrl = await getDownloadUrl(materialId);
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

    return (
        <div>
            {/* Back link */}
            <Link to="/student/classes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to classes
            </Link>

            {/* Class Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-gray-900">{classTitle}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Instructor: {classDetailLoading ? "Loading..." : instructorName}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {enrolledStudents.length} student{enrolledStudents.length !== 1 ? "s" : ""} enrolled
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
                <div className="w-full flex flex-col gap-6">
                    {/* ── A. Classroom Hero Banner ─────────────────────────────── */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
                        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                    {classTitle}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-blue-100">
                                    <span className="flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4" />
                                        Course: {courseName}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        Semester: {semesterName}
                                    </span>
                                </div>
                            </div>
                            {/* Teacher Badge — no class code / copy actions */}
                            <div className="flex-shrink-0 flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 md:py-2.5">
                                <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-900 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {getInitials(instructorName)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{instructorName}</p>
                                    {instructorEmail ? (
                                        <a
                                            href={`mailto:${instructorEmail}`}
                                            className="text-[11px] text-blue-200 hover:text-white transition-colors truncate block"
                                        >
                                            {instructorEmail}
                                        </a>
                                    ) : (
                                        <span className="text-[11px] text-blue-200 truncate block">Instructor contact pending</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── B. Latest Announcements Widget ───────────────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-indigo-600" />
                                Latest Announcements
                            </h3>
                            <button
                                onClick={() => setActiveTab("announcements")}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors cursor-pointer"
                            >
                                View All Announcements &rarr;
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {announcements.slice(0, 2).length === 0 ? (
                                <div className="px-5 py-6 text-sm text-gray-500">No announcements available yet.</div>
                            ) : announcements.slice(0, 2).map((item) => {
                                const authorName = item.authorName || item.author || instructorName;
                                const initials = getInitials(authorName);
                                const avatarColor = getAvatarColor(authorName);
                                return (
                                    <div key={item.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5`}>
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900">{item.title || "Announcement"}</p>
                                                <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                                                    {item.content || "No details provided."}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-2">{formatDate(item.createdAt || item.date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── C. Recently Uploaded Materials Widget ────────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-600" />
                                Recently Uploaded Materials
                            </h3>
                            <button
                                onClick={() => setActiveTab("materials")}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors cursor-pointer"
                            >
                                View All Materials &rarr;
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {materials.slice(0, 2).length === 0 ? (
                                <div className="px-5 py-6 text-sm text-gray-500">No materials uploaded yet.</div>
                            ) : materials.slice(0, 2).map((material) => {
                                const fileName = material.fileName || material.name || "Untitled";
                                const fileSize = material.fileSize || material.size;
                                const iconType = getFileIconType(fileName);
                                const materialId = material.id || material.fileId;
                                return (
                                    <div key={materialId} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group" onClick={() => handleDownload(materialId)}>
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${getFileIconColor(iconType)}`}>
                                            {getFileIconLabel(iconType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{fileSize ? formatFileSize(fileSize) : "Download available"}</p>
                                        </div>
                                        <div className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors cursor-pointer">
                                            <Download className="w-4 h-4" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Class Members Tab (Live from API) ===== */}
            {activeTab === "members" && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-indigo-50/30">
                            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600" />
                                Enrolled Students ({enrolledStudents.length})
                            </h2>
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
                                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : enrolledStudents.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                                    <Users className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-500">
                                    No students have joined this class yet.
                                </p>
                                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                                    Student rosters will appear here once classmates enroll through the class invite.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {enrolledStudents.map((student, idx) => {
                                    const fullName = student.fullName || student.name || "Unknown Student";
                                    const studentId = student.studentId || student.id || "—";
                                    const className = student.className || student.section || "—";
                                    const email = student.email || "—";
                                    const initials = getInitials(fullName);
                                    const avatarColor = getAvatarColor(fullName);

                                    return (
                                        <div
                                            key={student.id || student.studentId || idx}
                                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-sm font-semibold text-white`}>
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{fullName}</p>
                                                <p className="text-xs text-gray-400">{email}</p>
                                            </div>
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                                                {studentId}
                                            </span>
                                            {className && className !== "—" && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                                                    {className}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== Announcements Tab (Live from API) ===== */}
            {activeTab === "announcements" && (
                <div className="space-y-4">
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
                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors cursor-pointer"
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
                        [...announcements]
                            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                            .map((item) => {
                                const authorName = item.authorName || item.author || "Instructor";
                                const initials = getInitials(authorName);
                                const avatarColor = getAvatarColor(authorName);
                                const timestamp = formatDate(item.createdAt || item.date);
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5"
                                    >
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
                                );
                            })
                    )}
                </div>
            )}

            {/* ===== Course Materials Tab (Live from API) ===== */}
            {activeTab === "materials" && (
                <div className="space-y-3">
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
                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors cursor-pointer"
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
                        [...materials]
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
                                        className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer group"
                                        onClick={() => handleDownload(materialId)}
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

                                        {/* Download button */}
                                        <div className="flex-shrink-0">
                                            {downloadingId === materialId ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                                            ) : (
                                                <div className="p-2 rounded-lg text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>
            )}
        </div>
    );
}