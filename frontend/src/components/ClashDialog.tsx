import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";

export interface ClashShift {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface ClashDialogProps {
  open: boolean;
  conflictShift?: ClashShift | null;
  onCancel: () => void;
  onIgnore: () => void;
  loading?: boolean;
}

const ClashDialog: React.FC<ClashDialogProps> = ({
  open,
  conflictShift,
  onCancel,
  onIgnore,
  loading = false,
}) => {
  const shift = conflictShift;
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      aria-labelledby="clash-dialog-title"
      aria-describedby="clash-dialog-description"
      disableEscapeKeyDown={loading}
    >
      <DialogTitle id="clash-dialog-title">Shift Clash Warning</DialogTitle>
      <DialogContent>
        {shift ? (
          <>
            <DialogContentText id="clash-dialog-description">
              This shift clashes with an existing shift:
            </DialogContentText>
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
              {shift.name}
            </Typography>
            <Typography variant="body2">Date: {shift.date}</Typography>
            <Typography variant="body2">
              Time: {shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)}
            </Typography>
            <DialogContentText sx={{ mt: 2 }}>
              Do you want to proceed anyway?
            </DialogContentText>
          </>
        ) : (
          <DialogContentText id="clash-dialog-description">
            This shift clashes with an existing shift. Do you want to proceed?
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading} color="primary">
          Cancel
        </Button>
        <Button onClick={onIgnore} disabled={loading} color="primary" autoFocus>
          Ignore
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClashDialog;
