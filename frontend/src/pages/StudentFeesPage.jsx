import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import StudentFeeBreakdown from '../components/fees/StudentFeeBreakdown';

const StudentFeesPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Fees</h1>
            <p className="mt-1 text-sm text-gray-500">
              View your fee records and payment status
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Fee Breakdown */}
        <div className="mt-6">
          <StudentFeeBreakdown />
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Important Information</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>Total Fees:</strong> Sum of all fee records created for you</p>
            <p>• <strong>Pending:</strong> Amount remaining to be paid on current fee records</p>
            <p>• <strong>Overdue:</strong> Fees that are past their due date and remain unpaid</p>
            <p>• Fee calculations are based only on actual fee records in the system</p>
            <p>• No fees are considered due until a fee record is created by the administration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeesPage;