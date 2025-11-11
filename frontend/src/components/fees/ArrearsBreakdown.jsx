import { useState, useEffect } from 'react';
import { fetchStudentArrears } from '../../utils/feeUtils';

const ArrearsBreakdown = ({ studentId, onClose }) => {
  const [arrearsData, setArrearsData] = useState({ totalArrears: 0, breakdown: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArrears = async () => {
      if (studentId) {
        try {
          const response = await fetchStudentArrears(studentId);
          if (response && typeof response === 'object') {
            setArrearsData(response);
          } else {
            // Handle legacy number format
            setArrearsData({ totalArrears: response || 0, breakdown: [] });
          }
        } catch (error) {
          setArrearsData({ totalArrears: 0, breakdown: [] });
        }
      }
      setLoading(false);
    };
    loadArrears();
  }, [studentId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Arrears Breakdown</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {arrearsData.totalArrears > 0 ? (
            <>
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <div className="text-lg font-semibold text-red-800">
                  Total Arrears: ₹{arrearsData.totalArrears.toLocaleString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Month-wise Breakdown:</h4>
                {arrearsData.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{item.month}</div>
                      <div className="text-sm text-gray-600 capitalize">{item.feeType} - {item.status}</div>
                    </div>
                    <div className="font-semibold text-red-600">
                      ₹{item.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-green-600 text-lg font-semibold">No Arrears</div>
              <div className="text-gray-500">All fees are up to date</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArrearsBreakdown;