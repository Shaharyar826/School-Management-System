import { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const PasswordResetChecker = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check if user is authenticated and has user data
    if (isAuthenticated && user) {
      // Check if password reset is required
      if (user.passwordResetRequired) {
        // Don't redirect if already on the reset page
        if (location.pathname !== '/reset-temp-password') {
          console.log('Password reset required. Redirecting to reset page.');
          navigate('/reset-temp-password');
        }
      } else if (location.pathname === '/reset-temp-password') {
        // If user is on reset page but doesn't need to reset password, redirect to dashboard
        console.log('Password reset not required. Redirecting to dashboard.');
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  // During redirection, we might briefly show a loading state
  // or return null to prevent flickering
  if (
    // We're in a redirection state in these cases:
    (user?.passwordResetRequired && location.pathname !== '/reset-temp-password') ||
    (!user?.passwordResetRequired && location.pathname === '/reset-temp-password')
  ) {
    // Return null or a loading indicator while redirecting
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // In all other cases, render the children
  return children;
};

export default PasswordResetChecker;
