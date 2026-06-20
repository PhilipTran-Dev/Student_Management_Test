import { useState, useEffect } from "react";
import axios from "axios";
import { Users, Plus, X, Trash2, Lock, Unlock, Key, Search, User, GraduationCap, MoreHorizontal, Pencil } from "lucide-react";

const API = {
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
    headers: () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` }),
};

const EMPTY_USER = {
    full_name: "", email: "", password_hash: "********", role: "student", status: "active",
    student_id: "", class_name: "", date_of_birth: "", faculty: "", gender: "", major: "", phone_number: "",
    teacher_id: "",
};

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [showDelete, setShowDelete] = useState(null);
    const [showReset, setShowReset] = useState(null);
    const [showEdit, setShowEdit] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_USER, password: "" });
    const [editForm, setEditForm] = useState({ ...EMPTY_USER, password: "" });
    const [formError, setFormError] = useState("");
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // ---------- Build query url based on filter ----------
    const buildUrl = () => {
        const url = new URL(`${API.baseURL}/admin/users`);
        if (filter === "student") url.searchParams.set("role", "STUDENT");
        if (filter === "teacher") url.searchParams.set("role", "TEACHER");
        return url.toString();
    };

    // ---------- Fetch users ----------
    const fetchUsers = async () => {
        setFetching(true);
        try {
            const res = await axios.get(buildUrl(), { headers: API.headers() });
            setUsers(res.data);
            setServerError("");
        } catch (err) {
            setServerError(err.response?.data?.message || "Failed to load users.");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const filtered = users.filter((u) =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ---------- Create ----------
    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError("");
        if (!form.full_name.trim() || !form.email.trim() || !form.password) { setFormError("Full Name, Email, and Password are required"); return; }
        if (form.password.length < 6) { setFormError("Password must be at least 6 characters"); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setFormError("Invalid email format"); return; }
        setLoading(true);
        try {
            const payload = {
                full_name: form.full_name, email: form.email, password: form.password,
                role: form.role.toUpperCase(),
                date_of_birth: form.date_of_birth, faculty: form.faculty,
                gender: form.gender, phone_number: form.phone_number,
                student_id: form.role === "student" ? (form.student_id || null) : null,
                class_name: form.role === "student" ? (form.class_name || null) : null,
                major: form.role === "student" ? (form.major || null) : null,
            };
            const res = await axios.post(`${API.baseURL}/admin/users`, payload, { headers: API.headers() });
            setUsers((p) => [res.data, ...p]);
            setShowCreate(false);
            setForm({ ...EMPTY_USER, password: "" });
            setFormError("");
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to create user.");
        } finally { setLoading(false); }
    };

    // ---------- Toggle Lock ----------
    const handleToggleLock = async (id) => {
        try {
            const res = await axios.patch(`${API.baseURL}/admin/users/${id}/toggle-status`, {}, { headers: API.headers() });
            setUsers((p) => p.map((u) => (u.id === id ? { ...u, status: res.data.status || (u.status === "active" ? "locked" : "active") } : u)));
        } catch (err) {
            setServerError(err.response?.data?.message || "Failed to toggle user status.");
        }
    };

    // ---------- Delete ----------
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API.baseURL}/admin/users/${id}`, { headers: API.headers() });
            setUsers((p) => p.filter((u) => u.id !== id));
            setShowDelete(null);
        } catch (err) {
            setServerError(err.response?.data?.message || "Failed to delete user.");
            setShowDelete(null);
        }
    };

    // ---------- Reset Password ----------
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setFormError("");
        if (!form.password) { setFormError("Enter a temporary password"); return; }
        if (form.password.length < 6) { setFormError("Minimum 6 characters"); return; }
        setLoading(true);
        try {
            await axios.patch(`${API.baseURL}/admin/users/${showReset.id}/reset-password`, { password: form.password }, { headers: API.headers() });
            setShowReset(null);
            setForm((p) => ({ ...p, password: "" }));
            setFormError("");
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to reset password.");
        } finally { setLoading(false); }
    };

    // ---------- Open Edit Modal (data pre-population) ----------
    const openEditModal = (user) => {
        setEditForm({
            full_name: user.full_name || "",
            email: user.email || "",
            role: user.role || "STUDENT",
            status: user.status || "active",
            student_id: user.student_id ?? "",
            class_name: user.class_name ?? "",
            date_of_birth: user.date_of_birth ?? "",
            faculty: user.faculty ?? "",
            gender: user.gender ?? "",
            major: user.major ?? "",
            phone_number: user.phone_number ?? "",
            teacher_id: user.teacher_id ?? "",
            password: "", // password field starts empty — only sent if filled
            password_hash: user.password_hash || "********",
        });
        setShowEdit(user);
        setFormError("");
    };

    // ---------- Update via PUT /api/v1/admin/users/{id} ----------
    const handleUpdate = async (e) => {
        e.preventDefault();
        setFormError("");

        // Validate
        if (!editForm.full_name.trim() || !editForm.email.trim()) {
            setFormError("Full Name and Email are required");
            return;
        }
        if (editForm.password && editForm.password.length < 6) {
            setFormError("Password must be at least 6 characters");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
            setFormError("Invalid email format");
            return;
        }

        setLoading(true);
        try {
            // Build payload — only include password if admin typed a new one
            const payload = {
                full_name: editForm.full_name,
                email: editForm.email,
                role: editForm.role.toUpperCase(),
                status: editForm.status,
                date_of_birth: editForm.date_of_birth,
                faculty: editForm.faculty,
                gender: editForm.gender,
                phone_number: editForm.phone_number,
            };

            // Only attach password if non-empty
            if (editForm.password.trim()) {
                payload.password = editForm.password;
            }

            // Role-specific fields
            if (editForm.role.toUpperCase() === "STUDENT") {
                payload.student_id = editForm.student_id || null;
                payload.class_name = editForm.class_name || null;
                payload.major = editForm.major || null;
            }

            // Teacher-specific fields
            if (editForm.role.toUpperCase() === "TEACHER") {
                payload.teacher_id = editForm.teacher_id || null;
            }

            const res = await axios.put(`${API.baseURL}/admin/users/${showEdit.id}`, payload, { headers: API.headers() });
            setUsers((p) => p.map((u) => (u.id === showEdit.id ? res.data : u)));
            setShowEdit(null);
            setEditForm({ ...EMPTY_USER, password: "" });
            setFormError("");
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to update user.");
        } finally { setLoading(false); }
    };

    // ========== HELPERS ==========

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            return d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const renderLabel = (label) => (
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">{label}</label>
    );

    const renderInput = (value, onChange, opts = {}) => (
        <input
            type={opts.type || "text"}
            value={value}
            onChange={onChange}
            placeholder={opts.placeholder || ""}
            disabled={opts.disabled || false}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-zinc-50 disabled:text-zinc-400"
        />
    );

    const renderSelect = (value, onChange, options) => (
        <select
            value={value}
            onChange={onChange}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 bg-white"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled || false}>
                    {opt.label}
                </option>
            ))}
        </select>
    );

    const renderDetailRow = (label, value) => (
        <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider min-w-[24%]">{label}</span>
            <span className="text-xs text-zinc-700">{value}</span>
        </div>
    );

    // ========== STUDENT TABLE DETAILS (strict 14 lines, no placeholder dashes) ==========
    const StudentDetailRows = ({ user }) => (
        <div className="space-y-1.5 min-w-[220px]">
            {user.id != null && renderDetailRow("ID", user.id)}
            {user.student_id && renderDetailRow("Student ID", user.student_id)}
            {user.full_name && renderDetailRow("Full Name", user.full_name)}
            {user.email && renderDetailRow("Email", user.email)}
            {user.class_name && renderDetailRow("Class Name", user.class_name)}
            {user.major && renderDetailRow("Major", user.major)}
            {user.faculty && renderDetailRow("Faculty", user.faculty)}
            {user.gender && renderDetailRow("Gender", user.gender)}
            {user.date_of_birth && renderDetailRow("Date of Birth", user.date_of_birth)}
            {user.phone_number && renderDetailRow("Phone Number", user.phone_number)}
            {user.role && renderDetailRow("Role", user.role)}
            {user.status && renderDetailRow("Status", user.status)}
            {user.created_at && renderDetailRow("Created At", user.created_at)}
            {user.updated_at && renderDetailRow("Updated At", user.updated_at)}
        </div>
    );

    // ========== TEACHER TABLE DETAILS (strict 13 lines, no placeholder dashes) ==========
    const TeacherDetailRows = ({ user }) => (
        <div className="space-y-1.5 min-w-[220px]">
            {user.id != null && renderDetailRow("ID", user.id)}
            {user.teacher_id && renderDetailRow("Teacher ID", user.teacher_id)}
            {user.full_name && renderDetailRow("Full Name", user.full_name)}
            {user.email && renderDetailRow("Email", user.email)}
            {user.faculty && renderDetailRow("Faculty", user.faculty)}
            {user.gender && renderDetailRow("Gender", user.gender)}
            {user.date_of_birth && renderDetailRow("Date of Birth", user.date_of_birth)}
            {user.phone_number && renderDetailRow("Phone Number", user.phone_number)}
            {user.role && renderDetailRow("Role", user.role)}
            {user.status && renderDetailRow("Status", user.status)}
            {user.created_at && renderDetailRow("Created At", user.created_at)}
            {user.updated_at && renderDetailRow("Updated At", user.updated_at)}
        </div>
    );

    // ========== STUDENT EDIT FORM FIELDS ==========
    const StudentEditFields = ({ formData, setter }) => {
        const updater = (field) => (e) => setter((p) => ({ ...p, [field]: e.target.value }));
        return (
            <>
                {/* Row 1: Student ID + Class Name */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        {renderLabel("Student ID")}
                        {renderInput(formData.student_id || "", updater("student_id"), { placeholder: "e.g. STU001" })}
                    </div>
                    <div>
                        {renderLabel("Class Name")}
                        {renderInput(formData.class_name || "", updater("class_name"), { placeholder: "e.g. 12A1" })}
                    </div>
                </div>
                {/* Row 2: Major + Faculty */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        {renderLabel("Major")}
                        {renderInput(formData.major || "", updater("major"), { placeholder: "e.g. Mathematics" })}
                    </div>
                    <div>
                        {renderLabel("Faculty")}
                        {renderInput(formData.faculty || "", updater("faculty"), { placeholder: "e.g. Natural Sciences" })}
                    </div>
                </div>
                {/* Row 3: Gender + DOB */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        {renderLabel("Gender")}
                        {renderSelect(formData.gender || "", updater("gender"), [
                            { value: "", label: "-- Select --", disabled: true },
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                        ])}
                    </div>
                    <div>
                        {renderLabel("Date of Birth")}
                        {renderInput(formData.date_of_birth || "", updater("date_of_birth"), { type: "date" })}
                    </div>
                </div>
                {/* Row 4: Phone + (empty for balance) */}
                <div>
                    {renderLabel("Phone Number")}
                    {renderInput(formData.phone_number || "", updater("phone_number"), { placeholder: "e.g. 0912345678" })}
                </div>
            </>
        );
    };

    // ========== TEACHER EDIT FORM FIELDS ==========
    const TeacherEditFields = ({ formData, setter }) => {
        const updater = (field) => (e) => setter((p) => ({ ...p, [field]: e.target.value }));
        return (
            <>
                {/* Row 1: Teacher ID + Faculty */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        {renderLabel("Teacher ID")}
                        {renderInput(formData.teacher_id || "", updater("teacher_id"), { placeholder: "e.g. TCH001" })}
                    </div>
                    <div>
                        {renderLabel("Faculty")}
                        {renderInput(formData.faculty || "", updater("faculty"), { placeholder: "e.g. Natural Sciences" })}
                    </div>
                </div>
                {/* Row 2: Gender + DOB */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        {renderLabel("Gender")}
                        {renderSelect(formData.gender || "", updater("gender"), [
                            { value: "", label: "-- Select --", disabled: true },
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                        ])}
                    </div>
                    <div>
                        {renderLabel("Date of Birth")}
                        {renderInput(formData.date_of_birth || "", updater("date_of_birth"), { type: "date" })}
                    </div>
                </div>
                {/* Row 3: Phone */}
                <div>
                    {renderLabel("Phone Number")}
                    {renderInput(formData.phone_number || "", updater("phone_number"), { placeholder: "e.g. 0912345678" })}
                </div>
            </>
        );
    };

    // ========== RENDER ==========
    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="flex items-center gap-3 text-zinc-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm">Loading users...</span>
                </div>
            </div>
        );
    }

    const isStudentFilter = filter === "student";
    const isTeacherFilter = filter === "teacher";

    return (
        <div className="max-w-6xl">
            {serverError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    {serverError}
                    <button onClick={() => setServerError("")} className="ml-3 font-medium hover:text-red-800 cursor-pointer">Dismiss</button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">User Management</h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        {users.length} registered users &middot; {users.filter((u) => u.status === "active").length} active
                    </p>
                </div>
                <button
                    onClick={() => { setShowCreate(true); setForm({ ...EMPTY_USER, password: "" }); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            {/* Quick Filters + Search */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex gap-1 p-1 bg-zinc-100/80 rounded-xl w-fit">
                    {[
                        { key: "all", label: "All Users" },
                        { key: "student", label: "Students" },
                        { key: "teacher", label: "Teachers" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${filter === key ? "bg-white text-indigo-600 shadow-sm shadow-zinc-200/50" : "text-zinc-500 hover:text-zinc-700"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 placeholder:text-zinc-300"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm shadow-zinc-200/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-50">
                                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">User</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Details</th>
                                <th className="text-center px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="text-center px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Created</th>
                                <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-zinc-400">No users found.</td></tr>
                            ) : (
                                filtered.map((u, idx) => (
                                    <tr key={u.id} className={`group transition-all duration-150 hover:bg-zinc-50/80 ${idx < filtered.length - 1 ? "border-b border-zinc-50" : ""}`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold ${u.role?.toLowerCase() === "teacher"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-indigo-50 text-indigo-600"
                                                    }`}>
                                                    {u.full_name?.split(" ").pop()[0] || "?"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-900">{u.full_name}</p>
                                                    <p className="text-xs text-zinc-400">{u.email}</p>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border mt-1 ${u.role?.toLowerCase() === "teacher"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                        }`}>
                                                        {u.role?.toLowerCase() === "teacher" ? "Teacher" : "Student"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {/* Role-aware detail rendering */}
                                            {u.role?.toLowerCase() === "student" ? (
                                                <StudentDetailRows user={u} />
                                            ) : (
                                                <TeacherDetailRows user={u} />
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${u.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-zinc-400"
                                                    }`} />
                                                {u.status === "active" ? "Active" : "Locked"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center text-xs text-zinc-400">{formatDate(u.created_at || u.createdAt)}</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                <button onClick={() => openEditModal(u)} className="p-2 rounded-lg text-zinc-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 cursor-pointer" title="Edit">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleToggleLock(u.id)} className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${u.status === "active" ? "text-zinc-300 hover:text-amber-500 hover:bg-amber-50" : "text-zinc-300 hover:text-emerald-500 hover:bg-emerald-50"
                                                    }`} title={u.status === "active" ? "Lock" : "Unlock"}>
                                                    {u.status === "active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => { setShowReset(u); setForm((p) => ({ ...p, password: "" })); }} className="p-2 rounded-lg text-zinc-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 cursor-pointer" title="Reset password">
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setShowDelete(u.id)} className="p-2 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="opacity-100 group-hover:opacity-0 transition-all duration-200 -mt-8">
                                                <MoreHorizontal className="w-4 h-4 text-zinc-300 ml-auto" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========== CREATE MODAL ========== */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-lg z-10 border border-zinc-100 animate-in slide-in-from-bottom-4 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-zinc-900">Add User</h2>
                            <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">{formError}</div>}
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                {renderLabel("Full Name")}
                                {renderInput(form.full_name, (e) => setForm((p) => ({ ...p, full_name: e.target.value })))}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    {renderLabel("Email")}
                                    {renderInput(form.email, (e) => setForm((p) => ({ ...p, email: e.target.value })), { type: "email" })}
                                </div>
                                <div>
                                    {renderLabel("Password")}
                                    {renderInput(form.password, (e) => setForm((p) => ({ ...p, password: e.target.value })), { type: "password", placeholder: "Min. 6 chars" })}
                                </div>
                            </div>
                            <div>
                                {renderLabel("Role")}
                                <div className="flex gap-2">
                                    {["student", "teacher"].map((r) => (
                                        <label key={r} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-all duration-200 ${form.role === r ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"
                                            }`}>
                                            <input type="radio" value={r} checked={form.role === r} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="sr-only" />
                                            {r === "teacher" ? <GraduationCap className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                            {r === "teacher" ? "Teacher" : "Student"}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <StudentOnlyFieldsCreate formData={form} setter={setForm} />
                            <SharedFieldsCreate formData={form} setter={setForm} />
                            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                                {loading ? "Creating..." : "Create Account"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ========== EDIT MODAL — Dynamic Polymorphic Layout ========== */}
            {showEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowEdit(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-xl z-10 border border-zinc-100 animate-in slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-semibold text-zinc-900">
                                    Edit {editForm.role === "TEACHER" ? "Teacher" : "Student"}
                                </h2>
                                <p className="text-sm text-zinc-400 mt-0.5">
                                    Updating <span className="font-medium text-zinc-700">{showEdit.full_name}</span>
                                </p>
                            </div>
                            <button onClick={() => setShowEdit(null)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">{formError}</div>}
                        <form onSubmit={handleUpdate} className="space-y-4">
                            {/* Full Name */}
                            <div>
                                {renderLabel("Full Name")}
                                {renderInput(editForm.full_name, (e) => setEditForm((p) => ({ ...p, full_name: e.target.value })))}
                            </div>

                            {/* Email + Password (side by side) */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    {renderLabel("Email")}
                                    {renderInput(editForm.email, (e) => setEditForm((p) => ({ ...p, email: e.target.value })), { type: "email" })}
                                </div>
                                <div>
                                    {renderLabel("Password")}
                                    {renderInput(editForm.password, (e) => setEditForm((p) => ({ ...p, password: e.target.value })), { type: "password", placeholder: "Leave blank to keep" })}
                                </div>
                            </div>

                            {/* Role + Status (side by side) */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    {renderLabel("Role")}
                                    {renderSelect(editForm.role, (e) => setEditForm((p) => ({ ...p, role: e.target.value })), [
                                        { value: "STUDENT", label: "Student" },
                                        { value: "TEACHER", label: "Teacher" },
                                    ])}
                                </div>
                                <div>
                                    {renderLabel("Status")}
                                    {renderSelect(editForm.status, (e) => setEditForm((p) => ({ ...p, status: e.target.value })), [
                                        { value: "active", label: "Active" },
                                        { value: "locked", label: "Locked" },
                                    ])}
                                </div>
                            </div>

                            {/* === DYNAMIC: Student fields === */}
                            {editForm.role === "STUDENT" && <StudentEditFields formData={editForm} setter={setEditForm} />}

                            {/* === DYNAMIC: Teacher fields (studentId, className, major COMPLETELY REMOVED) === */}
                            {editForm.role === "TEACHER" && <TeacherEditFields formData={editForm} setter={setEditForm} />}

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setShowEdit(null)} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-sm font-medium transition-all duration-200 cursor-pointer">Cancel</button>
                                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showReset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowReset(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-md z-10 border border-zinc-100">
                        <div className="flex items-center justify-between mb-5">
                            <div><h2 className="text-lg font-semibold text-zinc-900">Reset Password</h2><p className="text-sm text-zinc-400 mt-0.5">Set a temporary password for <span className="font-medium text-zinc-700">{showReset.full_name}</span></p></div>
                            <button onClick={() => setShowReset(null)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">{formError}</div>}
                        <form onSubmit={handleResetPassword}>
                            {renderLabel("Temporary Password")}
                            {renderInput(form.password, (e) => setForm((p) => ({ ...p, password: e.target.value })), { placeholder: "Min. 6 characters" })}
                            <div className="mt-4">
                                <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {showDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowDelete(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm z-10 border border-zinc-100 text-center">
                        <div className="mx-auto w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4"><Trash2 className="w-5 h-5 text-red-500" /></div>
                        <h2 className="text-lg font-semibold text-zinc-900 mb-1">Delete Account?</h2>
                        <p className="text-sm text-zinc-400 mb-6">This action is permanent and cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDelete(null)} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-sm font-medium transition-all duration-200 cursor-pointer">Cancel</button>
                            <button onClick={() => handleDelete(showDelete)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-red-200/50 cursor-pointer">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ========== CREATE MODAL HELPERS (kept only for create flow, not edit) ==========

function StudentOnlyFieldsCreate({ formData, setter }) {
    const updater = (field) => (e) => setter((p) => ({ ...p, [field]: e.target.value }));
    if (formData.role !== "student") return null;
    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Student ID</label>
                    <input
                        type="text"
                        value={formData.student_id || ""}
                        onChange={updater("student_id")}
                        placeholder="e.g. STU001"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Class</label>
                    <input
                        type="text"
                        value={formData.class_name || ""}
                        onChange={updater("class_name")}
                        placeholder="e.g. 12A1"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />
                </div>
            </div>
            <div>
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Major</label>
                <input
                    type="text"
                    value={formData.major || ""}
                    onChange={updater("major")}
                    placeholder="e.g. Mathematics"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
            </div>
        </>
    );
}

function SharedFieldsCreate({ formData, setter }) {
    const updater = (field) => (e) => setter((p) => ({ ...p, [field]: e.target.value }));
    return (
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Gender</label>
                <select value={formData.gender || ""} onChange={updater("gender")} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 bg-white">
                    <option value="" disabled>-- Select --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Date of Birth</label>
                <input
                    type="date"
                    value={formData.date_of_birth || ""}
                    onChange={updater("date_of_birth")}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
            </div>
            <div>
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Phone</label>
                <input
                    type="text"
                    value={formData.phone_number || ""}
                    onChange={updater("phone_number")}
                    placeholder="e.g. 0912345678"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
            </div>
            <div>
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Faculty</label>
                <input
                    type="text"
                    value={formData.faculty || ""}
                    onChange={updater("faculty")}
                    placeholder="e.g. Natural Sciences"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
            </div>
        </div>
    );
}