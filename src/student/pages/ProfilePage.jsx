import { useState } from "react";
import { User, Mail, Phone, Calendar, Lock, Eye, EyeOff, Save } from "lucide-react";

const MOCK_PROFILE = {
    fullName: "Nguyen Van A",
    email: "a.nguyen@student.edu.vn",
    phoneNumber: "+84 912 345 678",
    dateOfBirth: "2003-05-15",
    gender: "Male",
    studentId: "21000001",
    faculty: "Computer Science & Engineering",
    major: "Software Engineering",
    class: "DI21V7A1",
};

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("profile"); // "profile" | "password"
    const [profile, setProfile] = useState({ ...MOCK_PROFILE });
    const [editMode, setEditMode] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Profile update
    const editableFields = ["fullName", "phoneNumber", "dateOfBirth", "gender"];
    const fieldLabels = { fullName: "Full Name", phoneNumber: "Phone Number", dateOfBirth: "Date of Birth", gender: "Gender" };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateProfile = () => {
        const newErrors = {};
        if (!profile.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!profile.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
        if (!profile.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        if (!profile.gender) newErrors.gender = "Gender is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setServerError("");
        setSuccessMsg("");
        if (!validateProfile()) return;
        setLoading(true);
        try {
            // const res = await axios.put("/api/student/profile", profile);
            await new Promise((r) => setTimeout(r, 1000));
            setSuccessMsg("Profile updated successfully!");
            setEditMode(false);
        } catch (err) {
            setServerError(err.response?.data?.message || "Update failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Password update
    const validatePassword = () => {
        const newErrors = {};
        if (!passwordForm.currentPassword) newErrors.currentPassword = "Current password is required";
        if (!passwordForm.newPassword) {
            newErrors.newPassword = "New password is required";
        } else if (passwordForm.newPassword.length < 6) {
            newErrors.newPassword = "Must be at least 6 characters";
        }
        if (!passwordForm.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setServerError("");
        setSuccessMsg("");
        if (!validatePassword()) return;
        setLoading(true);
        try {
            // const res = await axios.put("/api/student/profile/password", passwordForm);
            await new Promise((r) => setTimeout(r, 1000));
            setSuccessMsg("Password updated successfully!");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setServerError(err.response?.data?.message || "Password update failed.");
        } finally {
            setLoading(false);
        }
    };

    const handlePwChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const inputClass = (field) =>
        `w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${errors[field]
            ? "border-red-400 ring-2 ring-red-100 bg-red-50"
            : "border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
        }`;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-500 text-sm mt-1">View and manage your account details</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
                <button
                    onClick={() => { setActiveTab("profile"); setErrors({}); setServerError(""); setSuccessMsg(""); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === "profile" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
                        }`}
                >
                    <User className="w-4 h-4 inline mr-1.5" />
                    Profile
                </button>
                <button
                    onClick={() => { setActiveTab("password"); setErrors({}); setServerError(""); setSuccessMsg(""); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === "password" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
                        }`}
                >
                    <Lock className="w-4 h-4 inline mr-1.5" />
                    Password
                </button>
            </div>

            {/* Messages */}
            {serverError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{serverError}</div>
            )}
            {successMsg && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{successMsg}</div>
            )}

            {activeTab === "profile" ? (
                /* ===== Profile Tab ===== */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                    {/* Read-only info cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Student ID</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{profile.studentId}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{profile.email}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Class</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{profile.class}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Faculty</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{profile.faculty}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Major</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{profile.major}</p>
                        </div>
                    </div>

                    {/* Editable form */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Update Profile</h2>
                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                            >
                                Edit
                            </button>
                        ) : null}
                    </div>

                    {editMode ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {editableFields.map((field) => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {fieldLabels[field]} <span className="text-red-500">*</span>
                                        </label>
                                        {field === "gender" ? (
                                            <div className="flex gap-3">
                                                {["Male", "Female", "Other"].map((g) => (
                                                    <label
                                                        key={g}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${profile.gender === g
                                                                ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                                                                : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                                                            } ${errors.gender ? "border-red-400 ring-2 ring-red-100" : ""}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="gender"
                                                            value={g}
                                                            checked={profile.gender === g}
                                                            onChange={handleProfileChange}
                                                            className="sr-only"
                                                        />
                                                        <span>{g}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : field === "dateOfBirth" ? (
                                            <input
                                                type="date"
                                                name={field}
                                                value={profile[field]}
                                                onChange={handleProfileChange}
                                                className={`${inputClass(field)} [color-scheme:light]`}
                                            />
                                        ) : (
                                            <input
                                                type={field === "phoneNumber" ? "tel" : "text"}
                                                name={field}
                                                value={profile[field]}
                                                onChange={handleProfileChange}
                                                className={inputClass(field)}
                                            />
                                        )}
                                        {errors[field] && <p className="mt-1 text-xs text-red-600">{errors[field]}</p>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Save Changes</>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setEditMode(false); setProfile({ ...MOCK_PROFILE }); setErrors({}); }}
                                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {editableFields.map((field) => (
                                <div key={field}>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{fieldLabels[field]}</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                        {field === "dateOfBirth"
                                            ? new Date(profile[field]).toLocaleDateString("en-GB")
                                            : profile[field] || "—"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* ===== Password Tab ===== */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-lg">
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    name="currentPassword"
                                    type={showPw.current ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePwChange}
                                    placeholder="Enter current password"
                                    className={`${inputClass("currentPassword")} pr-10`}
                                />
                                <button type="button" onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer" tabIndex={-1}>
                                    {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.currentPassword && <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    name="newPassword"
                                    type={showPw.new ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={passwordForm.newPassword}
                                    onChange={handlePwChange}
                                    placeholder="Min. 6 characters"
                                    className={`${inputClass("newPassword")} pr-10`}
                                />
                                <button type="button" onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer" tabIndex={-1}>
                                    {showPw.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    name="confirmPassword"
                                    type={showPw.confirm ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePwChange}
                                    placeholder="Re-enter new password"
                                    className={`${inputClass("confirmPassword")} pr-10`}
                                />
                                <button type="button" onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer" tabIndex={-1}>
                                    {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <><Lock className="w-4 h-4" /> Update Password</>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}