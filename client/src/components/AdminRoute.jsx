import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from './ui/LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('AdminRoute Debug:', {
    user,
    isAuthenticated,
    isLoading,
    userRole: user?.role,
    currentPath: location.pathname
  });

  if (isLoading) {
    console.log('AdminRoute: Still loading...');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('AdminRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    console.log('AdminRoute: Insufficient permissions, redirecting to home. User role:', user?.role);
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute: Access granted');
  return children;
};

export default AdminRoute;
