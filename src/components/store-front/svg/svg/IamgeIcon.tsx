

export default function IamgeIcon({ color, size }: {
    color?: string;
    size?: string;
}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" fill="none">
            <path d="M6 32L14.9393 23.0606C15.6185 22.3816 16.5396 22 17.5 22C18.4604 22 19.3815 22.3816 20.0606 23.0606L28 31M28 31L31 34M28 31L31.9394 27.0606C32.6184 26.3816 33.5396 26 34.5 26C35.4604 26 36.3816 26.3816 37.0606 27.0606L42 32" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 5C15.5405 5 11.3108 5 8.50552 7.39594C8.10716 7.73616 7.73616 8.10716 7.39594 8.50552C5 11.3108 5 15.5405 5 24C5 32.4594 5 36.6892 7.39594 39.4944C7.73616 39.8928 8.10716 40.2638 8.50552 40.604C11.3108 43 15.5405 43 24 43C32.4594 43 36.6892 43 39.4944 40.604C39.8928 40.2638 40.2638 39.8928 40.604 39.4944C43 36.6892 43 32.4594 43 24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M31 11C32.1796 9.78632 35.3194 5 37 5C38.6806 5 41.8204 9.78632 43 11M37 6V19" stroke="#A2A2A2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
