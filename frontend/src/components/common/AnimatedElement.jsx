import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * AnimatedElement component
 * 
 * A wrapper component that applies consistent animations across both light and dark themes
 * using framer-motion. This ensures animations work the same way regardless of theme.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to be animated
 * @param {string} props.type - Animation type (e.g., 'card', 'button', 'icon', etc.)
 * @param {Object} props.customVariants - Custom animation variants to override defaults
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 * @param {string} props.as - HTML element or component to render (default: 'div')
 * @param {Object} props.rest - Any other props to pass to the motion component
 */
const AnimatedElement = ({ 
  children, 
  type = 'default', 
  customVariants = {}, 
  className = '', 
  style = {}, 
  as = 'div',
  ...rest 
}) => {
  const { theme } = useTheme();
  const isLightTheme = theme === 'light';

  // Default animation variants
  const defaultVariants = {
    default: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.5 }
      },
      hover: { scale: 1.02 }
    },
    card: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5 }
      },
      hover: { 
        y: -5, 
        boxShadow: isLightTheme 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' 
          : '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }
    },
    button: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.3 }
      },
      hover: { scale: 1.05 },
      tap: { scale: 0.95 }
    },
    icon: {
      hidden: { opacity: 0, rotate: -10 },
      visible: { 
        opacity: 1, 
        rotate: 0,
        transition: { duration: 0.5 }
      },
      hover: { scale: 1.1, rotate: 5 }
    },
    link: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.3 }
      },
      hover: { 
        scale: 1.05,
        color: isLightTheme ? '#E6B800' : '#FFE066'
      }
    },
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2,
          delayChildren: 0.3
        }
      }
    },
    item: {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.7,
          ease: "easeOut"
        }
      }
    },
    scrollIndicator: {
      hidden: { opacity: 0, y: -10 },
      visible: { 
        opacity: [0.2, 1, 0.2], 
        y: [0, 10, 0],
        transition: { 
          duration: 2,
          repeat: Infinity,
          repeatType: "loop"
        }
      }
    }
  };

  // Select the appropriate variants based on type
  const variants = customVariants.hasOwnProperty('hidden') 
    ? customVariants 
    : defaultVariants[type] || defaultVariants.default;

  // Create the motion component with the specified HTML element
  const MotionComponent = motion[as];

  return (
    <MotionComponent
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover={variants.hover ? "hover" : undefined}
      whileTap={variants.tap ? "tap" : undefined}
      {...rest}
    >
      {children}
    </MotionComponent>
  );
};

export default AnimatedElement;
