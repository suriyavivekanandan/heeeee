// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import InitialWeightEntry from './pages/InitialEntry';
import RemainingWeightEntry from './pages/RemainingEntry';
import DataPage from './pages/DataView';
import BookingEntry from './pages/Bookings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OtpVerification from './pages/OtpVerification';
import PasswordReset from './pages/PasswordReset';

// ProtectedRoute component to guard routes that require authentication
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify" element={<OtpVerification />} />
              <Route path="/reset-password" element={<PasswordReset />} />

              {/* Protected Routes */}
              <Route path="/initial-weight" element={
                <ProtectedRoute>
                  <InitialWeightEntry />
                </ProtectedRoute>
              } />
              <Route path="/remaining-weight" element={
                <ProtectedRoute>
                  <RemainingWeightEntry />
                </ProtectedRoute>
              } />
              <Route path="/data" element={
                <ProtectedRoute>
                  <DataPage />
                </ProtectedRoute>
              } />
              <Route path="/booking" element={
                <ProtectedRoute>
                  <BookingEntry />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;