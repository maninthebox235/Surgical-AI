import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Lazy load components
const Login = React.lazy(() => import('../components/Login'));
const Dashboard = React.lazy(() => import('../components/Dashboard'));
const VideoUpload = React.lazy(() => import('../components/VideoUpload'));
const VideoAnalysis = React.lazy(() => import('../components/VideoAnalysis'));

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Temporarily bypass authentication
  return <>{children}</>;
};

const AuthRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <VideoUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videos/:videoId/analysis"
          element={
            <ProtectedRoute>
              <VideoAnalysis />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AuthRoutes; 