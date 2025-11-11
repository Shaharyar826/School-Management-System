import { useNavigation } from '../../context/NavigationContext';

/**
 * A reusable back button component that uses the NavigationContext
 * to navigate back to the previous page or a default fallback route.
 * 
 * @param {Object} props - Component props
 * @param {string} props.defaultPath - Default path to navigate to if no previous path exists
 * @param {string} props.label - Button label text (defaults to "Back")
 * @param {string} props.className - Additional CSS classes for styling
 * @param {Function} props.onClick - Optional callback to execute before navigation
 */
const BackButton = ({ 
  defaultPath = '/dashboard', 
  label = 'Back', 
  className = '', 
  onClick = null 
}) => {
  const { goBack } = useNavigation();

  const handleClick = () => {
    // Execute the onClick callback if provided
    if (onClick && typeof onClick === 'function') {
      onClick();
    }
    
    // Navigate back using the navigation context
    goBack(defaultPath);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
    >
      {label}
    </button>
  );
};

export default BackButton;
