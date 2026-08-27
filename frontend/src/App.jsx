import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import ResendEmailVerification from "./pages/ResendEmailVerification.jsx";
import Projects from "./pages/Projects.jsx";
import CreateProject from "./pages/CreateProject.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
import TaskDetails from "./pages/TaskDetails.jsx";
import Dashboard from "./pages/Dashboard.jsx"

import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/create" element={<CreateProject />} />
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/resend-email-verification" element={<ResendEmailVerification />} />
            <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetails />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;