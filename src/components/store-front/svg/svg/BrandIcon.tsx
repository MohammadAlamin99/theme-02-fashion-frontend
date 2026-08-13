interface BrandIconProps {
    className?: string;
}

export default function BrandIcon({ className }: BrandIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className={className}
        >
            <mask id="mask0_87_1332" maskUnits="userSpaceOnUse" x="3" y="1" width="18" height="22">
                <path d="M4 22V3C4 2.73478 4.10536 2.48043 4.29289 2.29289C4.48043 2.10536 4.73478 2 5 2H19C19.2652 2 19.5196 2.10536 19.7071 2.29289C19.8946 2.48043 20 2.73478 20 3V22L12 17.8635L4 22Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                <path d="M8 9H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </mask>
            <g mask="url(#mask0_87_1332)">
                <path d="M0 0H24V24H0V0Z" fill="currentColor" />
            </g>
        </svg>
    );
}