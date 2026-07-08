import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userApi } from "../services/api";
import {
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    UserPlus,
    Calendar,
    Hash,
    BookOpen,
    GraduationCap,
    Users,
} from "lucide-react";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // Section A: Account Credentials
        email: "",
        password: "",
        confirmPassword: "",
        // Section B: Personal Information
        fullName: "",
        dateOfBirth: "",
        gender: "",
        phoneNumber: "",
        // Section C: Academic Information
        studentId: "",
        faculty: "",
        major: "",
        class: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const FACULTIES = [
        "Computer Science & Engineering",
        "Information Technology",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Business Administration",
        "Applied Mathematics",
        "Biotechnology",
    ];

    const MAJORS = [
        "Software Engineering",
        "Data Science",
        "Artificial Intelligence",
        "Cyber Security",
        "Computer Networks",
        "Information Systems",
        "Multimedia Technology",
        "Internet of Things",
    ];

    const GENDERS = ["Male", "Female", "Other"];

    const validateForm = () => {
        const newErrors = {};

        // Section A: Account Credentials
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Section B: Personal Information
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = "Date of birth is required";
        }

        if (!formData.gender) {
            newErrors.gender = "Please select your gender";
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!/^[+]?[\d\s()-]{7,15}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Please enter a valid phone number";
        }

        // Section C: Academic Information
        if (!formData.studentId.trim()) {
            newErrors.studentId = "Student ID is required";
        }

        if (!formData.faculty) {
            newErrors.faculty = "Please select your faculty";
        }

        if (!formData.major) {
            newErrors.major = "Please select your major";
        }

        if (!formData.class.trim()) {
            newErrors.class = "Class is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        if (!validateForm()) return;

        setLoading(true);

        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                role: "STUDENT",
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                phoneNumber: formData.phoneNumber,
                studentId: formData.studentId,
                faculty: formData.faculty,
                major: formData.major,
                class: formData.class,
            };

            await userApi.post("/v1/auth/student/register", payload);

            alert("Account created successfully! Redirecting to login page...");
            navigate("/student/login");
        } catch (err) {
            if (err.code === "ERR_NETWORK") {
                setServerError("Backend authentication server is offline. Please check the server connection.");
            } else if (err.response?.data?.message) {
                setServerError(err.response.data.message);
            } else {
                setServerError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear field error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        if (serverError) setServerError("");
    };

    // Shared input class helper
    const inputClass = (fieldName, hasIcon = true) =>
        `w-full ${hasIcon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${errors[fieldName]
            ? "border-red-400 ring-2 ring-red-100 bg-red-50"
            : "border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
        }`;

    const iconClass =
        "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none";

    // Section divider component
    const SectionDivider = ({ label, icon: Icon }) => (
        <div className="relative flex items-center gap-3 pt-4 pb-2">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
                <div className="p-1.5 rounded-lg bg-indigo-50">
                    <Icon className="w-4 h-4" />
                </div>
                <span>{label}</span>
            </div>
            <div className="flex-1 border-t border-gray-200" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-3xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 text-white mb-4">
                        <UserPlus className="w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Create Student Account
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Fill in your details below to get started
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-8 md:p-10">
                    {/* Server Error Banner */}
                    {serverError && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        {/* ===== Section A: Account Credentials ===== */}
                        <SectionDivider
                            label="Account Credentials"
                            icon={Lock}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-2">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className={iconClass} />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className={inputClass("email")}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Empty column on desktop (spacer) */}
                            <div className="hidden md:block" />

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className={iconClass} />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 characters"
                                        className={`${inputClass("password")} pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className={iconClass} />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter your password"
                                        className={`${inputClass("confirmPassword")} pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ===== Section B: Personal Information ===== */}
                        <SectionDivider
                            label="Personal Information"
                            icon={User}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-2">
                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className={iconClass} />
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        autoComplete="name"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className={inputClass("fullName")}
                                    />
                                </div>
                                {errors.fullName && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.fullName}
                                    </p>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label
                                    htmlFor="dateOfBirth"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className={iconClass} />
                                    <input
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className={`${inputClass("dateOfBirth")} [color-scheme:light]`}
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                </div>
                                {errors.dateOfBirth && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.dateOfBirth}
                                    </p>
                                )}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4 h-[42px] items-center">
                                    {GENDERS.map((g) => (
                                        <label
                                            key={g}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${formData.gender === g
                                                ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                                                : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                                                } ${errors.gender
                                                    ? "border-red-400 ring-2 ring-red-100"
                                                    : ""
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={g}
                                                checked={formData.gender === g}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <Users className="w-4 h-4" />
                                            <span>{g}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.gender && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.gender}
                                    </p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label
                                    htmlFor="phoneNumber"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className={iconClass} />
                                    <input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        autoComplete="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="+84 123 456 789"
                                        className={inputClass("phoneNumber")}
                                    />
                                </div>
                                {errors.phoneNumber && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.phoneNumber}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ===== Section C: Academic Information ===== */}
                        <SectionDivider
                            label="Academic Information"
                            icon={GraduationCap}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-2">
                            {/* Student ID (MSSV) */}
                            <div>
                                <label
                                    htmlFor="studentId"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Student ID (MSSV){" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Hash className={iconClass} />
                                    <input
                                        id="studentId"
                                        name="studentId"
                                        type="text"
                                        value={formData.studentId}
                                        onChange={handleChange}
                                        placeholder="e.g. 21000001"
                                        className={inputClass("studentId")}
                                    />
                                </div>
                                {errors.studentId && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.studentId}
                                    </p>
                                )}
                            </div>

                            {/* Class */}
                            <div>
                                <label
                                    htmlFor="class"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Class <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <BookOpen className={iconClass} />
                                    <input
                                        id="class"
                                        name="class"
                                        type="text"
                                        value={formData.class}
                                        onChange={handleChange}
                                        placeholder="e.g. DI21V7A1"
                                        className={inputClass("class")}
                                    />
                                </div>
                                {errors.class && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.class}
                                    </p>
                                )}
                            </div>

                            {/* Faculty / Department */}
                            <div>
                                <label
                                    htmlFor="faculty"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Faculty / Department{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <GraduationCap className={iconClass} />
                                    <select
                                        id="faculty"
                                        name="faculty"
                                        value={formData.faculty}
                                        onChange={handleChange}
                                        className={`${inputClass("faculty")} appearance-none cursor-pointer`}
                                    >
                                        <option value="">
                                            Select faculty...
                                        </option>
                                        {FACULTIES.map((f) => (
                                            <option key={f} value={f}>
                                                {f}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.faculty && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.faculty}
                                    </p>
                                )}
                            </div>

                            {/* Major */}
                            <div>
                                <label
                                    htmlFor="major"
                                    className="block text-sm font-medium text-gray-700 mb-1.5"
                                >
                                    Major <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <BookOpen className={iconClass} />
                                    <select
                                        id="major"
                                        name="major"
                                        value={formData.major}
                                        onChange={handleChange}
                                        className={`${inputClass("major")} appearance-none cursor-pointer`}
                                    >
                                        <option value="">
                                            Select major...
                                        </option>
                                        {MAJORS.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.major && (
                                    <p className="mt-1.5 text-xs text-red-600">
                                        {errors.major}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Create Student Account
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link
                            to="/student/login"
                            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}