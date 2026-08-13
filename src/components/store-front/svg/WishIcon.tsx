interface WishIconProps {
  className?: string;
  color?: string;
}

export default function WishIcon({ 
  className = "", 
  color = "#FF7050"
}: WishIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 28 28"
      fill="none"
      className={className}
    >
      <path
        d="M19.4783 3.5C17.0937 3.5 15.0345 4.8965 13.9997 6.9335C12.9648 4.8965 10.9057 3.5 8.52101 3.5C5.10267 3.5 2.33301 6.3665 2.33301 9.8945C2.33301 13.4225 4.45284 16.6565 7.19217 19.313C9.93151 21.9695 13.9997 24.5 13.9997 24.5C13.9997 24.5 17.936 22.0115 20.8072 19.313C23.8697 16.436 25.6663 13.433 25.6663 9.8945C25.6663 6.356 22.8967 3.5 19.4783 3.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
