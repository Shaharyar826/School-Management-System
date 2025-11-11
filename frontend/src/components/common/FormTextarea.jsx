import React, { useState } from 'react';

/**
 * Reusable form textarea component with the glowing effect and floating label
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Textarea ID
 * @param {string} props.name - Textarea name
 * @param {string} props.label - Textarea label
 * @param {string} props.value - Textarea value
 * @param {function} props.onChange - Change handler function
 * @param {boolean} props.required - Whether the textarea is required
 * @param {string} props.placeholder - Textarea placeholder
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.floating - Whether to use floating label effect (default: true)
 * @param {string} props.error - Error message
 * @param {number} props.rows - Number of rows
 * @param {Object} props.rest - Any other props to pass to the textarea
 */
const FormTextarea = ({
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  placeholder = '',
  className = '',
  floating = true,
  error = '',
  rows = 4,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Standard textarea with label above (legacy style)
  if (!floating) {
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={rows}
          className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${error ? 'border-red-500' : ''} ${className}`}
          {...rest}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }

  // Floating label textarea
  const shouldFloat = isFocused || value;
  // Always show the placeholder in dark mode
  const displayPlaceholder = label;

  return (
    <div className="floating-input-container">
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={displayPlaceholder}
        rows={rows}
        className={`floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none ${error ? 'border-red-500' : ''} ${className}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      />

      {/* Hide the label in dark mode since we're using placeholder instead */}
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none dark-mode-label
          ${shouldFloat
            ? 'text-sm text-green-500 -top-2.5 bg-white px-1'
            : 'text-gray-500 top-3'}`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FormTextarea;
