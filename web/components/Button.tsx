import React from "react";

type ButtonProps = {
  text: string;
  color?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const colorMap = {
  red: "bg-red-400",
  sky: "bg-sky-400",
};

const hoverMap = {
  red: "bg-red-700",
  sky: "bg-sky-700",
};

export default function Button({
  text,
  color,
  icon,
  disabled = false,
  onClick,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`relative box-border inline-flex items-center justify-center h-11 px-4 py-3 rounded-lg border-b-4 border-solid border-transparent ${color ? colorMap.red : colorMap.sky} text-sm font-bold uppercase tracking-wider text-white transition-all duration-200
        brightness-110 active:border-b-0 active:border-t-4 active:bg-none w-full self-center
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
      `}
      {...props}
    >
      {icon && <span className="mr-2 flex items-center">{icon}</span>}
      {text}
      {/* Optional background effect */}
      <span
        className={`absolute inset-0 -z-10 rounded-lg border-b-4 border-solid border-transparent ${color === "red" ? hoverMap.red : hoverMap.sky}`}
      />
    </button>
  );
}
