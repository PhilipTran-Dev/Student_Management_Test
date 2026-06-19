import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, LogIn, GraduationCap, Briefcase, Shield } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const [role, setRole] = useState("student"); // "student" | "teacher" | "admin"
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e, overrideRole) => {
        if (e) e.preventDefault();
        setServerError("");

        if (!validateForm()) return;

        const activeRole = overrideRole || role;
        setLoading(true);

        try {
            const loginPayload = {
                email: formData.email,
                password: formData.password,
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/auth/login/${activeRole.toLowerCase()}`,
                loginPayload
            );

            const { token, refreshToken, fullName, email, role: backendRole } = response.data;

            // Store tokens
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);

            // Store user profile
            localStorage.setItem(
                "user",
                JSON.stringify({ fullName, email })
            );

            // Normalize role to lowercase for frontend route compatibility
            const normalizedRole = backendRole.toLowerCase();

            // Conditional redirection based on role (handles "ROLE_" prefix from Spring Security)
            if (normalizedRole.includes("admin")) {
                navigate("/admin/users");
            } else if (normalizedRole.includes("teacher")) {
                navigate("/teacher/classes");
            } else if (normalizedRole.includes("student")) {
                navigate("/student/dashboard");
            } else {
                navigate("/");
            }
        } catch (err) {
            if (err.code === "ERR_NETWORK") {
                setServerError("Backend authentication server is offline. Please check port 8081.");
            } else if (err.response?.data?.message) {
                setServerError(err.response.data.message);
            } else {
                setServerError("Invalid credentials. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleClick = async (newRole) => {
        setRole(newRole);
        await handleSubmit(null, newRole);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        if (serverError) setServerError("");
    };

    // Hàm trả về Icon tương ứng với từng Role ở phần Header
    const renderRoleIcon = () => {
        switch (role) {
            case "teacher":
                return <Briefcase className="w-7 h-7" />;
            case "admin":
                return <Shield className="w-7 h-7" />;
            default:
                return <GraduationCap className="w-7 h-7" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 text-white mb-4 transition-all duration-300">
                        {renderRoleIcon()}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="mt-2 text-gray-500">
                        Sign in to your <span className="font-semibold text-indigo-600 capitalize">{role}</span> account to continue
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-8">
                    {serverError && (
                        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={(e) => handleSubmit(e, null)} noValidate className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${errors.email
                                        ? "border-red-400 ring-2 ring-red-100 bg-red-50"
                                        : "border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm outline-none transition-colors ${errors.password
                                        ? "border-red-400 ring-2 ring-red-100 bg-red-50"
                                        : "border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                                    Remember me
                                </span>
                            </label>
                            <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Primary Submit Button — Student */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Sign In
                                </>
                            )}
                        </button>

                        {/* Secondary Role Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => handleRoleClick("teacher")}
                                className="flex-1 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Briefcase className="w-4 h-4" />
                                Sign In as Teacher
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => handleRoleClick("admin")}
                                className="flex-1 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Shield className="w-4 h-4" />
                                Sign In as Admin
                            </button>
                        </div>
                    </form>

                    {/* Register Link (Chỉ hiển thị khi không phải phân hệ Admin) */}
                    {role !== "admin" && (
                        <p className="mt-6 text-center text-sm text-gray-500">
                            Don't have an account?{" "}
                            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                Create one
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}