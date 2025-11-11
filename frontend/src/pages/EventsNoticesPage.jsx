import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import NoticeList from '../components/notices/NoticeList';
import NoticeForm from '../components/notices/NoticeForm';

const EventsNoticesPage = () => {
  const { user } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'events', 'notices'
  
  const handleAddClick = (type) => {
    setSelectedNotice({
      type: type // Set the default type for new item
    });
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Events and Notices</h1>
          
          {user && ['admin', 'principal'].includes(user.role) && !showForm && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleAddClick('event')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Event
              </button>
              <button
                onClick={() => handleAddClick('notice')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Notice
              </button>
            </div>
          )}
        </div>

        {!showForm && (
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('all')}
                className={`${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                All
              </button>
              <button
                onClick={() => handleTabChange('events')}
                className={`${
                  activeTab === 'events'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Events
              </button>
              <button
                onClick={() => handleTabChange('notices')}
                className={`${
                  activeTab === 'notices'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Notices
              </button>
            </nav>
          </div>
        )}
        
        <div className="mt-6">
          {showForm ? (
            <NoticeForm 
              notice={selectedNotice} 
              onSuccess={handleFormSuccess} 
              onCancel={handleFormCancel} 
            />
          ) : (
            <NoticeList 
              key={`${refreshKey}-${activeTab}`}
              limit={10} 
              showAddButton={false}
              onEditClick={handleEditClick}
              filter={activeTab !== 'all' ? { type: activeTab === 'events' ? 'event' : 'notice' } : {}}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsNoticesPage;
