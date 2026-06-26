import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import ProductsPage from './pages/ProductsPage';
import { tokenStore } from './lib/auth';

function RequireAuth({ children }: { children: React.ReactNode }) {
  return tokenStore.get() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={tokenStore.get() ? '/products' : '/login'} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/products"
        element={
          <RequireAuth>
            <ProductsPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
