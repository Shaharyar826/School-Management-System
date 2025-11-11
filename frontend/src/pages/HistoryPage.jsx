import { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const HistoryPage = () => {
  const { user } = useContext(AuthContext);
  const { entityType, entityId } = useParams();
  const navigate = useNavigate();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entity, setEntity] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  useEffect(() => {
    // Only admin and principal can access history
    if (!user || !['admin', 'principal'].includes(user.role)) {
      navigate('/dashboard');
      return;
    }
    
    if (entityType && entityId) {
      fetchEntityHistory();
      fetchEntityDetails();
    } else {
      fetchAllHistory();
    }
  }, [entityType, entityId, currentPage]);
  
  const fetchAllHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.get(`/api/history?page=${currentPage}&limit=10`);
      
      if (res.data.success) {
        setHistory(res.data.data);
        if (res.data.pagination) {
          setTotalPages(Math.ceil(res.data.count / 10));
        }
      } else {
        setError('Failed to fetch history');
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to fetch history. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const fetchEntityDetails = async () => {
    try {
      let endpoint;
      
      if (entityType === 'Meeting') {
        endpoint = `/api/meetings/${entityId}`;
      } else if (entityType === 'EventNotice') {
        endpoint = `/api/events-notices/${entityId}`;
      }
      
      if (endpoint) {
        const res = await axios.get(endpoint);
        
        if (res.data.success) {
          setEntity(res.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching entity details:', err);
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
  
  const getEntityTypeLabel = (type) => {
    switch (type) {
      case 'Meeting':
        return 'Meeting';
      case 'EventNotice':
        return 'Event/Notice';
      default:
        return type;
    }
  };
  
  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setViewMode('detail');
  };
  
  const handleBackToList = () => {
    setSelectedRecord(null);
    setViewMode('list');
  };
  
  const renderChanges = (changes) => {
    if (!changes || changes.length === 0) {
      return <p className="text-gray-500 italic">No changes recorded</p>;
    }
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Changes:</h4>
        <div className="bg-gray-50 p-3 rounded-md">
          <ul className="divide-y divide-gray-200">
            {changes.map((change, index) => (
              <li key={index} className="py-2">
                <div className="flex flex-col">
                  <span className="font-medium">{change.field}</span>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    <div>
                      <span className="text-xs text-gray-500">Old value:</span>
                      <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-auto max-h-20">
                        {change.oldValue !== null ? JSON.stringify(change.oldValue, null, 2) : 'null'}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">New value:</span>
                      <pre className="mt-1 text-xs bg-green-50 p-2 rounded overflow-auto max-h-20">
                        {change.newValue !== null ? JSON.stringify(change.newValue, null, 2) : 'null'}
                      </pre>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {entityType && entityId ? `History for ${getEntityTypeLabel(entityType)}` : 'History'}
          </h1>
          
          {entityType && entityId && (
            <button
              onClick={() => navigate('/history')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to All History
            </button>
          )}
        </div>
        
        {entity && (
          <div className="mt-4 bg-blue-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-blue-800">
              {entityType === 'Meeting' ? entity.title : entity.title}
            </h2>
            <p className="mt-1 text-sm text-blue-600">
              {entityType === 'Meeting' ? entity.description : entity.content}
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : error ? (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
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
        ) : viewMode === 'list' ? (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            {history.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No history records found
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {history.map((record) => (
                  <li key={record._id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium text-blue-600">
                                {record.description || `${record.action} ${record.entityType}`}
                              </h4>
                              <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(record.action)}`}>
                                {record.action}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              {!entityType && (
                                <span className="mr-2">
                                  <span className="font-medium">Type:</span> {getEntityTypeLabel(record.entityType)}
                                </span>
                              )}
                              <span>
                                <span className="font-medium">By:</span> {record.performedBy?.name || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end text-sm text-gray-500">
                          <div>{formatDate(record.createdAt)}</div>
                          <button
                            onClick={() => handleViewDetails(record)}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  History Record Details
                </h3>
                <button
                  onClick={handleBackToList}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to List
                </button>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Action</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(selectedRecord.action)}`}>
                      {selectedRecord.action}
                    </span>
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedRecord.createdAt)}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{getEntityTypeLabel(selectedRecord.entityType)}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Performed By</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedRecord.performedBy?.name || 'Unknown'}</dd>
                </div>
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedRecord.description}</dd>
                </div>
                
                {selectedRecord.changes && selectedRecord.changes.length > 0 && (
                  <div className="sm:col-span-2">
                    {renderChanges(selectedRecord.changes)}
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {viewMode === 'list' && !entityType && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                  currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                  currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                      currentPage === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                      currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
