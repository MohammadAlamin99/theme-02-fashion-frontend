// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useLanguage } from "@/providers/LanguageProvider";
// import { translations } from "@/locales";

// // React Icons
// import { FiMapPin, FiPhoneCall, FiMail, FiClock } from "react-icons/fi";
// import {
//   FaFacebook,
//   FaInstagram,
//   FaYoutube,
//   FaLinkedin,
//   FaTelegramPlane,
//   FaWhatsapp,
//   FaTwitter,
//   FaTiktok,
// } from "react-icons/fa";
// import { useQuery } from "@tanstack/react-query";
// import { fetchSettings } from "@/services-api/settingsService";
// import { JSX } from "react/jsx-runtime";

// const Footer = () => {
//   const currentYear = new Date().getFullYear();

//   const { data: settings, isLoading } = useQuery({
//     queryKey: ["settings"],
//     queryFn: fetchSettings,
//   });

//   const info = settings?.data || settings;
//   const socialIcons: Record<string, JSX.Element> = {
//     facebook: <FaFacebook />,
//     instagram: <FaInstagram />,
//     youtube: <FaYoutube />,
//     linkedin: <FaLinkedin />,
//     telegram: <FaTelegramPlane />,
//     whatsapp: <FaWhatsapp />,
//     twitter: <FaTwitter />,
//     tiktok: <FaTiktok />,
//   };
//   const backendBaseUrl =
//     process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
//     "http://localhost:8082";
//   const rowImage = info?.footer_logo || "";
//   const iconUrl = rowImage.startsWith("http")
//     ? rowImage
//     : `${backendBaseUrl}/${rowImage.replace(/^\/+/, "")}`;

//   const { language } = useLanguage();
//   const t = translations[language];

//   const footerLinks = {
//     company: [
//       {
//         label: t.footer.companyLinks[0],
//         path: "/legal/about-us",
//       },
//       // {
//       //   label: t.footer.companyLinks[1],
//       //   path: "/shipping",
//       // },
//       {
//         label: t.footer.companyLinks[2],
//         path: "/legal/return-exchange",
//       },
//       {
//         label: t.footer.companyLinks[3],
//         path: "/legal/privacy-policy",
//       },
//       {
//         label: t.footer.companyLinks[4],
//         path: "/legal/terms-condition",
//       },
//       {
//         label: t.footer.companyLinks[5],
//         path: "/faq",
//       },
//     ],

//     account: [
//       {
//         label: t.footer.quickLinks[0],
//         path: "/signin",
//       },
//       {
//         label: t.footer.quickLinks[1],
//         path: "/signup",
//       },
//       {
//         label: t.footer.quickLinks[2],
//         path: "/blog",
//       },
//       // {
//       //   label: t.footer.accountLinks[1],
//       //   path: "/cart",
//       // },
//       // {
//       //   label: t.footer.accountLinks[2],
//       //   path: "/profile/wishlist",
//       // },
//       // {
//       //   label: t.footer.accountLinks[3],
//       //   path: "/track-order",
//       // },
//       // {
//       //   label: t.footer.accountLinks[4],
//       //   path: "/help-ticket",
//       // },
//       {
//         label: t.footer.quickLinks[5],
//         path: "/",
//       },
//     ],

//     corporate: [
//       // {
//       //   label: t.footer.corporateLinks[0],
//       //   path: "/vendor/register",
//       // },
//       // {
//       //   label: t.footer.corporateLinks[1],
//       //   path: "/affiliate-program",
//       // },
//       {
//         label: t.footer.corporateLinks[2],
//         path: "/blog",
//       },
//       // {
//       //   label: t.footer.corporateLinks[5],
//       //   path: "/suppliers",
//       // },
//     ],
//   };

//   return (
//     <footer className="w-full bg-white font-inter">
//       <div className="max-w-[1720px] mx-auto px-4 md:px-10">
//         {/* --- Top Section: Links & Info --- */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-5 mb-3 md:mb-2">
//           <div className="col-span-2 lg:col-span-1">
//             <Link
//               href="/"
//               className="inline-block mb-6 md:mb-8 max-w-[180px] sm:max-w-[210px] md:max-w-[230px] w-full"
//             >
//               {isLoading ? (
//                 <div className="w-[230px] h-[64px] animate-pulse bg-gray-100 rounded" />
//               ) : (
//                 <Image
//                   src={iconUrl}
//                   alt="Creass Mart"
//                   width={230}
//                   height={64}
//                   className="w-full object-contain"
//                   priority
//                   unoptimized
//                   style={{ height: "auto" }}
//                 />
//               )}
//             </Link>

