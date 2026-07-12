import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { ArrowLeft, FileText, Upload, Clock, CheckCircle, X, Download, MessageSquare, Star, AlertTriangle, Loader2 } from "lucide-react";
import { getClassAssignments, submitAssignment, unsubmitAssignment } from "../../services/assignmentService";
import { fetchStudentClasses } from "../../services/classService";

export default function AssignmentDetailPage() {
    const { assignmentId } = useParams();
    const location = useLocation();
    const classIdFromState = location.state?.classId;

    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [files, setFiles] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");

    useEffect(() => {
        loadAssignment();
    }, [assignmentId]);

    const loadAssignment = async () => {
        setLoading(true);
        setError("");
        try {
            if (classIdFromState) {
                const data = await getClassAssignments(classIdFromState);
                const list = Array.isArray(data) ? data : [];
                const found = list.find((a) => String(a.id) === String(assignmentId));
                if (found) {
                    setAssignment(found);
                    return;
                }
            }
            const classes = await fetchStudentClasses();
            const classList = Array.isArray(classes) ? classes : [];
            for (const cls of classList) {
                const data = await getClassAssignments(cls.id);
                const list = Array.isArray(data) ? data : [];
                const found = list.find((a) => String(a.id) === String(assignmentId));
                if (found) {
                    setAssignment(found);
                    return;
                }
            }
            setError("Assignment not found");
        } catch {
            setError("Failed to load assignment details");
        } finally {
            setLoading(false);
        }
    };

    const dueDate = assignment ? new Date(assignment.dueDate) : new Date();
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
        const dropped = Array.from(e.dataTransfer.files || []);
        if (dropped.length > 0) setFiles((prev) => [...prev, ...dropped]);
    };
    const handleFileSelect = (e) => {
        const selected = Array.from(e.target.files || []);
        if (selected.length > 0) setFiles((prev) => [...prev, ...selected]);
        e.target.value = "";
    };
    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (files.length === 0) return;
        setServerError("");
        setSubmitting(true);
        try {
            await submitAssignment(assignmentId, files);
            setAssignment((prev) => ({ ...prev, state: "DONE", submittedFiles: files.map((f) => f.name) }));
            setFiles([]);
        } catch (err) {
            setServerError(err.response?.data?.message || "Submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnsubmit = async () => {
        setServerError("");
        setSubmitting(true);
        try {
            await unsubmitAssignment(assignmentId);
            setAssignment((prev) => ({ ...prev, state: "TODO", submittedFiles: null, earnedGrade: null }));
        } catch (err) {
            setServerError(err.response?.data?.message || "Unsubmit failed.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="ml-3 text-gray-500 text-sm">Loading assignment...</span>
            </div>
        );
    }

    if (error && !assignment) {
        return (
            <div>
                <Link to="/student/assignments" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to assignments
                </Link>
                <div className="text-center py-16 text-gray-400">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            </div>
        );
    }

    const isSubmitted = assignment.state === "DONE";
    const isGraded = assignment.earnedGrade !== null && assignment.earnedGrade !== undefined;

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
                            <span className="font-medium text-indigo-600">{assignment.className || assignment.classId}</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
                        <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{assignment.description}</p>

                        {isOverdue && !isSubmitted && (
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

                        {isSubmitted ? (
                            <div>
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200 mb-4">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-emerald-800">Submitted</p>
                                        <p className="text-xs text-emerald-600 truncate">
                                            {assignment.submittedFiles?.join(", ") || "Files submitted"}
                                        </p>
                                    </div>
                                    {!isGraded && (
                                        <button
                                            onClick={handleUnsubmit}
                                            disabled={submitting}
                                            className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer disabled:opacity-50"
                                        >
                                            {submitting ? "..." : "Unsubmit & Resubmit"}
                                        </button>
                                    )}
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
                                    <p className="text-sm font-medium text-gray-600">Drag & drop files here</p>
                                    <p className="text-xs text-gray-400 mt-1">or click to browse (multiple files)</p>
                                    <input id="fileInput" type="file" multiple onChange={handleFileSelect} className="hidden" />
                                </div>
                                {files.length > 0 && (
                                    <div className="mt-3 space-y-1.5">
                                        {files.map((f, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <span className="text-sm text-gray-700 flex-1 truncate">{f.name}</span>
                                                <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 cursor-pointer flex-shrink-0"><X className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={files.length === 0 || submitting}
                                    className="mt-4 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    {submitting ? "Submitting..." : <><Upload className="w-4 h-4" /> Submit Assignment</>}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Feedback */}
                    {isGraded && assignment.feedback && (
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
                            {!isSubmitted && (
                                <div>
                                    <p className="text-xs text-gray-500">Time Remaining</p>
                                    <p className={`font-medium flex items-center gap-1 ${isOverdue ? "text-red-600" : "text-amber-600"}`}>
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatTimeLeft(timeLeft)}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500">Points</p>
                                <p className="font-medium text-gray-900">{assignment.maxScore} pts</p>
                            </div>
                            {isGraded && (
                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">Grade</p>
                                    <p className="text-lg font-bold text-emerald-600">
                                        <Star className="w-4 h-4 inline mr-1" />
                                        {assignment.earnedGrade}/{assignment.maxScore}
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
