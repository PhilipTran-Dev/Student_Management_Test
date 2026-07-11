import { useEffect, useState } from "react";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createClass, fetchAllCourses, fetchAllSemesters } from "../../services/classService";

// ── Toast component ──────────────────────────────────────────────────────
function Toast({ message, type, code, onClose }) {
    const isSuccess = type === "success";
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm z-10 text-center">
                <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isSuccess ? "bg-emerald-100" : "bg-red-100"}`}>
                    {isSuccess ? <CheckCircle className="w-7 h-7 text-emerald-600" /> : <AlertCircle className="w-7 h-7 text-red-600" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{isSuccess ? "Class Created Successfully!" : "Failed to Create Class"}</h3>
                {isSuccess && code ? (
                    <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Share this code with your students:</p>
                        <div className="inline-block px-6 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <span className="text-2xl font-bold tracking-widest text-emerald-700 select-all">{code}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Click the code above to select it, then copy (Ctrl+C)</p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 mb-4">{message}</p>
                )}
                <button onClick={onClose} className={`w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-colors cursor-pointer ${isSuccess ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>
                    {isSuccess ? "Done" : "Try Again"}
                </button>
            </div>
        </div>
    );
}

export default function CreateClassModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ name: "", courseId: "", semesterId: "" });
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        let active = true;
        const loadLookups = async () => {
            setOptionsLoading(true);
            try {
                const [courseData, semesterData] = await Promise.all([fetchAllCourses(), fetchAllSemesters()]);
                if (active) {
                    setCourses(Array.isArray(courseData) ? courseData : []);
                    setSemesters(Array.isArray(semesterData) ? semesterData : []);
                }
            } catch {
                if (active) {
                    setCourses([]);
                    setSemesters([]);
                }
            } finally {
                if (active) {
                    setOptionsLoading(false);
                }
            }
        };

        loadLookups();
        return () => {
            active = false;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (formError) setFormError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!form.name.trim()) {
            setFormError("Class name is required.");
            return;
        }
        if (!form.courseId) {
            setFormError("Please select a course.");
            return;
        }
        if (!form.semesterId) {
            setFormError("Please select a semester.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: form.name.trim(),
                courseId: Number(form.courseId),
                semesterId: Number(form.semesterId),
            };

            const createdClass = await createClass(payload);
            setToast({ type: "success", message: "Class created successfully.", code: createdClass?.code || "N/A" });
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "An unexpected error occurred. Please try again.";
            setToast({ type: "error", message: errorMsg, code: null });
        } finally {
            setLoading(false);
        }
    };

    const handleToastClose = () => {
        setToast(null);
        if (toast?.type === "success") {
            onClose();
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/40" onClick={loading ? undefined : onClose} />
                <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-gray-900">Create New Class</h2>
                        <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 disabled:opacity-40 cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {formError && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Name <span className="text-red-500">*</span></label>
                        <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Advanced Programming" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 mb-4" autoFocus disabled={loading} />

                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Course <span className="text-red-500">*</span></label>
                        <select name="courseId" value={form.courseId} onChange={handleChange} disabled={loading || optionsLoading} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 mb-4 appearance-none bg-white">
                            <option value="">{optionsLoading ? "Loading courses..." : "--- Select a Course ---"}</option>
                            {!optionsLoading && courses.map((course) => (
                                <option key={course.id} value={course.id}>{course.name || course.code || `Course ${course.id}`}</option>
                            ))}
                        </select>

                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Semester <span className="text-red-500">*</span></label>
                        <select name="semesterId" value={form.semesterId} onChange={handleChange} disabled={loading || optionsLoading} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 mb-6 appearance-none bg-white">
                            <option value="">{optionsLoading ? "Loading semesters..." : "--- Select a Semester ---"}</option>
                            {!optionsLoading && semesters.map((sem) => (
                                <option key={sem.id} value={sem.id}>{sem.name || sem.code || `Semester ${sem.id}`}</option>
                            ))}
                        </select>

                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-40 cursor-pointer">Cancel</button>
                            <button type="submit" disabled={loading || optionsLoading} className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer">
                                {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Creating...</>) : "Create Class"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {toast && <Toast type={toast.type} message={toast.message} code={toast.code} onClose={handleToastClose} />}
        </>
    );
}