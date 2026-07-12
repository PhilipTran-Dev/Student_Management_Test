import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Clock, CheckCircle2, AlertCircle, Calendar, Search, Filter, X, BookOpen, Loader2 } from "lucide-react";
import { fetchStudentClasses } from "../../services/classService";
import { getClassAssignments } from "../../services/assignmentService";

const TABS = [
    { key: "all", label: "All", icon: ClipboardList },
    { key: "TODO", label: "To Do", icon: Clock },
    { key: "DONE", label: "Done", icon: CheckCircle2 },
    { key: "MISSING", label: "Missing", icon: AlertCircle },
];

const STATUS_STYLES = {
    TODO: { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
    DONE: { bg: "bg-emerald-50", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
    MISSING: { bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100 text-red-700" },
};

export default function AssignmentListPage() {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("default");

    useEffect(() => {
        fetchStudentClasses()
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setClasses(list);
                if (list.length > 0) setSelectedClassId(list[0].id);
            })
            .catch(() => setError("Failed to load classes"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedClassId) return;
        setLoading(true);
        setError("");
        getClassAssignments(selectedClassId)
            .then((data) => setAssignments(Array.isArray(data) ? data : []))
            .catch(() => setError("Failed to load assignments"))
            .finally(() => setLoading(false));
    }, [selectedClassId]);

    const classOptions = useMemo(() => classes, [classes]);

    const hasActiveFilters = searchQuery.trim() !== "" || activeTab !== "all" || sortBy !== "default";

    const clearFilters = () => {
        setSearchQuery("");
        setSortBy("default");
        setActiveTab("all");
    };

    const filtered = useMemo(() => {
        let result = assignments.filter((a) => {
            const q = searchQuery.trim().toLowerCase();
            const matchSearch = !q || a.title.toLowerCase().includes(q);
            const matchTab = activeTab === "all" || a.state === activeTab;
            return matchSearch && matchTab;
        });

        if (sortBy === "due_soonest") {
            result = [...result].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        } else if (sortBy === "highest_points") {
            result = [...result].sort((a, b) => b.maxMark - a.maxMark);
        }

        return result;
    }, [assignments, searchQuery, activeTab, sortBy]);

    const getUrgency = (a) => {
        if (a.state === "DONE") return 3;
        if (a.state === "MISSING") return 0;
        const diff = new Date(a.deadline) - new Date();
        if (diff < 0) return 1;
        return 2;
    };

    if (loading && classes.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="ml-3 text-gray-500 text-sm">Loading assignments...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                <p className="text-gray-500 text-sm mt-1">Track and manage your tasks</p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            {/* Class selector & Search Row */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-56">
                    <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400 appearance-none bg-white"
                    >
                        <option value="" disabled>Select a class</option>
                        {classOptions.map((c) => (
                            <option key={c.id} value={c.id}>{c.name || c.code || c.id}</option>
                        ))}
                    </select>
                </div>
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by assignment title..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400"
                    />
                </div>
                <div className="relative w-full sm:w-40">
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400 appearance-none bg-white"
                    >
                        <option value="default">Default Order</option>
                        <option value="due_soonest">Due Soonest</option>
                        <option value="highest_points">Highest Points</option>
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

            {/* Tab filter */}
            <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit flex-wrap">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        <tab.icon className="w-4 h-4 inline mr-1.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Results count */}
            {!loading && (
                <p className="text-xs text-gray-400 mb-3">{filtered.length} assignment{filtered.length !== 1 ? "s" : ""} found</p>
            )}

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    <span className="ml-2 text-gray-400 text-sm">Loading...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">No assignments match your criteria</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.sort((a, b) => getUrgency(a) - getUrgency(b)).map((a) => {
                        const style = STATUS_STYLES[a.state] || STATUS_STYLES.TODO;
                        return (
                            <Link
                                key={a.id}
                                to={`/student/assignments/${a.id}`}
                                state={{ classId: selectedClassId, assignment: a }}
                                className={`block bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors ${style.bg}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}>
                                                {a.state === "TODO" ? "To Do" : a.state === "DONE" ? "Done" : "Missing"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                            <span className="font-medium">{a.className || a.classId}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Due: {a.deadline ? new Date(a.deadline).toLocaleDateString() : "N/A"}
                                            </span>
                                            <span>{a.maxMark} pts</span>
                                        </div>
                                    </div>
                                    {a.state === "DONE" && a.earnedGrade !== null && a.earnedGrade !== undefined && (
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-emerald-600">{a.earnedGrade}/{a.maxMark}</p>
                                            <p className="text-[10px] text-gray-400">points</p>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
