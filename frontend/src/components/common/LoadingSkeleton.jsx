import React from 'react';

// Base skeleton component
const SkeletonBase = ({ className = '', children }) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
);

// Individual skeleton elements
export const SkeletonText = ({ lines = 1, className = '' }) => (
  <SkeletonBase className={className}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`bg-gray-200 dark:bg-gray-700 rounded h-4 ${
          index < lines - 1 ? 'mb-2' : ''
        } ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </SkeletonBase>
);

export const SkeletonImage = ({ className = '', aspectRatio = 'square' }) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[3/1]',
    tall: 'aspect-[1/2]'
  };

  return (
    <SkeletonBase className={className}>
      <div className={`bg-gray-200 dark:bg-gray-700 rounded ${aspectClasses[aspectRatio]} w-full`} />
    </SkeletonBase>
  );
};

export const SkeletonCard = ({ className = '', showImage = true, textLines = 3 }) => (
  <SkeletonBase className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
    {showImage && (
      <SkeletonImage className="mb-4" aspectRatio="video" />
    )}
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4" />
    <SkeletonText lines={textLines} />
  </SkeletonBase>
);

export const SkeletonButton = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32'
  };

  return (
    <SkeletonBase className={className}>
      <div className={`bg-gray-200 dark:bg-gray-700 rounded ${sizeClasses[size]}`} />
    </SkeletonBase>
  );
};

// Page-specific skeleton layouts
export const LandingPageSkeleton = () => (
  <div className="min-h-screen">
    {/* Hero Section Skeleton */}
    <div className="relative h-screen">
      <SkeletonImage className="w-full h-full" aspectRatio="wide" />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-4">
          <div className="h-16 bg-white bg-opacity-20 rounded mb-6 w-3/4 mx-auto" />
          <div className="h-6 bg-white bg-opacity-20 rounded mb-8 w-1/2 mx-auto" />
          <SkeletonButton size="lg" className="mx-auto" />
        </div>
      </div>
    </div>

    {/* Content Sections */}
    <div className="py-16 space-y-16">
      {/* About Section */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3 mx-auto" />
          <SkeletonText lines={2} className="max-w-2xl mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SkeletonImage aspectRatio="video" />
          <SkeletonText lines={6} />
        </div>
      </div>

      {/* Featured Teachers */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/4 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} showImage={true} textLines={2} />
          ))}
        </div>
      </div>

      {/* Events & Notices */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} showImage={false} textLines={3} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const AboutPageSkeleton = () => (
  <div className="min-h-screen">
    {/* Banner */}
    <SkeletonImage className="w-full h-64 md:h-96" aspectRatio="wide" />
    
    {/* Content */}
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-8 w-1/2" />
        <SkeletonText lines={8} className="mb-12" />
        
        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <SkeletonCard textLines={4} showImage={false} />
          <SkeletonCard textLines={4} showImage={false} />
        </div>
        
        {/* Leadership */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SkeletonImage className="w-32 h-32 rounded-full mx-auto" />
          <SkeletonText lines={6} />
        </div>
      </div>
    </div>
  </div>
);

export const ContentPageSkeleton = ({ title = "Page Content" }) => (
  <div className="min-h-screen">
    {/* Header */}
    <div className="bg-school-navy-dark text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="h-12 bg-white bg-opacity-20 rounded mb-4 w-1/3 mx-auto" />
        <div className="h-6 bg-white bg-opacity-20 rounded w-1/2 mx-auto" />
      </div>
    </div>
    
    {/* Content */}
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <SkeletonText lines={12} className="mb-8" />
        
        {/* Content Sections */}
        <div className="space-y-12">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index}>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/4" />
              <SkeletonText lines={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Main loading skeleton component
const LoadingSkeleton = ({ type = 'default', ...props }) => {
  switch (type) {
    case 'landing':
      return <LandingPageSkeleton {...props} />;
    case 'about':
      return <AboutPageSkeleton {...props} />;
    case 'content':
      return <ContentPageSkeleton {...props} />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <SkeletonText lines={3} className="max-w-md" />
        </div>
      );
  }
};

export default LoadingSkeleton;
