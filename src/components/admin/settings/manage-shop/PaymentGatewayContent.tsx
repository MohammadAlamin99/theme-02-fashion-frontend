"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ImagePlus,
  ChevronDown,
  Info,
  Type,
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import PrimaryButton from "../../common/PrimaryButton";

const PaymentGatewayContent = () => {
  const [codActive, setCodActive] = useState(true);
  const [aamarPayActive, setAamarPayActive] = useState(false);
  const [bkashActive, setBkashActive] = useState(true);
  const [selfMfsActive, setSelfMfsActive] = useState(true);
  const [advancePaymentActive, setAdvancePaymentActive] = useState(true);
  const [selectedMfs, setSelectedMfs] = useState("bkash");
  const [advanceType, setAdvancePaymentType] = useState("percentage");

  const mfsProviders = [
    { id: "bkash", name: "bKash", img: "/images/admin/bkashpayment.png" },
    { id: "nagad", name: "Nagad", img: "/images/admin/nagad.png" },
    { id: "rocket", name: "Rocket", img: "/images/admin/rocket.png" },
    { id: "ucash", name: "UCash", img: "/images/admin/ucash.png" },
    { id: "mcash", name: "mCash", img: "/images/admin/mcash.png" },
  ];

  return (
    <div className="space-y-6 pb-20 font-lato text-gray-800 bg-white p-4.5 rounded-lg">
      <div>
        <h3 className="text-[20px] font-medium font-lato mb-1">
          Payment Gateway
        </h3>
        <p className="text-[12px] text-[#A2A2A2]">
          Enable and configure your preferred payment methods
        </p>
      </div>

      {/* 1. Cash On Delivery */}
      {/* <section className="bg-white p-5 rounded-lg border border-gray-200 flex justify-between items-center ">
        <div>
          <h4 className="text-[18px] font-bold text-black">Cash On Delivery</h4>
          <p className="text-xs text-gray-400">
            Accept cash payments on delivery
          </p>
        </div>
        <button
          onClick={() => setCodActive(!codActive)}
          className={`w-11 h-6 rounded-full transition-colors relative ${codActive ? "bg-blue-500" : "bg-gray-200"}`}
        >
          <div
            className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${codActive ? "right-1" : "left-1"}`}
          />
        </button>
      </section> */}

      {/* 2. AamarPay */}
      <section className="bg-white p-5 rounded-lg border border-gray-200 flex justify-between items-center ">
        <div className="items-center gap-4">
          <div className="w-24 h-14 flex items-center justify-center">
            <img
              src="/images/admin/amarpay.png"
              alt="AamarPay"
              className="object-contain max-h-full"
            />
          </div>
          <span className="text-xs font-bold text-gray-400">
            Configure AamarPay credentials
          </span>
        </div>
        <button
          onClick={() => setAamarPayActive(!aamarPayActive)}
          className={`w-11 h-6 rounded-full transition-colors relative ${aamarPayActive ? "bg-blue-500" : "bg-gray-200"}`}
        >
          <div
            className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${aamarPayActive ? "right-1" : "left-1"}`}
          />
        </button>
      </section>

      {/* 3. bKash Merchant */}
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-5 flex justify-between items-center">
          <div className="items-center gap-4">
            <div className="w-30 h-14 flex items-center justify-center border border-gray-100 rounded-lg">
              <img
                src="/images/admin/bkashpayment.png"
                alt="bKash"
                className="object-contain max-h-full"
              />
            </div>
            <div>
              <h4 className="text-[14px] font-normal text-[#003032]">
                Configure bKash merchant credentials
              </h4>
              <p className="text-[11px] text-gray-400">
                Please provide your bKash credentials to integrate bKash
                merchant
              </p>
            </div>
          </div>
          <button
            onClick={() => setBkashActive(!bkashActive)}
            className={`w-11 h-6 rounded-full transition-colors relative ${bkashActive ? "bg-blue-500" : "bg-gray-200"}`}
          >
            <div
              className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${bkashActive ? "right-1" : "left-1"}`}
            />
          </button>
        </div>

        <div className="p-6 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-400"
              placeholder="Merchant App Key"
            />
            <input
              className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-400"
              placeholder="Merchant Secret Key"
            />
            <input
              className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-400"
              placeholder="Merchant Username"
            />
            <input
              className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-400"
              placeholder="Merchant Password"
            />
          </div>
          <div className="flex justify-end">
            <button className="bg-[#1890FF] text-white px-10 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all">
              Save
            </button>
          </div>
        </div>
      </section>

      {/* 4. Self MFS */}
      {/* <section className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-[16px] font-semibold text-black">Self MFS</h4>
            <p className="text-xs text-gray-400">
              Configure delivery credentials
            </p>
          </div>
          <button
            onClick={() => setSelfMfsActive(!selfMfsActive)}
            className={`w-11 h-6 rounded-full transition-colors relative ${selfMfsActive ? "bg-blue-500" : "bg-gray-200"}`}
          >
            <div
              className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${selfMfsActive ? "right-1" : "left-1"}`}
            />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap gap-3">
              {mfsProviders.map((mfs) => (
                <button
                  key={mfs.id}
                  onClick={() => setSelectedMfs(mfs.id)}
                  className={`relative w-28 h-12 rounded-xl border flex items-center justify-center p-2 transition-all ${
                    selectedMfs === mfs.id
                      ? "border-blue-500 bg-blue-50/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={mfs.img}
                    alt={mfs.name}
                    className="object-contain max-h-full"
                  />
                  {selectedMfs === mfs.id && (
                    <div className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center bg-[#F8F9FA] rounded-xl px-4 py-3 border border-transparent">
                <span className="text-black text-sm font-medium mr-2 whitespace-nowrap shrink-0">
                  Phone Number
                </span>
                <span className="text-gray-400 text-sm font-medium mr-2 shrink-0">
                  +88
                </span>
                <input
                  className="bg-transparent outline-none w-full text-sm"
                  placeholder="01XX XXXXXXX"
                />
              </div>
              <div className="relative">
                <select className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm w-full outline-none appearance-none cursor-pointer text-gray-700">
                  <option>Merchant</option>
                  <option>Personal</option>
                  <option>Agent</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#003032]">
                Payment Instruction
              </label>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-[#F8F9FA] border-b border-gray-100 p-2 flex gap-4 text-gray-500">
                  <div className="flex gap-2 border-r pr-4">
                    <span className="text-xs font-bold flex items-center gap-1">
                      Normal <ChevronDown size={12} />
                    </span>
                  </div>
                  <div className="flex gap-3 border-r pr-4">
                    <Bold size={16} /> <Italic size={16} />{" "}
                    <Underline size={16} /> <Quote size={16} />{" "}
                    <Type size={16} />
                  </div>
                  <div className="flex gap-3 border-r pr-4">
                    <ListOrdered size={16} /> <List size={16} />
                  </div>
                  <div className="flex gap-3">
                    <ImagePlus size={16} /> <Link2 size={16} />
                  </div>
                </div>
                <textarea
                  className="w-full h-32 p-4 text-sm outline-none resize-none"
                  placeholder="E.g. Send money to this number and provide TxnId on checkout."
                />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-72">
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
              <h5 className="text-sm font-bold text-[#003032]">Add QR Code</h5>
              <div className="w-32 h-32 bg-[#F8F9FA] rounded-xl flex items-center justify-center p-4">
                <img
                  src="/images/admin/qr-code.png"
                  alt="QR Placeholder"
                  className="w-full h-full"
                />
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Drag and drop image here, or click add image.
                <br />
                Supported formats: JPG, PNG, Max size: 4MB.
                <br />
                Note: Use images with a 1:1 aspect ratio (150x150 pixels).
              </p>
              <button className="bg-orange-500 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 transition-all shadow-md">
                Add Image
              </button>
            </div>
          </div>
        </div>
      </section> */}

      {/* 5. Advance Payment & Message Note */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-[16px] font-semibold text-black">
                Advance payment
              </h4>
              <p className="text-xs text-gray-400">
                Select how much amount you want to get advance from customer.
              </p>
            </div>
            <button
              onClick={() => setAdvancePaymentActive(!advancePaymentActive)}
              className={`w-11 h-6 rounded-full transition-colors relative ${advancePaymentActive ? "bg-blue-500" : "bg-gray-200"}`}
            >
              <div
                className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${advancePaymentActive ? "right-1" : "left-1"}`}
              />
            </button>
          </div>

          <div className="space-y-4">
            {[
              "Full Payment",
              "Delivery Charge Only",
              "Percentage",
              "Fixed Amount",
            ].map((type) => (
              <label
                key={type}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    advanceType === type.toLowerCase().replace(" ", "_")
                      ? "border-blue-500"
                      : "border-gray-300 group-hover:border-gray-400"
                  }`}
                >
                  {advanceType === type.toLowerCase().replace(" ", "_") && (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  )}
                </div>
                <input
                  type="radio"
                  className="hidden"
                  name="advanceType"
                  onChange={() =>
                    setAdvancePaymentType(type.toLowerCase().replace(" ", "_"))
                  }
                />
                <span className="text-sm font-medium text-gray-600">
                  {type}
                </span>
              </label>
            ))}
            {advanceType === "percentage" && (
              <input
                className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm w-full outline-none ml-8 max-w-[120px]"
                defaultValue="0"
              />
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h4 className="text-[16px] font-semibold text-black">
            Payment process message note
          </h4>

          <textarea
            className="w-full min-h-[140px] bg-[#F8F9FA] rounded-lg p-4 text-sm outline-none border border-transparent focus:border-gray-200 resize-none"
            placeholder="Add a custom message for your customers about the payment process..."
          />
        </section>
      </div>

      <div className="flex justify-end pt-4">
        <PrimaryButton label="Update delivery Charges" className="px-6 py-3" />
      </div>
    </div>
  );
};

export default PaymentGatewayContent;
