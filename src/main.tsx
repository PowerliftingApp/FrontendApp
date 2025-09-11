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
import Athletes from "./pages/Athletes/Athletes.tsx";
import Home from "./pages/Home/Home.tsx";
import Templates from "./pages/Templates/Templates.tsx";
import TrainingPlansDetail from "./pages/TrainingPlansDetail/TrainingPlansDetail.tsx";
import CreateTrainingPlan from "./pages/CreateTrainingPlan/CreateTrainingPlan.tsx";
import EditTrainingPlan from "./pages/EditTrainingPlan/EditTrainingPlan.tsx";
import Settings from "./pages/Settings/Settings.tsx";

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
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/athletes" element={<Athletes />} />
        <Route path="/dashboard/training-plans" element={<TrainingPlans />} />
        <Route path="/dashboard/templates" element={<Templates />} />
        <Route
          path="/dashboard/training-plans/detail"
          element={<TrainingPlansDetail />}
        />
        <Route
          path="/dashboard/training-plans/create"
          element={<CreateTrainingPlan />}
        />
        <Route
          path="/dashboard/training-plans/edit"
          element={<EditTrainingPlan />}
        />
      </Route>
    </Routes>
  </BrowserRouter>
);
