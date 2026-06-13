import { useState, useRef, useEffect, useMemo } from "react";
import {
    GraduationCap, MessageSquare, Award, ChevronDown, Calendar, User,
    FileText, CheckCircle, X, Clock, Star, Percent, BookOpen,
    TrendingUp, AlertCircle, BarChart3, Quote, Search, Filter, SlidersHorizontal
} from "lucide-react";

/* ============================================================
   MOCK DATA
   ============================================================ */
const COURSES = [
    {
        id: "CS101",
        name: "Introduction to Programming",
        code: "CS101-2026-S1",
        credits: 4,
        instructor: "Dr. Tran Van B",
        assignments: [
            {
                id: "a1",
                name: "Assignment 1: Variables & Types",
                category: "Homework",
                weight: 10,
                score: 92,
                maxScore: 100,
                gradeDate: "2026-02-17",
                gradedBy: "Dr. Tran Van B",
                feedback: {
                    text: "Excellent work on the fundamentals! Your variable naming conventions are clear and consistent. The type conversions are handled correctly. One area to improve: please add more edge case handling for null inputs. Overall, a strong start to the course.",
                    rubric: [
                        { criterion: "Code Correctness", score: 45, maxScore: 50 },
                        { criterion: "Code Efficiency & Optimization", score: 22, maxScore: 25 },
                        { criterion: "Documentation & Readme", score: 25, maxScore: 25 },
                    ],
                    publishedAt: "2026-02-18T10:30:00Z",
                },
            },
            {
                id: "a2",
                name: "Assignment 2: Control Loops",
                category: "Homework",
                weight: 10,
                score: 88,
                maxScore: 100,
                gradeDate: "2026-03-03",
                gradedBy: "Dr. Tran Van B",
                feedback: {
                    text: "Good logic flow in your loop implementations. The nested loop in problem 3 was elegant. However, some of your while loops could be optimized with for loops where the iteration count is known. Make sure to include comments explaining complex logic. Keep up the good work!",
                    rubric: [
                        { criterion: "Code Correctness", score: 42, maxScore: 50 },
                        { criterion: "Code Efficiency & Optimization", score: 21, maxScore: 25 },
                        { criterion: "Documentation & Readme", score: 25, maxScore: 25 },
                    ],
                    publishedAt: "2026-03-04T14:15:00Z",
                },
            },
            {
                id: "a3",
                name: "Assignment 3: Functions & Modules",
                category: "Homework",
                weight: 10,
                score: null,
                maxScore: 100,
                gradeDate: null,
                gradedBy: null,
                feedback: null,
            },
            {
                id: "mid1",
                name: "Midterm Exam",
                category: "Exam",
                weight: 30,
                score: 85,
                maxScore: 100,
                gradeDate: "2026-03-16",
                gradedBy: "Dr. Tran Van B",
                feedback: {
                    text: "Solid midterm performance. You demonstrated strong understanding of core concepts. The algorithm design question was particularly well done. For future exams, focus on time complexity analysis questions and practice with more complex data structure problems.",
                    rubric: [
                        { criterion: "Multiple Choice (Theory)", score: 28, maxScore: 30 },
                        { criterion: "Coding Problems", score: 40, maxScore: 45 },
                        { criterion: "Algorithm Analysis", score: 17, maxScore: 25 },
                    ],
                    publishedAt: "2026-03-18T09:00:00Z",
                },
            },
            {
                id: "final1",
                name: "Final Exam",
                category: "Exam",
                weight: 40,
                score: null,
                maxScore: 100,
                gradeDate: null,
                gradedBy: null,
                feedback: null,
            },
        ],
    },
    {
        id: "CS201",
        name: "Data Structures & Algorithms",
        code: "CS201-2026-S1",
        credits: 4,
        instructor: "Prof. Le Thi C",
        assignments: [
            {
                id: "b1",
                name: "Assignment 1: Linked Lists",
                category: "Homework",
                weight: 10,
                score: 90,
                maxScore: 100,
                gradeDate: "2026-02-20",
                gradedBy: "Prof. Le Thi C",
                feedback: {
                    text: "Excellent implementation of doubly linked lists. Your insertion and deletion operations are correct and well-structured. The bonus section for circular linked lists was a nice touch. Consider adding more comments for complex pointer manipulations.",
                    rubric: [
                        { criterion: "Code Correctness", score: 46, maxScore: 50 },
                        { criterion: "Code Efficiency & Optimization", score: 20, maxScore: 25 },
                        { criterion: "Documentation & Readme", score: 24, maxScore: 25 },
                    ],
                    publishedAt: "2026-02-21T11:00:00Z",
                },
            },
            {
                id: "b2",
                name: "Midterm Exam",
                category: "Exam",
                weight: 30,
                score: 72,
                maxScore: 100,
                gradeDate: "2026-03-18",
                gradedBy: "Prof. Le Thi C",
                feedback: {
                    text: "Your recursive solution to the tree traversal problem was well-structured. However, the graph section needs improvement. I recommend reviewing Dijkstra's algorithm and practicing more graph-based problems. The theoretical questions were answered competently.",
                    rubric: [
                        { criterion: "Multiple Choice (Theory)", score: 22, maxScore: 30 },
                        { criterion: "Coding Problems", score: 35, maxScore: 45 },
                        { criterion: "Algorithm Analysis", score: 15, maxScore: 25 },
                    ],
                    publishedAt: "2026-03-20T10:00:00Z",
                },
            },
            {
                id: "b3",
                name: "Assignment 2: Trees & Graphs",
                category: "Homework",
                weight: 10,
                score: null,
                maxScore: 100,
                gradeDate: null,
                gradedBy: null,
                feedback: null,
            },
            {
                id: "b4",
                name: "Final Exam",
                category: "Exam",
                weight: 40,
                score: 80,
                maxScore: 100,
                gradeDate: "2026-05-10",
                gradedBy: "Prof. Le Thi C",
                feedback: {
                    text: "Good recovery on the final exam. Your understanding of hash tables and BST operations has clearly improved. The complexity analysis section was well-answered. To further improve, focus on advanced sorting algorithms and their real-world applications.",
                    rubric: [
                        { criterion: "Multiple Choice (Theory)", score: 26, maxScore: 30 },
                        { criterion: "Coding Problems", score: 38, maxScore: 45 },
                        { criterion: "Algorithm Analysis", score: 16, maxScore: 25 },
                    ],
                    publishedAt: "2026-05-12T09:30:00Z",
                },
            },
            {
                id: "b5",
                name: "Weekly Quizzes",
                category: "Quiz",
                weight: 10,
                score: 88,
                maxScore: 100,
                gradeDate: "2026-05-08",
                gradedBy: "Prof. Le Thi C",
                feedback: {
                    text: "Consistent quiz performance throughout the semester. Your scores improved from week 1 to week 12, showing good progress. Keep reviewing lecture materials before each class to maintain this trajectory.",
                    rubric: [
                        { criterion: "Weekly Quiz Scores", score: 44, maxScore: 50 },
                        { criterion: "Improvement Trend", score: 22, maxScore: 25 },
                        { criterion: "Timely Submissions", score: 22, maxScore: 25 },
                    ],
                    publishedAt: "2026-05-09T08:00:00Z",
                },
            },
        ],
    },
    {
        id: "MA101",
        name: "Calculus I",
        code: "MA101-2026-S1",
        credits: 3,
        instructor: "Dr. Pham Van D",
        assignments: [
            {
                id: "c1",
                name: "Homework 1: Limits & Continuity",
                category: "Homework",
                weight: 10,
                score: 80,
                maxScore: 100,
                gradeDate: "2026-02-10",
                gradedBy: "Dr. Pham Van D",
                feedback: {
                    text: "Good attempt on limit evaluations. Most of the algebraic manipulation was correct. However, be careful with one-sided limits and the squeeze theorem. Review the examples from lecture 3 for more practice. Your handwriting and presentation are neat.",
                    rubric: [
                        { criterion: "Problem Solving Accuracy", score: 38, maxScore: 50 },
                        { criterion: "Method & Approach", score: 22, maxScore: 25 },
                        { criterion: "Presentation & Clarity", score: 20, maxScore: 25 },
                    ],
                    publishedAt: "2026-02-11T08:30:00Z",
                },
            },
            {
                id: "c2",
                name: "Homework 2: Derivatives",
                category: "Homework",
                weight: 10,
                score: null,
                maxScore: 100,
                gradeDate: null,
                gradedBy: null,
                feedback: null,
            },
            {
                id: "c3",
                name: "Midterm Exam",
                category: "Exam",
                weight: 35,
                score: 65,
                maxScore: 100,
                gradeDate: "2026-03-15",
                gradedBy: "Dr. Pham Van D",
                feedback: {
                    text: "The midterm results indicate that derivative rules still need practice, especially the chain rule and implicit differentiation. Your limit and continuity section was average. I strongly recommend attending extra tutorial sessions on Thursdays. Additional practice problems are available on the course portal.",
                    rubric: [
                        { criterion: "Limits & Continuity", score: 18, maxScore: 30 },
                        { criterion: "Derivative Calculations", score: 28, maxScore: 45 },
                        { criterion: "Applications of Derivatives", score: 19, maxScore: 25 },
                    ],
                    publishedAt: "2026-03-17T10:00:00Z",
                },
            },
            {
                id: "c4",
                name: "Final Exam",
                category: "Exam",
                weight: 40,
                score: 70,
                maxScore: 100,
                gradeDate: "2026-05-12",
                gradedBy: "Dr. Pham Van D",
                feedback: {
                    text: "Noticeable improvement from midterm to final. The integration section was your strongest area. Derivative applications have improved but still need refinement. Continue practicing optimization problems over the break if you plan to take Calculus II.",
                    rubric: [
                        { criterion: "Integration", score: 22, maxScore: 30 },
                        { criterion: "Derivative Applications", score: 30, maxScore: 45 },
                        { criterion: "Theoretical Understanding", score: 18, maxScore: 25 },
                    ],
                    publishedAt: "2026-05-14T09:00:00Z",
                },
            },
            {
                id: "c5",
                name: "Weekly Problem Sets",
                category: "Quiz",
                weight: 5,
                score: 80,
                maxScore: 100,
                gradeDate: "2026-05-08",
                gradedBy: "Dr. Pham Van D",
                feedback: null,
            },
        ],
    },
    {
        id: "EN201",
        name: "Academic English",
        code: "EN201-2025-F1",
        credits: 2,
        instructor: "Ms. Nguyen Thi E",
        assignments: [
            {
                id: "d1",
                name: "Essay 1: Argumentative Writing",
                category: "Writing",
                weight: 20,
                score: 90,
                maxScore: 100,
                gradeDate: "2026-02-15",
                gradedBy: "Ms. Nguyen Thi E",
                feedback: {
                    text: "Well-structured argument with strong thesis statement. Your use of transition phrases is excellent. The counterargument paragraph was particularly effective. To improve further, work on integrating more academic sources to support your claims.",
                    rubric: [
                        { criterion: "Thesis & Argument Structure", score: 24, maxScore: 25 },
                        { criterion: "Grammar & Vocabulary", score: 22, maxScore: 25 },
                        { criterion: "Research & Citation", score: 21, maxScore: 25 },
                        { criterion: "Originality & Critical Thinking", score: 23, maxScore: 25 },
                    ],
                    publishedAt: "2026-02-16T14:00:00Z",
                },
            },
            {
                id: "d2",
                name: "Oral Presentation",
                category: "Speaking",
                weight: 20,
                score: 88,
                maxScore: 100,
                gradeDate: "2026-03-10",
                gradedBy: "Ms. Nguyen Thi E",
                feedback: {
                    text: "Confident delivery with good eye contact and pacing. Your slides were well-designed and informative. Areas for improvement: work on pronunciation of technical terms and reduce filler words (um, like). Practice with timed runs to manage the Q&A session better next time.",
                    rubric: [
                        { criterion: "Delivery & Confidence", score: 23, maxScore: 25 },
                        { criterion: "Content & Organization", score: 22, maxScore: 25 },
                        { criterion: "Visual Aids", score: 23, maxScore: 25 },
                        { criterion: "Q&A Handling", score: 20, maxScore: 25 },
                    ],
                    publishedAt: "2026-03-11T11:30:00Z",
                },
            },
            {
                id: "d3",
                name: "Midterm Exam",
                category: "Exam",
                weight: 20,
                score: 85,
                maxScore: 100,
                gradeDate: "2026-03-20",
                gradedBy: "Ms. Nguyen Thi E",
                feedback: null,
            },
            {
                id: "d4",
                name: "Final Essay",
                category: "Writing",
                weight: 25,
                score: null,
                maxScore: 100,
                gradeDate: null,
                gradedBy: null,
                feedback: null,
            },
            {
                id: "d5",
                name: "Class Participation",
                category: "Participation",
                weight: 15,
                score: 95,
                maxScore: 100,
                gradeDate: "2026-05-08",
                gradedBy: "Ms. Nguyen Thi E",
                feedback: {
                    text: "Excellent participation throughout the semester. You consistently contributed valuable insights during class discussions. Your group work collaboration was highly praised by peers. Keep up this level of engagement!",
                    rubric: [
                        { criterion: "Class Discussion", score: 48, maxScore: 50 },
                        { criterion: "Group Collaboration", score: 23, maxScore: 25 },
                        { criterion: "Attendance & Punctuality", score: 24, maxScore: 25 },
                    ],
                    publishedAt: "2026-05-09T08:00:00Z",
                },
            },
        ],
    },
];

