import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Bell, Users, FileText, Download, Megaphone, User, Calendar,
    BookOpen, Clock, MapPin, UserCheck, GraduationCap, ExternalLink, FileType,
    DownloadCloud, Bot
} from "lucide-react";

const MOCK_CLASS = {
    id: "CS101",
    name: "Introduction to Programming",
    code: "CS101-2026-S1",
    instructor: "Dr. Tran Van B",
    semester: "Spring 2026",
    description: "This course provides a comprehensive introduction to programming concepts using Python. Topics include variables, data types, control structures, functions, data structures, and basic algorithms. No prior programming experience is required.",
    schedules: [
        { day: "Monday", time: "09:00 - 10:30", room: "Hall A - 201" },
        { day: "Wednesday", time: "09:00 - 10:30", room: "Lab B - 105" },
        { day: "Friday", time: "14:00 - 15:00", room: "Hall A - 201" },
    ],
    instructors: [
        { id: "T001", name: "Dr. Tran Van B", email: "tvb@university.edu.vn", specialty: "Computer Science" },
        { id: "T002", name: "Prof. Le Thi C", email: "ltc@university.edu.vn", specialty: "Programming Languages" },
    ],
    classmates: [
        { id: "S001", name: "Nguyen Van A", email: "a.nguyen@student.edu.vn" },
        { id: "S002", name: "Tran Thi B", email: "b.tran@student.edu.vn" },
        { id: "S003", name: "Le Van C", email: "c.le@student.edu.vn" },
        { id: "S004", name: "Pham Thi D", email: "d.pham@student.edu.vn" },
        { id: "S005", name: "Hoang Van E", email: "e.hoang@student.edu.vn" },
        { id: "S006", name: "Nguyen Thi F", email: "f.nguyen@student.edu.vn" },
        { id: "S007", name: "Tran Van G", email: "g.tran@student.edu.vn" },
    ],
};

const MOCK_ANNOUNCEMENTS = [
    { id: 1, title: "Welcome to the course!", content: "Please review the syllabus and course materials before our first session. All lecture slides are available in the Course Materials tab.", author: "Dr. Tran Van B", date: "2026-01-10", pinned: true },
    { id: 2, title: "Midterm Exam Schedule", content: "The midterm exam will be held on March 15th at 9:00 AM in Hall B. Bring your student ID. The exam covers chapters 1-6.", author: "Dr. Tran Van B", date: "2026-02-20", pinned: false },
    { id: 3, title: "Office Hours Update", content: "Office hours have been changed to Wednesdays 2-4 PM in Room 305. Please sign up via the link posted in the announcements.", author: "Dr. Tran Van B", date: "2026-03-01", pinned: false },
    { id: 4, title: "Assignment 2 Released", content: "Assignment 2 is now available. It covers loops and functions. Due date: March 10th at 11:59 PM. Submit via the assignment portal.", author: "Prof. Le Thi C", date: "2026-03-05", pinned: true },
];

const MOCK_MATERIALS = [
    { id: 1, name: "Syllabus - Introduction to Programming", type: "pdf", size: "1.2 MB", uploadedBy: "Dr. Tran Van B", date: "2026-01-10", format: "PDF" },
    { id: 2, name: "Chapter 1 - Introduction & Setup", type: "pdf", size: "2.4 MB", uploadedBy: "Dr. Tran Van B", date: "2026-01-12", format: "PDF" },
    { id: 3, name: "Chapter 2 - Data Types & Variables", type: "pptx", size: "5.1 MB", uploadedBy: "Dr. Tran Van B", date: "2026-01-19", format: "PPTX" },
    { id: 4, name: "Week 3 - Lecture Notes", type: "pdf", size: "1.8 MB", uploadedBy: "Dr. Tran Van B", date: "2026-01-26", format: "PDF" },
    { id: 5, name: "Assignment 1 - Instructions", type: "pdf", size: "0.9 MB", uploadedBy: "Prof. Le Thi C", date: "2026-02-02", format: "PDF" },
    { id: 6, name: "Chapter 3 - Control Structures", type: "pptx", size: "4.3 MB", uploadedBy: "Dr. Tran Van B", date: "2026-02-09", format: "PPTX" },
    { id: 7, name: "External: Python Official Docs", type: "link", url: "https://docs.python.org/3/", uploadedBy: "Dr. Tran Van B", date: "2026-01-10", format: "Link" },
];

const TABS = [
    { key: "overview", label: "Overview", icon: BookOpen },
    { key: "members", label: "Class Members", icon: Users },
    { key: "announcements", label: "Announcements", icon: Megaphone },
    { key: "materials", label: "Course Materials", icon: FileText },
];

const TYPE_ICONS = {
    pdf: { bg: "bg-red-50", text: "text-red-600", icon: FileType },
    pptx: { bg: "bg-orange-50", text: "text-orange-600", icon: FileType },
    link: { bg: "bg-blue-50", text: "text-blue-600", icon: ExternalLink },
};