//             <div className="space-y-5">
//               <div className="flex items-start gap-3">
//                 <FiMapPin className="text-[#7FB63F] text-xl shrink-0 mt-1" />
//                 <p className="text-[#727272] text-[15px] font-medium leading-normal">
//                   <span className="text-[#727272] font-bold">
//                     {t.footer.address}:
//                   </span>{" "}
//                   {info?.address || "Dhaka, Bangladesh"}
//                 </p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <FiPhoneCall className="text-[#7FB63F] text-xl shrink-0" />
//                 <p className="text-[#727272] text-[15px] font-medium leading-normal">
//                   <span className="text-[#727272] font-bold">
//                     {t.footer.callUs}:
//                   </span>{" "}
//                   {info?.contact_phone || "+88 0141-0050041"}
//                 </p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <FiMail className="text-[#7FB63F] text-xl shrink-0" />
//                 <p className="text-[#727272] text-[15px] font-medium leading-normal">
//                   <span className="text-[#727272] font-bold">
//                     {t.footer.email}:
//                   </span>{" "}
//                   {info?.contact_email || "info@creasssmart.com"}
//                 </p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <FiClock className="text-[#7FB63F] text-xl shrink-0" />
//                 <p className="text-[#727272] text-[15px] font-medium leading-normal">
//                   <span className="text-[#727272] font-bold">
//                     {t.footer.hours}:
//                   </span>{" "}
//                   {t.footer.officeHours}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Column 2: Company */}
//           <div>
//             <h4 className="text-black font-poppins text-[20px] md:text-[22px] font-semibold mb-6 md:mb-8">
//               {t.footer.company}
//             </h4>
//             <ul className="space-y-4">
//               {footerLinks.company.map((link) => (
//                 <li key={link.label}>
//                   <Link
//                     href={link.path}
//                     className="text-[#727272] hover:text-[#7FB63F] transition-colors text-[15px] font-medium"
//                   >
//                     {link.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Column 3: Account */}
//           <div>
//             <h4 className="text-black font-poppins text-[20px] md:text-[22px] font-semibold mb-6 md:mb-8">
//               {t.footer.QuickLink}
//             </h4>
//             <ul className="space-y-4">
//               {footerLinks.account.map((link) => (
//                 <li key={link.path}>
//                   <Link
//                     href={link.path}
//                     className="text-[#727272] hover:text-[#7FB63F] transition-colors text-[15px] font-medium"
//                   >
//                     {link.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Column 4: Corporate */}
//           {/* <div>
//             <h4 className="text-black font-poppins text-[20px] md:text-[22px] font-semibold mb-6 md:mb-8">
//               {t.footer.corporate}
//             </h4>
//             <ul className="space-y-4">
//               {footerLinks.corporate.map((link) => (
//                 <li key={link.path}>
//                   <Link
//                     href={link.path}
//                     className="text-[#727272] hover:text-[#FF7050] transition-colors text-[15px] font-medium"
//                   >
//                     {link.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div> */}

//           {/* Column 5: Socials */}
//           <div>
//             <h4 className="text-black font-poppins text-[20px] md:text-[22px] font-semibold mb-6 md:mb-8">
//               {t.footer.getInTouch}
//             </h4>
//             <div className="space-y-5">
//               {info?.social_links?.map(
//                 (social: { platform: string; url: string }) => (
//                   <Link
//                     key={social.platform}
//                     href={social.url || "#"}
//                     target="_blank"
//                     className="flex items-center gap-3 group"
//                   >
//                     <div
//                       className={`text-[#7FB63F] text-2xl group-hover:scale-110 transition-transform`}
//                     >
//                       {socialIcons[social.platform.toLowerCase()] || (
//                         <FaFacebook />
//                       )}
//                     </div>
//                     <span className="text-[#727272] text-[14px] font-medium group-hover:text-black transition-colors truncate">
//                       {social.url}
//                     </span>
//                   </Link>
//                 ),
//               )}
//             </div>
//             {/*
//             <div className="flex items-center gap-2 mt-4 cursor-pointer">
//               <LocationIcon />
//               <span className="text-[#727272] text-[12px] font-medium whitespace-nowrap hover:font-semibold transition-all">
//                 {t.storeLocation}
//               </span>
//             </div> */}
//           </div>
//         </div>

