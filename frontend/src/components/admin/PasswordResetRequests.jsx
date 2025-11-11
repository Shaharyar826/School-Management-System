import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmationModal from '../common/ConfirmationModal';

const PasswordResetRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [actionResult, setActionResult] = useState({ message: '', type: '', tempPassword: '', userEmail: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get('/api/password-reset/requests');

      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching password reset requests:', err);
      setError('Failed to load password reset requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      setActionResult({ message: '', type: '', tempPassword: '' });

      const res = await axios.put(`/api/password-reset/approve/${selectedRequest._id}`);

      if (res.data.success) {
        console.log('Password reset response:', res.data); // Debug log

        setActionResult({
          message: 'Password reset request approved successfully.',
          type: 'success',
          tempPassword: res.data.data.tempPassword,
          userEmail: res.data.data.user.email
        });

        // Remove the approved request from the list
        setRequests(requests.filter(req => req._id !== selectedRequest._id));

        // Show the login button
        setShowLoginButton(true);

        // Don't close the modal automatically so admin can see the password
        // The admin will close it manually after noting the password
      }
    } catch (err) {
      console.error('Error approving password reset:', err.response || err);
      setActionResult({
        message: err.response?.data?.message || 'Failed to approve password reset request.',
        type: 'error',
        tempPassword: ''
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      setActionResult({ message: '', type: '', tempPassword: '' });

      const res = await axios.put(`/api/password-reset/reject/${selectedRequest._id}`);

      if (res.data.success) {
        setActionResult({
          message: 'Password reset request rejected successfully.',
          type: 'success',
          tempPassword: ''
        });

        // Remove the rejected request from the list
        setRequests(requests.filter(req => req._id !== selectedRequest._id));

        // Close the modal after a delay
        setTimeout(() => {
          setIsRejectModalOpen(false);
          setSelectedRequest(null);
        }, 2000);
      }
    } catch (err) {
      setActionResult({
        message: err.response?.data?.message || 'Failed to reject password reset request.',
        type: 'error',
        tempPassword: ''
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchRequests}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Password Reset Requests</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Users who have forgotten their passwords
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="px-4 py-5 sm:p-6">
          <p className="text-center text-gray-500">No pending password reset requests</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {requests.map((request) => (
            <li key={request._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-600">{request.user?.name || 'Unknown User'}</h4>
                  <p className="text-sm text-gray-500">{request.email}</p>
                  <p className="text-xs text-gray-400">Requested: {new Date(request.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setIsApproveModalOpen(true);
                    }}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setIsRejectModalOpen(true);
                    }}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Approve Modal */}
      <ConfirmationModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setIsApproveModalOpen(false);
            setSelectedRequest(null);
            setActionResult({ message: '', type: '', tempPassword: '' });
          }
        }}
        onConfirm={handleApprove}
        title="Approve Password Reset"
        message={`Are you sure you want to approve the password reset request for ${selectedRequest?.user?.name || 'this user'}? A temporary password will be generated.`}
        confirmButtonText={isProcessing ? "Processing..." : "Yes, Approve"}
        cancelButtonText="Cancel"
        isDangerous={false}
        isDisabled={isProcessing}
        result={actionResult.message ? (
          <div className={`mt-4 p-4 rounded-md ${actionResult.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p>{actionResult.message}</p>
            {actionResult.tempPassword && (
              <div className="mt-2">
                <p className="font-bold">Temporary Password:</p>
                <p className="font-mono bg-gray-100 p-4 rounded mt-1 text-xl font-bold text-center border-2 border-blue-500">{actionResult.tempPassword}</p>
                <div className="mt-2 text-center">
                  <button
                    onClick={() => {
                      // Copy password to clipboard
                      navigator.clipboard.writeText(actionResult.tempPassword);
                      alert('Password copied to clipboard!');
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Copy Password
                  </button>
                </div>
                <p className="text-sm mt-2">Please provide this temporary password to the user. They will be required to change it after logging in.</p>

                {showLoginButton && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        // Create a direct login link with the credentials
                        const loginUrl = `/login?temp_password=${actionResult.tempPassword}&email=${encodeURIComponent(actionResult.userEmail)}`;

                        // Open the login page in a new tab
                        window.open(loginUrl, '_blank');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Open Login Page with Credentials
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      />

      {/* Reject Modal */}
      <ConfirmationModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setIsRejectModalOpen(false);
            setSelectedRequest(null);
            setActionResult({ message: '', type: '', tempPassword: '' });
          }
        }}
        onConfirm={handleReject}
        title="Reject Password Reset"
        message={`Are you sure you want to reject the password reset request for ${selectedRequest?.user?.name || 'this user'}?`}
        confirmButtonText={isProcessing ? "Processing..." : "Yes, Reject"}
        cancelButtonText="Cancel"
        isDangerous={true}
        isDisabled={isProcessing}
        result={actionResult.message ? (
          <div className={`mt-4 p-4 rounded-md ${actionResult.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p>{actionResult.message}</p>
          </div>
        ) : null}
      />
    </div>
      // document.body
  );
};

export default PasswordResetRequests;
