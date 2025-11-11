import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../common/Spinner';

const EntityHistory = ({ entityType, entityId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (entityType && entityId) {
      fetchEntityHistory();
    }
  }, [entityType, entityId]);
  
  const fetchEntityHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.get(`/api/history/${entityType}/${entityId}`);
      
      if (res.data.success) {
        setHistory(res.data.data);
      } else {
        setError('Failed to fetch entity history');
      }
    } catch (err) {
      console.error('Error fetching entity history:', err);
      setError('Failed to fetch entity history. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'cancel':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          History
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          View the complete history of changes
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <div className="px-4 py-5 sm:p-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : history.length === 0 ? (
        <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
          No history records found
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {history.map((record) => (
            <li key={record._id} className="hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div>
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-blue-600">
                          {record.description || `${record.action} ${record.entityType}`}
                        </h4>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(record.action)}`}>
                          {record.action}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span>
                          <span className="font-medium">By:</span> {record.performedBy?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-sm text-gray-500">
                    <div>{formatDate(record.createdAt)}</div>
                    <Link
                      to={`/history/${entityType}/${entityId}/${record._id}`}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <Link
          to={`/history/${entityType}/${entityId}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Full History
        </Link>
      </div>
    </div>
  );
};

export default EntityHistory;
