import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDateForDisplay } from '../../utils/dateUtils';

const StudentFeeBreakdown = () => {
  const [feeData, setFeeData] = useState({
    totalFees: 0,
    paidAmount: 0,
    pendingFees: 0,
    overdue: 0,
    feeRecords: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      
      // Get student dashboard data which has corrected fee calculations
      const dashboardRes = await axios.get('/api/dashboard/student-metrics');
      
      if (dashboardRes.data.success) {
        const fees = dashboardRes.data.data.fees;
        
        // Get detailed fee records
        const feeRecordsRes = await axios.get('/api/fees', {
          params: { sort: '-dueDate' }
        });
        
        setFeeData({
          totalFees: fees.totalFees,
          paidAmount: fees.paidAmount,
          pendingFees: fees.pendingFees,
          overdue: fees.overdue,
          feeRecords: feeRecordsRes.data.success ? feeRecordsRes.data.data : []
        });
      }
    } catch (error) {
      console.error('Error fetching fee data:', error);
      setError('Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fee Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800">Total Fees</h3>
          <p className="text-2xl font-bold text-blue-900">₹{feeData.totalFees.toLocaleString()}</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800">Paid Amount</h3>
          <p className="text-2xl font-bold text-green-900">₹{feeData.paidAmount.toLocaleString()}</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
          <p className="text-2xl font-bold text-yellow-900">₹{feeData.pendingFees.toLocaleString()}</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800">Overdue</h3>
          <p className="text-2xl font-bold text-red-900">₹{feeData.overdue.toLocaleString()}</p>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Records</h3>
          
          {feeData.feeRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feeData.feeRecords.map((fee, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {fee.feeType.charAt(0).toUpperCase() + fee.feeType.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateForDisplay(fee.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{fee.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{fee.paidAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{fee.remainingAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                          fee.status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                          fee.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No fee records found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFeeBreakdown;