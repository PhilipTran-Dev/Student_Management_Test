import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

export default function StudentForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const validateEmail = (value) => {
        if (!value.trim()) {
            return "Email is required";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return "Please enter a valid email address";
        }
        return "";
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const validationError = validateEmail(email);
        setError(validationError);
        setSuccess("");
        if (validationError) return;

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate("/student/verifyotp", { state: { email } });
        }, 1600);
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (error) setError("");
        if (success) setSuccess("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 text-white mb-4 transition-all duration-300">
                        <Mail className="w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
                    <p className="mt-2 text-gray-500">
                        Enter your student email and we’ll send you instructions to reset your password.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-8">
                    {success ? (
                        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                            {success}
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
                                    value={email}
                                    onChange={handleChange}
                                    placeholder="you@student.edu"
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${error ? "border-red-400 ring-2 ring-red-100 bg-red-50" : "border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"}`}
                                />
                            </div>
                            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                "Send reset link"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <Link
                            to="/student/login"
                            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
