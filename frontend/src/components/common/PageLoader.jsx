import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import LoadingSkeleton from './LoadingSkeleton';
import PublicDataContext from '../../context/PublicDataContext';

const PageLoader = ({
  children,
  skeletonType = 'default',
  showSkeleton = true,
  fallbackContent = null,
  minLoadTime = 500,
  className = ''
}) => {
  const {
    loading,
    initialLoad,
    error,
    retryCount,
    refreshData,
    forceRefresh
  } = useContext(PublicDataContext);

  // Show skeleton during initial load if enabled
  if (initialLoad && showSkeleton) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <LoadingSkeleton type={skeletonType} />
      </motion.div>
    );
  }

  // Show loading spinner for subsequent loads
  if (loading && !initialLoad) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <LoadingSpinner
          fullScreen={true}
          text="Refreshing content..."
          color="yellow"
        />
      </motion.div>
    );
  }

  // Show error state with retry options
  if (error && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`min-h-screen flex items-center justify-center ${className}`}
      >
        <div className="max-w-md mx-auto text-center p-6">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500 mb-4"
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
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white" style={{ color: 'var(--text-primary, #111827)' }}>
              Failed to Load Content
            </h3>
            <p className="mb-4 text-gray-800 dark:text-gray-200" style={{ color: 'var(--text-secondary, #1f2937)' }}>
              Make sure to have a stable internet connection and try again. <br />
              {error}
            </p>
            {retryCount > 0 && (
              <p className="text-sm mb-4 text-gray-700 dark:text-gray-500" style={{ color: 'var(--text-tertiary, #374151)' }}>
                Retry attempts: {retryCount}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => refreshData()}
              className="w-full bg-school-yellow hover:bg-school-orange text-school-navy-dark font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>

            <button
              onClick={() => forceRefresh()}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            >
              Force Refresh
            </button>

            {fallbackContent && (
              <button
                onClick={() => window.location.reload()}
                className="w-full text-school-navy-dark hover:text-school-orange font-medium py-2 px-4 transition-colors duration-200"
              >
                Reload Page
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Show content with smooth transition
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.4,
          ease: "easeOut"
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Higher-order component for wrapping pages
export const withPageLoader = (WrappedComponent, options = {}) => {
  return function PageWithLoader(props) {
    return (
      <PageLoader {...options}>
        <WrappedComponent {...props} />
      </PageLoader>
    );
  };
};

// Section-specific loader for individual components
export const SectionLoader = ({
  section,
  children,
  fallback = null,
  className = ''
}) => {
  const { sectionLoading } = useContext(PublicDataContext);

  const isLoading = sectionLoading[section];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`flex items-center justify-center py-8 ${className}`}
      >
        {fallback || (
          <LoadingSpinner
            fullScreen={false}
            size="md"
            color="yellow"
            text={`Loading ${section}...`}
          />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Progressive loading component for content that loads in stages
export const ProgressiveLoader = ({
  stages = [],
  currentStage = 0,
  className = ''
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="max-w-md mx-auto text-center">
        <LoadingSpinner
          size="lg"
          color="yellow"
          className="mb-6"
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Loading School Management System
          </h3>

          {stages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {stages[currentStage] || 'Preparing content...'}
              </p>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-school-yellow h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentStage + 1) / stages.length) * 100}%`
                  }}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentStage + 1} of {stages.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