//         {/* --- Payment Logos Section --- */}
//         {/* <div className="w-full border-b border-[#D9DBE9] py-6">
//           <div className="flex flex-wrap justify-center gap-2">
//             <Image
//               src="/images/paymentIcons.png"
//               alt="Payments"
//               width={1709}
//               height={40}
//               className="object-contain"
//             />
//           </div>
//         </div> */}

//         {/* --- Bottom Copyright --- */}
//         <div className="py-4 text-center  border-t border-[#D9DBE9]">
//           <p className="text-[#727272] text-[15px] font-medium">
//             {t.footer.developedBy}{" "}
//             <Link href={"https://codeandget.com"} target="_blank">
//               <Image
//                 src={"/images/admin/logo.png"}
//                 alt="Code and Get"
//                 width={100}
//                 height={20}
//                 className="inline-block mr-1.5"
//               />
//             </Link>
//             | {t.footer.copyright} {currentYear} © Overseas.{" "}
//             {t.footer.allRightsReserved}
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchSettings } from "@/services-api/settingsService";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

// Icons
import { Globe } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaTelegramPlane,
  FaWhatsapp,
  FaTwitter,
  FaTiktok,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { language } = useLanguage();
  const t = translations[language];

  // data fetching
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const info = settings?.data || settings;
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  // logo url filter
  const rawLogo = info?.footer_logo || info?.header_logo || "";
  const logoUrl = rawLogo.startsWith("http")
    ? rawLogo
    : `${backendBaseUrl}/${rawLogo.replace(/^\/+/, "")}`;

  // social icon
  const socialIcons: Record<string, React.ReactNode> = {
    facebook: <FaFacebook size={20} />,
    instagram: <FaInstagram size={20} />,
    youtube: <FaYoutube size={20} />,
    linkedin: <FaLinkedin size={20} />,
    telegram: <FaTelegramPlane size={20} />,
    whatsapp: <FaWhatsapp size={20} />,
    twitter: <FaTwitter size={20} />,
    tiktok: <FaTiktok size={20} />,
  };

  // footwer link
  const navLinks = [
    { label: t.footer.companyLinks[0] || "About us", path: "/legal/about-us" },
    {
      label: t.footer.companyLinks[3] || "Privacy Policy",
      path: "/legal/privacy-policy",
    },
    {
      label: t.footer.companyLinks[4] || "Terms & Condition",
      path: "/legal/terms-condition",
    },
    { label: t.footer.companyLinks[5] || "FAQ", path: "/faq" },
  ];

  return (
    <footer className="w-full bg-white font-inter mt-10">
      {/* --- Middle Footer (Dynamic Logo & Links) --- */}
      <div className="max-w-[1170px] mx-auto px-4 sm:px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
        {/* Dynamic Logo */}
        <Link href="/" className="shrink-0">
          {isLoading ? (
            <div className="w-[150px] h-[50px] bg-gray-100 animate-pulse rounded" />
          ) : (
            <Image
              src={logoUrl || "/images/logo.svg"}
              alt="Logo"
              width={150}
              height={50}
              className="w-[120px] md:w-[150px] h-auto object-contain"
              unoptimized
              priority
            />
          )}
        </Link>

        {/* Dynamic Nav Links */}
        <nav className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className="text-[#707070] hover:text-[#0D285C] font-normal font-lato transition-colors text-sm md:text-base"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Dynamic Social Icons */}
        <div className="flex gap-4 md:gap-[20px]">
          {info?.social_links?.map(
            (social: { platform: string; url: string }) => (
              <Link
                key={social.platform}
                href={social.url || "#"}
                target="_blank"
              >
                <div className="bg-[#686BC614] text-[#0D285C] w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-[#0D285C] hover:text-white">
                  {socialIcons[social.platform.toLowerCase()] || (
                    <Globe size={20} />
                  )}
                </div>
              </Link>
            ),
          )}
          {/* Default Globe if no links provided */}
          {(!info?.social_links || info.social_links.length === 0) && (
            <Link href="https://www.codeandget.com/" target="_blank">
              <div className="bg-[#686BC614] text-[#0D285C] w-10 h-10 rounded-full flex items-center justify-center">
                <Globe size={20} />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* --- Bottom Copyright (Dynamic Year & Text) --- */}
      <div className="w-full bg-[#0D285C] py-6">
        <div className="max-w-[1440px] mx-auto px-4 text-center">
          <p className="text-white text-sm md:text-base font-normal tracking-wide font-lato">
            © {currentYear} {info?.site_name || "Code & Get"},{" "}
            {t.footer.allRightsReserved || "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
