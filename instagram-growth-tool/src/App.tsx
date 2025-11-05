import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PersonalizationProvider } from './hooks/usePersonalization';
import { PersonalizationContextProvider } from './contexts/PersonalizationContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import OAuthCallback from './pages/OAuthCallback';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function AppContent() {
  const { user, loading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* OAuth Callback Route - Accessible without authentication */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Landing Page Route */}
        <Route
          path="/"
          element={
            !user && showLanding ? (
              <LandingPage onGetStarted={() => setShowLanding(false)} />
            ) : !user ? (
              <div>
                <button 
                  onClick={() => setShowLanding(true)}
                  className="absolute top-4 left-4 text-purple-600 hover:text-purple-700 flex items-center gap-2"
                >
                  ← Back to Home
                </button>
                <Login />
              </div>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Dashboard Route - Protected */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" replace />}
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PersonalizationProvider>
        <PersonalizationContextProvider>
          <AppContent />
        </PersonalizationContextProvider>
      </PersonalizationProvider>
    </AuthProvider>
  );
}