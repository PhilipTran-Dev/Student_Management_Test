import { useState } from "react";
import { User, Lock, Eye, EyeOff, Save, School, Mail, Phone, BookOpen } from "lucide-react";

export default function ProfilePage() {
    const [tab, setTab] = useState("profile");
    const [profile, setProfile] = useState({
        fullName: "Dr. Tran Van B",
        email: "tvb@university.edu.vn",
        phoneNumber: "+84 912 345 678",
        faculty: "Computer Science & Engineering",
        department: "Software Engineering",
    });
    const [editMode, setEditMode] = useState(false);
    const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
    const [showPw, setShowPw] = useState({ c: false, n: false, cf: false });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const editable = ["fullName", "phoneNumber"];
    const labels = { fullName: "Full Name", phoneNumber: "Phone Number" };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile((p) => ({ ...p, [name]: value }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault(); setServerError(""); setSuccess("");
        const ne = {};
        if (!profile.fullName.trim()) ne.fullName = "Required";
        if (!profile.phoneNumber.trim()) ne.phoneNumber = "Required";
        setErrors(ne); if (Object.keys(ne).length) return;
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 1000));
            setSuccess("Profile updated!");
            setEditMode(false);
        } catch (err) { setServerError(err.response?.data?.message || "Update failed."); }
        finally { setLoading(false); }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault(); setServerError(""); setSuccess("");
        const ne = {};
        if (!pwForm.current) ne.current = "Required";
        if (!pwForm.new) ne.new = "Required";
        else if (pwForm.new.length < 6) ne.new = "Min 6 chars";
        if (!pwForm.confirm) ne.confirm = "Required";
        else if (pwForm.new !== pwForm.confirm) ne.confirm = "Passwords don't match";
        setErrors(ne); if (Object.keys(ne).length) return;
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 1000));
            setSuccess("Password updated!");
            setPwForm({ current: "", new: "", confirm: "" });
        } catch (err) { setServerError(err.response?.data?.message || "Failed."); }
        finally { setLoading(false); }
    };

    const ic = (f) =>
        `w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${errors[f]
            ? "border-red-400 ring-2 ring-red-100 bg-red-50"
            : "border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white"
        }`;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your teacher account</p>
            </div>

            <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
                <button onClick={() => { setTab("profile"); setErrors({}); setServerError(""); setSuccess(""); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "profile" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}><User className="w-4 h-4 inline mr-1.5" />Profile</button>
                <button onClick={() => { setTab("password"); setErrors({}); setServerError(""); setSuccess(""); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${tab === "password" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}><Lock className="w-4 h-4 inline mr-1.5" />Password</button>
            </div>

            {serverError && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{serverError}</div>}
            {success && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{success}</div>}

            {tab === "profile" ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { l: "Email", v: profile.email, icon: Mail },
                            { l: "Faculty", v: profile.faculty, icon: School },
                            { l: "Department", v: profile.department, icon: BookOpen },
                            { l: "Role", v: "Teacher", icon: User },
                        ].map((x) => (
                            <div key={x.l} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{x.l}</p>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{x.v}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Update Profile</h2>
                        {!editMode && <button onClick={() => setEditMode(true)} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer">Edit</button>}
                    </div>

                    {editMode ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                            {editable.map((f) => (
                                <div key={f}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{labels[f]} <span className="text-red-500">*</span></label>
                                    <input type={f === "phoneNumber" ? "tel" : "text"} name={f} value={profile[f]} onChange={handleProfileChange} className={ic(f)} />
                                    {errors[f] && <p className="mt-1 text-xs text-red-600">{errors[f]}</p>}
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm flex items-center gap-2 cursor-pointer">
                                    {loading ? <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <><Save className="w-4 h-4" /> Save</>}
                                </button>
                                <button type="button" onClick={() => { setEditMode(false); setErrors({}); }} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium cursor-pointer">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                            {editable.map((f) => (
                                <div key={f}><p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{labels[f]}</p><p className="text-sm font-semibold text-gray-900 mt-0.5">{profile[f] || "—"}</p></div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-lg">
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        {["current", "new", "confirm"].map((f) => (
                            <div key={f}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{f === "current" ? "Current" : f === "new" ? "New" : "Confirm New"} Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input name={f} type={showPw[f[0]] ? "text" : "password"} autoComplete={f === "current" ? "current-password" : "new-password"} value={pwForm[f]} onChange={(e) => { setPwForm((p) => ({ ...p, [f]: e.target.value })); if (errors[f]) setErrors((p) => ({ ...p, [f]: "" })); }} placeholder={"••••••••"} className={`${ic(f)} pr-10`} />
                                    <button type="button" onClick={() => setShowPw((p) => ({ ...p, [f[0]]: !p[f[0]] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer" tabIndex={-1}>
                                        {showPw[f[0]] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors[f] && <p className="mt-1 text-xs text-red-600">{errors[f]}</p>}
                            </div>
                        ))}
                        <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm flex items-center gap-2 cursor-pointer">
                            {loading ? <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <><Lock className="w-4 h-4" /> Update Password</>}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}