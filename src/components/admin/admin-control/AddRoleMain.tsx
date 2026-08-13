"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/utils/api";
import PrimaryButton from "../common/PrimaryButton";
import toast from "react-hot-toast";

const PERMISSIONS = [
  "Dashboard",
  "Orders",
  "Products",
  "Catalog",
  "Inventory",
  "Customer & Review",
  "Website Content",
  "Campaign",
  "Settings",
  "Admin Control",
];

interface AdminFormValues {
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "MANAGER";
  password: string;
  permissions: string[];
}

interface AdminData {
  name?: string;
  email?: string;
  phone?: string;
  role?: "ADMIN" | "MANAGER";
  permissions?: string[];
}

export default function AddRoleMain() {
  const router = useRouter();
  const params = useParams();
  const adminId = params?.id as string;
  const isEdit = !!adminId;

  const queryClient = useQueryClient();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const methods = useForm<AdminFormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "ADMIN",
      password: "",
    },
  });

  // const [selectedPerms, setSelectedPerms] = useState<string[]>(["Dashboard"]);
  const selectedPerms =
    useWatch({
      control: methods.control,
      name: "permissions",
    }) || [];

  // Load existing data if editing
  const { data: adminData, isLoading } = useQuery<AdminData>({
    queryKey: ["admin-detail", adminId],
    queryFn: async () => {
      const res = await apiFetch(`/users/${adminId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const json = await res.json();
      return json.data || json;
    },
    enabled: isEdit && !!adminId,
  });

  // Populate form fields when data is fetched
  useEffect(() => {
    if (adminData) {
      methods.reset({
        name: adminData.name || "",
        email: adminData.email || "",
        phone: adminData.phone || "",
        role: adminData.role || "ADMIN",
        permissions: adminData.permissions || ["Dashboard"],
      });
    }
  }, [adminData, methods]);

  // Animation logic for "Access in" click
  const handleAccessClick = () => {
    if (sidebarRef.current) {
      sidebarRef.current.classList.add("animate-shake");
      sidebarRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(
        () => sidebarRef.current?.classList.remove("animate-shake"),
        500,
      );
    }
  };

  const onSubmit = async (formData: AdminFormValues) => {
    const payload: {
      name: string;
      email: string;
      phone: string;
      role: "ADMIN" | "MANAGER";
      permissions: string[];
      password?: string;
    } = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      permissions: selectedPerms,
    };

    // Only include password if creating a new user
    if (!isEdit) payload.password = formData.password;

    const res = await apiFetch(
      isEdit ? `/users/admin-update/${adminId}` : "/users",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      router.push("/admin/dashboard/admin-control");
    } else {
      const err = await res.json();
      toast.error(err.message || "Failed to save changes");
    }
  };

  if (isEdit && isLoading)
    return (
      <div className="p-10 text-center text-[#023337] font-bold text-xl">
        Loading Admin Data...
      </div>
    );

  const togglePermission = (p: string) => {
    const current = methods.getValues("permissions");
    const updated = current.includes(p)
      ? current.filter((x) => x !== p)
      : [...current, p];

    methods.setValue("permissions", updated);
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="flex gap-6 mt-6 items-start font-lato"
        >
          {/* Permission Sidebar */}
          <div
            ref={sidebarRef}
            className="w-1/3 bg-white p-6 rounded-xl transition-all"
          >
            <h3 className="font-bold text-[#023337] mb-4">Permissions</h3>
            <div className="space-y-1">
              {PERMISSIONS.map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 px-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPerms.includes(p)}
                    onChange={() => togglePermission(p)}
                    className="w-4 h-4 accent-[#1DA1F2]"
                  />
                  <span className="text-sm text-gray-700 font-medium">{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="w-2/3 bg-white p-8 rounded-xl">
            <div className="flex items-center gap-4 mb-8">
              <ArrowLeft
                className="cursor-pointer text-[#023337]"
                onClick={() => router.back()}
              />
              <h2 className="text-xl font-bold text-[#023337]">
                {isEdit ? "Edit Role" : "Add Admin"}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#023337] mb-2">
                  Admin Name
                </label>
                <input
                  {...methods.register("name")}
                  className="w-full p-3 bg-gray-100 rounded-lg outline-none focus:border-[#1DA1F2] transition-all"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#023337] mb-2">
                  Email*
                </label>
                <input
                  {...methods.register("email")}
                  className="w-full p-3 bg-gray-100 rounded-lg outline-none focus:border-[#1DA1F2] transition-all"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#023337] mb-2">
                  Phone*
                </label>
                <input
                  {...methods.register("phone")}
                  className="w-full p-3 bg-gray-100 rounded-lg outline-none focus:border-[#1DA1F2] transition-all"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#023337] mb-2">
                  Role*
                </label>
                <select
                  {...methods.register("role")}
                  className="w-full p-3 bg-gray-100 rounded-lg outline-none focus:border-[#1DA1F2] transition-all appearance-none"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>

              {/* RESTORED ACCESS IN FIELD */}
              <div>
                <label className="block text-sm font-bold text-[#023337] mb-2">
                  Access in*
                </label>
                <div
                  onClick={handleAccessClick}
                  className="w-full p-3 bg-[#F9F9F9] rounded-lg border cursor-pointer hover:border-[#1DA1F2] transition-colors flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600 font-medium">
                    {selectedPerms.length} Permissions Selected
                  </span>
                  <span className="text-[10px] bg-[#1DA1F2] text-white px-2 py-1 rounded">
                    View
                  </span>
                </div>
              </div>
            </div>

            {!isEdit && (
              <div className="mt-6">
                <label className="block text-sm font-bold text-[#023337] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  {...methods.register("password")}
                  className="w-full p-3 bg-[#F9F9F9] rounded-lg border outline-none focus:border-[#1DA1F2] transition-all"
                  placeholder="Set Password"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 mt-10">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 font-semibold text-black bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <PrimaryButton
                label={isEdit ? "Save Changes" : "Add Admin"}
                type="submit"
                className="px-8 py-2.5"
              />
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
