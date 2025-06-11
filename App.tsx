
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProviders, useAuth, useSettings } from './store'; // Changed useTheme to useSettings
import AuthPage from './AuthPage';
import ChatPage from './ChatPage'; // Changed to default import
import SettingsAdminPage from './SettingsAdminPage';
import { LoadingSpinner } from './ui';

// Main application component structure

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { currentUser, token } = useAuth();
  const location = useLocation();

  // If token exists but currentUser is not yet populated, it might be still loading/decoding.
  // This check relies on AuthProvider to set currentUser to null if token is invalid.
  // A more robust check might involve an explicit loading state in AuthContext.
  if (!token) { 
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // If token exists, but currentUser is null after initial load, it means token was invalid or user not found.
  // However, AuthProvider's useEffect should set currentUser based on token.
  // This route guard assumes AuthProvider has had a chance to process the token.
  if (token && !currentUser && !localStorage.getItem('titanChatToken_isLoading')) { // Add a temporary loading flag if needed
     // Potentially, this means the token was invalid and cleared, or user data issue.
     // For simplicity, if token is present but no user, and not actively loading, treat as needing login.
  }


  return children; // If token is present and (implicitly) currentUser will be or is populated
};

const AppContent: React.FC = () => {
  const { currentUser, token } = useAuth();
  const { settings } = useSettings(); // Using settings from useSettings
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  useEffect(() => {
     if (localStorage.getItem('titanChatToken')) {
        const timer = setTimeout(() => setIsAuthLoading(false), 250); 
        return () => clearTimeout(timer);
    } else {
        setIsAuthLoading(false);
    }
  }, []);

  // Effect to apply language and direction to HTML tag (now handled in SettingsProvider)
  // useEffect(() => {
  //   document.documentElement.lang = settings.language;
  //   document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  // }, [settings.language]);

  if (isAuthLoading && token) { 
    return (
      <div className="flex items-center justify-center h-screen bg-secondary-100 dark:bg-secondary-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // The theme class (dark/light) is applied by SettingsProvider directly to documentElement
  return (
    <div className={`app-container font-sans`}> {/* Removed theme class from here */}
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/signup" element={currentUser ? <Navigate to="/" /> : <AuthPage initialView="signup" />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
         <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <ChatPage initialView="contacts" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <ChatPage initialView="search" />
            </ProtectedRoute>
          }
        />
         <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <ChatPage initialView="groups" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsAdminPage view="settings"/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <SettingsAdminPage view="admin"/>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
};

export default App;