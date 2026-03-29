import { cn } from "@/lib/cn";

type StatusType = "error" | "success" | "info";

interface StatusAlertProps {
  type: StatusType;
  message: string;
}

const classesByType: Record<StatusType, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-sky-200 bg-sky-50 text-sky-700"
};

export function StatusAlert({ type, message }: StatusAlertProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3.5 py-2.5 text-sm font-medium",
        classesByType[type]
      )}
    >
      {message}
    </div>
  );
}

