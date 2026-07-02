import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus, X, Edit3, Trash2, Users, CheckCircle, AlertTriangle, School, Search, Filter } from "lucide-react";
import CreateClassModal from "../components/CreateClassModal";

const MOCK_CLASSES = [
    { id: "CS101", name: "Introduction to Programming", students: 45, code: "CS101-2026", color: "emerald", semester: "Spring 2026", faculty: "Computer Science" },
    { id: "CS201", name: "Data Structures & Algorithms", students: 38, code: "CS201-2026", color: "blue", semester: "Spring 2026", faculty: "Computer Science" },
    { id: "MA101", name: "Calculus I", students: 52, code: "MA101-2026", color: "amber", semester: "Fall 2025", faculty: "Mathematics" },
    { id: "PH101", name: "Physics for Engineers", students: 41, code: "PH101-2026", color: "purple", semester: "Spring 2026", faculty: "Physics" },
    { id: "EN201", name: "Academic English", students: 30, code: "EN201-2026", color: "rose", semester: "Fall 2025", faculty: "Languages" },
];

const COLORS = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    rose: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

export default function ClassListPage() {
    const [classes, setClasses] = useState(MOCK_CLASSES);
    const [showCreate, setShowCreate] = useState(false);
    const [showDelete, setShowDelete] = useState(null);
    const [showEdit, setShowEdit] = useState(null);
    const [form, setForm] = useState({ name: "", code: "", autoCode: true });
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successToast, setSuccessToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("all");
    const [facultyFilter, setFacultyFilter] = useState("all");

    const semesters = useMemo(() => [...new Set(classes.map((c) => c.semester))].sort(), [classes]);
    const faculties = useMemo(() => [...new Set(classes.map((c) => c.faculty))].sort(), [classes]);

    const hasActiveFilters = searchQuery.trim() !== "" || semesterFilter !== "all" || facultyFilter !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setSemesterFilter("all");
        setFacultyFilter("all");
    };

    const filtered = classes.filter((c) => {
        const q = searchQuery.trim().toLowerCase();
        const matchSearch = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
        const matchSemester = semesterFilter === "all" || c.semester === semesterFilter;
        const matchFaculty = facultyFilter === "all" || c.faculty === facultyFilter;
        return matchSearch && matchSemester && matchFaculty;
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
        if (name === "name" && form.autoCode) {
            setForm((p) => ({ ...p, code: value.toUpperCase().replace(/\s+/g, "-").substring(0, 10) }));
        }
    };

    const handleClassCreated = (newClass) => {
        setClasses((prev) => [
            {
                id: newClass.id || newClass.code,
                name: newClass.name,
                students: 0,
                code: newClass.code,
                color: "emerald",
                semester: "Spring 2026",
                faculty: "Computer Science",
            },
            ...prev,
        ]);
    };

    const handleUpdate = async (e) => {
        e.preventDefault(); setFormError("");
        if (!form.name.trim()) { setFormError("Name is required"); return; }
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 800));
            setClasses((p) => p.map((c) => c.id === showEdit.id ? { ...c, name: form.name } : c));
            setShowEdit(null);
        } finally { setLoading(false); }
    };

    const handleDelete = (id) => {
        setClasses((p) => p.filter((c) => c.id !== id));
        setShowDelete(null);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage the classes you teach</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" /> Create New Class
                </button>
            </div>

            {/* Search & Filter Row */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by class name or code..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400"
                    />
                </div>
                <div className="relative w-full sm:w-44">
                    <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={semesterFilter}
                        onChange={(e) => setSemesterFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white"
                    >
                        <option value="all">All Semesters</option>
                        {semesters.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full sm:w-44">
                    <School className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={facultyFilter}
                        onChange={(e) => setFacultyFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white"
                    >
                        <option value="all">All Faculties</option>
                        {faculties.map((f) => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                        Clear
                    </button>
                )}
            </div>

            {/* Results count */}
            <p className="text-xs text-gray-400 mb-3">{filtered.length} class{filtered.length !== 1 ? "es" : ""} found</p>

            {/* Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <School className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">No classes match your criteria</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((cls) => {
                        const c = COLORS[cls.color] || COLORS.emerald;
                        return (
                            <div key={cls.id} className={`bg-white rounded-xl border ${c.border} shadow-sm hover:shadow-md transition-shadow group relative`}>
                                <Link to={`/teacher/classes/${cls.id}`} className="block p-5">
                                    <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
                                        <BookOpen className={`w-5 h-5 ${c.text}`} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-sm">{cls.name}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Code: {cls.code}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{cls.students} students</span>
                                        <span className="flex items-center gap-1"><School className="w-3.5 h-3.5" />{cls.faculty}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1.5">{cls.semester}</p>
                                </Link>
                                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => { setShowEdit(cls); setForm({ name: cls.name, code: cls.code, autoCode: false }); }} className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer" title="Update"><Edit3 className="w-4 h-4" /></button>
                                    <button onClick={() => setShowDelete(cls.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <CreateClassModal
                    onClose={() => setShowCreate(false)}
                    onClassCreated={handleClassCreated}
                />
            )}

            {/* Update Modal */}
            {showEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowEdit(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Update Class</h2>
                            <button onClick={() => setShowEdit(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>}
                        <form onSubmit={handleUpdate}>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Name</label>
                            <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 mb-4" autoFocus />
                            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm transition-colors cursor-pointer">{loading ? "Saving..." : "Save Changes"}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {showDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowDelete(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm z-10 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Class?</h2>
                        <p className="text-sm text-gray-500 mb-6">This will permanently delete the class and all associated data.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDelete(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium cursor-pointer">Cancel</button>
                            <button onClick={() => handleDelete(showDelete)} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium cursor-pointer">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}