/* ============================================================
   HELPERS
   ============================================================ */
const getGradedAssignments = (assignments) =>
    assignments.filter((a) => a.score !== null);

const getPendingAssignments = (assignments) =>
    assignments.filter((a) => a.score === null);

const calcCourseAverage = (assignments) => {
    const graded = getGradedAssignments(assignments);
    if (graded.length === 0) return 0;
    const totalWeight = graded.reduce((s, a) => s + a.weight, 0);
    const weightedSum = graded.reduce(
        (s, a) => s + (a.score / a.maxScore) * a.weight,
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

const getProgressColor = (pct) => {
    if (pct >= 85) return "stroke-emerald-500";
    if (pct >= 70) return "stroke-blue-500";
    if (pct >= 60) return "stroke-amber-500";
    return "stroke-red-500";
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/* ============================================================
   CIRCULAR PROGRESS COMPONENT
   ============================================================ */
function CircularProgress({ value, size = 80, strokeWidth = 6, label }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const colorClass = getProgressColor(value);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90 absolute top-0 left-0">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    className="stroke-gray-100 fill-none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className={`fill-none transition-all duration-700 ease-out ${colorClass}`}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>

            <div className="flex flex-col items-center justify-center z-10 text-center select-none">
                <span className={`${size < 70 ? "text-xs" : "text-sm"} font-bold text-gray-900`}>
                    {value.toFixed(1)}%
                </span>
                {label && <span className="text-[9px] text-gray-400 mt-0.5">{label}</span>}
            </div>
        </div>
    );
}

/* ============================================================
   FEEDBACK MODAL
   ============================================================ */
function FeedbackModal({ assignment, onClose }) {
    if (!assignment || !assignment.feedback) return null;

    const { feedback } = assignment;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10 animate-fade-in">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">
                                Feedback: {assignment.name}
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {assignment.category} &middot; Weight: {assignment.weight}%
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Instructor Header */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
                            {assignment.gradedBy?.split(" ").pop()[0]}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                                {assignment.gradedBy}
                            </p>
                            <p className="text-xs text-gray-400">
                                Grade published{" "}
                                {formatDateTime(feedback.publishedAt)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                                {assignment.score}/{assignment.maxScore}
                            </p>
                            <p className="text-xs text-gray-400">
                                {((assignment.score / assignment.maxScore) * 100).toFixed(0)}%
                            </p>
                        </div>
                    </div>

                    {/* Qualitative Comments */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Quote className="w-4 h-4 text-indigo-500" />
                            Instructor Comments
                        </h3>
                        <div className="relative pl-5 border-l-4 border-indigo-300 bg-indigo-50/50 rounded-r-xl p-4">
                            <p className="text-sm text-gray-700 leading-relaxed italic">
                                "{feedback.text}"
                            </p>
                        </div>
                    </div>

                    {/* Rubric Breakdown */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-indigo-500" />
                            Rubric Component Breakdown
                        </h3>
                        <div className="space-y-3">
                            {feedback.rubric.map((item, idx) => {
                                const pct = (item.score / item.maxScore) * 100;
                                return (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between text-sm mb-1.5">
                                            <span className="font-medium text-gray-700">
                                                {item.criterion}
                                            </span>
                                            <span className={`font-semibold ${getScoreColor(item.score, item.maxScore)}`}>
                                                {item.score} / {item.maxScore}
                                            </span>
                                        </div>
                                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${pct >= 85
                                                    ? "bg-emerald-500"
                                                    : pct >= 70
                                                        ? "bg-blue-500"
                                                        : pct >= 60
                                                            ? "bg-amber-500"
                                                            : "bg-red-500"
                                                    }`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Score Summary */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-600" />
                                <span className="text-sm font-semibold text-indigo-800">
                                    Total Score
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-bold text-indigo-700">
                                    {assignment.score} / {assignment.maxScore}
                                </span>
                                <span className="text-sm text-indigo-500 ml-2">
                                    ({((assignment.score / assignment.maxScore) * 100).toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   MAIN PAGE COMPONENT
   ============================================================ */
export default function GradebookPage() {
    const [selectedCourse, setSelectedCourse] = useState("all");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [feedbackTarget, setFeedbackTarget] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [gradeRangeFilter, setGradeRangeFilter] = useState("all");
    const dropdownRef = useRef(null);

    /* Close dropdown on outside click */
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* Category options derived from all courses */
    const categoryOptions = useMemo(() => {
        const cats = new Set();
        COURSES.forEach((c) => c.assignments.forEach((a) => cats.add(a.category)));
        return [...cats].sort();
    }, []);

    /* Has active filters */
    const hasActiveFilters = searchQuery.trim() !== "" || categoryFilter !== "all" || gradeRangeFilter !== "all" || selectedCourse !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setCategoryFilter("all");
        setGradeRangeFilter("all");
        setSelectedCourse("all");
    };

    /* Filter courses */
    const filteredCourses =
        selectedCourse === "all"
            ? COURSES
            : COURSES.filter((c) => c.id === selectedCourse);

    const selectedCourseObj =
        selectedCourse === "all" ? null : COURSES.find((c) => c.id === selectedCourse);

    /* Compute overall metrics */
    const allGradedAssignments = COURSES.flatMap((c) => getGradedAssignments(c.assignments));
    const totalGradedCount = allGradedAssignments.length;
    const totalPendingCount = COURSES.flatMap((c) => getPendingAssignments(c.assignments)).length;

    const totalCredits = COURSES.reduce((s, c) => s + c.credits, 0);
    const gpa =
        COURSES.reduce((s, c) => {
            const avg = calcCourseAverage(c.assignments);
            return s + getGradePoints(avg) * c.credits;
        }, 0) / totalCredits;

    const overallAvg =
        COURSES.reduce((s, c) => s + calcCourseAverage(c.assignments), 0) / COURSES.length;

    const academicStanding = gpa >= 3.5 ? "Dean's List" : gpa >= 2.0 ? "Good Standing" : "Probation";

    return (
        <div>
            {/* ======== Page Header ======== */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Grades & Feedback</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Track your performance and review instructor feedback
                </p>
            </div>

            {/* ======== Summary Dashboard Metrics ======== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* GPA Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Current GPA
                        </span>
                        <div className="p-1.5 rounded-lg bg-indigo-50">
                            <GraduationCap className="w-4 h-4 text-indigo-600" />
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {gpa.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">out of 4.0</p>
                        </div>
                        <div className="relative w-16 h-16">
                            <CircularProgress
                                value={overallAvg}
                                size={64}
                                strokeWidth={5}
                            />
                        </div>
                    </div>
                </div>

                {/* Completed Credits */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Completed Credits
                        </span>
                        <div className="p-1.5 rounded-lg bg-emerald-50">
                            <BookOpen className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{totalCredits}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        18 Credits Total &middot;{" "}
                        <span className="text-emerald-600 font-medium">
                            {((totalCredits / 18) * 100).toFixed(0)}% Complete
                        </span>
                    </p>
                    <div className="mt-3 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${(totalCredits / 18) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Graded Tasks */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Graded Tasks
                        </span>
                        <div className="p-1.5 rounded-lg bg-amber-50">
                            <FileText className="w-4 h-4 text-amber-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{totalGradedCount}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Assignments Graded &middot;{" "}
                        <span className="text-amber-600 font-medium">
                            {totalPendingCount} pending
                        </span>
                    </p>
                </div>

                {/* Academic Standing */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Academic Standing
                        </span>
                        <div className="p-1.5 rounded-lg bg-purple-50">
                            <Star className="w-4 h-4 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {gpa >= 3.5 ? "Dean's List" : "Good Standing"}
                    </p>
                    <span
                        className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${gpa >= 3.5
                            ? "bg-purple-50 text-purple-700"
                            : "bg-emerald-50 text-emerald-700"
                            }`}
                    >
                        <CheckCircle className="w-3 h-3" />
                        {academicStanding}
                    </span>
                </div>
            </div>

            {/* ======== Search & Filters Bar ======== */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by assignment name..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400"
                    />
                </div>
                <div className="relative w-full sm:w-44">
                    <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400 appearance-none bg-white"
                    >
                        <option value="all">All Categories</option>
                        {categoryOptions.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full sm:w-44">
                    <Percent className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={gradeRangeFilter}
                        onChange={(e) => setGradeRangeFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400 appearance-none bg-white"
                    >
                        <option value="all">All Grades</option>
                        <option value="excellent">Excellent (90%+)</option>
                        <option value="passing">Passing (60%-89%)</option>
                        <option value="failing">Failing (below 60%)</option>
                    </select>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                        Clear
                    </button>
                )}
            </div>

            {/* ======== Course Filter Dropdown ======== */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        {selectedCourse === "all" ? (
                            <>
                                <GraduationCap className="w-4 h-4 text-indigo-500" />
                                All Courses
                            </>
                        ) : (
                            <>
                                <BookOpen className="w-4 h-4 text-indigo-500" />
                                {selectedCourseObj?.name} ({selectedCourse})
                            </>
                        )}
                        <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                            <button
                                onClick={() => {
                                    setSelectedCourse("all");
                                    setDropdownOpen(false);
                                }}
                                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${selectedCourse === "all"
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <GraduationCap className="w-4 h-4 flex-shrink-0" />
                                <span className="font-medium">All Courses</span>
                            </button>
                            <hr className="border-gray-100 mx-3" />
                            {COURSES.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => {
                                        setSelectedCourse(c.id);
                                        setDropdownOpen(false);
                                    }}
                                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${selectedCourse === c.id
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">{c.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {c.code} &middot; {c.credits} credits
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <p className="text-xs text-gray-400">
                    Showing{" "}
                    <span className="font-semibold text-gray-600">
                        {filteredCourses.length}
                    </span>{" "}
                    course{filteredCourses.length > 1 ? "s" : ""}
                </p>
            </div>

            {/* ======== Grades & Feedback Table ======== */}
            {filteredCourses.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">No courses found</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {filteredCourses.map((course) => {
                        const courseAvg = calcCourseAverage(course.assignments);
                        const lg = getLetterGrade(courseAvg);
                        const graded = getGradedAssignments(course.assignments);
                        const pending = getPendingAssignments(course.assignments);

                        // Apply assignment-level filters
                        const q = searchQuery.trim().toLowerCase();
                        const filteredGraded = graded.filter((a) => {
                            const matchSearch = !q || a.name.toLowerCase().includes(q);
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
                            const matchSearch = !q || a.name.toLowerCase().includes(q);
                            const matchCategory = categoryFilter === "all" || a.category === categoryFilter;
                            // Pending items only show if grade range is "all" (since they have no score)
                            const matchGradeRange = gradeRangeFilter === "all";
                            return matchSearch && matchCategory && matchGradeRange;
                        });
                        const allAssignments = [
                            ...filteredGraded.sort((a, b) => new Date(b.gradeDate) - new Date(a.gradeDate)),
                            ...filteredPending,
                        ];

                        // Skip course card if no assignments match
                        if (allAssignments.length === 0) return null;

                        return (
                            <div
                                key={course.id}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                            >
                                {/* Course Header */}
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                {course.name}
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                {course.code} &middot; {course.instructor} &middot;{" "}
                                                {course.credits} credits
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400">
                                            {graded.length}/{course.assignments.length} graded
                                        </span>
                                        <span
                                            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${lg.bg} ${lg.color}`}
                                        >
                                            {lg.grade} ({courseAvg.toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/30">
                                                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                                    Assignment
                                                </th>
                                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                                    Weight
                                                </th>
                                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                                    Score
                                                </th>
                                                <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                                    Graded On
                                                </th>
                                                <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {allAssignments.map((a) => {
                                                const isPending = a.score === null;
                                                return (
                                                    <tr
                                                        key={a.id}
                                                        className="hover:bg-gray-50/50 transition-colors"
                                                    >
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`p-1.5 rounded-lg ${isPending
                                                                        ? "bg-gray-100"
                                                                        : a.category === "Exam"
                                                                            ? "bg-red-50"
                                                                            : a.category === "Quiz"
                                                                                ? "bg-purple-50"
                                                                                : "bg-indigo-50"
                                                                        }`}
                                                                >
                                                                    {isPending ? (
                                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                                    ) : a.category === "Exam" ? (
                                                                        <FileText className="w-3.5 h-3.5 text-red-500" />
                                                                    ) : a.category === "Quiz" ? (
                                                                        <Percent className="w-3.5 h-3.5 text-purple-500" />
                                                                    ) : (
                                                                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                                        {a.name}
                                                                    </p>
                                                                    <span className="text-[11px] text-gray-400">
                                                                        {a.category}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center text-gray-600 font-medium">
                                                            {a.weight}%
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            {isPending ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
                                                                    <AlertCircle className="w-3 h-3" />
                                                                    Pending
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    className={`font-semibold ${getScoreColor(
                                                                        a.score,
                                                                        a.maxScore
                                                                    )}`}
                                                                >
                                                                    {a.score}/{a.maxScore}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center text-xs text-gray-400">
                                                            {isPending ? "—" : formatDate(a.gradeDate)}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-right">
                                                            {isPending ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-400">
                                                                    <Clock className="w-3 h-3" />
                                                                    Awaiting Grade
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() =>
                                                                        setFeedbackTarget(a)
                                                                    }
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                                                >
                                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                                    View Feedback
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Course Summary Footer */}
                                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-xs">
                                    <span className="text-gray-400">
                                        Course Average
                                    </span>
                                    <span className={`font-bold ${lg.color}`}>
                                        {lg.grade} ({courseAvg.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ======== Feedback Modal ======== */}
            {feedbackTarget && (
                <FeedbackModal
                    assignment={feedbackTarget}
                    onClose={() => setFeedbackTarget(null)}
                />
            )}
        </div>
    );
}