"use client";

import React from "react";
import { Play } from "lucide-react";

const ShopDomainContent = () => {
  return (
    <div className="pb-20 font-lato animate-in fade-in duration-500 bg-white p-4.5 rounded-lg">
      {/* 1. Header Section - Positioned on the Left like previous components */}
      <div className="mb-10">
        <h3 className="text-[18px] font-normal text-black mb-1">Shop Domain</h3>
      </div>

      {/* 2. Centered Content Container */}
      <div className="max-w-[850px] mx-auto">
        {/* Instructions Red Border Box */}
        <section className="bg-white p-8 rounded-2xl border border-[#FF0000] shadow-sm space-y-5">
          <h4 className="text-[16px] font-normal text-black">Instructions</h4>

          <div className="space-y-4 text-sm font-normal text-gray-600 leading-relaxed font-poppins text-left">
            <p className="font-semibold text-black">
              Configure DNS Settings in Cloudflare
            </p>

            <div className="space-y-2">
              <p>The Steps in the Bellow:</p>
              <p>
                1. Point{" "}
                <span className="font-bold text-black uppercase">
                  A Record for @: 128.199.220.202
                </span>
              </p>
              <p>
                2. Point{" "}
                <span className="font-bold text-black uppercase">
                  CNAME Record for www: your_domain.com
                </span>
              </p>
            </div>

            <p>
              Add the following DNS record to your{" "}
              <span className="font-bold text-black">Cloudflare DNS</span> with{" "}
              <span className="font-bold text-black">TTL: Auto</span> and <br />
              <span className="font-bold text-black">
                Proxy Status: Proxied
              </span>
              . Set <span className="font-bold text-black">SSL</span> mode to{" "}
              <span className="font-bold text-black">Flexible</span>. Allow up
              to 24 hours for verification.
            </p>
          </div>

          {/* YouTube Style Button */}
          <button className="flex items-center gap-2 bg-[#FFF1F1] text-black px-5 py-2.5 rounded-xl hover:bg-[#FFE4E4] transition-all group mt-2">
            <div className="bg-[#FF0000] p-1.5 rounded-md flex items-center justify-center">
              <Play size={14} fill="white" className="text-white" />
            </div>
            <span className="text-sm font-medium">View Video Instruction</span>
          </button>
        </section>

        {/* 3. Input and Save Section */}
        <div className="mt-12 space-y-6">
          <div className="space-y-2">
            <input
              type="text"
              className="w-full bg-[#F8F9FA] rounded-xl px-4 py-4 text-base font-normal text-gray-700 outline-none border border-transparent focus:border-gray-200 transition-all placeholder:text-[#A2A2A2]"
              placeholder="Your_domain.com"
            />
          </div>

          <button className="w-full bg-[#1890FF] text-white py-4 rounded-xl text-[18px] font-bold cursor-pointer">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopDomainContent;
