import Link from "next/link";
import React from "react";

const variants = {
  primary: "bg-brass text-night hover:bg-brass-bright",
  secondary: "border border-line bg-surface text-ivory hover:bg-raised",
  ghost: "text-muted hover:bg-raised hover:text-ivory",
  danger: "border border-ember/50 text-ember hover:bg-ember/10",
};

const sizes = {
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-6 text-base",
};

type Common = {
  text?: string;
  icon?: React.ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children?: React.ReactNode;
};

type ButtonProps = Common &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;
type LinkProps = Common & { href: string };

// A <Link> when given `href`, so links never wrap buttons (invalid HTML and two tab stops).
export default function Button(props: ButtonProps | LinkProps) {
  const {
    text,
    icon,
    variant = "primary",
    size = "md",
    className = "",
    children,
    ...rest
  } = props;
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;
  const content = (
    <>
      {icon && (
        <span aria-hidden="true" className="flex">
          {icon}
        </span>
      )}
      {children ?? text}
    </>
  );

  if ("href" in rest && rest.href) {
    return (
      <Link href={rest.href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      className={classes}
    >
      {content}
    </button>
  );
}
