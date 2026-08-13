"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaLock, FaPhone, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore } from "@/store/useAuthStore";
import { apiFetch } from "@/utils/api";
import { setSessionToken } from "@/app/actions/auth";
import { mergeCart } from "@/services-api/cartService";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";
const SignInPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    if (!/^01[3-9]\d{8}$/.test(phone)) {
      return setError(t.errors.invalidPhone);
    }

    try {
      setLoading(true);
      const res = await apiFetch("/users/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Invalid credentials!");

      // Dynamic token and user footprint mapping
      const targetToken =
        data.token ||
        data.accessToken ||
        data.data?.token ||
        data.data?.accessToken;
      const rawUser =
        data.user ||
        data.data?.user ||
        (data.id || data.name ? data : data.data);

      if (!targetToken) throw new Error("Authentication token missing.");

      // 1. Offload token management securely to Server-side HTTP-only cookies
      await setSessionToken(targetToken);

      // Merge guest cart items into logged-in user's server cart
      const guestId =
        typeof window !== "undefined" ? localStorage.getItem("guestId") : null;
      if (guestId) {
        try {
          await mergeCart(guestId);
          localStorage.removeItem("guestId");
        } catch (mergeErr) {
          console.error("Failed to merge guest cart on signin:", mergeErr);
        }
      }

      // 2. Clear state formatting structural payload and commit to Zustand
      const targetUser = {
        id: rawUser.id || rawUser._id,
        name: rawUser.name || "",
        email: rawUser.email || "",
        phone: rawUser.phone || "",
        role: rawUser.role || "USER",
        avatar: rawUser.avatar || data.avatar || data.data?.avatar || null,
        permissions: rawUser.permissions || [],
      };

      setAuthUser(targetUser);

      router.refresh();
      router.push(redirectUrl || "/profile");
    } catch (err: unknown) {
      setError((err as Error).message || t.errors.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  };

  const { language } = useLanguage();
  const t = translations[language].auth;

  return (
    <div className="w-full min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4 font-poppins">
      <div className="w-full max-w-[460px] bg-white rounded-[12px] border border-[#D2D2D2] p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black">{t.signIn.title}</h2>
          <p className="text-sm text-gray-400 mt-1">{t.signIn.subtitle}</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-red-500 font-semibold bg-red-50 p-3 rounded-[8px] border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#727272]">
              {t.fields.phone}
            </label>
            <div className="flex border border-[#D2D2D2] rounded-[10px] overflow-hidden focus-within:border-[#FF7050] bg-white transition-all">
              <div className="bg-[#F9F9F9] px-4 flex items-center justify-center border-r border-[#D2D2D2] w-[55px]">
                <FaPhone className="text-[#FF7050] rotate-[90deg]" size={16} />
              </div>
              <input
                name="phone"
                type="tel"
                placeholder={t.placeholders.phone}
                className="w-full px-4 py-3.5 text-sm text-gray-700 outline-none"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-[#727272]">
                {t.fields.password}
              </label>
              <a
                href="#"
                className="text-xs text-[#FF7050] font-medium hover:underline"
              >
                {t.signIn.forgotPassword}
              </a>
            </div>
            <div className="flex border border-[#D2D2D2] rounded-[10px] overflow-hidden focus-within:border-[#FF7050] bg-white relative transition-all">
              <div className="bg-[#F9F9F9] px-4 flex items-center justify-center border-r border-[#D2D2D2] w-[55px]">
                <FaLock className="text-[#FF7050]" size={16} />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t.placeholders.passwordDots}
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
            {loading ? t.signIn.loading : t.signIn.button}
          </button>

          <div className="text-center mt-2 text-sm text-gray-500">
            {t.signIn.noAccount}{" "}
            <a
              href="/signup"
              className="text-[#FF7050] font-semibold hover:underline"
            >
              {t.signIn.createOne}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
