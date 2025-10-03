import React from "react";
import "./App.css";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Dashboard from "./layouts/Dashboard";
import Home from "./pages/Home";
import Shift from "./pages/Shift";
import ShiftForm from "./pages/ShiftForm";
import { ThemeProvider } from "@mui/material";
import { staffanyTheme } from "./commons/theme";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={staffanyTheme}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <Dashboard>
                <Home />
              </Dashboard>
            </Route>
            <Route exact path="/shift">
              <Dashboard>
                <Shift />
              </Dashboard>
            </Route>
            <Route exact path="/shift/add">
              <Dashboard>
                <ShiftForm />
              </Dashboard>
            </Route>
            <Route exact path="/shift/:id/edit">
              <Dashboard>
                <ShiftForm />
              </Dashboard>
            </Route>
          </Switch>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
