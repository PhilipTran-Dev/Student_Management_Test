import { useState, useRef, useEffect, useMemo } from "react";
import {
    GraduationCap, MessageSquare, Award, ChevronDown, Calendar, BookOpen,
    FileText, X, Clock, Star, Percent, BarChart3, Quote, Search, Filter, Loader2
} from "lucide-react";
import { fetchStudentClasses } from "../../services/classService";
import { getClassGradebook } from "../../services/assignmentService";

const getGradedAssignments = (assignments) =>
    assignments.filter((a) => a.score !== null);

const getPendingAssignments = (assignments) =>
    assignments.filter((a) => a.score === null);

const calcCourseAverage = (assignments) => {
    const graded = getGradedAssignments(assignments);
    if (graded.length === 0) return 0;
    const totalWeight = graded.reduce((s, a) => s + (a.weight || 1), 0);
    const weightedSum = graded.reduce(
        (s, a) => s + (a.score / a.maxScore) * (a.weight || 1),
        0
    );
    return totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
};

const getLetterGrade = (avg) => {
    if (avg >= 90) return { grade: "A", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
    if (avg >= 80) return { grade: "B+", color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" };
    if (avg >= 73) return { grade: "B", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
    if (avg >= 66) return { grade: "B-", color: "text-blue-500", bg: "bg-blue-50 border-blue-200" };
    if (avg >= 60) return { grade: "C+", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
    if (avg >= 53) return { grade: "C", color: "text-amber-500", bg: "bg-amber-50 border-amber-200" };
    return { grade: "F", color: "text-red-600", bg: "bg-red-50 border-red-200" };
};

const getGradePoints = (avg) => {
    if (avg >= 90) return 4.0;
    if (avg >= 80) return 3.5;
    if (avg >= 73) return 3.0;
    if (avg >= 66) return 2.5;
    if (avg >= 60) return 2.0;
    if (avg >= 53) return 1.5;
    return 0;
};

const getScoreColor = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 85) return "text-emerald-600";
    if (pct >= 70) return "text-blue-600";
    if (pct >= 60) return "text-amber-600";
    return "text-red-600";
};

const formatDate = (dateStr) => {
    if (!dateStr) return "\u2014";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return "\u2014";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

const getProgressColor = (pct) => {
    if (pct >= 85) return "stroke-emerald-500";
    if (pct >= 70) return "stroke-blue-500";
    if (pct >= 60) return "stroke-amber-500";
    return "stroke-red-500";
};

function CircularProgress({ value, size = 80, strokeWidth = 6 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const colorClass = getProgressColor(value);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90 absolute top-0 left-0">
                <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} className="stroke-gray-100 fill-none" />
                <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} strokeLinecap="round"
                    className={`fill-none transition-all duration-700 ease-out ${colorClass}`}
                    strokeDasharray={circumference} strokeDashoffset={offset} />
            </svg>
            <div className="flex flex-col items-center justify-center z-10 text-center select-none">
                <span className={`${size < 70 ? "text-xs" : "text-sm"} font-bold text-gray-900`}>{value.toFixed(1)}%</span>
            </div>
        </div>
    );
}

function FeedbackModal({ assignment, onClose }) {
    if (!assignment || !assignment.feedback) return null;

    const { feedback } = assignment;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10 animate-fade-in">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Feedback: {assignment.name}</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{assignment.category}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
                            {assignment.gradedBy?.split(" ").pop()[0] || "?"}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{assignment.gradedBy || "Instructor"}</p>
                            <p className="text-xs text-gray-400">Grade published {formatDateTime(feedback.publishedAt)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{assignment.score}/{assignment.maxScore}</p>
                            <p className="text-xs text-gray-400">{((assignment.score / assignment.maxScore) * 100).toFixed(0)}%</p>
                        </div>
                    </div>

                    {feedback.text && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Quote className="w-4 h-4 text-indigo-500" /> Instructor Comments
                            </h3>
                            <div className="relative pl-5 border-l-4 border-indigo-300 bg-indigo-50/50 rounded-r-xl p-4">
                                <p className="text-sm text-gray-700 leading-relaxed italic">"{feedback.text}"</p>
                            </div>
                        </div>
                    )}

                    {feedback.rubric && feedback.rubric.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-indigo-500" /> Rubric Component Breakdown
                            </h3>
                            <div className="space-y-3">
                                {feedback.rubric.map((item, idx) => {
                                    const pct = (item.score / item.maxScore) * 100;
                                    return (
                                        <div key={idx}>
                                            <div className="flex items-center justify-between text-sm mb-1.5">
                                                <span className="font-medium text-gray-700">{item.criterion}</span>
                                                <span className={`font-semibold ${getScoreColor(item.score, item.maxScore)}`}>
                                                    {item.score} / {item.maxScore}
                                                </span>
                                            </div>
                                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-700 ${pct >= 85 ? "bg-emerald-500" : pct >= 70 ? "bg-blue-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                                    style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-600" />
                                <span className="text-sm font-semibold text-indigo-800">Total Score</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-bold text-indigo-700">{assignment.score} / {assignment.maxScore}</span>
                                <span className="text-sm text-indigo-500 ml-2">({((assignment.score / assignment.maxScore) * 100).toFixed(0)}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function GradebookPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("all");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [feedbackTarget, setFeedbackTarget] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [gradeRangeFilter, setGradeRangeFilter] = useState("all");
    const dropdownRef = useRef(null);

    useEffect(() => {
        loadGradebook();
    }, []);

    const loadGradebook = async () => {
        setLoading(true);
        setError("");
        try {
            const classList = await fetchStudentClasses();
            const enrolled = Array.isArray(classList) ? classList : [];

            const results = await Promise.allSettled(
                enrolled.map((cls) =>
                    getClassGradebook(cls.id).then((data) => ({
                        ...data,
                        id: cls.id,
                        code: cls.code || cls.id,
                        name: cls.name || `Class ${cls.id}`,
                        assignments: data.assignments || data.scores || [],
                    }))
                )
            );

            const loaded = results
                .filter((r) => r.status === "fulfilled")
                .map((r) => r.value);

            setCourses(loaded.length > 0 ? loaded : enrolled.map((cls) => ({
                id: cls.id,
                name: cls.name || `Class ${cls.id}`,
                code: cls.code || cls.id,
                credits: cls.credits || 0,
                instructor: cls.instructor || "",
                assignments: [],
            })));
        } catch {
            setError("Failed to load gradebook data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const categoryOptions = useMemo(() => {
        const cats = new Set();
        courses.forEach((c) => (c.assignments || []).forEach((a) => cats.add(a.category)));
        return [...cats].sort();
    }, [courses]);

    const hasActiveFilters = searchQuery.trim() !== "" || categoryFilter !== "all" || gradeRangeFilter !== "all" || selectedCourse !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setCategoryFilter("all");
        setGradeRangeFilter("all");
        setSelectedCourse("all");
    };

    const filteredCourses = selectedCourse === "all"
        ? courses
        : courses.filter((c) => String(c.id) === String(selectedCourse));

    const selectedCourseObj = selectedCourse === "all" ? null : courses.find((c) => String(c.id) === String(selectedCourse));

    const allGradedAssignments = courses.flatMap((c) => getGradedAssignments(c.assignments || []));
    const totalGradedCount = allGradedAssignments.length;
    const totalPendingCount = courses.flatMap((c) => getPendingAssignments(c.assignments || [])).length;

    const totalCredits = courses.reduce((s, c) => s + (c.credits || 0), 0);
    const gpa = totalCredits > 0
        ? courses.reduce((s, c) => {
            const avg = calcCourseAverage(c.assignments || []);
            return s + getGradePoints(avg) * (c.credits || 1);
        }, 0) / totalCredits
        : 0;

    const overallAvg = courses.length > 0
        ? courses.reduce((s, c) => s + calcCourseAverage(c.assignments || []), 0) / courses.length
        : 0;

    const academicStanding = gpa >= 3.5 ? "Dean\u2019s List" : gpa >= 2.0 ? "Good Standing" : "Probation";

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="ml-3 text-gray-500 text-sm">Loading gradebook...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Grades & Feedback</h1>
                <p className="text-gray-500 text-sm mt-1">Track your performance and review instructor feedback</p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            {/* Summary Dashboard Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current GPA</span>
                        <div className="p-1.5 rounded-lg bg-indigo-50">
                            <GraduationCap className="w-4 h-4 text-indigo-600" />
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{gpa.toFixed(2)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">out of 4.0</p>
                        </div>
                        <div className="relative w-16 h-16">
                            <CircularProgress value={overallAvg} size={64} strokeWidth={5} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Completed Credits</span>
                        <div className="p-1.5 rounded-lg bg-emerald-50">
                            <BookOpen className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{totalCredits}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{courses.length} course{courses.length !== 1 ? "s" : ""} enrolled</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Graded Tasks</span>
                        <div className="p-1.5 rounded-lg bg-amber-50">
                            <FileText className="w-4 h-4 text-amber-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{totalGradedCount}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Assignments Graded &middot;{" "}
                        <span className="text-amber-600 font-medium">{totalPendingCount} pending</span>
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Academic Standing</span>
                        <div className="p-1.5 rounded-lg bg-purple-50">
                            <Star className="w-4 h-4 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{gpa >= 3.5 ? "Dean\u2019s List" : gpa >= 2.0 ? "Good Standing" : "Probation"}</p>
                    <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${gpa >= 3.5 ? "bg-purple-50 text-purple-700" : "bg-emerald-50 text-emerald-700"}`}>
                        <Star className="w-3 h-3" />
                        {academicStanding}
                    </span>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by assignment name..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div className="relative w-full sm:w-44">
                    <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400 appearance-none bg-white">
                        <option value="all">All Categories</option>
                        {categoryOptions.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                </div>
                <div className="relative w-full sm:w-44">
                    <Percent className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select value={gradeRangeFilter} onChange={(e) => setGradeRangeFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400 appearance-none bg-white">
                        <option value="all">All Grades</option>
                        <option value="excellent">Excellent (90%+)</option>
                        <option value="passing">Passing (60%-89%)</option>
                        <option value="failing">Failing (below 60%)</option>
                    </select>
                </div>
                {hasActiveFilters && (
                    <button onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer flex-shrink-0">
                        <X className="w-4 h-4" /> Clear
                    </button>
                )}
            </div>

            {/* Course Filter Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
                        {selectedCourse === "all" ? (
                            <><GraduationCap className="w-4 h-4 text-indigo-500" /> All Courses</>
                        ) : (
                            <><BookOpen className="w-4 h-4 text-indigo-500" /> {selectedCourseObj?.name}</>
                        )}
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                            <button onClick={() => { setSelectedCourse("all"); setDropdownOpen(false); }}
                                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${selectedCourse === "all" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
                                <GraduationCap className="w-4 h-4 flex-shrink-0" />
                                <span className="font-medium">All Courses</span>
                            </button>
                            <hr className="border-gray-100 mx-3" />
                            {courses.map((c) => (
                                <button key={c.id} onClick={() => { setSelectedCourse(c.id); setDropdownOpen(false); }}
                                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${String(selectedCourse) === String(c.id) ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
                                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">{c.name}</p>
                                        <p className="text-xs text-gray-400">{c.code}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <p className="text-xs text-gray-400">
                    Showing <span className="font-semibold text-gray-600">{filteredCourses.length}</span> course{filteredCourses.length > 1 ? "s" : ""}
                </p>
            </div>

            {/* Grades & Feedback Table */}
            {filteredCourses.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">No courses found</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {filteredCourses.map((course) => {
                        const courseAssignments = course.assignments || [];
                        const courseAvg = calcCourseAverage(courseAssignments);
                        const lg = getLetterGrade(courseAvg);
                        const graded = getGradedAssignments(courseAssignments);
                        const pending = getPendingAssignments(courseAssignments);

                        const q = searchQuery.trim().toLowerCase();
                        const filteredGraded = graded.filter((a) => {
                            const matchSearch = !q || (a.name || "").toLowerCase().includes(q);
                            const matchCategory = categoryFilter === "all" || a.category === categoryFilter;
                            let matchGradeRange = gradeRangeFilter === "all";
                            if (!matchGradeRange) {
                                const pct = (a.score / a.maxScore) * 100;
                                if (gradeRangeFilter === "excellent") matchGradeRange = pct >= 90;
                                else if (gradeRangeFilter === "passing") matchGradeRange = pct >= 60 && pct < 90;
                                else if (gradeRangeFilter === "failing") matchGradeRange = pct < 60;
                            }
                            return matchSearch && matchCategory && matchGradeRange;
                        });
                        const filteredPending = pending.filter((a) => {
                            const matchSearch = !q || (a.name || "").toLowerCase().includes(q);
                            const matchCategory = categoryFilter === "all" || a.category === categoryFilter;
                            return matchSearch && matchCategory && gradeRangeFilter === "all";
                        });
                        const allAssignments = [
                            ...filteredGraded.sort((a, b) => new Date(b.gradeDate || 0) - new Date(a.gradeDate || 0)),
                            ...filteredPending,
                        ];

                        if (allAssignments.length === 0) return null;

                        return (
                            <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">{course.name}</h3>
                                            <p className="text-xs text-gray-400">{course.code} &middot; {course.instructor || ""}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400">{graded.length}/{courseAssignments.length} graded</span>
                                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${lg.bg} ${lg.color}`}>
                                            {lg.grade} ({courseAvg.toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/30">
                                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Assignment</th>
                                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Weight</th>
                                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Score</th>
                                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Graded On</th>
                                                <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {allAssignments.map((a) => {
                                                const isPending = a.score === null;
                                                return (
                                                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-1.5 rounded-lg ${isPending ? "bg-gray-100" : a.category === "Exam" ? "bg-red-50" : a.category === "Quiz" ? "bg-purple-50" : "bg-indigo-50"}`}>
                                                                    {isPending ? <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                                        : a.category === "Exam" ? <FileText className="w-3.5 h-3.5 text-red-500" />
                                                                            : a.category === "Quiz" ? <Percent className="w-3.5 h-3.5 text-purple-500" />
                                                                                : <FileText className="w-3.5 h-3.5 text-indigo-500" />}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                                                                    <span className="text-[11px] text-gray-400">{a.category}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center text-gray-600 font-medium">{a.weight || "-"}%</td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            {isPending ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                                                                    <Clock className="w-3 h-3" /> Pending
                                                                </span>
                                                            ) : (
                                                                <span className={`font-semibold ${getScoreColor(a.score, a.maxScore)}`}>
                                                                    {a.score}/{a.maxScore}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center text-xs text-gray-400">
                                                            {isPending ? "\u2014" : formatDate(a.gradeDate)}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-right">
                                                            {isPending ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-400">
                                                                    <Clock className="w-3 h-3" /> Awaiting Grade
                                                                </span>
                                                            ) : (
                                                                <button onClick={() => setFeedbackTarget(a)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer">
                                                                    <MessageSquare className="w-3.5 h-3.5" /> View Feedback
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-xs">
                                    <span className="text-gray-400">Course Average</span>
                                    <span className={`font-bold ${lg.color}`}>{lg.grade} ({courseAvg.toFixed(1)}%)</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {feedbackTarget && (
                <FeedbackModal assignment={feedbackTarget} onClose={() => setFeedbackTarget(null)} />
            )}
        </div>
    );
}
