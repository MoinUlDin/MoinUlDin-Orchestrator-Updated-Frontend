// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy } from "react";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import TopNavLayout from "./layouts/TopNavLayout";
import { Toaster } from "react-hot-toast";
const DashboardMain = lazy(() => import("./pages/DashboardMain"));
const LoginPage = lazy(() => import("./pages/auth/Login"));
const WorkingOnPage = lazy(() => import("./pages/WorkingOnPage"));
const ProjectList = lazy(() => import("./pages/ProjectsList"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetailPage"));
const DeploymentLogs = lazy(() => import("./pages/DeploymentLogs"));
const CreateTemplatePage = lazy(() => import("./pages/CreateTemplatePage"));
const TemplateListPage = lazy(() => import("./pages/TemplateListPage"));
const TemplateDetailPage = lazy(() => import("./pages/TemplateDetailPage"));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <main>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <TopNavLayout>
                    <DashboardMain />
                  </TopNavLayout>
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/projects"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <TopNavLayout>
                    <ProjectList />
                  </TopNavLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/project-detail/:slug"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <TopNavLayout>
                    <ProjectDetails />
                  </TopNavLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/projects/:slug/instances/:deploymentId/logs"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <TopNavLayout>
                    <DeploymentLogs />
                  </TopNavLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <TopNavLayout>
                    <TemplateListPage />
                  </TopNavLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/templates/:slug"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <TopNavLayout>
                    <TemplateDetailPage />
                  </TopNavLayout>
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/templates/create-template/:slug"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <TopNavLayout>
                    <CreateTemplatePage />
                  </TopNavLayout>
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/projects/*"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <TopNavLayout>
                    <WorkingOnPage />
                  </TopNavLayout>
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <TopNavLayout>
                    <WorkingOnPage />
                  </TopNavLayout>
                </RoleProtectedRoute>
              }
            />

            <Route
              path="*"
              element={
                <RoleProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <TopNavLayout>
                    <WorkingOnPage />
                  </TopNavLayout>
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </Router>
  );
}

export default App;
