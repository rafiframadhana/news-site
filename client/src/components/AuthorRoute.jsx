import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SimpleLoader } from './ui';

const AuthorRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SimpleLoader size="lg" text="Verifying author access" showText={true} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Allow both authors and admins to access author routes
  if (user.role !== 'author' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthorRoute;
