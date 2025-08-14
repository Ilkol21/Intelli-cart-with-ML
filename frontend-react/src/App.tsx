// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import { AuthContext } from './context/AuthContext';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ShoppingListsPage } from './pages/ShoppingListsPage';
import { ListPage } from './pages/ListPage';
import { Notifications } from './components/Notifications'; // <-- Імпортуємо

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const setAuthToken = (newToken: string | null, userData: any = null) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    }
    setToken(newToken);
    setUser(userData);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) {
      setAuthToken(storedToken, storedUser ? JSON.parse(storedUser) : null);
    }
  }, []);

  return (
      <AuthContext.Provider value={{ token, user, setAuthToken }}>
        <BrowserRouter>
          <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <Header />
            <main>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/lists"
                    element={
                      <ProtectedRoute>
                        <ShoppingListsPage />
                      </ProtectedRoute>
                    }
                />
                <Route
                    path="/lists/:listId"
                    element={
                      <ProtectedRoute>
                        <ListPage />
                      </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to={token ? "/lists" : "/login"} />} />
              </Routes>
            </main>
            {token && <Notifications />}
          </div>
        </BrowserRouter>
      </AuthContext.Provider>
  );
}

export default App;