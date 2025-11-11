import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import NoticeList from '../components/notices/NoticeList';
import NoticeForm from '../components/notices/NoticeForm';

const NoticeBoardPage = () => {
  const { user } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleAddClick = () => {
    setSelectedNotice(null);
    setShowForm(true);
  };
  
  const handleEditClick = (notice) => {
    setSelectedNotice(notice);
    setShowForm(true);
  };
  
  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedNotice(null);
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedNotice(null);
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Notice Board</h1>
          
          {user && ['admin', 'principal'].includes(user.role) && !showForm && (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Notice
            </button>
          )}
        </div>
        
        <div className="mt-6">
          {showForm ? (
            <NoticeForm 
              notice={selectedNotice} 
              onSuccess={handleFormSuccess} 
              onCancel={handleFormCancel} 
            />
          ) : (
            <NoticeList 
              key={refreshKey}
              limit={10} 
              showAddButton={false}
              onEditClick={handleEditClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeBoardPage;
