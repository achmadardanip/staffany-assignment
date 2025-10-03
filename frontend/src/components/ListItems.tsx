import React from "react";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LayersIcon from "@mui/icons-material/Layers";
import { Link as RouterLink } from "react-router-dom";
import { ListItemButton } from "@mui/material";

export const mainListItems = (
  <div>
    <ListItem disablePadding>
      <ListItemButton component={RouterLink} to="/shift">
        <ListItemIcon>
          <LayersIcon />
        </ListItemIcon>
        <ListItemText primary="Shift" />
      </ListItemButton>
    </ListItem>
  </div>
);
