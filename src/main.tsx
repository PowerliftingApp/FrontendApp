import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Register from "./pages/Register/Register.tsx";
import Login from "./pages/Login/Login.tsx";
import "./index.css"
import PasswordRecovery from "./pages/PasswordRecovery/PasswordRecovery.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {/* <Toaster /> */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account-verification" element={<Register />} />
        <Route path="/password-recovery" element={<PasswordRecovery />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
