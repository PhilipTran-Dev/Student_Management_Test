import { useState } from "react";
import { Users, Plus, X, Trash2, Lock, Unlock, Key, Search, User, GraduationCap, MoreHorizontal } from "lucide-react";

const MOCK_USERS = [
    { id: "U001", name: "Nguyen Van A", email: "a.nguyen@student.edu.vn", role: "student", status: "active", createdAt: "Sep 1, 2025" },
    { id: "U002", name: "Tran Thi B", email: "b.tran@student.edu.vn", role: "student", status: "active", createdAt: "Sep 1, 2025" },
    { id: "U003", name: "Dr. Tran Van B", email: "tvb@university.edu.vn", role: "teacher", status: "active", createdAt: "Aug 15, 2024" },
    { id: "U004", name: "Prof. Le Thi C", email: "ltc@university.edu.vn", role: "teacher", status: "locked", createdAt: "Aug 15, 2024" },
    { id: "U005", name: "Le Van C", email: "c.le@student.edu.vn", role: "student", status: "active", createdAt: "Sep 10, 2025" },
    { id: "U006", name: "Pham Thi D", email: "d.pham@student.edu.vn", role: "student", status: "locked", createdAt: "Sep 10, 2025" },
    { id: "U007", name: "Dr. Pham Van D", email: "pvd@university.edu.vn", role: "teacher", status: "active", createdAt: "Sep 1, 2024" },
    { id: "U008", name: "Hoang Van E", email: "e.hoang@student.edu.vn", role: "student", status: "active", createdAt: "Sep 15, 2025" },
];

export default function UserManagementPage() {
    const [users, setUsers] = useState(MOCK_USERS);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [showDelete, setShowDelete] = useState(null);
    const [showReset, setShowReset] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    const filtered = users
        .filter((u) => filter === "all" || u.role === filter)
        .filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCreate = async (e) => {
        e.preventDefault(); setFormError("");
        if (!form.name.trim() || !form.email.trim() || !form.password) { setFormError("All fields are required"); return; }
        if (form.password.length < 6) { setFormError("Minimum 6 characters"); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setFormError("Invalid email format"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 800));
            setUsers((p) => [{ id: `U${Date.now()}`, name: form.name, email: form.email, role: form.role, status: "active", createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }, ...p]);
            setShowCreate(false); setForm({ name: "", email: "", password: "", role: "student" });
        } finally { setLoading(false); }
    };

    const handleToggleLock = (id) => setUsers((p) => p.map((u) => u.id === id ? { ...u, status: u.status === "active" ? "locked" : "active" } : u));
    const handleDelete = (id) => { setUsers((p) => p.filter((u) => u.id !== id)); setShowDelete(null); };

    const handleResetPassword = async (e) => {
        e.preventDefault(); setFormError("");
        if (!form.password) { setFormError("Enter a temporary password"); return; }
        if (form.password.length < 6) { setFormError("Minimum 6 characters"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 600));
            setShowReset(null); setForm((p) => ({ ...p, password: "" }));
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">User Management</h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        {users.length} registered users &middot; {users.filter((u) => u.status === "active").length} active
                    </p>
                </div>
                <button onClick={() => { setShowCreate(true); setForm({ name: "", email: "", password: "", role: "student" }); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            {/* Filter + Search */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex gap-1 p-1 bg-zinc-100/80 rounded-xl w-fit">
                    {["all", "student", "teacher"].map((f) => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer capitalize ${filter === f ? "bg-white text-indigo-600 shadow-sm shadow-zinc-200/50" : "text-zinc-500 hover:text-zinc-700"
                            }`}>
                            {f === "all" ? "All" : f === "student" ? "Students" : "Teachers"}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 placeholder:text-zinc-300" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm shadow-zinc-200/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-50">
                                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">User</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Role</th>
                                <th className="text-center px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="text-center px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Created</th>
                                <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u, idx) => (
                                <tr key={u.id} className={`group transition-all duration-150 hover:bg-zinc-50/80 ${idx < filtered.length - 1 ? "border-b border-zinc-50" : ""}`}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold ${u.role === "teacher" ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"
                                                }`}>
                                                {u.name.split(" ").pop()[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900">{u.name}</p>
                                                <p className="text-xs text-zinc-400">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${u.role === "teacher" ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"
                                            }`}>
                                            {u.role === "teacher" ? <GraduationCap className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {u.role === "teacher" ? "Teacher" : "Student"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${u.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-zinc-400"}`} />
                                            {u.status === "active" ? "Active" : "Locked"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center text-xs text-zinc-400">{u.createdAt}</td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-md z-10 border border-zinc-100 animate-in slide-in-from-bottom-4 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-zinc-900">Add User</h2>
                            <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">{formError}</div>}
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Full Name</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></div>
                            <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Email</label><input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></div>
                            <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Password</label><input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></div>
                            <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Role</label>
                                <div className="flex gap-2">
                                    {["student", "teacher"].map((r) => (
                                        <label key={r} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-all duration-200 ${form.role === r ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"
                                            }`}>
                                            <input type="radio" name="role" value={r} checked={form.role === r} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="sr-only" />
                                            {r === "teacher" ? <GraduationCap className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                            {r === "teacher" ? "Teacher" : "Student"}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                                {loading ? "Creating..." : "Create Account"}
                            </button>
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
                            <div><h2 className="text-lg font-semibold text-zinc-900">Reset Password</h2><p className="text-sm text-zinc-400 mt-0.5">Set a temporary password for <span className="font-medium text-zinc-700">{showReset.name}</span></p></div>
                            <button onClick={() => setShowReset(null)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">{formError}</div>}
                        <form onSubmit={handleResetPassword}>
                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Temporary Password</label>
                            <input type="text" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 mb-4" autoFocus />
                            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
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