import React from 'react';

type ButtonProps = {
  text: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  text,
  icon,
  disabled = false,
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`relative box-border inline-flex items-center justify-center h-11 px-4 py-3 rounded-lg border-b-4 border-solid border-transparent bg-sky-600 text-sm font-bold uppercase tracking-wider text-white transition-all duration-200
        brightness-110 active:border-b-0 active:border-t-4 active:bg-none w-full self-center
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
      {...props}
    >
      {icon && (
        <span className="mr-2 flex items-center">
          {icon}
        </span>
      )}
      {text}
      {/* Optional background effect */}
      <span className="absolute inset-0 -z-10 rounded-lg border-b-4 border-solid border-transparent bg-sky-500" />
    </button>
  );
}
