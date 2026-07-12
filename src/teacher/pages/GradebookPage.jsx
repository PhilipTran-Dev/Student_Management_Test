import { useState, useEffect, useMemo } from "react";
import { Download, FileSpreadsheet, Search, GraduationCap, Filter, X, School, Loader2 } from "lucide-react";
import { fetchClasses } from "../../services/classService";
import { getClassGradebook } from "../../services/assignmentService";

export default function GradebookPage() {
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [gradebookData, setGradebookData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [performanceFilter, setPerformanceFilter] = useState("all");

    useEffect(() => {
        fetchClasses()
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
        getClassGradebook(selectedClassId)
            .then((data) => setGradebookData(data))
            .catch(() => setError("Failed to load gradebook data"))
            .finally(() => setLoading(false));
    }, [selectedClassId]);

    const assignments = useMemo(() => {
        if (!gradebookData) return [];
        return gradebookData.assignments || [];
    }, [gradebookData]);

    const studentRows = useMemo(() => {
        if (!gradebookData) return [];
        return gradebookData.studentRows || [];
    }, [gradebookData]);

    const hasActiveFilters = searchQuery.trim() !== "" || performanceFilter !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setPerformanceFilter("all");
    };

    const calcWeightedAverage = (row) => {
        if (!assignments.length) return 0;
        let totalWeight = 0;
        let weightedSum = 0;
        assignments.forEach((a) => {
            const maxMark = a.maxMark || 100;
            const score = row.grades?.[a.id];
            if (score !== null && score !== undefined) {
                totalWeight += maxMark;
                weightedSum += (score / maxMark) * maxMark;
            }
        });
        return totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
    };

    const filteredRows = useMemo(() => {
        return studentRows.filter((row) => {
            const q = searchQuery.trim().toLowerCase();
            const matchSearch = !q || (row.studentName || "").toLowerCase().includes(q) || (row.studentCode || row.studentId || "").toLowerCase().includes(q);
            let matchPerformance = performanceFilter === "all";
            if (!matchPerformance) {
                const avg = calcWeightedAverage(row);
                if (performanceFilter === "excellent") matchPerformance = avg >= 90;
                else if (performanceFilter === "passing") matchPerformance = avg >= 60 && avg < 90;
                else if (performanceFilter === "struggling") matchPerformance = avg < 60;
            }
            return matchSearch && matchPerformance;
        });
    }, [studentRows, searchQuery, performanceFilter, assignments]);

    const handleExport = () => {
        alert("Gradebook export triggered. Download will start from the backend.");
    };

    if (loading && classes.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="ml-3 text-gray-500 text-sm">Loading gradebook...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gradebook</h1>
                    <p className="text-gray-500 text-sm mt-1">View student grades across assessments</p>
                </div>
                <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4" /> Export Excel
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-56">
                    <School className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white">
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name || c.code || c.id}</option>
                        ))}
                    </select>
                </div>
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by student name or ID..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400" />
                </div>
                <div className="relative w-full sm:w-44">
                    <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select value={performanceFilter} onChange={(e) => setPerformanceFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white">
                        <option value="all">All Students</option>
                        <option value="excellent">Excellent (90%+)</option>
                        <option value="passing">Passing (60%-89%)</option>
                        <option value="struggling">Needs Attention (below 60%)</option>
                    </select>
                </div>
                {hasActiveFilters && (
                    <button onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer flex-shrink-0">
                        <X className="w-4 h-4" /> Clear
                    </button>
                )}
            </div>

            <p className="text-xs text-gray-400 mb-3">
                {loading ? "Loading..." : `${filteredRows.length} student${filteredRows.length !== 1 ? "s" : ""} found`}
            </p>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    <span className="ml-2 text-gray-400 text-sm">Loading...</span>
                </div>
            ) : filteredRows.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-sm font-medium">No students match your criteria</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-5 py-3 font-semibold text-gray-700 w-48">Student Name</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-700 w-32">Student ID</th>
                                    {assignments.map((a) => (
                                        <th key={a.id} className="text-center px-4 py-3 font-semibold text-gray-700 text-xs">
                                            {a.title}<br /><span className="font-normal text-gray-400">({a.maxMark} pts)</span>
                                        </th>
                                    ))}
                                    <th className="text-center px-5 py-3 font-semibold text-gray-700">Weighted Avg</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((row, idx) => {
                                    const avg = calcWeightedAverage(row);
                                    return (
                                        <tr key={row.studentId} className={`${idx < filteredRows.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50`}>
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-gray-900">{row.studentName}</p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-sm text-gray-600">{row.studentCode || row.studentId}</span>
                                            </td>
                                            {assignments.map((a) => {
                                                const score = row.grades?.[a.id];
                                                return (
                                                    <td key={a.id} className="text-center px-4 py-3.5 font-medium text-gray-900">
                                                        {score !== null && score !== undefined ? score : "\u2014"}
                                                    </td>
                                                );
                                            })}
                                            <td className={`text-center px-5 py-3.5 font-bold ${avg >= 80 ? "text-emerald-600" : avg >= 60 ? "text-amber-600" : "text-red-600"}`}>
                                                {avg.toFixed(1)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
