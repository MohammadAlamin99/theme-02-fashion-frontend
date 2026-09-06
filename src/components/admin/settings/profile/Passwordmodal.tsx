"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/utils/api";
import toast from "react-hot-toast";
import { ChangePasswordPayload } from "@/@types/profile.type";

interface PasswordModalProps {
  onClose: () => void;
  onRedirect: () => void;
}

const PasswordModal = ({ onClose, onRedirect }: PasswordModalProps) => {
  const [data, setData] = useState<ChangePasswordPayload>({
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/users/change-password", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Incorrect current password.");
      setSuccess(true);
      setTimeout(() => onRedirect(), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-[350px] shadow-2xl">
        {success ? (
          <div className="text-center py-6">
            <CheckCircle2 className="text-green-500 mx-auto mb-2" size={48} />{" "}
            <h3 className="font-bold">Password Changed!</h3>{" "}
            <p className="text-sm text-gray-500">Redirecting...</p>
          </div>
        ) : (
          <>
            <h3 className="font-bold mb-4">Change Password</h3>
            <input
              type="password"
              placeholder="Current Password"
              className="w-full p-3 bg-gray-50 rounded mb-3 border outline-none"
              onChange={(e) =>
                setData({ ...data, currentPassword: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-3 bg-gray-50 rounded mb-4 border outline-none"
              onChange={(e) =>
                setData({ ...data, newPassword: e.target.value })
              }
            />
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 p-2 bg-gray-100 rounded"
              >
                Cancel
              </button>{" "}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 p-2 bg-[#1DA1F2] text-white rounded"
              >
                {loading ? "Saving..." : "Confirm"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordModal;
