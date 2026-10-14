"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import logo from "@/public/images/oxyauraai_svg_logo.svg";
import plainBgAuth from "@/public/images/plainBgAuth.jpg";
import api from "@/lib/api";
import { saveAuth, isAuthenticated, type AuthData } from "@/lib/auth";

/* ─────────────────────────── Types ─────────────────────────── */

interface SignupErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface SigninErrors {
  email?: string;
  password?: string;
  general?: string;
}

/* ─────────────────────────── Sign-Up Form ─────────────────────────── */

function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof SignupErrors] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
    }

    if (
      name === "confirmPassword" &&
      formData.password &&
      value !== formData.password
    ) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else if (
      name === "password" &&
      formData.confirmPassword &&
      value !== formData.confirmPassword
    ) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else if (
      (name === "confirmPassword" && value === formData.password) ||
      (name === "password" && value === formData.confirmPassword)
    ) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: SignupErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Valid email required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Min. 6 characters required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password required";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const payload = {
        fullname: formData.name,
        email: formData.email,
        password: formData.password,
      };
      const response = await api.post(
        "/auth/signup",
        payload,
      );
      console.log("Signup response:", response.data);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full py-6 px-4 bg-teal-50/80 border border-teal-200 rounded-lg text-center my-auto">
        <div className="flex items-center justify-center gap-2 text-[#008B8B] font-semibold text-base">
          <CheckCircle2 className="w-5 h-5" />
          Account Created!
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Your account has been registered successfully.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsSuccess(false);
            setFormData({
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
            });
          }}
          className="mt-3 text-xs font-medium text-[#008B8B] hover:underline"
        >
          Register another account
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col gap-1"
    >
      {/* General error slot with fixed height */}
      <div className="h-4 flex items-center justify-center">
        {errors.general && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-red-500 truncate whitespace-nowrap">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{errors.general}</span>
          </p>
        )}
      </div>

      {/* Name */}
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor="signup-name"
          className="text-xs font-bold text-gray-700"
        >
          Name
        </label>
        <input
          id="signup-name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
          className={`h-8.5 rounded-md border bg-white px-3 text-xs outline-none transition ${
            errors.name
              ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
              : "border-gray-300 focus:border-[#008B8B] focus:ring-1 focus:ring-[#008B8B]/20"
          }`}
        />
        <div className="h-4 flex items-center overflow-hidden">
          {errors.name && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500 truncate whitespace-nowrap">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor="signup-email"
          className="text-xs font-bold text-gray-700"
        >
          Email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          className={`h-8.5 rounded-md border bg-white px-3 text-xs outline-none transition ${
            errors.email
              ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
              : "border-gray-300 focus:border-[#008B8B] focus:ring-1 focus:ring-[#008B8B]/20"
          }`}
        />
        <div className="h-4 flex items-center overflow-hidden">
          {errors.email && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500 truncate whitespace-nowrap">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>
      </div>

      {/* Password row */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* Password */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <label
            htmlFor="signup-password"
            className="text-xs font-bold text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={`h-8.5 w-full rounded-md border bg-white pl-3 pr-8 text-xs outline-none transition ${
                errors.password
                  ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  : "border-gray-300 focus:border-[#008B8B] focus:ring-1 focus:ring-[#008B8B]/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <div className="h-4 flex items-center overflow-hidden">
            {errors.password && (
              <p className="flex items-center gap-1 text-[11px] font-medium text-red-500 truncate whitespace-nowrap">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span className="truncate">{errors.password}</span>
              </p>
            )}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <label
            htmlFor="signup-confirm-password"
            className="text-xs font-bold text-gray-700"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className={`h-8.5 w-full rounded-md border bg-white pl-3 pr-8 text-xs outline-none transition ${
                errors.confirmPassword
                  ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  : "border-gray-300 focus:border-[#008B8B] focus:ring-1 focus:ring-[#008B8B]/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              tabIndex={-1}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <div className="h-4 flex items-center overflow-hidden">
            {errors.confirmPassword && (
              <p className="flex items-center gap-1 text-[11px] font-medium text-red-500 truncate whitespace-nowrap">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span className="truncate">{errors.confirmPassword}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-1 h-9 w-full rounded-md bg-[#008B8B] text-white font-semibold text-xs transition hover:bg-[#007777] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : (
          <span>Sign Up</span>
        )}
      </button>
    </form>
  );
}

/* ─────────────────────────── Sign-In Form ─────────────────────────── */

function SigninForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<SigninErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof SigninErrors] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: SigninErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Valid email required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await api.post<AuthData>(
        "/auth/signin",
        formData,
      );
      saveAuth(response.data);
      router.replace("/dashboard");
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Invalid credentials. Please try again.";
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col gap-1"
    >
      {/* General error slot */}
      <div className="h-4 flex items-center justify-center">
        {errors.general && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-red-500 truncate whitespace-nowrap">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{errors.general}</span>
          </p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="signin-email"
          className="text-xs md:text-md font-bold text-gray-700"
        >
          Email
        </label>
        <input
          id="signin-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          className={`h-8.5 rounded-md border bg-white px-3 text-xs outline-none transition ${
            errors.email
              ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
              : "border-gray-300 focus:border-[#008B8B] focus:ring-1 focus:ring-[#008B8B]/20"
          }`}
        />
        <div className="h-4 flex items-center overflow-hidden">
          {errors.email && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500 truncate whitespace-nowrap">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="signin-password"
            className="text-xs md:text-md font-bold text-gray-700"
          >
            Password
          </label>
          <button
            type="button"
            className="text-[11px] md:text-md text-[#008B8B] hover:underline font-medium hover:cursor-pointer"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            id="signin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={`h-8.5 w-full rounded-md border bg-white pl-3 pr-8 text-xs outline-none transition ${
              errors.password
                ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                : "border-gray-300 focus:border-[#008B8B] focus:ring-1 focus:ring-[#008B8B]/20"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <div className="h-4 flex items-center overflow-hidden">
          {errors.password && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500 truncate whitespace-nowrap">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.password}</span>
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-1 h-9 w-full rounded-md bg-[#008B8B] text-white font-semibold text-xs transition hover:bg-[#007777] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Signing In...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>
    </form>
  );
}

/* ─────────────────────────── Main Auth Component ─────────────────────────── */

type Tab = "signin" | "signup";

export default function Signup() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("signin");

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div
      className="h-screen w-screen overflow-hidden flex items-center justify-center p-3"
      style={{
        backgroundImage: `url(${plainBgAuth.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-zinc-100 border border-gray-200 shadow-md rounded-xl w-full max-w-md my-auto flex flex-col overflow-hidden">
        <div className="flex flex-col justify-center items-center py-3.5 px-6 sm:px-8">
          {/* Logo */}
          <div className="mb-6">
            <Image
              src={logo}
              alt="Oxyaura AI Logo"
              width={95}
              height={95}
              priority
            />
          </div>

          {/* Tab Switcher */}
          <div className="relative w-full flex bg-gray-200/80 rounded-lg p-1 mb-3">
            {/* Animated sliding pill */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-[#008B8B] shadow-sm transition-all duration-300 ease-in-out hover:cursor-pointer"
              style={{ left: activeTab === "signin" ? "4px" : "calc(50%)" }}
            />
            <button
              id="tab-signin"
              type="button"
              onClick={() => setActiveTab("signin")}
              className={`relative z-10 flex-1 h-8 rounded-md text-xs font-bold transition-colors duration-300 hover:cursor-pointer ${
                activeTab === "signin"
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-signup"
              type="button"
              onClick={() => setActiveTab("signup")}
              className={`relative z-10 flex-1 h-8 rounded-md text-xs font-bold transition-colors duration-300 hover:cursor-pointer ${
                activeTab === "signup"
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Heading */}
          <div className="font-extrabold text-md md:text-2xl  text-gray-900 tracking-tight mb-2">
            {activeTab === "signin" ? (
              <>
                Welcome <span className="text-[#008B8B]">Back</span>
              </>
            ) : (
              <>
                Create an <span className="text-[#008B8B]">Account</span>
              </>
            )}
          </div>

          {/* Active Form */}
          {activeTab === "signin" ? <SigninForm /> : <SignupForm />}

          {/* Footer toggle */}
          <div className="mt-3 text-center text-xs text-gray-500">
            {activeTab === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className="text-[#008B8B] font-bold hover:underline"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  className="text-[#008B8B] font-bold hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
