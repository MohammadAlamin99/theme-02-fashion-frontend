// "use client";
// import React, { useEffect } from "react";
// import { useForm, FormProvider } from "react-hook-form";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useRouter, useSearchParams } from "next/navigation";
// import { ArrowLeft, Loader2, Save } from "lucide-react";
// import {
//   createUnit,
//   updateUnit,
//   fetchSingleUnit,
// } from "@/services-api/unitService";
// import PrimaryButton from "../../../common/PrimaryButton";

// export default function AddUnitMain() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const unitId = searchParams.get("id");
//   const isEditMode = !!unitId;

//   const methods = useForm({
//     defaultValues: { name: "", slug: "", priority: 100, status: "active" },
//   });
//   const { register, handleSubmit, reset } = methods;

//   const { data: response, isLoading } = useQuery({
//     queryKey: ["unit-single", unitId],
//     queryFn: () => fetchSingleUnit(unitId!),
//     enabled: isEditMode,
//   });

//   useEffect(() => {
//     if (response?.data) {
//       reset(response.data);
//     }
//   }, [response, reset]);

//   const mutation = useMutation({
//     mutationFn: (data: any) =>
//       isEditMode ? updateUnit(unitId!, data) : createUnit(data),
//     onSuccess: () => {
//       alert("Unit saved successfully!");
//       router.push("/admin/dashboard/unit");
//     },
//     onError: (err: any) => alert(err.message),
//   });

//   if (isEditMode && isLoading)
//     return (
//       <div className="p-10 text-center">
//         <Loader2 className="animate-spin mx-auto" />
//       </div>
//     );

//   return (
//     <div className="pt-8 px-6">
//       {" "}
//       {/* Added top padding here */}
//       <FormProvider {...methods}>
//         <form
//           onSubmit={handleSubmit((d) => mutation.mutate(d))}
//           className="bg-white max-w-2xl mx-auto rounded-xl border border-gray-100 shadow-sm overflow-hidden"
//         >
//           {/* Header Section */}
//           <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center gap-4">
//             <button
//               type="button"
//               onClick={() => router.back()}
//               className="p-2 hover:bg-gray-200 rounded-full transition"
//             >
//               <ArrowLeft size={20} className="text-gray-600" />
//             </button>
//             <h1 className="text-xl font-bold text-[#003032]">
//               {isEditMode ? "Edit Unit Information" : "Create New Unit"}
//             </h1>
//           </div>

//           {/* Form Fields */}
//           <div className="p-6 space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Unit Name
//                 </label>
//                 <input
//                   {...register("name", { required: true })}
//                   placeholder="e.g. Kilogram"
//                   className="w-full p-3 bg-[#F9F9F9] rounded-lg border border-transparent focus:border-[#1DA1F2] outline-none transition"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Slug
//                 </label>
//                 <input
//                   {...register("slug", { required: true })}
//                   placeholder="e.g. kg"
//                   className="w-full p-3 bg-[#F9F9F9] rounded-lg border border-transparent focus:border-[#1DA1F2] outline-none transition"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Priority
//                 </label>
//                 <input
//                   type="number"
//                   {...register("priority")}
//                   className="w-full p-3 bg-[#F9F9F9] rounded-lg border border-transparent focus:border-[#1DA1F2] outline-none transition"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Status
//                 </label>
//                 <select
//                   {...register("status")}
//                   className="w-full p-3 bg-[#F9F9F9] rounded-lg border border-transparent focus:border-[#1DA1F2] outline-none transition cursor-pointer"
//                 >
//                   <option value="active">Publish</option>
//                   <option value="draft">Draft</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Footer Actions */}
//           <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
//             <PrimaryButton
//               label={mutation.isPending ? "Saving..." : "Save Changes"}
//               type="submit"
//               className="px-8 py-3 flex items-center gap-2"
//             />
//           </div>
//         </form>
//       </FormProvider>
//     </div>
//   );
// }
