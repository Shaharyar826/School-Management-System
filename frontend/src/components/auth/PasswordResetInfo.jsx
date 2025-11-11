import React from 'react';
import PropTypes from 'prop-types';

const PasswordResetInfo = ({ tempPassword }) => {
  if (!tempPassword) return null;

  return (
    <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">Password Reset Successful</h3>
          <div className="mt-2 text-sm text-green-700">
            <p>Your password has been reset. Please use the temporary password below to log in:</p>
            <div className="mt-2 p-4 bg-white border-2 border-green-500 rounded font-mono text-center text-2xl font-bold">
              {tempPassword}
            </div>
            <div className="mt-2 text-center">
              <button
                onClick={() => {
                  // Copy password to clipboard
                  navigator.clipboard.writeText(tempPassword);
                  alert('Password copied to clipboard!');
                }}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Copy Password
              </button>
            </div>
            <p className="mt-2 text-xs">You will be required to change your password after logging in.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

PasswordResetInfo.propTypes = {
  tempPassword: PropTypes.string
};

export default PasswordResetInfo;
