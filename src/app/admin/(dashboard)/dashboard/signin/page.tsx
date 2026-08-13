"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import { FaLock, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa";

import { useAuthStore } from "@/store/useAuthStore";

import { apiFetch } from "@/utils/api";

import { setAdminSessionToken } from "@/app/actions/auth";

import { useQueryClient } from "@tanstack/react-query";

const SignInPage = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const setAdminUser = useAuthStore((state) => state.setAdminUser);

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    const formData = new FormData(e.currentTarget);

    const phone = formData.get("phone") as string;

    const password = formData.get("password") as string;

    try {
      setLoading(true);

      const res = await apiFetch("/users/login", {
        method: "POST",

        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Invalid credentials!");

      const rawUser = data.user || data.data?.user;

      if (rawUser.role !== "ADMIN" && rawUser.role !== "MANAGER") {
        throw new Error("Access Denied: Administrative credentials required.");
      }

      const targetToken =
        data.accessToken || data.token || data.data?.accessToken;

      // 1. Set the secure cookie

      await setAdminSessionToken(targetToken);

      setAdminUser({
        id: rawUser.id,

        name: rawUser.name,

        email: rawUser.email,

        phone: rawUser.phone,

        role: rawUser.role,

        avatar: rawUser.avatar || null,

        permissions: rawUser.permissions || [],
      });

      // 3. Force React Query to fetch fresh data

      await queryClient.invalidateQueries({ queryKey: ["admin-staff"] });

      await queryClient.invalidateQueries({ queryKey: ["admin-profile"] });

      // 4. Redirect

      router.push("/admin/dashboard/home");

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4 font-poppins">
      <div className="w-full max-w-[460px] bg-white rounded-[12px] border border-[#D2D2D2] p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black">Admin Sign In</h2>

          <p className="text-sm text-gray-400 mt-1">
            Access your profile metrics
            {process.env.NEXT_PUBLIC_ENABLE_ADMIN_BYPASS === "true" && (
              <span className="block text-xs text-[#FF7050] font-semibold mt-1">
                ⚠️ Dev Bypass Active: Use "admin" / "admin"
              </span>
            )}
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-red-500 font-semibold bg-red-50 p-3 rounded-[8px] border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#727272]">
              Phone Number
            </label>

            <div className="flex border border-[#D2D2D2] rounded-[10px] overflow-hidden focus-within:border-[#FF7050] bg-white transition-all">
              <div className="bg-[#F9F9F9] px-4 flex items-center justify-center border-r border-[#D2D2D2] w-[55px]">
                <FaPhone className="text-[#FF7050] rotate-[90deg]" size={16} />
              </div>

              <input
                name="phone"
                type="text"
                placeholder="017XXXXXXXX or 'admin'"
                className="w-full px-4 py-3.5 text-sm text-gray-700 outline-none"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-[#727272]">
                Password
              </label>
            </div>

            <div className="flex border border-[#D2D2D2] rounded-[10px] overflow-hidden focus-within:border-[#FF7050] bg-white relative transition-all">
              <div className="bg-[#F9F9F9] px-4 flex items-center justify-center border-r border-[#D2D2D2] w-[55px]">
                <FaLock className="text-[#FF7050]" size={16} />
              </div>

              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 text-sm text-gray-700 outline-none pr-12"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF7050] text-white py-3.5 rounded-[10px] text-base font-semibold transition-all hover:bg-[#e66345] cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
