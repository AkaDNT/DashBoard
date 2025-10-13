import React, { ReactNode } from "react";

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

interface ButtonProps extends Omit<NativeButtonProps, "children"> {
  children: ReactNode;                 // Button text or content
  size?: "sm" | "md";                  // Button size
  variant?: "primary" | "outline";     // Button variant
  startIcon?: ReactNode;               // Icon before the text
  endIcon?: ReactNode;                 // Icon after the text
  isLoading?: boolean;                 // Optional loading state
  className?: string;                  // Extra classes
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  className = "",
  disabled = false,
  isLoading = false,
  ...rest // <-- chứa type, onClick, formAction, v.v.
}) => {
  // Size Classes
  const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-4 py-3 text-sm rounded-lg",
    md: "px-5 py-3.5 text-sm rounded-lg",
  };

  // Variant Classes
  const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 disabled:bg-brand-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  };

  const computedDisabled = disabled || isLoading;

  return (
    <button
      className={`inline-flex items-center justify-center font-medium gap-2 transition select-none ${sizeClasses[size]} ${variantClasses[variant]} ${
        computedDisabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
      disabled={computedDisabled}
      aria-busy={isLoading || undefined}
      {...rest} // <-- đảm bảo nhận 'type="submit"', 'onClick', v.v.
    >
      {/* Start icon or spinner */}
      {isLoading ? (
        <svg
          className="-ml-0.5 mr-1 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" opacity="0.25" />
          <path d="M22 12a10 10 0 0 1-10 10" />
        </svg>
      ) : (
        startIcon && <span className="flex items-center -ml-0.5">{startIcon}</span>
      )}

      <span>{children}</span>

      {endIcon && !isLoading && (
        <span className="flex items-center -mr-0.5">{endIcon}</span>
      )}
    </button>
  );
};

export default Button;
