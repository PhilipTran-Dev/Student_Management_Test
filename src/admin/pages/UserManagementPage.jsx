import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, X, Trash2, Lock, Unlock, Key, Search, MoreHorizontal, Pencil } from "lucide-react";
import UserFormModal from "../components/UserFormModal";

const API = {
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
    headers: () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` }),
};

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMajor, setSelectedMajor] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [selectedUser, setSelectedUser] = useState(null);
    const [serverError, setServerError] = useState("");
    const [toast, setToast] = useState({ message: "", type: "" });
    const [fetching, setFetching] = useState(true);

    // ---------- Toast ----------
    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "" }), 3000);
    };

    // ---------- Derive unique majors & classes from dataset ----------
    const uniqueMajors = [...new Set(users.map((u) => u.major).filter(Boolean))].sort();
    const uniqueClasses = Array.from(new Set(users.map((u) => u.className || u.class_name).filter(Boolean))).sort();

    // ---------- Build query url based on filter ----------
    const buildUrl = () => {
        const url = new URL(`${API.baseURL}/admin/users`);
        if (filter === "student") url.searchParams.set("role", "STUDENT");
        if (filter === "teacher") url.searchParams.set("role", "TEACHER");
        if (searchTerm.trim()) url.searchParams.set("search", searchTerm.trim());
        if (selectedMajor) url.searchParams.set("major", selectedMajor);
        if (selectedClass) url.searchParams.set("className", selectedClass);
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
    }, [filter, searchTerm, selectedMajor, selectedClass]);

    const filtered = users;

    // ---------- Create ----------
    const openCreateModal = () => {
        setModalMode("create");
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    // ---------- Update (Edit) ----------
    const openEditModal = (user) => {
        setModalMode("edit");
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleSaveSuccess = () => {
        closeModal();
        fetchUsers();
        showToast("User saved successfully!");
    };

    // ---------- Toggle Lock ----------
    const handleToggleLock = async (id) => {
        try {
            await axios.patch(`${API.baseURL}/admin/users/${id}/toggle-status`, {}, { headers: API.headers() });
            showToast("User status toggled successfully!");
            fetchUsers();
        } catch (err) {
            setServerError(err.response?.data?.message || "Failed to toggle user status.");
        }
    };

    // ---------- Reset Password (window.prompt) ----------
    const handleResetPassword = async (user) => {
        const newPassword = window.prompt("Enter new temporary password (min 6 characters):");
        if (!newPassword) return;
        if (newPassword.length < 6) {
            setServerError("Password must be at least 6 characters.");
            return;
        }
        try {
            await axios.patch(
                `${API.baseURL}/admin/users/${user.id}/reset-password`,
                { new_password: newPassword },
                { headers: API.headers() }
            );
            showToast("Password reset successfully!");
        } catch (err) {
            setServerError(err.response?.data?.message || "Failed to reset password.");
        }
    };

    // ---------- Delete (window.confirm) ----------
    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you absolutely sure you want to permanently delete this user account?");
        if (!confirmed) return;
        try {
            await axios.delete(`${API.baseURL}/admin/users/${id}`, { headers: API.headers() });
            setUsers((p) => p.filter((u) => u.id !== id));
            showToast("User deleted successfully!");
        } catch (err) {
            setServerError(err.response?.data?.message || "Failed to delete user.");
        }
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

    const renderDetailRow = (label, value) => (
        <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider min-w-[24%]">{label}</span>
            <span className="text-xs text-zinc-700">{value}</span>
        </div>
    );

    // ========== STUDENT TABLE DETAILS ==========
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

    // ========== TEACHER TABLE DETAILS ==========
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
            {/* Toast Notification */}
            {toast.message && (
                <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 animate-in slide-in-from-top-2 ${toast.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    : "bg-red-50 border border-red-100 text-red-600"
                    }`}>
                    <div className="flex items-center gap-2">
                        <span>{toast.type === "success" ? "✓" : "✕"}</span>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

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
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            {/* Quick Filters + Search + Dropdowns */}
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
                <select
                    value={selectedMajor}
                    onChange={(e) => setSelectedMajor(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 bg-white min-w-[140px]"
                >
                    <option value="">All Majors</option>
                    {uniqueMajors.map((major) => (
                        <option key={major} value={major}>{major}</option>
                    ))}
                </select>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 bg-white min-w-[140px]"
                >
                    <option value="">All Classes</option>
                    {uniqueClasses.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                    ))}
                </select>
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
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${u.status?.toUpperCase() === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                }`}>
                                                {u.status?.toUpperCase() === "ACTIVE" ? "Active" : "Locked"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center text-xs text-zinc-400">{formatDate(u.created_at || u.createdAt)}</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                {/* 1. Update (Pencil) - Opens edit modal with pre-populated data */}
                                                <button
                                                    onClick={() => openEditModal(u)}
                                                    className="p-2 rounded-lg text-zinc-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>

                                                {/* 2. Toggle Lock (Padlock) - PATCH toggle-status */}
                                                <button
                                                    onClick={() => handleToggleLock(u.id)}
                                                    className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${u.status === "active" ? "text-zinc-300 hover:text-amber-500 hover:bg-amber-50" : "text-zinc-300 hover:text-emerald-500 hover:bg-emerald-50"
                                                        }`}
                                                    title={u.status === "active" ? "Lock" : "Unlock"}
                                                >
                                                    {u.status === "active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                </button>

                                                {/* 3. Reset Password (Key) - window.prompt */}
                                                <button
                                                    onClick={() => handleResetPassword(u)}
                                                    className="p-2 rounded-lg text-zinc-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
                                                    title="Reset password"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>

                                                {/* 4. Delete (Trash) - window.confirm */}
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="p-2 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                                                    title="Delete"
                                                >
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

            <UserFormModal
                isOpen={isModalOpen}
                mode={modalMode}
                userToEdit={selectedUser}
                onClose={closeModal}
                onSaveSuccess={handleSaveSuccess}
            />
        </div>
    );
}