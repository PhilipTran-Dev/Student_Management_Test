import { useEffect, useState } from "react";
import { BookOpen, Plus, X, Edit3, Trash2, AlertTriangle, Search } from "lucide-react";
import { createCourse, deleteCourse, fetchAllCourses, updateCourse } from "../../services/classService";

const FACULTIES = ["Computer Science & Engineering", "Information Technology", "Electrical Engineering", "Mechanical Engineering", "Business Administration"];

const emptyForm = { name: "", code: "", faculty: "", credits: "", level: "Undergraduate" };

const getErrorMessage = (error) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong while contacting the server.";

export default function CourseManagementPage() {
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(null);
    const [showDelete, setShowDelete] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        let active = true;
        const loadCourses = async () => {
            setLoading(true);
            setLoadError("");
            try {
                const data = await fetchAllCourses();
                if (active) {
                    setCourses(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (active) {
                    setCourses([]);
                    setLoadError(getErrorMessage(error));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadCourses();
        return () => {
            active = false;
        };
    }, []);

    const filtered = courses.filter((c) =>
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.code || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError("");
        if (!form.name.trim() || !form.code.trim() || !form.faculty || !form.credits) {
            setFormError("All fields required");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                faculty: form.faculty,
                credits: Number(form.credits),
                level: form.level,
            };
            const createdCourse = await createCourse(payload);
            setCourses((prev) => [...prev, createdCourse || { id: Date.now(), ...payload, students: 0 }]);
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
        setFormError("");
        if (!form.name.trim() || !form.code.trim() || !form.faculty || !form.credits) {
            setFormError("All fields required");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                faculty: form.faculty,
                credits: Number(form.credits),
                level: form.level,
            };
            const updatedCourse = await updateCourse(showEdit.id, payload);
            setCourses((prev) => prev.map((c) => (c.id === showEdit.id ? updatedCourse || { ...c, ...payload } : c)));
            setShowEdit(null);
        } catch (error) {
            setFormError(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCourse(id);
            setCourses((prev) => prev.filter((c) => c.id !== id));
            setShowDelete(null);
        } catch (error) {
            setFormError(getErrorMessage(error));
        }
    };

    return (
        <div className="max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Courses</h1>
                    <p className="text-sm text-zinc-400 mt-1">{courses.length} courses in the catalog</p>
                </div>
                <button onClick={() => { setShowCreate(true); setForm(emptyForm); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                    <Plus className="w-4 h-4" /> Add Course
                </button>
            </div>

            <div className="relative max-w-xs mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search courses..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 placeholder:text-zinc-300" />
            </div>

            {loadError && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{loadError}</div>
            )}

            {loading ? (
                <div className="text-center py-16 text-zinc-400">Loading courses...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-zinc-300"><BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm font-medium">No courses found</p></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((c) => (
                        <div key={c.id} className="group bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-lg hover:shadow-zinc-200/30 transition-all duration-300 relative">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-indigo-500" />
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium ${c.level === "Graduate" ? "bg-purple-50 text-purple-600" : "bg-sky-50 text-sky-600"}`}>{c.level || "Undergraduate"}</span>
                            </div>
                            <h3 className="font-semibold text-zinc-900 text-sm">{c.name}</h3>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400">
                                <span className="font-mono font-medium text-zinc-500">{c.code}</span>
                                <span>&middot;</span>
                                <span>{c.credits || 0} credits</span>
                                <span>&middot;</span>
                                <span>{c.students || 0} enrolled</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1.5">{c.faculty}</p>
                            <div className="absolute top-3 right-3 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <button onClick={() => { setShowEdit(c); setForm({ name: c.name || "", code: c.code || "", faculty: c.faculty || "", credits: String(c.credits || ""), level: c.level || "Undergraduate" }); }} className="p-2 rounded-lg text-zinc-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => setShowDelete(c.id)} className="p-2 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(showCreate || showEdit) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => { setShowCreate(false); setShowEdit(null); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-lg z-10 border border-zinc-100">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-zinc-900">{showEdit ? "Update Course" : "Add Course"}</h2>
                            <button onClick={() => { setShowCreate(false); setShowEdit(null); }} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">{formError}</div>}
                        <form onSubmit={showEdit ? handleUpdate : handleCreate} className="space-y-4">
                            <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Course Name</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Code</label><input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="e.g. CS101" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></div>
                                <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Credits</label><input type="number" value={form.credits} onChange={(e) => setForm((p) => ({ ...p, credits: e.target.value }))} min="1" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></div>
                            </div>
                            <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Faculty</label>
                                <select value={form.faculty} onChange={(e) => setForm((p) => ({ ...p, faculty: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100">
                                    <option value="">Select...</option>
                                    {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Level</label>
                                <div className="flex gap-2">
                                    {["Undergraduate", "Graduate"].map((l) => (
                                        <label key={l} className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-all duration-200 ${form.level === l ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"}`}>
                                            <input type="radio" name="level" value={l} checked={form.level === l} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} className="sr-only" />
                                            {l}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" disabled={saving} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                                {saving ? "Saving..." : showEdit ? "Save Changes" : "Create Course"}
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
                        <h2 className="text-lg font-semibold text-zinc-900 mb-1">Delete Course?</h2>
                        <p className="text-sm text-zinc-400 mb-6">Permanently remove this course.</p>
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