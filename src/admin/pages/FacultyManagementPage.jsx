import { useState } from "react";
import { Building2, Plus, X, Edit3, Trash2, AlertTriangle, Search } from "lucide-react";

const MOCK_FACULTIES = [
    { id: "F01", name: "Computer Science & Engineering", code: "CSE", established: "2000", departments: 6 },
    { id: "F02", name: "Information Technology", code: "IT", established: "2005", departments: 4 },
    { id: "F03", name: "Electrical Engineering", code: "EE", established: "1998", departments: 5 },
    { id: "F04", name: "Mechanical Engineering", code: "ME", established: "1995", departments: 4 },
    { id: "F05", name: "Business Administration", code: "BA", established: "2002", departments: 3 },
];

export default function FacultyManagementPage() {
    const [faculties, setFaculties] = useState(MOCK_FACULTIES);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(null);
    const [showDelete, setShowDelete] = useState(null);
    const [form, setForm] = useState({ name: "", code: "", established: "" });
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    const filtered = faculties.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCreate = async (e) => {
        e.preventDefault(); setFormError("");
        if (!form.name.trim() || !form.code.trim() || !form.established) { setFormError("All fields required"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 600));
            setFaculties((p) => [...p, { id: `F${Date.now()}`, name: form.name, code: form.code.toUpperCase(), established: form.established, departments: 0 }]);
            setShowCreate(false); setForm({ name: "", code: "", established: "" });
        } finally { setLoading(false); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault(); setFormError("");
        if (!form.name.trim() || !form.code.trim() || !form.established) { setFormError("All fields required"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 600));
            setFaculties((p) => p.map((f) => f.id === showEdit.id ? { ...f, name: form.name, code: form.code.toUpperCase(), established: form.established } : f));
            setShowEdit(null);
        } finally { setLoading(false); }
    };

    const handleDelete = (id) => { setFaculties((p) => p.filter((f) => f.id !== id)); setShowDelete(null); };

    return (
        <div className="max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Faculties</h1>
                    <p className="text-sm text-zinc-400 mt-1">{faculties.length} departments & faculties</p>
                </div>
                <button onClick={() => { setShowCreate(true); setForm({ name: "", code: "", established: "" }); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                    <Plus className="w-4 h-4" /> Add Faculty
                </button>
            </div>

            <div className="relative max-w-xs mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search faculties..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 placeholder:text-zinc-300" />
            </div>

            {/* Cards Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-zinc-300"><Building2 className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm font-medium">No faculties found</p></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((f) => (
                        <div key={f.id} className="group bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-lg hover:shadow-zinc-200/30 transition-all duration-300 relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center mb-4">
                                <Building2 className="w-5 h-5 text-indigo-500" />
                            </div>
                            <h3 className="font-semibold text-zinc-900 text-sm">{f.name}</h3>
                            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                                <span className="font-mono font-medium text-zinc-500">{f.code}</span>
                                <span>&middot;</span>
                                <span>Est. {f.established}</span>
                                <span>&middot;</span>
                                <span>{f.departments} depts</span>
                            </div>
                            <div className="absolute top-3 right-3 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <button onClick={() => { setShowEdit(f); setForm({ name: f.name, code: f.code, established: f.established }); }} className="p-2 rounded-lg text-zinc-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => setShowDelete(f.id)} className="p-2 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreate || showEdit) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => { setShowCreate(false); setShowEdit(null); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-md z-10 border border-zinc-100">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-zinc-900">{showEdit ? "Update Faculty" : "Add Faculty"}</h2>
                            <button onClick={() => { setShowCreate(false); setShowEdit(null); }} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">{formError}</div>}
                        <form onSubmit={showEdit ? handleUpdate : handleCreate} className="space-y-4">
                            <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Faculty Name</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Code</label><input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="e.g. CSE" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></div>
                                <div><label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Established</label><input type="number" value={form.established} onChange={(e) => setForm((p) => ({ ...p, established: e.target.value }))} placeholder="2000" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" /></div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-200/50 cursor-pointer">
                                {loading ? "Saving..." : showEdit ? "Save Changes" : "Create Faculty"}
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
                        <div className="mx-auto w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
                        <h2 className="text-lg font-semibold text-zinc-900 mb-1">Delete Faculty?</h2>
                        <p className="text-sm text-zinc-400 mb-6">This will remove all associated data.</p>
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