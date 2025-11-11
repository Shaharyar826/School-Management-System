import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * A portal component that renders its children in a div appended to document.body
 * This ensures the modal is completely separate from the rest of the DOM hierarchy
 */
const ModalPortal = ({ children, isOpen, onClose }) => {
  // Create a ref for the portal element
  const portalRef = useRef(null);
  
  // Create the portal element on mount
  useEffect(() => {
    // Create a div element for the portal
    const portalElement = document.createElement('div');
    portalElement.className = 'modal-portal-container';
    portalElement.style.position = 'fixed';
    portalElement.style.top = '0';
    portalElement.style.left = '0';
    portalElement.style.width = '100%';
    portalElement.style.height = '100%';
    portalElement.style.zIndex = '9999';
    portalElement.style.pointerEvents = 'none';
    
    // Append the portal element to the body
    document.body.appendChild(portalElement);
    
    // Store the portal element in the ref
    portalRef.current = portalElement;
    
    // Clean up the portal element on unmount
    return () => {
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
      }
    };
  }, []);
  
  // Add/remove modal-open class to body when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      
      if (portalRef.current) {
        portalRef.current.style.pointerEvents = 'auto';
      }
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      
      if (portalRef.current) {
        portalRef.current.style.pointerEvents = 'none';
      }
    }
    
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Don't render anything if the modal is not open or the portal element doesn't exist
  if (!isOpen || !portalRef.current) {
    return null;
  }
  
  // Create a portal to render the children in the portal element
  return createPortal(
    <div className="modal-portal">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-80"
        style={{ 
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    portalRef.current
  );
};

export default ModalPortal;
