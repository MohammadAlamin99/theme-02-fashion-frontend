"use client";

const MenuButton = ({
  onClick,
  isActive,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded hover:bg-gray-100 transition-colors ${
      isActive ? "bg-gray-200 text-blue-600" : "text-gray-500"
    }`}
  >
    {children}
  </button>
);

export default MenuButton;
