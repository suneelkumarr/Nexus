import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PersonalizationProvider } from './hooks/usePersonalization';
import { PersonalizationContextProvider } from './contexts/PersonalizationContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import { useState } from 'react';

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

  // Show landing page for non-authenticated users
  if (!user && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // Show login for non-authenticated users who clicked "Get Started"
  if (!user && !showLanding) {
    return (
      <div>
        <button 
          onClick={() => setShowLanding(true)}
          className="absolute top-4 left-4 text-purple-600 hover:text-purple-700 flex items-center gap-2"
        >
          ← Back to Home
        </button>
        <Login />
      </div>
    );
  }

  // Show dashboard for authenticated users
  return <Dashboard />;
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