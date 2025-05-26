import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Register from "./pages/Register/Register.tsx";
import Login from "./pages/Login/Login.tsx";
import "./index.css";
import PasswordRecovery from "./pages/PasswordRecovery/PasswordRecovery.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import VerifyAccount from "./pages/VerifyAccount/VerifyAccount.tsx";
import ResetPassword from "./pages/ResetPassword/ResetPassword.tsx";
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import TrainingPlans from "./pages/TrainingPlans/TrainingPlans.tsx";
import Athletes from "./pages/TrainingPlans copy/Athletes.tsx";
import Home from "./pages/Home/Home.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Toaster
      toastOptions={{
        classNames: {
          description: "description",
        },
      }}
    />
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/activate-account/:token" element={<VerifyAccount />} />
      <Route path="/password-recovery" element={<PasswordRecovery />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Dashboard />}>
        <Route path="/dashboard" element={<Home />} />
        <Route path="/dashboard/athletes" element={<Athletes />} />
        <Route path="/dashboard/training-plans" element={<TrainingPlans />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
