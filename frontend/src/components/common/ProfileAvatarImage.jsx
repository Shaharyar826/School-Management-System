import React from 'react';
import { FaUser } from 'react-icons/fa';

/**
 * A simple component for displaying user profile avatars with consistent fallback
 * Specifically designed for direct use in lists and tables
 * 
 * @param {Object} props Component props
 * @param {Object} props.profileImage The profile image object from Cloudinary
 * @param {string} props.name The user's name for fallback initial and alt text
 * @param {string} props.size The size of the avatar
 * @param {string} props.className Additional classes for the container
 * @param {function} props.onClick Click handler for the avatar
 */
const ProfileAvatarImage = ({ profileImage, name, size = 'md', className = '', onClick }) => {
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

  const renderContent = () => {
    if (profileImage?.url) {
      return (
        <img
          src={profileImage.url}
          alt={name || 'Profile'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getInitials(name))}&background=0D8ABC&color=fff&size=256`;
          }}
        />
      );
    } else if (name) {
      return (
        <span className="text-gray-600 font-semibold text-center">
          {getInitials(name)}
        </span>
      );
    } else {
      return (
        <FaUser className={`text-gray-400 ${iconSizes[size]}`} />
      );
    }
  };

  return (
    <div className={containerClasses} onClick={onClick}>
      {renderContent()}
    </div>
  );
};

export default ProfileAvatarImage;
