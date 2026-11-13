import React from "react";

type FieldProps = {
  label: string;
  id: string;
  hint?: string;
  trailing?: React.ReactNode;
  multiline?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const inputClasses =
  "w-full rounded-xl border border-line bg-raised px-4 py-3 text-ivory placeholder:text-muted/70 focus:border-amber focus:outline-none";

export default function Field({
  label,
  id,
  hint,
  trailing,
  multiline,
  ...input
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ivory">
        {label}
      </label>
      <div className="relative">
        {multiline ? (
          <textarea
            id={id}
            name={id}
            aria-describedby={hintId}
            className={inputClasses}
            {...input}
          />
        ) : (
          <input
            id={id}
            name={id}
            aria-describedby={hintId}
            className={`${inputClasses} ${trailing ? "pr-12" : ""}`}
            {...input}
          />
        )}
        {trailing && (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {trailing}
          </div>
        )}
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
