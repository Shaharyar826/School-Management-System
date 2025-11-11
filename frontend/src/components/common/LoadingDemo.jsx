import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import PublicDataContext from '../../context/PublicDataContext';
import LoadingSpinner from './LoadingSpinner';
import LoadingSkeleton from './LoadingSkeleton';
import PageLoader from './PageLoader';
import LoadingProgress from './LoadingProgress';

const LoadingDemo = () => {
  const [demoType, setDemoType] = useState('spinner');
  const { 
    loading, 
    initialLoad, 
    sectionLoading, 
    error, 
    retryCount,
    refreshData,
    forceRefresh,
    clearCache
  } = useContext(PublicDataContext);

  const demoTypes = [
    { id: 'spinner', name: 'Loading Spinner', component: 'LoadingSpinner' },
    { id: 'skeleton', name: 'Loading Skeleton', component: 'LoadingSkeleton' },
    { id: 'progress', name: 'Loading Progress', component: 'LoadingProgress' },
    { id: 'pageloader', name: 'Page Loader', component: 'PageLoader' }
  ];

  const renderDemo = () => {
    switch (demoType) {
      case 'spinner':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Loading Spinner Variants</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <LoadingSpinner fullScreen={false} size="sm" color="blue" />
                <p className="text-sm mt-2">Small Blue</p>
              </div>
              <div className="text-center">
                <LoadingSpinner fullScreen={false} size="md" color="yellow" />
                <p className="text-sm mt-2">Medium Yellow</p>
              </div>
              <div className="text-center">
                <LoadingSpinner fullScreen={false} size="lg" color="orange" />
                <p className="text-sm mt-2">Large Orange</p>
              </div>
              <div className="text-center">
                <LoadingSpinner fullScreen={false} size="xl" color="navy" />
                <p className="text-sm mt-2">XL Navy</p>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <LoadingSpinner 
                fullScreen={false} 
                size="lg" 
                color="yellow" 
                text="Loading with custom text..."
              />
            </div>
          </div>
        );

      case 'skeleton':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Loading Skeleton Variants</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Landing Page Skeleton</h4>
                <div className="border rounded p-2 max-h-96 overflow-y-auto">
                  <LoadingSkeleton type="landing" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">About Page Skeleton</h4>
                <div className="border rounded p-2 max-h-96 overflow-y-auto">
                  <LoadingSkeleton type="about" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Content Page Skeleton</h4>
                <div className="border rounded p-2 max-h-96 overflow-y-auto">
                  <LoadingSkeleton type="content" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Loading Progress Demo</h3>
            <div className="bg-gray-100 p-4 rounded min-h-96">
              <LoadingProgress showProgress={true}>
                <div className="text-center p-8">
                  <h4 className="text-xl font-semibold mb-4">Content Loaded!</h4>
                  <p>This content appears after the loading progress completes.</p>
                </div>
              </LoadingProgress>
            </div>
          </div>
        );

      case 'pageloader':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Page Loader Demo</h3>
            <div className="bg-gray-100 p-4 rounded min-h-96">
              <PageLoader skeletonType="content" showSkeleton={true}>
                <div className="text-center p-8">
                  <h4 className="text-xl font-semibold mb-4">Page Content Loaded!</h4>
                  <p>This demonstrates the PageLoader component with skeleton fallback.</p>
                </div>
              </PageLoader>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-school-navy-dark mb-4">
          Enhanced Loading System Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Demonstration of the comprehensive loading mechanism implemented for the School Management System.
        </p>

        {/* Current Loading State Info */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Current Loading State</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Loading:</span> 
              <span className={loading ? 'text-red-600' : 'text-green-600'}>
                {loading ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Initial Load:</span> 
              <span className={initialLoad ? 'text-red-600' : 'text-green-600'}>
                {initialLoad ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Error:</span> 
              <span className={error ? 'text-red-600' : 'text-green-600'}>
                {error ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Retry Count:</span> 
              <span className="text-gray-700">{retryCount}</span>
            </div>
          </div>
          
          {/* Section Loading States */}
          <div className="mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Section Loading States:</h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-xs">
              {Object.entries(sectionLoading).map(([section, isLoading]) => (
                <div key={section} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isLoading ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span className="capitalize">{section}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => refreshData()}
            className="px-4 py-2 bg-school-yellow text-school-navy-dark rounded hover:bg-school-orange transition-colors"
          >
            Refresh Data
          </button>
          <button
            onClick={() => forceRefresh()}
            className="px-4 py-2 bg-school-navy text-white rounded hover:bg-school-navy-dark transition-colors"
          >
            Force Refresh
          </button>
          <button
            onClick={() => clearCache()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Demo Type Selector */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Loading Component Demos</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {demoTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setDemoType(type.id)}
              className={`px-4 py-2 rounded transition-colors ${
                demoType === type.id
                  ? 'bg-school-yellow text-school-navy-dark'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <motion.div
        key={demoType}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border rounded-lg p-6"
      >
        {renderDemo()}
      </motion.div>

      {/* Implementation Notes */}
      <div className="mt-8 bg-gray-50 border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Implementation Features</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Intelligent Caching:</strong> 5-minute cache with automatic invalidation</li>
          <li>• <strong>Progressive Loading:</strong> Section-specific loading states for granular control</li>
          <li>• <strong>Retry Mechanism:</strong> Exponential backoff with configurable retry limits</li>
          <li>• <strong>Skeleton Loading:</strong> Page-specific skeleton screens for better UX</li>
          <li>• <strong>Error Handling:</strong> Graceful fallbacks with user-friendly error messages</li>
          <li>• <strong>Performance Optimized:</strong> Minimal re-renders and efficient state management</li>
          <li>• <strong>Accessibility:</strong> Screen reader friendly loading indicators</li>
          <li>• <strong>Responsive Design:</strong> Adapts to different screen sizes and orientations</li>
        </ul>
      </div>
    </div>
  );
};

export default LoadingDemo;