export default function ClassDetailPage() {
    const { classId } = useParams();
    const [activeTab, setActiveTab] = useState("overview");
    const [downloadStates, setDownloadStates] = useState({});

    const handleDownload = (materialId) => {
        setDownloadStates((prev) => ({ ...prev, [materialId]: true }));
        // Simulate download
        setTimeout(() => {
            setDownloadStates((prev) => ({ ...prev, [materialId]: false }));
            // In production: use axios to fetch blob, then trigger download
            // const res = await axios.get(`/api/student/classes/${classId}/materials/${materialId}/download`, { responseType: 'blob' });
            // const url = window.URL.createObjectURL(new Blob([res.data]));
            // const link = document.createElement('a'); link.href = url; link.download = material.name; link.click();
        }, 1500);
    };

    const getInitials = (name) => {
        return name.split(" ").pop()[0];
    };

    const cls = MOCK_CLASS;

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
                        <h1 className="text-2xl font-bold text-gray-900">{cls.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {cls.code} &middot; {cls.semester} &middot; Instructor: {cls.instructor}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {cls.classmates.length + cls.instructors.length} members enrolled
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
                        <p className="text-sm text-gray-600 leading-relaxed">{cls.description}</p>
                    </div>

                    {/* Class Schedule */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            Class Schedule
                        </h2>
                        <div className="space-y-3">
                            {cls.schedules.map((schedule, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="w-20 text-sm font-semibold text-gray-900">{schedule.day}</div>
                                    <div className="flex-1 text-sm text-gray-600 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        {schedule.time}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                        {schedule.room}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-indigo-50">
                                <UserCheck className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{cls.instructors.length}</p>
                                <p className="text-xs text-gray-500">Instructors</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-emerald-50">
                                <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{cls.classmates.length}</p>
                                <p className="text-xs text-gray-500">Classmates</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-amber-50">
                                <GraduationCap className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{cls.semester}</p>
                                <p className="text-xs text-gray-500">Semester</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Class Members Tab ===== */}
            {activeTab === "members" && (
                <div className="space-y-6">
                    {/* Instructors Section */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-amber-50/30">
                            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-amber-600" />
                                Instructors ({cls.instructors.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {cls.instructors.map((inst, idx) => (
                                <div key={inst.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-sm font-semibold text-amber-700">
                                        {getInitials(inst.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{inst.name}</p>
                                        <p className="text-xs text-gray-400">{inst.email}</p>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                                        {inst.specialty}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Classmates Section */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-indigo-50/30">
                            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600" />
                                Classmates / Students ({cls.classmates.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {cls.classmates.map((student, idx) => (
                                <div key={student.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                                        {getInitials(student.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                        <p className="text-xs text-gray-400">{student.email}</p>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                                        Student
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Announcements Tab ===== */}
            {activeTab === "announcements" && (
                <div className="space-y-4">
                    {MOCK_ANNOUNCEMENTS.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Megaphone className="w-12 h-12 mx-auto mb-3" />
                            <p className="text-sm font-medium">No announcements yet</p>
                        </div>
                    ) : (
                        MOCK_ANNOUNCEMENTS
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((item) => (
                                <div key={item.id} className={`bg-white rounded-xl border p-5 ${item.pinned ? "border-indigo-200 bg-indigo-50/30" : "border-gray-200"}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${item.pinned ? "bg-indigo-100" : "bg-gray-100"}`}>
                                            {item.pinned ? <Bell className="w-4 h-4 text-indigo-600" /> : <Megaphone className="w-4 h-4 text-gray-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                                                {item.pinned && <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold">Pinned</span>}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1.5">{item.content}</p>
                                            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.author}</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            )}

            {/* ===== Course Materials Tab ===== */}
            {activeTab === "materials" && (
                <div className="space-y-3">
                    {MOCK_MATERIALS.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-3" />
                            <p className="text-sm font-medium">No course materials available</p>
                        </div>
                    ) : (
                        MOCK_MATERIALS.map((mat) => {
                            const typeStyle = TYPE_ICONS[mat.type] || TYPE_ICONS.pdf;
                            const isDownloading = downloadStates[mat.id];
                            const IconComp = typeStyle.icon;

                            return (
                                <div key={mat.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-gray-300 transition-colors">
                                    <div className={`p-2.5 rounded-lg ${typeStyle.bg}`}>
                                        <IconComp className={`w-5 h-5 ${typeStyle.text}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{mat.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {mat.format} {mat.size && `· ${mat.size}`} · {mat.date} · {mat.uploadedBy}
                                        </p>
                                    </div>
                                    {mat.type === "link" ? (
                                        <a
                                            href={mat.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                                            title="Open link"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => handleDownload(mat.id)}
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
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}