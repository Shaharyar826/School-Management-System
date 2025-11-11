/**
 * A simple event service for global application events
 * Uses the browser's built-in CustomEvent API
 */

// Event types
export const EVENT_TYPES = {
  NEW_CONTACT_MESSAGE: 'new-contact-message',
};

/**
 * Emit an event with optional data
 * @param {string} eventType - The type of event to emit
 * @param {any} data - Optional data to include with the event
 */
export const emitEvent = (eventType, data = null) => {
  const event = new CustomEvent(eventType, { detail: data });
  window.dispatchEvent(event);
  console.log(`Event emitted: ${eventType}`, data);
};

/**
 * Listen for an event
 * @param {string} eventType - The type of event to listen for
 * @param {function} callback - The callback function to execute when the event is emitted
 * @returns {function} - A function to remove the event listener
 */
export const listenEvent = (eventType, callback) => {
  const handler = (event) => callback(event.detail);
  window.addEventListener(eventType, handler);
  
  // Return a function to remove the listener
  return () => {
    window.removeEventListener(eventType, handler);
  };
};
