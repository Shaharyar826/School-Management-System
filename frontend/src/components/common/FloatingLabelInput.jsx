import { useState } from 'react';

/**
 * Floating label input component that animates the label when the input is focused
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.label - Input label/placeholder text
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler function
 * @param {boolean} props.required - Whether the input is required
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.rest - Any other props to pass to the input
 */
const FloatingLabelInput = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  required = false,
  className = '',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Determine if the label should be floating (when input is focused or has a value)
  const shouldFloat = isFocused || value;

  return (
    <div className="floating-input-container relative">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className={`floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none ${className}`}
        placeholder=" " // Empty placeholder to prevent browser default behavior
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

      {/* Horizontal line for visual effect when label is floating */}
      {shouldFloat && (
        <div className="absolute top-0 left-0 w-full h-0 border-t border-green-500 pointer-events-none"></div>
      )}
    </div>
  );
};

export default FloatingLabelInput;
