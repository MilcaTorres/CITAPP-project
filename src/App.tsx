import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginView } from "./components/Auth/LoginView";
import { DashboardView } from "./components/Dashboard/DashboardView";
import { ProductsView } from "./components/Products/ProductsView";
import { AdministratorsView } from "./components/Administrators/AdministratorsView";
import { ProfileView } from "./components/Profile/ProfileView";
import MainLayout from "./components/Layouts/MainLayout";
import PrivateRoute from "./Routes/PrivateRoute";
import { ReportsView } from "./components/Reports/ReportsViews";


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
           <Route path="reportes" element={<ReportsView/>} />
            <Route path="perfil" element={<ProfileView />} />
          </Route>

          {/* Ruta por defecto: redirigir a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
