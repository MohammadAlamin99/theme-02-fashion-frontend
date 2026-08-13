import {
  FaLinkedinIn,
  FaTwitter,
  FaFacebookF,
  FaWhatsapp,
} from "react-icons/fa";
import { FiLink } from "react-icons/fi";

export default function BlogShare() {
  const platforms = [
    { name: "LinkedIn", icon: <FaLinkedinIn />, color: "bg-[#0077B5]" },
    { name: "Twitter", icon: <FaTwitter />, color: "bg-[#1DA1F2]" },
    { name: "Facebook", icon: <FaFacebookF />, color: "bg-[#1877F2]" },
    { name: "Whatsapp", icon: <FaWhatsapp />, color: "#25D366" },
    { name: "Copy", icon: <FiLink />, color: "bg-[#FF7050]" },
  ];

  return (
    <section className="container mx-auto px-4 py-10 border-t border-gray-100">
      <p className="text-xs font-bold text-gray-400 uppercase mb-4">Share:</p>
      <div className="flex flex-wrap gap-3">
        {platforms.map((p) => (
          <button
            key={p.name}
            className={`${p.name === "Whatsapp" ? "bg-[#25D366]" : p.color} text-white flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-transform active:scale-95`}
          >
            {p.icon} <span className="hidden md:inline">{p.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
