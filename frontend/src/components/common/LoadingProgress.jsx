import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PublicDataContext from '../../context/PublicDataContext';
import LoadingSpinner from './LoadingSpinner';

const LoadingProgress = ({ 
  children, 
  showProgress = true,
  minDisplayTime = 1000,
  className = ''
}) => {
  const { 
    loading, 
    initialLoad, 
    sectionLoading, 
    error, 
    retryCount 
  } = useContext(PublicDataContext);

  const [currentStage, setCurrentStage] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [startTime] = useState(Date.now());

  // Loading stages for progress display
  const loadingStages = [
    'Connecting to server...',
    'Loading school information...',
    'Fetching dynamic content...',
    'Loading teachers and staff...',
    'Getting events and notices...',
    'Preparing page content...',
    'Almost ready...'
  ];

  // Calculate loading progress based on section loading states
  const calculateProgress = () => {
    const sections = Object.keys(sectionLoading);
    const loadedSections = sections.filter(section => !sectionLoading[section]);
    return Math.round((loadedSections.length / sections.length) * 100);
  };

  // Update current stage based on progress
  useEffect(() => {
    if (loading || initialLoad) {
      const progress = calculateProgress();
      const stageIndex = Math.floor((progress / 100) * (loadingStages.length - 1));
      setCurrentStage(Math.min(stageIndex, loadingStages.length - 1));
    }
  }, [sectionLoading, loading, initialLoad]);

  // Handle content display timing
  useEffect(() => {
    if (!loading && !initialLoad) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
      
      setTimeout(() => {
        setShowContent(true);
      }, remainingTime);
    }
  }, [loading, initialLoad, startTime, minDisplayTime]);

  // Show error state
  if (error && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`min-h-screen flex items-center justify-center ${className}`}
      >
        <div className="max-w-md mx-auto text-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-10 h-10 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
          </motion.div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Content
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error}
          </p>
          
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Failed attempts: {retryCount}
            </p>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="bg-school-yellow hover:bg-school-orange text-school-navy-dark font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Reload Page
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Show loading progress
  if ((loading || initialLoad) && showProgress) {
    const progress = calculateProgress();
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-school-navy/5 to-school-yellow/5 ${className}`}
      >
        <div className="max-w-md mx-auto text-center p-6">
          {/* School Logo/Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.8, 
              type: "spring", 
              stiffness: 200,
              damping: 20 
            }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-school-yellow rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg 
                className="w-10 h-10 text-school-navy-dark" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
          </motion.div>

          {/* Loading Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-2xl font-bold text-school-navy-dark mb-2"
          >
            School Management System
          </motion.h2>

          {/* Loading Spinner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mb-6"
          >
            <LoadingSpinner 
              fullScreen={false}
              size="lg"
              color="yellow"
            />
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mb-4"
          >
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-school-yellow to-school-orange h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {progress}% Complete
            </p>
          </motion.div>

          {/* Current Stage */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-gray-600 dark:text-gray-300 text-sm"
            >
              {loadingStages[currentStage]}
            </motion.p>
          </AnimatePresence>

          {/* Loading Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="mt-8 text-xs text-gray-500 dark:text-gray-400"
          >
            <p>Loading dynamic content from the server...</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Show content with smooth transition
  if (showContent || (!loading && !initialLoad)) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.6,
            ease: "easeOut"
          }}
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Fallback loading state
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <LoadingSpinner 
        fullScreen={true}
        size="lg"
        color="yellow"
        text="Loading..."
      />
    </div>
  );
};

export default LoadingProgress;
