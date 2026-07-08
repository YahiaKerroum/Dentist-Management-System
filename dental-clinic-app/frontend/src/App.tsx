import { Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Login } from './components/Login';
import { AppRoutes } from './routes/AppRoutes';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/Toaster';

function App() {
  const { token, login } = useAuth();

  return (
    <MotionConfig reducedMotion="user">
      <Toaster />
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={login} />}
        />
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </MotionConfig>
  );
}

export default App;
