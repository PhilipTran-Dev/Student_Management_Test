import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ShieldCheck, Key } from "lucide-react";

export default function StudentVerifyOtp() {
    const location = useLocation();
    const email = location.state?.email ?? "your email";
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const inputsRef = useRef([]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;
        const nextOtp = [...otp];
        nextOtp[index] = value;
        setOtp(nextOtp);

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, event) => {
        if (event.key === "Backspace") {
            if (otp[index] === "") {
                if (index > 0) {
                    inputsRef.current[index - 1]?.focus();
                    const nextOtp = [...otp];
                    nextOtp[index - 1] = "";
                    setOtp(nextOtp);
                }
            }
        }
    };

    const handlePaste = (event) => {
        const paste = event.clipboardData.getData("text").trim();
        if (!/^[0-9]{1,6}$/.test(paste)) return;
        const pasteValues = paste.split("").slice(0, 6);
        const nextOtp = [...otp];
        for (let i = 0; i < pasteValues.length; i += 1) {
            nextOtp[i] = pasteValues[i];
        }
        setOtp(nextOtp);
        const nextIndex = Math.min(pasteValues.length, 5);
        inputsRef.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError("");
        setSuccess("");

        const code = otp.join("");
        if (code.length < 6) {
            setError("Please enter the full 6-digit code.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccess("OTP verified successfully. You may now reset your password.");
        }, 1600);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 text-white mb-4 transition-all duration-300">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Verify Your Code</h1>
                    <p className="mt-2 text-gray-500">
                        Enter the 6-digit code sent to {email} to continue resetting your password.
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-6 gap-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(ref) => {
                                        inputsRef.current[index] = ref;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="h-14 w-full rounded-2xl border border-gray-300 bg-slate-50 text-center text-lg font-semibold text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            ))}
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
                                "Verifying..."
                            )}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-gray-100 pt-5">
                        <div className="flex justify-between text-sm text-gray-500">
                            <Link to="/student/login" className="font-medium text-indigo-600 hover:text-indigo-700">
                                Back to Sign In
                            </Link>
                            <button
                                type="button"
                                className="font-medium text-indigo-600 hover:text-indigo-700"
                                onClick={() => {
                                    setError("");
                                    setSuccess("A new code has been requested and sent to your email.");
                                }}
                            >
                                Resend code
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
