"use client";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

interface MessageProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
}

const styles = {
  success: { tone: "border-moss/40 text-moss", Icon: CircleCheck },
  error: { tone: "border-ember/40 text-ember", Icon: CircleAlert },
  info: { tone: "border-line text-muted", Icon: Info },
};

export default function Message({
  message,
  type = "info",
  onClose,
}: MessageProps) {
  const { tone, Icon } = styles[type];
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface px-4 py-3 shadow-lg shadow-black/30 ${tone}`}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm text-ivory">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="-m-2 flex size-9 items-center justify-center rounded-lg text-muted hover:text-ivory"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
