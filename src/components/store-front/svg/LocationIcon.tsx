interface LocationIconProps {
  className?: string;
  color?: string;
}

export default function LocationIcon({ 
  className = "", 
  color = "#FF7050"
}: LocationIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M6.39951 4.75953C7.88982 3.29902 9.89631 2.48566 11.9829 2.49619C14.0696 2.50673 16.0677 3.34032 17.5432 4.81581C19.0187 6.2913 19.8523 8.28946 19.8628 10.3761C19.8734 12.4627 19.06 14.4692 17.5995 15.9595L13.4135 20.1455C13.0385 20.5205 12.5298 20.7311 11.9995 20.7311C11.4692 20.7311 10.9606 20.5205 10.5855 20.1455L6.39951 15.9595C4.91439 14.4743 4.08008 12.4599 4.08008 10.3595C4.08008 8.25915 4.91439 6.24479 6.39951 4.75953Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 13.3594C13.6569 13.3594 15 12.0162 15 10.3594C15 8.70252 13.6569 7.35938 12 7.35938C10.3431 7.35938 9 8.70252 9 10.3594C9 12.0162 10.3431 13.3594 12 13.3594Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}