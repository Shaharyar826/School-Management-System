import React from 'react';

/**
 * Reusable form checkbox component
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Checkbox ID
 * @param {string} props.name - Checkbox name
 * @param {string} props.label - Checkbox label
 * @param {boolean} props.checked - Whether the checkbox is checked
 * @param {function} props.onChange - Change handler function
 * @param {boolean} props.required - Whether the checkbox is required
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.rest - Any other props to pass to the checkbox
 */
const FormCheckbox = ({
  id,
  name,
  label,
  checked,
  onChange,
  required = false,
  className = '',
  ...rest
}) => {
  return (
    <div className="flex items-center">
      <input
        id={id || name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        required={required}
        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${className}`}
        {...rest}
      />
      <label htmlFor={id || name} className="ml-2 block text-sm text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
};

export default FormCheckbox;
