import { useState, useEffect, useContext, useCallback, memo } from 'react';
import AuthContext from '../../context/AuthContext';

// Memoize the component to prevent unnecessary re-renders
const PendingApprovals = memo(() => {
  const { getPendingApprovals, approveUser, rejectUser } = useContext(AuthContext);

  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use useCallback with a ref to avoid dependency on getPendingApprovals
  const fetchPendingApprovals = useCallback(async () => {
    if (!getPendingApprovals) return; // Safety check

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const result = await getPendingApprovals();

      if (result?.success) {
        setPendingUsers(result.data || []);
      } else {
        setError(result?.message || 'Failed to fetch pending approvals');
      }
    } catch (err) {
      setError('An error occurred while fetching pending approvals');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array for stable reference

  // Only run once on mount
  useEffect(() => {
    fetchPendingApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use useCallback with no dependencies for the approval handler
  const handleApprove = useCallback(async (userId) => {
    if (!approveUser) return; // Safety check

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await approveUser(userId);

      if (result?.success) {
        setSuccess(result.message || 'User approved successfully');
        // Use functional update to avoid stale state
        setPendingUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      } else {
        setError(result?.message || 'Failed to approve user');
      }
    } catch (err) {
      setError('An error occurred while approving user');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array for stable reference

  // Use useCallback with no dependencies for the rejection handler
  const handleReject = useCallback(async (userId) => {
    if (!rejectUser) return; // Safety check

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await rejectUser(userId);

      if (result?.success) {
        setSuccess(result.message || 'User rejected successfully');
        // Use functional update to avoid stale state
        setPendingUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      } else {
        setError(result?.message || 'Failed to reject user');
      }
    } catch (err) {
      setError('An error occurred while rejecting user');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array for stable reference

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Account Approvals</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Approve or reject user registration requests
          </p>
        </div>
        <button
          onClick={fetchPendingApprovals}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 mx-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 mx-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500">
          No pending approvals found
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {pendingUsers.map((user) => (
            <li key={user._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {user.role}
                    </span>
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleApprove(user._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default PendingApprovals;
