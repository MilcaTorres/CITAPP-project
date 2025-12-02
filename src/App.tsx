import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdministratorsView } from "./components/Administrators/AdministratorsView";
import { LoginView } from "./components/Auth/LoginView";
import { DashboardView } from "./components/Dashboard/DashboardView";
import { EmployeeView } from "./components/Employee/EmployeeView";
import MainLayout from "./components/Layouts/MainLayout";
import { ProductsView } from "./components/Products/ProductsView";
import { ProfileView } from "./components/Profile/ProfileView";
import { ReportsView } from "./components/Reports/ReportsViews";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./Routes/PrivateRoute";


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
          <Route path="/login" element={<LoginView />} />
          <Route path="/empleado" element={<EmployeeView />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="productos" element={<ProductsView />} />
            <Route
              path="administradores"
              element={
                <AdminRoute>
                  <AdministratorsView />
                </AdminRoute>
              }
            />
            <Route path="reportes" element={<ReportsView />} />
            <Route path="perfil" element={<ProfileView />} />
          </Route>

          {/* Ruta por defecto: redirigir a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
