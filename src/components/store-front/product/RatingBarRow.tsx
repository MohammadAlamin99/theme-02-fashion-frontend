import { FaStar } from "react-icons/fa";

export default function RatingBarRow({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* উপরের অংশ: স্টার এবং রেটিং সংখ্যা */}
      <div className="flex justify-between items-center px-1">
        <div className="flex text-[#FDCC0D] text-[12px] gap-[3px]">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={i < star ? "text-[#FDCC0D]" : "text-[#F9F9F9]"}
            />
          ))}
        </div>
        <span className="text-[12px] font-medium text-[#FF7050]">{count}</span>
      </div>

      {/* নিচের অংশ: কাস্টম আউটলাইনড প্রোগ্রেস বার */}
      <div className="w-full h-[8px] bg-white border border-[#FF7050] rounded-full p-[1px] flex items-center">
        <div
          className="h-full bg-[#FF7050] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
