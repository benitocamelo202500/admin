import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { AdminUser } from './lib/supabase';

function App() {
  const [user, setUser] = useState<AdminUser | null>(null);

  const handleLogin = (loggedInUser: AdminUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
