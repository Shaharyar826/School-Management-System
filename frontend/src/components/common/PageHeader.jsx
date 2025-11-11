import React from 'react';

const PageHeader = ({ title, description, icon, actions }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-school-yellow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon && (
            <div className="flex-shrink-0 mr-4 bg-gray-50 p-3 rounded-full shadow-sm">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-school-navy-dark">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
