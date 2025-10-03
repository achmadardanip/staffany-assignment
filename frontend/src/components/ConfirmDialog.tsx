import React, { FunctionComponent } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";

interface Prop {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onYes: () => void;
  loading?: boolean;
}

const ConfirmDialog: FunctionComponent<Prop> = ({
  open,
  onClose,
  onYes,
  title,
  description,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      disableEscapeKeyDown={loading}
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {loading ? (
          <CircularProgress style={{ marginBottom: 10, marginRight: 10 }} />
        ) : (
          <div>
            <Button onClick={() => onClose()} color="primary">
              Cancel
            </Button>
            <Button onClick={() => onYes()} color="primary" autoFocus>
              Yes
            </Button>
          </div>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
