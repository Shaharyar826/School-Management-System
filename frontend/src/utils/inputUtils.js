/**
 * Utility functions for working with input fields
 */

import { useState } from 'react';
import FormInput from '../components/common/FormInput';

/**
 * Converts a standard input field to a floating label input
 *
 * @param {Object} inputProps - The props for the input field
 * @param {string} inputProps.id - Input ID
 * @param {string} inputProps.name - Input name
 * @param {string} inputProps.label - Input label (will be used as placeholder if no placeholder is provided)
 * @param {string} inputProps.placeholder - Input placeholder (optional)
 * @param {string} inputProps.type - Input type (default: 'text')
 * @param {boolean} inputProps.required - Whether the input is required
 * @param {string} inputProps.value - Input value
 * @param {function} inputProps.onChange - Change handler function
 * @param {string} inputProps.className - Additional CSS classes
 * @param {Object} inputProps.rest - Any other props to pass to the input
 * @returns {JSX.Element} - A FormInput component with floating label
 */
export const createFloatingInput = ({
  id,
  name,
  label,
  placeholder = '',
  type = 'text',
  required = false,
  value,
  onChange,
  className = '',
  ...rest
}) => {
  // Use empty placeholder for floating label effect
  const effectivePlaceholder = " ";

  return (
    <FormInput
      id={id}
      name={name}
      type={type}
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={effectivePlaceholder}
      className={className}
      floating={true}
      {...rest}
    />
  );
};

/**
 * Creates a floating label select input
 *
 * @param {Object} selectProps - The props for the select field
 * @param {string} selectProps.id - Select ID
 * @param {string} selectProps.name - Select name
 * @param {string} selectProps.label - Select label
 * @param {boolean} selectProps.required - Whether the select is required
 * @param {string} selectProps.value - Select value
 * @param {function} selectProps.onChange - Change handler function
 * @param {Array} selectProps.options - Array of options [{value, label}]
 * @param {boolean} selectProps.includeEmpty - Whether to include an empty option
 * @param {string} selectProps.emptyOptionLabel - Label for the empty option
 * @param {string} selectProps.className - Additional CSS classes
 * @returns {JSX.Element} - A select input with floating label
 */
export const createFloatingSelect = ({
  id,
  name,
  label,
  required = false,
  value,
  onChange,
  options = [],
  includeEmpty = true,
  emptyOptionLabel = 'Select...',
  className = '',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const shouldFloat = isFocused || value;

  return (
    <div className="floating-input-container">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none ${className}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      >
        {includeEmpty && <option value="">{emptyOptionLabel}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${shouldFloat
            ? 'text-sm text-green-500 -top-2.5 bg-white px-1'
            : 'text-gray-500 top-3'}`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
};
