import { useState } from "react";
import { FaStar } from "react-icons/fa";

export default function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl transition-colors"
        >
          <FaStar
            className={
              star <= (hovered || value) ? "text-[#FFD700]" : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
}
