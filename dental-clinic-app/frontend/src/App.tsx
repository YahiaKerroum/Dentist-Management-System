import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from './components/Login';
import { AppRoutes } from './routes/AppRoutes';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/Toaster';

function App() {
  const { token, login } = useAuth();

  return (
    <>
      <Toaster />
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={login} />}
        />
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </>
  );
}

export default App;
