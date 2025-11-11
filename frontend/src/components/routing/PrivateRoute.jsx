import { useContext, memo } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

// Memoize the PrivateRoute component to prevent unnecessary re-renders
const PrivateRoute = memo(({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
});

export default PrivateRoute;
