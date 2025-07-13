"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseError } from "@/utils/parseError";
import { useAuth } from "@/store/auth";

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { signup, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signup(formData.fullName, formData.email, formData.password);
      router.push("/");
    } catch (err) {
      const message = parseError(
        err instanceof Error ? err.message : "Signup failed",
      );
      setError(message);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form onSubmit={handleSubmit} className="shadow-xl rounded-2xl p-10 w-md">
        <h2 className="text-2xl font-bold text-center mb-8 text-blue-600">
          ♟️ Create Your Account
        </h2>

        <div className="mb-6">
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            placeholder="Sabin Shrestha"
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition duration-200 text-base"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="sabinshrestha@example.com"
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition duration-200 text-base"
            required
          />
        </div>

        <div className="mb-8 relative">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            placeholder="••••••••"
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition duration-200 text-base"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-9 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          text={isLoading ? "Signing up..." : "Sign Up"}
        />

        {error && (
          <p className="text-red-600 mt-6 text-center text-sm">{error}</p>
        )}

        <p className="text-center text-gray-600 text-sm mt-8">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-400 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
