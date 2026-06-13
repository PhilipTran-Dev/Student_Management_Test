import { useState } from "react";
import { Calendar, Plus, X, Edit3, CheckCircle, Clock, AlertTriangle, Search } from "lucide-react";

const MOCK_SEMESTERS = [
    { id: "S01", name: "Fall 2025", code: "F2025", startDate: "Sep 1, 2025", endDate: "Dec 31, 2025", status: "completed" },
    { id: "S02", name: "Spring 2026", code: "S2026", startDate: "Jan 15, 2026", endDate: "May 31, 2026", status: "active" },
    { id: "S03", name: "Summer 2026", code: "SU2026", startDate: "Jun 10, 2026", endDate: "Aug 31, 2026", status: "upcoming" },
    { id: "S04", name: "Fall 2026", code: "F2026", startDate: "Sep 1, 2026", endDate: "Dec 31, 2026", status: "upcoming" },
];

const STATUS_CONFIG = {
    active: { label: "Active", bg: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500", icon: CheckCircle },
    upcoming: { label: "Upcoming", bg: "bg-amber-50 text-amber-600", dot: "bg-amber-400", icon: Clock },
    completed: { label: "Completed", bg: "bg-zinc-100 text-zinc-500", dot: "bg-zinc-400", icon: CheckCircle },
};

export default function SemesterManagementPage() {
    const [semesters, setSemesters] = useState(MOCK_SEMESTERS);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(null);
    const [form, setForm] = useState({ name: "", code: "", startDate: "", endDate: "", status: "upcoming" });
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    const filtered = semesters.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const validate = () => {
        if (!form.name.trim() || !form.code.trim() || !form.startDate || !form.endDate) return "All fields required";
        if (form.startDate >= form.endDate) return "End date must be after start date";
        return null;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const err = validate(); if (err) { setFormError(err); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 600));
            const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            setSemesters((p) => [...p, { id: `S${Date.now()}`, name: form.name, code: form.code.toUpperCase(), startDate: fmt(form.startDate), endDate: fmt(form.endDate), status: form.status }]);
            setShowCreate(false); setForm({ name: "", code: "", startDate: "", endDate: "", status: "upcoming" });
        } finally { setLoading(false); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const err = validate(); if (err) { setFormError(err); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 600));
            const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            setSemesters((p) => p.map((s) => s.id === showEdit.id ? { ...s, name: form.name, code: form.code.toUpperCase(), startDate: fmt(form.startDate), endDate: fmt(form.endDate), status: form.status } : s));
            setShowEdit(null);
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Semesters</h1>
                    <p className="text-sm text-zinc-400 mt-1">Academic terms and schedules</p>
                </div>
                <button onClick={() => { setShowCreate(true); setForm({ name: "", code: "", startDate: "", endDate: "", status: "upcoming" }); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                    <Plus className="w-4 h-4" /> Add Semester
                </button>
            </div>

            <div className="relative max-w-xs mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search semesters..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 placeholder:text-zinc-300" />
            </div>

            {/* Semester Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-zinc-300"><Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm font-medium">No semesters found</p></div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((s) => {
                        const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.upcoming;
                        const Icon = cfg.icon;
                        return (
                            <div key={s.id} className="group bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-lg hover:shadow-zinc-200/30 transition-all duration-300 relative">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.status === "active" ? "bg-emerald-50" : s.status === "upcoming" ? "bg-amber-50" : "bg-zinc-50"
                                            }`}>
                                            <Calendar className={`w-5 h-5 ${s.status === "active" ? "text-emerald-500" : s.status === "upcoming" ? "text-amber-500" : "text-zinc-400"
                                                }`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2.5">
                                                <h3 className="font-semibold text-zinc-900 text-sm">{s.name}</h3>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-medium ${cfg.bg}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-0.5">
                                                <span className="font-mono font-medium text-zinc-500">{s.code}</span> &middot; {s.startDate} &rarr; {s.endDate}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setShowEdit(s); setForm({ name: s.name, code: s.code, startDate: "", endDate: "", status: s.status }); }} className="p-2 rounded-lg text-zinc-300 hover:text-indigo-500 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreate || showEdit) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => { setShowCreate(false); setShowEdit(null); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-lg z-10 border border-zinc-100">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-zinc-900">{showEdit ? "Update Semester" : "Add Semester"}</h2>
                            <button onClick={() => { setShowCreate(false); setShowEdit(null); }} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">{formError}</div>}
                        <form onSubmit={showEdit ? handleUpdate : handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Semester Name</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Fall 2026" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></div>
                                <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Code</label><input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="e.g. F2026" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 [color-scheme:light]" /></div>
                                <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 [color-scheme:light]" /></div>
                            </div>
                            <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Status</label>
                                <div className="flex gap-2">
                                    {["upcoming", "active", "completed"].map((st) => (
                                        <label key={st} className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-all duration-200 capitalize ${form.status === st ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"
                                            }`}>
                                            <input type="radio" name="status" value={st} checked={form.status === st} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="sr-only" />
                                            {st}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                                {loading ? "Saving..." : showEdit ? "Save Changes" : "Create Semester"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}