import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Sidebar from './components/Sidebar';
import MatrixBackground from './components/MatrixBackground';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TextEncryptPage from './pages/TextEncryptPage';
import FileEncryptPage from './pages/FileEncryptPage';
import ImageEncryptPage from './pages/ImageEncryptPage';
import SecurityAnalysisPage from './pages/SecurityAnalysisPage';
import ComparisonPage from './pages/ComparisonPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <MatrixBackground />
      <Sidebar />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <AppLayout><DashboardPage /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/encrypt/text" element={
          <PrivateRoute>
            <AppLayout><TextEncryptPage /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/encrypt/file" element={
          <PrivateRoute>
            <AppLayout><FileEncryptPage /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/encrypt/image" element={
          <PrivateRoute>
            <AppLayout><ImageEncryptPage /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/analysis" element={
          <PrivateRoute>
            <AppLayout><SecurityAnalysisPage /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/compare" element={
          <PrivateRoute>
            <AppLayout><ComparisonPage /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute>
            <AppLayout><ReportsPage /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <AppLayout><ProfilePage /></AppLayout>
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <AppLayout><AdminPage /></AppLayout>
          </AdminRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
