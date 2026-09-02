"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, XCircle, Loader2 } from "lucide-react";
import PrimaryButton from "../../common/PrimaryButton";
import {
  fetchShippingSettings,
  SHIPPING_SETTINGS_QUERY_KEY,
  ShippingSettingsData,
  ShippingZone,
  updateShippingSettings,
} from "@/services-api/shippingService";
import { fetchPaymentSettings, PAYMENT_SETTINGS_QUERY_KEY, updatePaymentSettings } from "@/services-api/paymentSettingsService";

type ZoneRow = ShippingZone & { _rowKey: string };

const makeRowKey = () => Math.random().toString(36).slice(2);

const toZoneRows = (zones: ShippingZone[] = []): ZoneRow[] =>
  zones.map((z) => ({ ...z, _rowKey: makeRowKey() }));

const emptyRow = (): ZoneRow => ({
  _rowKey: makeRowKey(),
  zone: "",
  inside: 0,
  outside: 0,
  subcity: 0,
});

const DeliveryChargeContent = () => {
  const queryClient = useQueryClient();
  const [pathaoActive, setPathaoActive] = useState(true);

  // --- Editable zones state, synced from the fetched data ---
  const [zoneRows, setZoneRows] = useState<ZoneRow[]>([]);
  const [defaultFee, setDefaultFee] = useState<string>("0");
  const [syncedSettings, setSyncedSettings] =
    useState<ShippingSettingsData | null>(null);

  // settings service
  const { data: paymentSettings, isLoading: isLoadingPayment } = useQuery({
    queryKey: PAYMENT_SETTINGS_QUERY_KEY,
    queryFn: fetchPaymentSettings,
  });

  // Payment Settings Mutation
  const { mutate: togglePayment, isPending: isUpdatingPayment } = useMutation({
    mutationFn: updatePaymentSettings,
    onSuccess: (newData) => {
      toast.success("Payment settings updated");
      queryClient.setQueryData(PAYMENT_SETTINGS_QUERY_KEY, newData);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to update payment status";
      toast.error(message);
    },
  });

  // 1. Fetch existing settings
  const {
    data: settings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: SHIPPING_SETTINGS_QUERY_KEY,
    queryFn: fetchShippingSettings,
  });
  if (settings && settings !== syncedSettings) {
    setSyncedSettings(settings);
    setDefaultFee(String(settings.default_shipping_fee ?? "0"));
    setZoneRows(toZoneRows(settings.courier_config?.zones));
  }
  const { mutate: saveZones, isPending: isSaving } = useMutation({
    mutationFn: (rows: ZoneRow[]) => {
      const cleanZones: ShippingZone[] = rows.map(({ ...z }) => ({
        ...z,
        inside: Number(z.inside) || 0,
        outside: Number(z.outside) || 0,
        subcity: Number(z.subcity) || 0,
      }));
      return updateShippingSettings({
        default_shipping_fee: Number(defaultFee) || 0,
        courier_config: { zones: cleanZones },
      });
    },
    onSuccess: (data) => {
      toast.success("Delivery charges updated");
      queryClient.setQueryData(SHIPPING_SETTINGS_QUERY_KEY, data);
      setSyncedSettings(data);
      setZoneRows(toZoneRows(data.courier_config?.zones));
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update delivery charges";
      toast.error(message);
    },
  });

  const handleZoneChange = (
    rowKey: string,
    field: keyof ShippingZone,
    value: string,
  ) => {
    setZoneRows((prev) =>
      prev.map((row) =>
        row._rowKey === rowKey ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleAddRow = () => {
    setZoneRows((prev) => [...prev, emptyRow()]);
  };

  const handleRemoveRow = (rowKey: string) => {
    const remaining = zoneRows.filter((r) => r._rowKey !== rowKey);
    setZoneRows(remaining);
    // deletion is saved immediately, no separate confirm step
    saveZones(remaining);
  };

  const handleSaveZones = () => {
    if (zoneRows.some((r) => !r.zone.trim())) {
      toast.error("Zone name can't be empty");
      return;
    }
    saveZones(zoneRows);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-gray-400 text-sm">
        <Loader2 className="animate-spin" size={18} />
        Loading delivery settings...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-24 text-sm text-red-500">
        {error instanceof Error
          ? error.message
          : "Failed to load delivery settings"}
      </div>
    );
  }

  if (isLoading || isLoadingPayment) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-gray-400 text-sm">
        <Loader2 className="animate-spin" size={18} />
        Loading settings...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 font-poppins text-gray-800 bg-white p-4.5 rounded-lg">
        {/* 1. Specific Delivery Charge */}

        <h3 className="text-[16px] font-normal text-black mb-4">
          Delivery Charge
        </h3>
        <section className="bg-white mb-4">
          <h3 className="text-[16px] font-normal text-black mb-4">
            Specific Delivery Charge
          </h3>

          <div className="space-y-4">
            {zoneRows.map((row) => (
              <div
                key={row._rowKey}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
              >
                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <input
                    className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 transition-all"
                    placeholder="Zone name, e.g. Dhaka"
                    value={row.zone}
                    onChange={(e) =>
                      handleZoneChange(row._rowKey, "zone", e.target.value)
                    }
                  />
                </div>

                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <div className="flex items-center bg-[#F8F9FA] rounded-xl px-4 py-3 border border-transparent">
                    <span className="text-gray-400 text-sm font-normal mr-2">
                      Inside
                    </span>
                    <input
                      className="bg-transparent outline-none w-full text-right font-semibold text-sm"
                      value={row.inside}
                      onChange={(e) =>
                        handleZoneChange(row._rowKey, "inside", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="md:col-span-3 flex flex-col gap-1.5">
                  <div className="flex items-center bg-[#F8F9FA] rounded-xl px-4 py-3 border border-transparent">
                    <span className="text-gray-400 text-sm font-normal mr-2">
                      Outside
                    </span>
                    <input
                      className="bg-transparent outline-none w-full text-right font-semibold text-sm"
                      value={row.outside}
                      onChange={(e) =>
                        handleZoneChange(row._rowKey, "outside", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <div className="flex items-center bg-[#F8F9FA] rounded-xl px-4 py-3 border border-transparent">
                    <span className="text-gray-400 text-sm font-normal whitespace-nowrap shrink-0 mr-2">
                      Sub city
                    </span>
                    <input
                      className="bg-transparent outline-none w-full text-right font-semibold text-sm"
                      value={row.subcity}
                      onChange={(e) =>
                        handleZoneChange(row._rowKey, "subcity", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="md:col-span-1 flex justify-end pb-3">
                  <button
                    onClick={() => handleRemoveRow(row._rowKey)}
                    disabled={isSaving}
                    className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            ))}

            {zoneRows.length === 0 && (
              <p className="text-sm text-gray-400 py-2">
                No delivery zones yet — add one below.
              </p>
            )}
          </div>

          <button
            onClick={handleAddRow}
            className="mt-4 flex items-center gap-1.5 text-sm cursor-pointer font-medium font-lato text-black bg-[#F3F4F6] px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
          >
            <Plus size={14} /> Add More
          </button>
          <div className="mt-6 flex justify-end">
            <PrimaryButton
              label={isSaving ? "Saving..." : "Update delivery Charges"}
              onClick={handleSaveZones}
              disabled={isSaving}
              className="px-6 py-3 rounded-lg"
            />
          </div>
        </section>

        {/* Payment Configuration */}

        {/* 2. Weight-based Extra Charges — no backend endpoint yet, left static */}
        {/* <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-[16px] font-normal text-black mb-1">
          Weight-based Extra Charges
        </h3>
        <p className="text-xs font-normal text-gray-400 mb-6">
          Add extra delivery charges based on product weight. For example: 5 kg
          = ৳50, 10 kg = ৳80
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-4 text-xs font-normal text-gray-400 px-1">
            <div className="col-span-5 uppercase tracking-wider">Weight</div>
            <div className="col-span-5 uppercase tracking-wider">Charge</div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            <input
              className="col-span-5 bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 transition-all"
              defaultValue="5 kg"
            />
            <input
              className="col-span-5 bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none border border-transparent focus:border-gray-200 transition-all"
              defaultValue="৳50"
            />
            <div className="col-span-2 flex justify-end pr-1">
              <button className="text-red-400 hover:text-red-600 transition-colors">
                <XCircle size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            <input
              className="col-span-5 bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none placeholder-gray-400 border border-transparent focus:border-gray-200 transition-all"
              placeholder="Ex. 5 kg"
            />
            <input
              className="col-span-5 bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none placeholder-gray-400 border border-transparent focus:border-gray-200 transition-all"
              placeholder="Ex. ৳50"
            />
            <div className="col-span-2 flex justify-end pr-1">
              <button className="flex items-center gap-1.5 text-xs font-semibold font-lato text-[#003032] bg-[#F3F4F6] px-4 py-2 rounded-lg hover:bg-gray-200 transition-all whitespace-nowrap">
                <Plus size={14} /> Add New
              </button>
            </div>
          </div>
        </div>
      </section> */}

        {/* 3. Delivery Option — zone dropdown now reflects real zones; COD/price per row still local */}
        {/* <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-[16px] font-normal text-black mb-6">
          Delivery Option
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 text-xs font-normal text-gray-400 px-1">
            <div className="col-span-5 uppercase tracking-wider">
              Specific Delivery Charge
            </div>
            <div className="col-span-5 text-right pr-4 uppercase tracking-wider">
              Charge
            </div>
          </div>

          {zoneRows.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5 bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal">
                  {zoneRows[0].zone || "—"}
                </div>
                <div className="col-span-5 flex items-center bg-[#F8F9FA] rounded-xl px-4 py-3 border border-transparent">
                  <span className="w-full text-right font-semibold text-sm">
                    ৳{zoneRows[0].inside}
                  </span>
                </div>
                <div className="col-span-2" />
              </div>

              <div className="flex justify-between items-center pl-1 pr-2 mt-2">
                <span className="text-[16px] font-normal text-[#003032]">
                  Enable COD for this zone
                </span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">
                      [{zoneCod ? "Yes" : "No"}]
                    </span>
                    <button
                      onClick={() => setZoneCod(!zoneCod)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        zoneCod ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          zoneCod ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-12 gap-4 items-center pt-5 border-t border-gray-100">
            <select className="col-span-5 bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal text-gray-400 outline-none appearance-none cursor-pointer border border-transparent focus:border-gray-200 transition-all">
              <option>Select delivery zone</option>
              {zoneRows.map((z) => (
                <option key={z._rowKey} value={z.zone}>
                  {z.zone}
                </option>
              ))}
            </select>
            <input
              className="col-span-5 bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none placeholder-gray-400 border border-transparent focus:border-gray-200 transition-all"
              placeholder="Price"
            />
            <div className="col-span-2 flex justify-end">
              <button className="flex items-center gap-1.5 text-xs font-semibold font-lato text-[#003032] bg-[#F3F4F6] px-4 py-2 rounded-lg hover:bg-gray-200 transition-all">
                <Plus size={14} /> Add New
              </button>
            </div>
          </div>
        </div>
      </section> */}

        {/* 4. Courier Services — no backend endpoint yet, left static */}
      </div>
      <section className="bg-white p-6 rounded-lg mt-4">
        <h3 className="text-[16px] font-normal text-black mb-6">
          Payment Configuration
        </h3>

        <div className="space-y-5">
          {/* Cash On Delivery Toggle */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[16px] font-normal text-[#003032]">
                Enable Cash on Delivery (COD)
              </span>
              <p className="text-xs text-gray-400">
                Allow customers to pay when they receive the product
              </p>
            </div>
            <button
              onClick={() =>
                togglePayment({
                  cod_enabled: !paymentSettings?.data?.cod_enabled,
                })
              }
              disabled={isUpdatingPayment}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                paymentSettings?.data?.cod_enabled
                  ? "bg-blue-500"
                  : "bg-gray-200"
              } ${isUpdatingPayment ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div
                className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  paymentSettings?.data?.cod_enabled ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-gray-50"></div>

          {/* Online Payment Toggle */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[16px] font-normal text-[#003032]">
                Enable Online Payment
              </span>
              <p className="text-xs text-gray-400">
                Accept BKash, Nagad, Cards via Payment Gateway
              </p>
            </div>
            <button
              onClick={() =>
                togglePayment({
                  online_payment_enabled:
                    !paymentSettings?.data?.online_payment_enabled,
                })
              }
              disabled={isUpdatingPayment}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                paymentSettings?.data?.online_payment_enabled
                  ? "bg-blue-500"
                  : "bg-gray-200"
              } ${isUpdatingPayment ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div
                className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  paymentSettings?.data?.online_payment_enabled
                    ? "right-1"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg mt-4 space-y-5">
        <div>
          <h3 className="text-[16px] font-normal text-black mb-1">
            Courier Services
          </h3>
          <p className="text-xs font-normal text-gray-400">
            Enable and configure your preferred delivery services
          </p>
        </div>

        <div className="bg-white rounded-lg">
          <div className="flex justify-between items-center bg-white">
            <div className="items-center gap-4">
              <div className="relative w-20 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-xl shadow-xs">
                <Image
                  src="/images/admin/pathao.png"
                  alt="Pathao"
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </div>
              <div>
                <span className="text-[10px] text-[#6F6F6F] font-normal px-2 py-0.5 rounded-full  items-center gap-1 mt-0.5">
                  Configured and active
                </span>
              </div>
            </div>

            <button
              onClick={() => setPathaoActive(!pathaoActive)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                pathaoActive ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  pathaoActive ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-gray-100 space-y-5 bg-white">
            <p className="text-xs font-normal text-gray-400 italic">
              Please provide your Pathao credentials to integrate Pathao
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none placeholder-gray-400 border border-transparent focus:border-gray-200 transition-all"
                placeholder="Client ID"
              />
              <input
                className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none placeholder-gray-400 border border-transparent focus:border-gray-200 transition-all"
                placeholder="Store ID"
              />
              <input
                className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none placeholder-gray-400 border border-transparent focus:border-gray-200 transition-all"
                placeholder="Email"
              />
              <input
                className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none placeholder-gray-400 border border-transparent focus:border-gray-200 transition-all"
                placeholder="Client Secret"
              />
              <input
                className="bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm font-normal outline-none placeholder-gray-400 border border-transparent focus:border-gray-200 transition-all md:col-span-2"
                placeholder="Special Instruction (Optional)"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button className="bg-[#1890FF] text-white px-10 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-md">
                Save
              </button>
            </div>
          </div>
        </div>

        {[
          { name: "SteadFast Courier", img: "/images/admin/steadFast.png" },
          { name: "REDX Courier", img: "/images/admin/redx.png" },
          { name: "PAPERFLY", img: "/images/admin/paperfly.png" },
        ].map((courier, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-xl">
                <Image
                  src={courier.img}
                  alt={courier.name}
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h4 className="text-[16px] font-normal text-[#003032]">
                  {courier.name}
                </h4>
                <span className="text-xs font-bold text-gray-400">
                  Configure delivery credentials
                </span>
              </div>
            </div>

            <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer">
              <div className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full" />
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

export default DeliveryChargeContent;
