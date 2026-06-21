import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { User, GraduationCap, X } from "lucide-react";

const API = {
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
    headers: () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` }),
};

const FACULTY_MAJOR_MAP = {
    "Computer Science & Engineering": ["Software Engineering", "Information Technology", "Artificial Intelligence", "Data Science"],
    "Electrical & Electronic Engineering": ["Automation Engineering", "Electrical Engineering"],
    "Mechanical Engineering": ["Mechatronics Engineering", "Mechanical Engineering"],
};

const FACULTY_LIST = Object.keys(FACULTY_MAJOR_MAP);

const DEFAULT_FORM = {
    email: "",
    fullName: "",
    password: "",
    role: "student",
    status: "active",
    studentId: "",
    className: "",
    dateOfBirth: "",
    faculty: "",
    gender: "",
    major: "",
    phoneNumber: "",
    teacherId: "",
};

function UserFormModal({ isOpen, mode = "create", userToEdit = null, onClose = () => { }, onSaveSuccess = () => { } }) {
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const availableMajors = useMemo(() => {
        if (!formData.faculty) return [];
        return FACULTY_MAJOR_MAP[formData.faculty] || [];
    }, [formData.faculty]);

    // Pre-populate form with existing user data when editing
    useEffect(() => {
        if (!isOpen) return;

        if (mode === "edit" && userToEdit) {
            setFormData({
                email: userToEdit.email || "",
                fullName: userToEdit.full_name || userToEdit.fullName || "",
                password: "",
                role: userToEdit.role?.toLowerCase() === "teacher" ? "teacher" : (userToEdit.role?.toLowerCase() === "admin" ? "admin" : "student"),
                status: userToEdit.status?.toLowerCase() || "active",
                studentId: userToEdit.student_id || userToEdit.studentId || "",
                className: userToEdit.class_name || userToEdit.className || "",
                dateOfBirth: userToEdit.date_of_birth || userToEdit.dateOfBirth || "",
                faculty: userToEdit.faculty || "",
                gender: userToEdit.gender || "",
                major: userToEdit.major || "",
                phoneNumber: userToEdit.phone_number || userToEdit.phoneNumber || "",
                teacherId: userToEdit.teacher_id || userToEdit.teacherId || "",
            });
            setError("");
            return;
        }

        setFormData(DEFAULT_FORM);
        setError("");
    }, [isOpen, mode, userToEdit]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            // If faculty changes, reset major since the new faculty may not have the same majors
            if (name === "faculty") {
                updated.major = "";
            }
            return updated;
        });
    };

    const validate = () => {
        if (!formData.fullName.trim()) {
            setError("Full Name is required");
            return false;
        }
        if (!formData.email.trim()) {
            setError("Email is required");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError("Invalid email format");
            return false;
        }
        if (mode === "create" && formData.password.trim().length < 6) {
            setError("Password must be at least 6 characters");
            return false;
        }
        if (mode === "edit" && formData.password.trim() && formData.password.trim().length < 6) {
            setError("Password must be at least 6 characters");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!validate()) return;

        // Build snake_case payload aligned with backend DTO rules
        const normalizedRole = formData.role.toUpperCase();
        const payload = {
            email: formData.email,
            full_name: formData.fullName,
            role: normalizedRole,
            status: formData.status,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            phone_number: formData.phoneNumber,
            faculty: formData.faculty,
            major: normalizedRole === 'STUDENT' ? formData.major : null,
            class_name: normalizedRole === 'STUDENT' ? formData.className : null,
            student_id: normalizedRole === 'STUDENT' ? formData.studentId : null,
            teacher_id: normalizedRole === 'TEACHER' ? formData.teacherId : null,
            password: formData.password || null,
        };

        // Remove password from payload if empty (keeping existing password in edit mode)
        if (!payload.password) {
            delete payload.password;
        }

        setLoading(true);
        try {
            const url = mode === "edit" && userToEdit?.id
                ? `${API.baseURL}/admin/users/${userToEdit.id}`
                : `${API.baseURL}/admin/users`;
            const method = mode === "edit" ? axios.put : axios.post;
            const response = await method(url, payload, { headers: API.headers() });
            onSaveSuccess(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-2xl z-10 border border-zinc-100 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">{mode === "edit" ? "Edit User" : "Add User"}</h2>
                        <p className="text-sm text-zinc-400 mt-0.5">{mode === "edit" ? "Update user details" : "Create a new user"}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                        <input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={mode === "edit" ? "Leave blank to keep current password" : "Min. 6 characters"}
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Role</label>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { value: "student", label: "Student", icon: <User className="w-4 h-4" /> },
                                { value: "teacher", label: "Teacher", icon: <GraduationCap className="w-4 h-4" /> },
                                { value: "admin", label: "Admin", icon: <User className="w-4 h-4" /> },
                            ].map((option) => (
                                <label key={option.value} className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-all duration-200 ${formData.role === option.value ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"}`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value={option.value}
                                        checked={formData.role === option.value}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    {option.icon}
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {mode === "edit" && (
                        <div>
                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 bg-white"
                            >
                                <option value="active">Active</option>
                                <option value="locked">Locked</option>
                            </select>
                        </div>
                    )}

                    {formData.role === "student" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Student ID</label>
                                    <input
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleChange}
                                        placeholder="e.g. STU001"
                                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Class Name</label>
                                    <input
                                        name="className"
                                        value={formData.className}
                                        onChange={handleChange}
                                        placeholder="e.g. 12A1"
                                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Faculty</label>
                                    <select
                                        name="faculty"
                                        value={formData.faculty}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 bg-white"
                                    >
                                        <option value="">-- Select Faculty --</option>
                                        {FACULTY_LIST.map((faculty) => (
                                            <option key={faculty} value={faculty}>{faculty}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Major</label>
                                    <select
                                        name="major"
                                        value={formData.major}
                                        onChange={handleChange}
                                        disabled={!formData.faculty}
                                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 bg-white disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed"
                                    >
                                        <option value="">{formData.faculty ? "-- Select Major --" : "-- Select Faculty First --"}</option>
                                        {availableMajors.map((major) => (
                                            <option key={major} value={major}>{major}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.role === "teacher" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Teacher ID</label>
                                    <input
                                        name="teacherId"
                                        value={formData.teacherId}
                                        onChange={handleChange}
                                        placeholder="e.g. TCH001"
                                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Faculty</label>
                                    <select
                                        name="faculty"
                                        value={formData.faculty}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 bg-white"
                                    >
                                        <option value="">-- Select Faculty --</option>
                                        {FACULTY_LIST.map((faculty) => (
                                            <option key={faculty} value={faculty}>{faculty}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 bg-white"
                            >
                                <option value="">-- Select --</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Date of Birth</label>
                            <input
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Phone Number</label>
                        <input
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="e.g. 0912345678"
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-sm font-medium transition-all duration-200">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50">
                            {loading ? "Saving..." : (mode === "edit" ? "Save Changes" : "Create Account")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserFormModal;