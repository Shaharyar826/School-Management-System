import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user if token exists - with stable reference
  const loadUser = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      try {
        // Use the token directly from localStorage to avoid dependency on state
        axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
        const res = await axios.get('/api/auth/me');

        if (res.data.success) {
          console.log('User loaded successfully:', res.data.data);
          setUser(res.data.data);
          setIsAuthenticated(true);
        } else {
          console.error('Failed to load user:', res.data.message);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError(res.data.message || 'Authentication failed. Please login again.');
        }
      } catch (err) {
        console.error('Error loading user:', err);

        // Get more specific error message
        let errorMessage = 'Authentication failed. Please login again.';

        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = err.response.data?.message || err.response.data?.error || errorMessage;

          if (err.response.status === 401) {
            errorMessage = 'Your session has expired. Please login again.';
          } else if (err.response.status === 403) {
            errorMessage = 'Your account is not authorized. Please contact an administrator.';
          }
        } else if (err.request) {
          // The request was made but no response was received
          errorMessage = 'No response from server. Please check your connection.';
        }

        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setError(errorMessage);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []); // No dependencies to prevent re-renders

  // Only run once on mount
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Register user
  const register = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post('/api/auth/register', formData);

      if (res.data.success) {
        return {
          success: true,
          message: res.data.message || 'Registration successful! Your account is on hold. Awaiting approval from Admin/Principal.'
        };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      return { success: false, message: err.response?.data?.message || 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get pending approvals - without affecting global loading state
  const getPendingApprovals = useCallback(async () => {
    try {
      // Don't set global loading state - let component handle its own loading
      // setLoading(true);
      // setError(null);

      const res = await axios.get('/api/auth/pending-approvals');

      if (res.data.success) {
        return {
          success: true,
          data: res.data.data,
          count: res.data.count
        };
      } else {
        return {
          success: false,
          message: res.data.message || 'Failed to fetch pending approvals.'
        };
      }
    } catch (err) {
      // Don't set global error state - let component handle its own errors
      // setError(err.response?.data?.message || 'Failed to fetch pending approvals.');
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch pending approvals.'
      };
    } finally {
      // Don't set global loading state
      // setLoading(false);
    }
  }, []); // Empty dependency array for stable reference

  // Approve user - without affecting global loading state
  const approveUser = useCallback(async (userId) => {
    try {
      // Don't set global loading state
      // setLoading(true);
      // setError(null);

      const res = await axios.put(`/api/auth/approve/${userId}`);

      if (res.data.success) {
        return {
          success: true,
          message: res.data.message || 'User approved successfully.',
          data: res.data.data
        };
      } else {
        return {
          success: false,
          message: res.data.message || 'Failed to approve user.'
        };
      }
    } catch (err) {
      // Don't set global error state
      // setError(err.response?.data?.message || 'Failed to approve user.');
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to approve user.'
      };
    } finally {
      // Don't set global loading state
      // setLoading(false);
    }
  }, []); // Empty dependency array for stable reference

  // Reject user - without affecting global loading state
  const rejectUser = useCallback(async (userId) => {
    try {
      // Don't set global loading state
      // setLoading(true);
      // setError(null);

      const res = await axios.put(`/api/auth/reject/${userId}`);

      if (res.data.success) {
        return {
          success: true,
          message: res.data.message || 'User rejected successfully.',
          data: res.data.data
        };
      } else {
        return {
          success: false,
          message: res.data.message || 'Failed to reject user.'
        };
      }
    } catch (err) {
      // Don't set global error state
      // setError(err.response?.data?.message || 'Failed to reject user.');
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to reject user.'
      };
    } finally {
      // Don't set global loading state
      // setLoading(false);
    }
  }, []); // Empty dependency array for stable reference

  // Login user
  const login = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);

      // First, perform login
      const loginRes = await axios.post('/api/auth/login', formData);

      if (loginRes.data.success) {
        // Set token in localStorage
        localStorage.setItem('token', loginRes.data.token);
        
        // Set token in axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${loginRes.data.token}`;
        
        // Set token in state
        setToken(loginRes.data.token);

        // Now fetch user data to ensure we have the latest
        const userRes = await axios.get('/api/auth/me');
        
        if (userRes.data.success) {
          // Set user data
          setUser(userRes.data.data);
          
          // Set authentication state
          setIsAuthenticated(true);

          return { success: true };
        } else {
          throw new Error('Failed to load user data');
        }
      } else {
        throw new Error(loginRes.data.message || 'Login failed');
      }
    } catch (err) {
      // Clear any partial auth state
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      setError(err.response?.data?.message || err.message || 'Login failed');
      return { 
        success: false, 
        message: err.response?.data?.message || err.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout user
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Update user data - useful after password reset or profile update
  const updateUserData = useCallback(async () => {
    try {
      const res = await axios.get('/api/auth/me');

      if (res.data.success) {
        setUser(res.data.data);
        return { success: true };
      } else {
        return {
          success: false,
          message: res.data.message || 'Failed to update user data'
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update user data'
      };
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    getPendingApprovals,
    approveUser,
    rejectUser,
    updateUserData
  }), [
    user,
    token,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    getPendingApprovals,
    approveUser,
    rejectUser,
    updateUserData
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
