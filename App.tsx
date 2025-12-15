import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './pages/Auth';
import { StudentPortal } from './pages/StudentPortal';
import { AdminPortal } from './pages/AdminPortal';
import { db } from './services/db';
import { User, Role } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = db.auth.getSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    const session = db.auth.getSession();
    setUser(session);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              user.role === Role.ADMIN ? <Navigate to="/admin" /> : <Navigate to="/student" />
            ) : (
              <Auth onLogin={handleLogin} />
            )
          } 
        />
        
        <Route 
          path="/student" 
          element={
            user && user.role === Role.STUDENT ? (
              <StudentPortal user={user} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            user && user.role === Role.ADMIN ? (
              <AdminPortal user={user} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;