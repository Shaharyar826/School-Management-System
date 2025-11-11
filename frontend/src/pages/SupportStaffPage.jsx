import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Pagination from '../components/common/Pagination';

const SupportStaffPage = () => {
  const { user } = useContext(AuthContext);
  const [supportStaff, setSupportStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  // Pagination state - simplified approach
  const [currentPage, setCurrentPage] = useState(1);
  const [staffPerPage, setStaffPerPage] = useState(5); // Start with 5 for testing
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchSupportStaff = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/support-staff');

        if (res.data.success) {
          console.log('Support staff fetched:', res.data.data.length);
          setSupportStaff(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching support staff:', err);
        setError('Failed to load support staff. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    console.log('Component mounted - fetching support staff');
    fetchSupportStaff();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handlePositionFilter = (e) => {
    setPositionFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Function to handle page changes with loading indicator
  const handlePageChange = (newPage) => {
    // Simple validation
    if (newPage < 1) return;

    // Show loading indicator
    setIsLoadingMore(true);

    // Update page
    setCurrentPage(newPage);

    // Hide loading indicator after a short delay
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 300);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newValue) => {
    setIsLoadingMore(true);
    setStaffPerPage(Number(newValue));
    setCurrentPage(1); // Reset to first page

    setTimeout(() => {
      setIsLoadingMore(false);
    }, 300);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/support-staff/${id}`);
        setSupportStaff(supportStaff.filter(staff => staff._id !== id));
      } catch (err) {
        console.error('Error deleting support staff:', err);
        alert('Failed to delete support staff member');
      }
    }
  };

  // Get unique positions for filter dropdown
  const positions = [...new Set(supportStaff.map(staff => staff.position))];

  // Filter support staff based on search term and position filter
  const getFilteredStaff = () => {
    return supportStaff.filter(staff => {
      const matchesSearch =
        staff.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phoneNumber?.includes(searchTerm);

      const matchesPosition = positionFilter ? staff.position === positionFilter : true;

      return matchesSearch && matchesPosition;
    });
  };

  // Get paginated staff
  const getPaginatedStaff = () => {
    const filteredStaff = getFilteredStaff();
    const startIndex = (currentPage - 1) * staffPerPage;
    const endIndex = startIndex + staffPerPage;
    return filteredStaff.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = () => {
    const filteredStaff = getFilteredStaff();
    return Math.max(1, Math.ceil(filteredStaff.length / staffPerPage));
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Support Staff Management</h1>
          {user && (user.role === 'admin' || user.role === 'principal') && (
            <Link
              to="/support-staff/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Support Staff
            </Link>
          )}
        </div>

        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                name="search"
                id="search"
                placeholder="Search by name, ID, or phone..."
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div>
              <label htmlFor="position-filter" className="block text-sm font-medium text-gray-700">
                Filter by Position
              </label>
              <select
                id="position-filter"
                name="position-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={positionFilter}
                onChange={handlePositionFilter}
              >
                <option value="">All Positions</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position.charAt(0).toUpperCase() + position.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
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
          ) : getFilteredStaff().length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No support staff found
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {getPaginatedStaff().map((staff) => (
                    <li key={staff._id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                              {staff.user?.profileImage?.url ? (
                                <img
                                  src={staff.user.profileImage.url}
                                  alt={staff.user?.name || 'Support'}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.user?.name?.charAt(0) || 'S')}&background=0D8ABC&color=fff&size=256`;
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                  {staff.user?.name?.charAt(0) || 'S'}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{staff.user?.name}</div>
                              <div className="text-sm text-gray-500">ID: {staff.employeeId}</div>
                              <div className="text-sm text-gray-500">
                                Position: {staff.position.charAt(0).toUpperCase() + staff.position.slice(1)}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              to={`/support-staff/${staff._id}`}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              View Details
                            </Link>
                            {user && (user.role === 'admin' || user.role === 'principal') && (
                              <>
                                <Link
                                  to={`/support-staff/edit/${staff._id}`}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleDelete(staff._id)}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pagination component */}
              <Pagination
                currentPage={currentPage}
                totalItems={getFilteredStaff().length}
                itemsPerPage={staffPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                loading={isLoadingMore}
                itemName="staff members"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportStaffPage;
