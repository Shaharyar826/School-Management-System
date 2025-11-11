import React from 'react';
import PendingApprovals from '../components/admin/PendingApprovals';

// Create a dedicated page component for pending approvals
// Using React.memo with a custom comparison function to prevent unnecessary re-renders
const PendingApprovalsPage = React.memo(() => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Pending Account Approvals</h1>
        <PendingApprovals />
      </div>
    </div>
  );
}, () => true); // Always return true to prevent re-renders

export default PendingApprovalsPage;
