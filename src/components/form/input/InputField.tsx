import * as React from "react";

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  hint?: string;
  success?: boolean;
  error?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      hint,
      success = false,
      error = false,
      disabled = false,
      id,
      ...rest
    },
    ref
  ) => {
    // Base styles
    let inputClasses =
      "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs " +
      "placeholder:text-gray-400 focus:outline-hidden focus:ring-3 " +
      "dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ";

    // State styles (ưu tiên: disabled > error > success > default)
    if (disabled) {
      inputClasses +=
        " text-gray-500 border-gray-300 cursor-not-allowed " +
        "dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    } else if (error) {
      inputClasses +=
        " bg-transparent text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10 " +
        "dark:text-error-400 dark:border-error-500";
    } else if (success) {
      inputClasses +=
        " bg-transparent text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300 " +
        "dark:text-success-400 dark:border-success-500";
    } else {
      inputClasses +=
        " bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 " +
        "dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";
    }

    // id cho hint (a11y)
    const hintId = hint && id ? `${id}-hint` : undefined;

    return (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          className={`${inputClasses} ${className}`}
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-describedby={hintId}
          {...rest} // ⬅️ value, onChange, type, placeholder, autoComplete, required, min, max, step, v.v... đều đi qua đây
        />

        {hint ? (
          <p
            id={hintId}
            className={`mt-1.5 text-xs ${
              error
                ? "text-error-500"
                : success
                ? "text-success-500"
                : "text-gray-500"
            }`}
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
