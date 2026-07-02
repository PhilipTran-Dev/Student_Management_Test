import { useState } from "react";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createClass } from "../../services/classService";

// ── Mock data for dropdowns ──────────────────────────────────────────────
const MOCK_COURSES = [
    { id: 101, name: "Java Backend Development" },
    { id: 102, name: "Distributed Systems" },
];

const MOCK_SEMESTERS = [
    { id: 1, name: "Semester 1 (Fall 2026)" },
    { id: 2, name: "Semester 2 (Spring 2027)" },
];

// ── Toast component ──────────────────────────────────────────────────────
function Toast({ message, type, code, onClose }) {
    const isSuccess = type === "success";
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm z-10 text-center">
                <div
                    className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isSuccess ? "bg-emerald-100" : "bg-red-100"
                        }`}
                >
                    {isSuccess ? (
                        <CheckCircle className="w-7 h-7 text-emerald-600" />
                    ) : (
                        <AlertCircle className="w-7 h-7 text-red-600" />
                    )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isSuccess ? "Class Created Successfully!" : "Failed to Create Class"}
                </h3>
                {isSuccess && code ? (
                    <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">
                            Share this code with your students:
                        </p>
                        <div className="inline-block px-6 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <span className="text-2xl font-bold tracking-widest text-emerald-700 select-all">
                                {code}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Click the code above to select it, then copy (Ctrl+C)
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 mb-4">{message}</p>
                )}
                <button
                    onClick={onClose}
                    className={`w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-colors cursor-pointer ${isSuccess
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                        }`}
                >
                    {isSuccess ? "Done" : "Try Again"}
                </button>
            </div>
        </div>
    );
}

// ── Main modal component ─────────────────────────────────────────────────
export default function CreateClassModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({
        name: "",
        courseId: "",
        semesterId: "",
    });
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null); // { type, message, code }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (formError) setFormError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        // ── Validation ────────────────────────────────────────────────
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

            // ── Success ────────────────────────────────────────────────
            setToast({
                type: "success",
                message: "Class created successfully.",
                code: createdClass.code || "N/A",
            });

            // Notify parent to re-fetch the full class list
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            // ── Error ──────────────────────────────────────────────────
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "An unexpected error occurred. Please try again.";

            setToast({
                type: "error",
                message: errorMsg,
                code: null,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToastClose = () => {
        setToast(null);
        // If it was a success, close the modal entirely
        if (toast?.type === "success") {
            onClose();
        }
    };

    return (
        <>
            {/* Modal backdrop + content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/40"
                    onClick={loading ? undefined : onClose}
                />
                <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Create New Class
                        </h2>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-40 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Inline form error */}
                    {formError && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        {/* Class Name */}
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Class Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Advanced Programming"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 mb-4"
                            autoFocus
                            disabled={loading}
                        />

                        {/* Course */}
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Course <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="courseId"
                            value={form.courseId}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 mb-4 appearance-none bg-white"
                        >
                            <option value="">--- Select a Course ---</option>
                            {MOCK_COURSES.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>

                        {/* Semester */}
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Semester <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="semesterId"
                            value={form.semesterId}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 mb-6 appearance-none bg-white"
                        >
                            <option value="">--- Select a Semester ---</option>
                            {MOCK_SEMESTERS.map((sem) => (
                                <option key={sem.id} value={sem.id}>
                                    {sem.name}
                                </option>
                            ))}
                        </select>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Class"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Success / Error Toast */}
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    code={toast.code}
                    onClose={handleToastClose}
                />
            )}
        </>
    );
}