import Alert from "@mui/material/Alert";
import { MuiScopedProvider } from "@/components/providers/MuiScopedProvider";

type StatusType = "error" | "success" | "info";

interface StatusAlertProps {
  type: StatusType;
  message: string;
}

const severityByType: Record<StatusType, "error" | "success" | "info"> = {
  error: "error",
  success: "success",
  info: "info"
};

export function StatusAlert({ type, message }: StatusAlertProps) {
  return (
    <MuiScopedProvider>
      <Alert
        severity={severityByType[type]}
        variant="outlined"
        sx={{
          borderRadius: 3,
          fontSize: "0.9rem",
          fontWeight: 600
        }}
      >
        {message}
      </Alert>
    </MuiScopedProvider>
  );
}
