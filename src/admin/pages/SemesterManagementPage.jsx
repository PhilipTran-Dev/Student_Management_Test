import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, Plus, X, Edit3, CheckCircle, Clock, AlertTriangle, Search, Trash2 } from "lucide-react";
import { createSemester, deleteSemester, fetchAllSemesters, updateSemester } from "../../services/classService";

const STATUS_CONFIG = {
    active: { label: "Active", bg: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500", icon: CheckCircle },
    upcoming: { label: "Upcoming", bg: "bg-amber-50 text-amber-600", dot: "bg-amber-400", icon: Clock },
    completed: { label: "Completed", bg: "bg-zinc-100 text-zinc-500", dot: "bg-zinc-400", icon: CheckCircle },
};

const emptyForm = { name: "", code: "", startDate: "", endDate: "", status: "upcoming" };

const getErrorMessage = (error) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong while contacting the server.";

const toInputDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatDateLabel = (value) => {
    if (!value) return "";
    try {
        return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
        return value;
    }
};

export default function SemesterManagementPage() {
    const [semesters, setSemesters] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(null);
    const [showDelete, setShowDelete] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState("");
    const activeRef = useRef(true);

    const loadSemesters = useCallback(async () => {
        setLoading(true);
        setLoadError("");
        try {
            const data = await fetchAllSemesters();
            if (activeRef.current) {
                setSemesters(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            if (activeRef.current) {
                setSemesters([]);
                setLoadError(getErrorMessage(error));
            }
        } finally {
            if (activeRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        activeRef.current = true;
        loadSemesters();
        return () => {
            activeRef.current = false;
        };
    }, [loadSemesters]);

    const filtered = semesters.filter((s) =>
        (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.code || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const validate = () => {
        if (!form.name.trim() || !form.code.trim() || !form.startDate || !form.endDate) return "All fields required";
        if (form.startDate >= form.endDate) return "End date must be after start date";
        return null;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) {
            setFormError(err);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                startDate: form.startDate,
                endDate: form.endDate,
                status: form.status.toUpperCase(),
            };
            await createSemester(payload);
            await loadSemesters();
            setShowCreate(false);
            setForm(emptyForm);
        } catch (error) {
            setFormError(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) {
            setFormError(err);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                startDate: form.startDate,
                endDate: form.endDate,
                status: form.status.toUpperCase(),
            };
            await updateSemester(showEdit.id, payload);
            await loadSemesters();
            setShowEdit(null);
        } catch (error) {
            setFormError(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteSemester(id);
            setSemesters((prev) => prev.filter((s) => s.id !== id));
            setShowDelete(null);
        } catch (error) {
            setFormError(getErrorMessage(error));
        }
    };

    return (
        <div className="max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Semesters</h1>
                    <p className="text-sm text-zinc-400 mt-1">Academic terms and schedules</p>
                </div>
                <button onClick={() => { setShowCreate(true); setForm(emptyForm); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                    <Plus className="w-4 h-4" /> Add Semester
                </button>
            </div>

            <div className="relative max-w-xs mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search semesters..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 placeholder:text-zinc-300" />
            </div>

            {loadError && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{loadError}</div>
            )}

            {loading ? (
                <div className="text-center py-16 text-zinc-400">Loading semesters...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-zinc-300"><Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm font-medium">No semesters found</p></div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((s) => {
                        const statusKey = s.status?.toLowerCase() || 'upcoming';
                        const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.upcoming;
                        return (
                            <div key={s.id} className="group bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-lg hover:shadow-zinc-200/30 transition-all duration-300 relative">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusKey === "active" ? "bg-emerald-50" : statusKey === "upcoming" ? "bg-amber-50" : "bg-zinc-50"}`}>
                                            <Calendar className={`w-5 h-5 ${statusKey === "active" ? "text-emerald-500" : statusKey === "upcoming" ? "text-amber-500" : "text-zinc-400"}`} />
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
                                                <span className="font-mono font-medium text-zinc-500">{s.code}</span> &middot; {formatDateLabel(s.startDate)} &rarr; {formatDateLabel(s.endDate)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <button onClick={() => { setShowEdit(s); setForm({ name: s.name || "", code: s.code || "", startDate: toInputDate(s.startDate), endDate: toInputDate(s.endDate), status: s.status?.toLowerCase() || "upcoming" }); }} className="p-2 rounded-lg text-zinc-300 hover:text-indigo-500 hover:bg-indigo-50 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                                        <button onClick={() => setShowDelete(s.id)} className="p-2 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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
                                        <label key={st} className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-all duration-200 capitalize ${form.status === st ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"}`}>
                                            <input type="radio" name="status" value={st} checked={form.status === st} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="sr-only" />
                                            {st}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={saving} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                                {saving ? "Saving..." : showEdit ? "Save Changes" : "Create Semester"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowDelete(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm z-10 border border-zinc-100 text-center">
                        <div className="mx-auto w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
                        <h2 className="text-lg font-semibold text-zinc-900 mb-1">Delete Semester?</h2>
                        <p className="text-sm text-zinc-400 mb-6">Permanently remove this semester.</p>
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