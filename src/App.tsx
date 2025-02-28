import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import AuthForm from './components/AuthForm';
import HomePage from './pages/HomePage';
import AlbumPage from './pages/AlbumPage';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route
            path="/"
            element={user ? <HomePage /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/auth"
            element={!user ? <AuthForm /> : <Navigate to="/" replace />}
          />
          <Route
            path="/album/:id"
            element={user ? <AlbumPage /> : <Navigate to="/auth" replace />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;