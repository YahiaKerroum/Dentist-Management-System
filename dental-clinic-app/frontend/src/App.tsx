import { useState } from 'react';
import { Login } from './components/Login';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  const [token, setToken] = useState<string | null>(() => {
    // Check if token exists in localStorage
    return localStorage.getItem('token');
  });

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <MainLayout token={token} onLogout={handleLogout} />;
}

export default App;

