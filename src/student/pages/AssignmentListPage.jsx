import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Clock, CheckCircle2, AlertCircle, Calendar, Search, Filter, X } from "lucide-react";

const MOCK_ASSIGNMENTS = [
    { id: "A01", title: "Week 1 - Hello World", class: "CS101", due: "2026-02-10", status: "done", points: 10, earned: 9 },
    { id: "A02", title: "Week 2 - Variables & Types", class: "CS101", due: "2026-02-17", status: "todo", points: 10, earned: null },
    { id: "A03", title: "Week 3 - Loops", class: "CS101", due: "2026-02-24", status: "todo", points: 15, earned: null },
    { id: "A04", title: "Lab 1 - Data Structures", class: "CS201", due: "2026-02-05", status: "missing", points: 20, earned: null },
    { id: "A05", title: "Calculus HW 1", class: "MA101", due: "2026-02-28", status: "done", points: 10, earned: 8 },
    { id: "A06", title: "English Essay Draft", class: "EN201", due: "2026-01-30", status: "missing", points: 15, earned: null },
];

const TABS = [
    { key: "all", label: "All", icon: ClipboardList },
    { key: "todo", label: "To Do", icon: Clock },
    { key: "done", label: "Done", icon: CheckCircle2 },
    { key: "missing", label: "Missing", icon: AlertCircle },
];

const STATUS_STYLES = {
    todo: { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
    done: { bg: "bg-emerald-50", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
    missing: { bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100 text-red-700" },
};

const getUrgency = (a) => {
    if (a.status === "done") return 3;
    if (a.status === "missing") return 0;
    const diff = new Date(a.due) - new Date();
    if (diff < 0) return 1; // overdue
    return 2; // pending
};

export default function AssignmentListPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("default");

    const classOptions = useMemo(() => [...new Set(MOCK_ASSIGNMENTS.map((a) => a.class))].sort(), []);

    const hasActiveFilters = searchQuery.trim() !== "" || classFilter !== "all" || statusFilter !== "all" || sortBy !== "default" || activeTab !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setClassFilter("all");
        setStatusFilter("all");
        setSortBy("default");
        setActiveTab("all");
    };

    const filtered = useMemo(() => {
        let result = MOCK_ASSIGNMENTS.filter((a) => {
            const q = searchQuery.trim().toLowerCase();
            const matchSearch = !q || a.title.toLowerCase().includes(q);
            const matchClass = classFilter === "all" || a.class === classFilter;
            const matchStatus = statusFilter === "all" || a.status === statusFilter;
            const matchTab = activeTab === "all" || a.status === activeTab;
            return matchSearch && matchClass && matchStatus && matchTab;
        });

        if (sortBy === "due_soonest") {
            result = [...result].sort((a, b) => new Date(a.due) - new Date(b.due));
        } else if (sortBy === "highest_points") {
            result = [...result].sort((a, b) => b.points - a.points);
        } else if (sortBy === "urgency") {
            result = [...result].sort((a, b) => getUrgency(a) - getUrgency(b));
        }

        return result;
    }, [searchQuery, classFilter, statusFilter, sortBy, activeTab]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                <p className="text-gray-500 text-sm mt-1">Track and manage your tasks</p>
            </div>

            {/* Search & Filter Row */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
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
                    <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400 appearance-none bg-white"
                    >
                        <option value="all">All Classes</option>
                        {classOptions.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full sm:w-40">
                    <AlertCircle className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-400 appearance-none bg-white"
                    >
                        <option value="all">All Statuses</option>
                        <option value="todo">Pending</option>
                        <option value="done">Submitted</option>
                        <option value="missing">Overdue</option>
                    </select>
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
                        <option value="urgency">Urgency</option>
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
            <p className="text-xs text-gray-400 mb-3">{filtered.length} assignment{filtered.length !== 1 ? "s" : ""} found</p>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">No assignments match your criteria</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((a) => {
                        const style = STATUS_STYLES[a.status];
                        return (
                            <Link
                                key={a.id}
                                to={`/student/assignments/${a.id}`}
                                className={`block bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors ${style.bg}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}>
                                                {a.status === "todo" ? "To Do" : a.status === "done" ? "Done" : "Missing"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                            <span className="font-medium">{a.class}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Due: {a.due}
                                            </span>
                                            <span>{a.points} pts</span>
                                        </div>
                                    </div>
                                    {a.status === "done" && a.earned !== null && (
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-emerald-600">{a.earned}/{a.points}</p>
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