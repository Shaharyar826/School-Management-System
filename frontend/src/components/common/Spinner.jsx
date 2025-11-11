import React from 'react';

const Spinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    yellow: 'border-school-yellow',
    orange: 'border-school-orange',
    navy: 'border-school-navy',
    green: 'border-green-500',
    red: 'border-red-500'
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 ${colorClasses[color]}`}></div>
  );
};

export default Spinner;
