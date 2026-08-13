interface ChatIconProps {
  className?: string;
}

export default function ChatIcon({ className = "" }: ChatIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M8 10H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 14H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 21C16.9706 21 21 17.1944 21 12.5C21 7.80558 16.9706 4 12 4C7.02944 4 3 7.80558 3 12.5C3 13.9314 3.37419 15.2802 4.03665 16.4728C4.22066 16.8041 4.28156 17.1896 4.17708 17.5528L3.5 20L6.21529 19.3162C6.55584 19.2305 6.91531 19.2823 7.22316 19.4524C8.61095 20.2198 10.2547 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}