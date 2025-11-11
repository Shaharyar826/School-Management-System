import { createContext, useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Create the context
const NavigationContext = createContext();

// Custom hook to use the navigation context
export const useNavigation = () => useContext(NavigationContext);

// Provider component
export const NavigationProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [previousPaths, setPreviousPaths] = useState({});

  // Track location changes to build navigation history
  useEffect(() => {
    // Don't track the same path twice in a row
    if (
      navigationHistory.length === 0 || 
      navigationHistory[navigationHistory.length - 1].pathname !== location.pathname
    ) {
      setNavigationHistory(prev => [...prev, { 
        pathname: location.pathname,
        search: location.search,
        state: location.state,
        timestamp: Date.now()
      }]);
    }
  }, [location, navigationHistory]);

  // Store the previous path for a specific detail view
  const storePreviousPath = (detailPath, sourcePath, additionalData = {}) => {
    setPreviousPaths(prev => ({
      ...prev,
      [detailPath]: {
        path: sourcePath,
        data: additionalData,
        timestamp: Date.now()
      }
    }));
  };

  // Navigate to a detail view and store the current path as the return path
  const navigateToDetail = (detailPath, state = {}) => {
    // Store current path as the previous path for this detail view
    storePreviousPath(detailPath, location.pathname, {
      search: location.search,
      state: location.state
    });
    
    // Navigate to the detail view with state
    navigate(detailPath, { state });
  };

  // Go back to the previous path for a specific detail view or default path
  const goBack = (defaultPath) => {
    // Check if we have a stored previous path for the current location
    const previousPathInfo = previousPaths[location.pathname];
    
    if (previousPathInfo && previousPathInfo.path) {
      // Navigate to the stored previous path with its state
      navigate(previousPathInfo.path, { 
        state: previousPathInfo.data.state,
        search: previousPathInfo.data.search
      });
    } else if (navigationHistory.length > 1) {
      // If no specific previous path is stored, go back to the last path in history
      const prevPath = navigationHistory[navigationHistory.length - 2];
      navigate(prevPath.pathname, { 
        state: prevPath.state,
        search: prevPath.search
      });
    } else {
      // If no history, go to the default path
      navigate(defaultPath || '/dashboard');
    }
  };

  // Clear navigation history for a specific path
  const clearPathHistory = (path) => {
    setPreviousPaths(prev => {
      const newPaths = { ...prev };
      delete newPaths[path];
      return newPaths;
    });
  };

  // Clear all navigation history
  const clearAllHistory = () => {
    setPreviousPaths({});
    setNavigationHistory([]);
  };

  // Value to be provided by the context
  const contextValue = {
    navigationHistory,
    previousPaths,
    storePreviousPath,
    navigateToDetail,
    goBack,
    clearPathHistory,
    clearAllHistory
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationContext;
