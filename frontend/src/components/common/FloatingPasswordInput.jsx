import { useState } from 'react';
import PropTypes from 'prop-types';

const FloatingPasswordInput = ({
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  placeholder = '',
  autoComplete = 'current-password',
  className = '',
  error = '',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="floating-input-container relative">
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        autoComplete={autoComplete}
        className={`floating-input peer w-full px-4 py-3 pr-12 border rounded-md transition-all duration-200 outline-none ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...rest}
      />

      {/* Eye toggle button */}
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors duration-200 z-10"
        tabIndex={-1}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
          // Eye slash icon (hide password)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
            />
          </svg>
        ) : (
          // Eye icon (show password)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>

      {/* Floating label */}
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${value
            ? 'text-sm text-green-500 -top-2.5 bg-white dark:bg-[#1e293b] px-1'
            : 'text-gray-500 top-3'}`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

FloatingPasswordInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  autoComplete: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.string
};

export default FloatingPasswordInput;
