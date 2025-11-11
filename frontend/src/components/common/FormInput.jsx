import React, { useState } from 'react';

/**
 * Reusable form input component with the glowing effect and floating label
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.label - Input label
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler function
 * @param {boolean} props.required - Whether the input is required
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.floating - Whether to use floating label effect (default: true)
 * @param {string} props.error - Error message
 * @param {Object} props.rest - Any other props to pass to the input
 */
const FormInput = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  required = false,
  placeholder = '',
  className = '',
  floating = true,
  error = '',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Standard input with label above (legacy style)
  if (!floating) {
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder || ""}
          className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${error ? 'border-red-500' : ''} ${className}`}
          {...rest}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }

  // Floating label input
  const shouldFloat = isFocused || value;
  // Use empty placeholder to prevent browser default behavior
  // This allows only the label to be visible and float properly
  const displayPlaceholder = " ";

  return (
    <div className="floating-input-container">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={displayPlaceholder}
        className={`floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none ${error ? 'border-red-500' : ''} ${className}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      />

      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${shouldFloat
            ? 'text-sm text-green-500 -top-2.5 bg-white dark:bg-[#1e293b] px-1'
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

export default FormInput;
