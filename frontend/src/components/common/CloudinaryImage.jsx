import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * CloudinaryImage - A component for displaying Cloudinary images with proper error handling
 *
 * @param {Object} props
 * @param {string} props.src - The image source URL
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.fallbackSrc - Optional fallback image source if the main image fails to load
 * @param {string} props.className - Optional CSS classes for the image
 * @param {string} props.placeholderClassName - Optional CSS classes for the placeholder
 * @param {string} props.errorClassName - Optional CSS classes for the error state
 * @param {Function} props.onLoad - Optional callback when image loads successfully
 * @param {Function} props.onError - Optional callback when image fails to load
 * @param {React.ReactNode} props.errorComponent - Optional custom component to show on error
 * @param {React.ReactNode} props.loadingComponent - Optional custom component to show while loading
 */
const CloudinaryImage = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  placeholderClassName = '',
  errorClassName = '',
  onLoad,
  onError,
  errorComponent,
  loadingComponent,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  // Reset state if src changes
  useEffect(() => {
    // If src is empty, null, or undefined, use fallback immediately
    if (!src || src === 'null' || src === 'undefined') {
      if (fallbackSrc) {
        setImgSrc(fallbackSrc);
      } else {
        setHasError(true);
        setIsLoading(false);
      }
      setRetryCount(0);
      return;
    }

    setImgSrc(src);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src, fallbackSrc]);

  // Generate initials from name for fallback
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Check if URL looks like a valid Cloudinary URL
  const isValidCloudinaryUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.includes('res.cloudinary.com') && url.includes('/image/upload/');
  };

  // Handle image load error
  const handleError = () => {
    // Only retry for valid Cloudinary URLs and if we haven't exceeded max retries
    if (retryCount < MAX_RETRIES && isValidCloudinaryUrl(src) && !imgSrc.includes('cb=')) {
      // Add cache buster to force reload from Cloudinary CDN
      const cacheBuster = `?cb=${Date.now()}`;
      const newSrc = src.includes('?')
        ? `${src}&cb=${Date.now()}`
        : `${src}${cacheBuster}`;
      setImgSrc(newSrc);
      setRetryCount(prev => prev + 1);
      return;
    }

    // If we've exhausted retries and have a fallback, use it
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setRetryCount(0); // Reset retry count for fallback
      return;
    }

    // If fallback also failed or no fallback available, show error state
    setHasError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  // Handle successful image load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad();
  };

  // Default loading component
  const defaultLoadingComponent = (
    <div className={`flex items-center justify-center bg-gray-100 ${placeholderClassName}`} style={{ minHeight: 80 }}>
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Default error component
  const defaultErrorComponent = (
    <div className={`flex items-center justify-center bg-gray-200 text-gray-500 ${errorClassName}`}>
      <span className="text-xl font-bold">{getInitials(alt)}</span>
    </div>
  );

  return (
    <>
      {isLoading && (loadingComponent || defaultLoadingComponent)}

      {!hasError && (
        <img
          src={imgSrc}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={handleError}
          onLoad={handleLoad}
          {...rest}
        />
      )}

      {hasError && (errorComponent || defaultErrorComponent)}
    </>
  );
};

CloudinaryImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  fallbackSrc: PropTypes.string,
  className: PropTypes.string,
  placeholderClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  errorComponent: PropTypes.node,
  loadingComponent: PropTypes.node,
};

export default CloudinaryImage;
