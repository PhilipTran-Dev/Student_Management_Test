import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { userApi } from "../../services/api";
import { Lock, ShieldCheck, ArrowLeft } from "lucide-react";

export default function StudentResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const resetToken = location.state?.resetToken;

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!email || !resetToken) {
            navigate("/student/login", { replace: true });
        }
    }, [email, resetToken, navigate]);

    const validatePasswords = () => {
        if (!newPassword) {
            return "New password is required";
        }
        if (newPassword.length < 8) {
            return "Password must be at least 8 characters.";
        }
        if (newPassword !== confirmPassword) {
            return "Passwords do not match.";
        }
        return "";
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError("");
        setSuccess("");

        const validationError = validatePasswords();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            await userApi.post(
                "/v1/auth/student/reset-password",
                { email, newPassword, resetToken }
            );
            setSuccess("Your password has been reset successfully.");
            setTimeout(() => {
                navigate("/student/login");
            }, 1400);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 text-white mb-4 transition-all duration-300">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
                    <p className="mt-2 text-gray-500">
                        Set a new password for <span className="font-medium text-indigo-700">{email}</span>.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-8">
                    {error ? (
                        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}

                    {success ? (
                        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                            {success}
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
                                />
                            </div>
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
                                "Reset password"
                            )}
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={() => navigate("/student/login")}
                        className="mt-5 w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        <ArrowLeft className="inline-block w-4 h-4 mr-2" />
                        Back to Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}
