// import ProfileSidebar from "@/components/store-front/profile/ProfileSidebar";
// import React from "react";

// export default function AccountLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="bg-[#FDFDFD] md:py-14 py-8 px-4 md:px-10 lg:px-20 font-poppins">
//       <div className="max-w-[1720px] mx-auto">
//         <h1 className="text-2xl font-semibold mb-8 text-black">My Account</h1>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
//           {/* Fixed/Reusable Sidebar Column */}
//           <aside className="lg:col-span-3">
//             <ProfileSidebar />
//           </aside>

//           {/* Dynamic Content Column */}
//           <main className="lg:col-span-9">{children}</main>
//         </div>
//       </div>
//     </div>
//   );
// }


import ProfileSidebar from "@/components/store-front/profile/ProfileSidebar";
import React from "react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#FDFDFD] md:py-14 py-8 px-4 md:px-10 lg:px-20 font-poppins">
      <div className="max-w-[1720px] mx-auto">
        <h1 className="text-2xl font-semibold mb-8 text-black">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Reusable Core Sidebar Grid Position */}
          <aside className="lg:col-span-3">
            <ProfileSidebar />
          </aside>

          {/* Core Dashboard Workspace */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}