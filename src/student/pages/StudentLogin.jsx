import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, LogIn, GraduationCap, Briefcase, Shield } from "lucide-react";

export default function StudentLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setServerError("");
        if (!validateForm()) return;
        setLoading(true);

        try {
            const loginPayload = {
                email: formData.email,
                password: formData.password,
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/auth/student/login`,
                loginPayload
            );

            const { token, refreshToken, fullName, email, role: backendRole } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem(
                "user",
                JSON.stringify({ fullName, email })
            );

            const normalizedRole = backendRole.toLowerCase();
            if (normalizedRole.includes("student")) {
                navigate("/student/dashboard");
            } else if (normalizedRole.includes("admin")) {
                navigate("/admin/users");
            } else if (normalizedRole.includes("teacher")) {
                navigate("/teacher/classes");
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        if (serverError) setServerError("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 text-white mb-4 transition-all duration-300">
                        <GraduationCap className="w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Student Portal</h1>
                    <p className="mt-2 text-gray-500">
                        Sign in to your student account to continue
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-8">
                    {serverError && (
                        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    id="email" name="email" type="email" autoComplete="email"
                                    value={formData.email} onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${errors.email ? "border-red-400 ring-2 ring-red-100 bg-red-50" : "border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"}`}
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
                                    value={formData.password} onChange={handleChange}
                                    placeholder="Enter your password"
                                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm outline-none transition-colors ${errors.password ? "border-red-400 ring-2 ring-red-100 bg-red-50" : "border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"}`}
                                />
                                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <Link to="/student/forgotpassword" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">Forgot password?</Link>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <><LogIn className="w-4 h-4" /> Sign In</>
                            )}
                        </button>
                    </form>

                    {/* Register link — only for Student */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link to="/student/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Create one</Link>
                    </p>

                    {/* Cross-portal navigation */}
                    <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col gap-2">
                        <p className="text-xs text-gray-400 text-center">Access a different portal?</p>
                        <div className="flex gap-2">
                            <Link to="/teacher/login" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500 hover:text-gray-700 text-xs font-medium transition-all duration-200">
                                <Briefcase className="w-3.5 h-3.5" /> Teacher
                            </Link>
                            <Link to="/admin/login" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500 hover:text-gray-700 text-xs font-medium transition-all duration-200">
                                <Shield className="w-3.5 h-3.5" /> Admin
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}