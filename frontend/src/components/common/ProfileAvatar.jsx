import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';

/**
 * A reusable component for displaying user profile avatars with consistent fallback
 *
 * @param {Object} props Component props
 * @param {Object} props.profileImage The profile image object from Cloudinary
 * @param {string} props.name The user's name for fallback initial and alt text
 * @param {string} props.size Size class for the avatar (sm, md, lg, xl)
 * @param {string} props.className Additional CSS classes
 * @param {Function} props.onClick Click handler for the avatar
 * @param {string} props.role The user's role for accessibility
 */
const ProfileAvatar = ({
  profileImage,
  name,
  size = 'md',
  className = '',
  onClick,
  role = 'user'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [optimizedUrl, setOptimizedUrl] = useState(null);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
    '3xl': 'w-32 h-32'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-12 h-12',
    '3xl': 'w-16 h-16'
  };

  // Optimize Cloudinary URL based on size
  useEffect(() => {
    if (profileImage?.url) {
      try {
        const url = new URL(profileImage.url);

        // Get the path parts
        const pathParts = url.pathname.split('/');

        // Find the upload index
        const uploadIndex = pathParts.findIndex(part => part === 'upload');
        if (uploadIndex === -1) {
          setOptimizedUrl(profileImage.url);
          return;
        }

        // Get the size transformation
        const sizeMap = {
          xs: 'w_24,h_24,c_fill',
          sm: 'w_32,h_32,c_fill',
          md: 'w_40,h_40,c_fill',
          lg: 'w_48,h_48,c_fill',
          xl: 'w_64,h_64,c_fill',
          '2xl': 'w_96,h_96,c_fill',
          '3xl': 'w_128,h_128,c_fill'
        };

        // Insert the transformation after 'upload'
        pathParts.splice(uploadIndex + 1, 0, sizeMap[size] || sizeMap.md);

        // Reconstruct the path
        url.pathname = pathParts.join('/');

        // Add quality and format parameters
        url.searchParams.set('q', 'auto');
        url.searchParams.set('f', 'auto');

        setOptimizedUrl(url.toString());
      } catch (err) {
        console.error('Error optimizing Cloudinary URL:', err);
        setOptimizedUrl(profileImage.url);
      }
    }
  }, [profileImage?.url, size]);

  const containerClasses = `relative rounded-full overflow-hidden flex items-center justify-center bg-gray-200 ${sizeClasses[size]} ${className}`;

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = (e) => {
    console.log('ProfileAvatar: Image load error. URL was:', e.target.src);

    // If the optimized URL failed, try the original URL
    if (e.target.src === optimizedUrl && profileImage?.url && optimizedUrl !== profileImage.url) {
      console.log('ProfileAvatar: Optimized URL failed, trying original URL:', profileImage.url);
      e.target.onerror = null;
      e.target.src = profileImage.url;
      return;
    }

    console.log('ProfileAvatar: Original URL also failed or not available, showing fallback');
    setIsLoading(false);
    setImageError(true);
    e.target.onerror = null;
    const initials = getInitials(name);
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0D8ABC&color=fff&size=256`;
  };

  const renderContent = () => {
    if (optimizedUrl && !imageError) {
      return (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-school-navy"></div>
            </div>
          )}
          <img
            src={optimizedUrl}
            alt={`${name || role}'s profile picture`}
            className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        </>
      );
    } else if (name) {
      return (
        <span className="text-gray-600 font-semibold text-center" aria-label={`${name}'s initials`}>
          {getInitials(name)}
        </span>
      );
    } else {
      return (
        <FaUser
          className={`text-gray-400 ${iconSizes[size]}`}
          aria-label={`${role}'s profile icon`}
        />
      );
    }
  };

  return (
    <div
      className={containerClasses}
      onClick={onClick}
      role="img"
      aria-label={`${name || role}'s profile picture`}
    >
      {renderContent()}
    </div>
  );
};

export default ProfileAvatar;
