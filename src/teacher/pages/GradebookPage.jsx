import { useState, useMemo } from "react";
import { Download, FileSpreadsheet, Search, GraduationCap, Filter, X, School } from "lucide-react";

const MOCK_CLASSES = [
    { id: "CS101", name: "Introduction to Programming" },
    { id: "CS201", name: "Data Structures" },
    { id: "MA101", name: "Calculus I" },
];

const MOCK_STUDENTS = [
    { id: "S001", name: "Nguyen Van A" },
    { id: "S002", name: "Tran Thi B" },
    { id: "S003", name: "Le Van C" },
    { id: "S004", name: "Pham Thi D" },
    { id: "S005", name: "Hoang Van E" },
];

const MOCK_ASSESSMENTS = ["Midterm (30%)", "Final (40%)", "Assignments (20%)", "Attendance (10%)"];

const MOCK_GRADES = {
    S001: [85, 78, 92, 100],
    S002: [72, 80, 88, 95],
    S003: [65, 70, 80, 100],
    S004: [88, 85, 90, 95],
    S005: [70, 75, 82, 90],
};

const avg = (arr) => (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1);

export default function GradebookPage() {
    const [selectedClass, setSelectedClass] = useState(MOCK_CLASSES[0].id);
    const [searchQuery, setSearchQuery] = useState("");
    const [performanceFilter, setPerformanceFilter] = useState("all");

    const weights = [30, 40, 20, 10];

    const hasActiveFilters = searchQuery.trim() !== "" || performanceFilter !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setPerformanceFilter("all");
    };

    const filteredStudents = useMemo(() => {
        return MOCK_STUDENTS.filter((s) => {
            const q = searchQuery.trim().toLowerCase();
            const matchSearch = !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);

            let matchPerformance = performanceFilter === "all";
            if (!matchPerformance) {
                const grades = MOCK_GRADES[s.id];
                const weighted = grades.reduce((sum, g, i) => sum + (g * weights[i]) / 100, 0);
                if (performanceFilter === "excellent") matchPerformance = weighted >= 90;
                else if (performanceFilter === "passing") matchPerformance = weighted >= 60 && weighted < 90;
                else if (performanceFilter === "struggling") matchPerformance = weighted < 60;
            }

            return matchSearch && matchPerformance;
        });
    }, [searchQuery, performanceFilter]);

    const handleExport = () => {
        console.log(`Exporting gradebook for class ${selectedClass}...`);
        alert(`Gradebook for ${selectedClass} export triggered. Connect to backend for actual file download.`);
    };

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

            {/* Search & Filter Row */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by student name or ID..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400"
                    />
                </div>
                <div className="relative w-full sm:w-44">
                    <School className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                        value={performanceFilter}
                        onChange={(e) => setPerformanceFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-emerald-400 appearance-none bg-white"
                    >
                        <option value="all">All Students</option>
                        <option value="excellent">Excellent (90%+)</option>
                        <option value="passing">Passing (60%-89%)</option>
                        <option value="struggling">Needs Attention (below 60%)</option>
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

            {/* Class selector */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {MOCK_CLASSES.map((c) => (
                    <button key={c.id} onClick={() => setSelectedClass(c.id)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${selectedClass === c.id ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}>
                        {c.name}
                    </button>
                ))}
            </div>

            {/* Results count */}
            <p className="text-xs text-gray-400 mb-3">{filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found</p>

            {/* Table */}
            {filteredStudents.length === 0 ? (
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
                                    <th className="text-left px-5 py-3 font-semibold text-gray-700 w-48">Student</th>
                                    {MOCK_ASSESSMENTS.map((a) => (
                                        <th key={a} className="text-center px-4 py-3 font-semibold text-gray-700 text-xs">{a}</th>
                                    ))}
                                    <th className="text-center px-5 py-3 font-semibold text-gray-700">Weighted Avg</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((s, idx) => {
                                    const grades = MOCK_GRADES[s.id];
                                    const weighted = grades.reduce((sum, g, i) => sum + (g * weights[i]) / 100, 0);
                                    return (
                                        <tr key={s.id} className={`${idx < filteredStudents.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50`}>
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-gray-900">{s.name}</p>
                                                <p className="text-xs text-gray-400">{s.id}</p>
                                            </td>
                                            {grades.map((g, i) => (
                                                <td key={i} className="text-center px-4 py-3.5 font-medium text-gray-900">{g}</td>
                                            ))}
                                            <td className={`text-center px-5 py-3.5 font-bold ${weighted >= 80 ? "text-emerald-600" : weighted >= 60 ? "text-amber-600" : "text-red-600"}`}>
                                                {weighted.toFixed(1)}
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