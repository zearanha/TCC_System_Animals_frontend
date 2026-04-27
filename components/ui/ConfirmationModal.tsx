"use client";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { MuiScopedProvider } from "@/components/providers/MuiScopedProvider";
import { Button } from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  isLoading = false,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  return (
    <MuiScopedProvider>
      <Dialog
        open={isOpen}
        onClose={isLoading ? undefined : onCancel}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "16px", border: "1px solid #d5e1d8" } }}
      >
        <DialogTitle sx={{ fontFamily: "Archivo, sans-serif", fontWeight: 700, color: "#273a2b" }}>
          {title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#60756a" }}>
            {message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </MuiScopedProvider>
  );
}
