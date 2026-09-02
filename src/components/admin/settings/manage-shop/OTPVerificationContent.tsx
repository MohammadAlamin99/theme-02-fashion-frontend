"use client";

import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";

const OTPVerificationContent = () => {
  const [regOtp, setRegRegOtp] = useState(true);
  const [orderOtp, setOrderOtp] = useState(true);
  const [phoneReq, setPhoneReq] = useState(true);
  const [sendMethod, setSendMethod] = useState("number");

  return (
    <div className="pb-20 font-lato animate-in fade-in duration-500 text-gray-800">
      {/* Page Header */}
      <div className="mb-10">
        <h3 className="text-[18px] font-normal text-black mb-1">OTP Verification</h3>
        <p className="text-xs font-normal text-gray-400 font-poppins">Configure security and verification settings for your customers.</p>
      </div>

      <div className="max-w-[1400px] space-y-12">
        
        {/* 1. Verification Section */}
        <section className="space-y-6">
          <h4 className="text-[16px] font-normal text-black px-1">Verification</h4>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Customer Registration OTP */}
            <div className="flex-1 w-full flex items-center justify-between bg-[#F8F9FA] rounded-xl px-5 py-4 border border-transparent">
              <span className="text-[15px] font-normal text-[#003032]">Customer Registration OTP Verify</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400">[{regOtp ? "Yes" : "No"}]</span>
                <button
                  onClick={() => setRegRegOtp(!regOtp)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${regOtp ? "bg-blue-500" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${regOtp ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>

            {/* Must Verify Account on Order */}
            <div className="flex-1 w-full flex items-center justify-between bg-[#F8F9FA] rounded-xl px-5 py-4 border border-transparent">
              <span className="text-[15px] font-normal text-[#003032]">Must Verify Account on Order Placement</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400">[{orderOtp ? "Yes" : "No"}]</span>
                <button
                  onClick={() => setOrderOtp(!orderOtp)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${orderOtp ? "bg-blue-500" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${orderOtp ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>

            {/* OTP Send Method */}
            <div className="flex items-center gap-6 px-4">
              <span className="text-[15px] font-normal text-[#003032] whitespace-nowrap">OTP Send Method</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div 
                    onClick={() => setSendMethod("number")}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${sendMethod === "number" ? "border-blue-500" : "border-gray-300"}`}
                  >
                    {sendMethod === "number" && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <span className="text-sm font-normal text-gray-600">Number</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div 
                    onClick={() => setSendMethod("email")}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${sendMethod === "email" ? "border-blue-500" : "border-gray-300"}`}
                  >
                    {sendMethod === "email" && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <span className="text-sm font-normal text-gray-600">Email</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Number Validation Section */}
        <section className="space-y-6">
          <h4 className="text-[16px] font-normal text-black px-1">Number Validation</h4>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Registration Phone Required */}
            <div className="w-full md:w-[400px] flex items-center justify-between bg-[#F8F9FA] rounded-xl px-5 py-4 border border-transparent">
              <span className="text-[15px] font-normal text-[#003032]">Registration Phone Required</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400">[{phoneReq ? "Yes" : "No"}]</span>
                <button
                  onClick={() => setPhoneReq(!phoneReq)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${phoneReq ? "bg-blue-500" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${phoneReq ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>

            {/* Min Length */}
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-normal text-gray-600">Minimum Length (without country code)</span>
              <input 
                type="text" 
                defaultValue="11" 
                className="w-12 bg-[#F8F9FA] rounded-lg py-2 text-center text-sm font-bold border border-transparent focus:border-blue-200 outline-none"
              />
            </div>

            {/* Max Length */}
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-normal text-gray-600">Maximum Length (without country code)</span>
              <input 
                type="text" 
                defaultValue="14" 
                className="w-12 bg-[#F8F9FA] rounded-lg py-2 text-center text-sm font-bold border border-transparent focus:border-blue-200 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Footer Action */}
        <div className="flex justify-end pt-10">
          <button className="bg-[#1890FF] text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-md active:scale-[0.98]">
            Update Charges
          </button>
        </div>

      </div>
    </div>
  );
};

export default OTPVerificationContent;