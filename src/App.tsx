import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginView } from './components/Auth/LoginView';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ProductsView } from './components/Products/ProductsView';
import { AdministratorsView } from './components/Administrators/AdministratorsView';
import { ProfileView } from './components/Profile/ProfileView';

function AppContent() {
  const { user, usuario, loading, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !usuario) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <Sidebar currentView="products" onViewChange={setCurrentView} />
          <div className="flex-1">
            <Header onProfileClick={() => setCurrentView('login')} />
            <main className="p-8">
              {currentView === 'login' ? (
                <LoginView />
              ) : (
                <ProductsView />
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductsView />;
      case 'administrators':
        return isAdmin ? <AdministratorsView /> : <ProductsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="flex-1">
          <Header onProfileClick={() => setCurrentView('profile')} />
          <main className="p-8">{renderView()}</main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
