import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdministratorsView } from "./components/Administrators/AdministratorsView";
import { ForgotPasswordView } from "./components/Auth/ForgotPasswordView";
import { LoginView } from "./components/Auth/LoginView";
import { DashboardView } from "./components/Dashboard/DashboardView";
import { EmployeeView } from "./components/Employee/EmployeeView";
import MainLayout from "./components/Layouts/MainLayout";
import PublicLayout from "./components/Layouts/PublicLayout";
import { NotFoundPage } from "./components/NotFound/NotFoundPage";
import { ProductsView } from "./components/Products/ProductsView";
import { ProfileView } from "./components/Profile/ProfileView";
import { ReportsView } from "./components/Reports/ReportsViews";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthCallback } from "./Routes/AuthCallback";
import PrivateRoute from "./Routes/PrivateRoute";
import { ProtectedRoute } from "./Routes/ProtectedRoute";



// 🔒 Componente para proteger rutas según el rol admin
function AdminRoute({ children }: { children: JSX.Element }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/productos" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Ruta pública */}
          {/* Landing Page - pero también maneja OAuth callback si viene de Google */}
          <Route path="/" element={<AuthCallback />} />

          {/* Ruta pública de Login */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/empleado" element={<EmployeeView />} />

          <Route path="/empleados" element={<PublicLayout />}>
            <Route index element={<EmployeeView />} />
          </Route>

          {/* Rutas protegidas */}
          <Route
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardView />
                </ProtectedRoute>
              }
            />
            <Route path="/productos" element={<ProductsView />} />
            <Route
              path="/administradores"
              element={
                <AdminRoute>
                  <AdministratorsView />
                </AdminRoute>
              }
            />
            <Route path="reportes" element={<ReportsView />} />
            <Route path="perfil" element={<ProfileView />} />

          </Route>

          {/* Ruta 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
