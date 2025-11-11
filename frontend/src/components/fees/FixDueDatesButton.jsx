import { useState } from 'react';
import { fixFeeDueDates } from '../../utils/feeUtils';

const FixDueDatesButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleFixDueDates = async () => {
    setLoading(true);
    setShowConfirmation(false);
    
    try {
      const result = await fixFeeDueDates();
      if (result.success) {
        onSuccess(`Fixed due dates for ${result.data.updatedCount} fee records. ${result.data.skippedCount} records were already correct.`);
      } else {
        alert(result.message || 'Failed to fix due dates');
      }
    } catch (error) {
      alert('Error fixing due dates');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Fix Fee Due Dates</h3>
            <button 
              onClick={() => setShowConfirmation(false)} 
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Confirm Due Date Fix</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>This will update all fee records to have due dates set to the last date of their respective months.</p>
                  <p className="mt-2 font-medium">For example:</p>
                  <ul className="mt-1 list-disc list-inside">
                    <li>January fees → Due on 31st January</li>
                    <li>February fees → Due on 28th/29th February</li>
                    <li>April fees → Due on 30th April</li>
                  </ul>
                  <p className="mt-2 text-yellow-600">This action will update existing fee records and cannot be undone.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 p-4 border-t">
            <button
              onClick={() => setShowConfirmation(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleFixDueDates}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50"
            >
              {loading ? 'Fixing...' : 'Fix Due Dates'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirmation(true)}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0V3m6 4v10a2 2 0 01-2 2H10a2 2 0 01-2-2V7" />
      </svg>
      {loading ? 'Fixing...' : 'Fix Due Dates'}
    </button>
  );
};

export default FixDueDatesButton;