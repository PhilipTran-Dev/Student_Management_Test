import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Upload, Clock, CheckCircle, X, Download, MessageSquare, Star, AlertTriangle } from "lucide-react";

const MOCK_ASSIGNMENT = {
    id: "A02",
    title: "Week 2 - Variables & Types",
    class: "CS101",
    due: "2026-02-17T23:59:00",
    points: 10,
    description: "Complete the exercises on variables, data types, and type conversion in JavaScript. Submit a single .js file with all your work clearly commented.\n\nTasks:\n1. Declare variables using let, const, and var\n2. Demonstrate at least 5 different data types\n3. Show type conversion examples (implicit and explicit)\n4. Include comments explaining each section",
    submitted: false,
    submittedFile: null,
    submittedAt: null,
    feedback: null,
    grade: null,
};

const MOCK_SUBMITTED = {
    ...MOCK_ASSIGNMENT,
    title: "Week 1 - Hello World",
    id: "A01",
    due: "2026-02-10T23:59:00",
    submitted: true,
    submittedFile: "hello_world.js",
    submittedAt: "2026-02-09T14:30:00",
    grade: 9,
    feedback: "Good work! Clear code structure and proper comments. Missing the bonus task for extra credit.",
};

export default function AssignmentDetailPage() {
    const { assignmentId } = useParams();
    const isSubmittedMock = assignmentId === "A01";
    const assignment = isSubmittedMock ? MOCK_SUBMITTED : MOCK_ASSIGNMENT;

    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(assignment.submitted);
    const [submittedFile, setSubmittedFile] = useState(assignment.submittedFile);
    const [serverError, setServerError] = useState("");

    const dueDate = new Date(assignment.due);
    const now = new Date();
    const timeLeft = dueDate - now;
    const isOverdue = timeLeft < 0;

    const formatTimeLeft = (ms) => {
        if (ms < 0) return "Overdue";
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}d ${hours}h remaining`;
        const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${mins}m remaining`;
    };

    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) setFile(f);
    };
    const handleFileSelect = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!file) return;
        setServerError("");
        setSubmitting(true);
        try {
            // const formData = new FormData();
            // formData.append("file", file);
            // const res = await axios.post(`/api/student/assignments/${assignmentId}/submit`, formData);
            await new Promise((r) => setTimeout(r, 1500));
            setSubmitted(true);
            setSubmittedFile(file.name);
            setFile(null);
        } catch (err) {
            setServerError(err.response?.data?.message || "Submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnsubmit = async () => {
        setSubmitting(true);
        try {
            // await axios.post(`/api/student/assignments/${assignmentId}/unsubmit`);
            await new Promise((r) => setTimeout(r, 800));
            setSubmitted(false);
            setSubmittedFile(null);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Link to="/student/assignments" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to assignments
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <span className="font-medium text-indigo-600">{assignment.class}</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
                        <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{assignment.description}</p>

                        {isOverdue && !submitted && (
                            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> This assignment is overdue.
                            </div>
                        )}
                    </div>

                    {/* Submission area */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Submission</h2>

                        {serverError && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{serverError}</div>
                        )}

                        {submitted ? (
                            <div>
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200 mb-4">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-emerald-800">Submitted</p>
                                        <p className="text-xs text-emerald-600 truncate">{submittedFile}</p>
                                    </div>
                                    <button onClick={handleUnsubmit} disabled={submitting} className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer">
                                        {submitting ? "..." : "Unsubmit & Resubmit"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-300 hover:border-gray-400"}`}
                                    onClick={() => document.getElementById("fileInput").click()}
                                >
                                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm font-medium text-gray-600">Drag & drop your file here</p>
                                    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                                    <input id="fileInput" type="file" onChange={handleFileSelect} className="hidden" />
                                </div>
                                {file && (
                                    <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                                        <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 cursor-pointer"><X className="w-4 h-4" /></button>
                                    </div>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!file || submitting}
                                    className="mt-4 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    {submitting ? "Submitting..." : <><Upload className="w-4 h-4" /> Submit Assignment</>}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Feedback */}
                    {assignment.feedback && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                                View Feedback
                            </h2>
                            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                                <p className="text-sm text-gray-700">{assignment.feedback}</p>
                                <p className="text-xs text-gray-400 mt-2">— Instructor</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-gray-500">Due Date</p>
                                <p className="font-medium text-gray-900">{dueDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Time Remaining</p>
                                <p className={`font-medium flex items-center gap-1 ${isOverdue ? "text-red-600" : "text-amber-600"}`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatTimeLeft(timeLeft)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Points</p>
                                <p className="font-medium text-gray-900">{assignment.points} pts</p>
                            </div>
                            {assignment.grade !== null && (
                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">Grade</p>
                                    <p className="text-lg font-bold text-emerald-600">
                                        <Star className="w-4 h-4 inline mr-1" />
                                        {assignment.grade}/{assignment.points}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}