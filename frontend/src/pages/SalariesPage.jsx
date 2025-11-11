import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const SalariesPage = () => {
  const { user } = useContext(AuthContext);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    status: '',
    month: ''
  });

  // Set current month as default when component mounts
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const currentMonth = `${year}-${month}`;
    console.log(`Setting default month to: ${currentMonth}`);

    // Set the current month as the default filter
    setFilter(prev => ({
      ...prev,
      month: currentMonth
    }));

    // Also update the month input element directly to ensure it displays correctly
    const monthInput = document.getElementById('month');
    if (monthInput) {
      monthInput.value = currentMonth;
    }
  }, []);

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        setLoading(true);

        // Build query string from filter
        const queryParams = new URLSearchParams();
        if (filter.status) queryParams.append('status', filter.status);
        if (filter.month) queryParams.append('month', filter.month);

        const url = `/api/salaries?${queryParams.toString()}`;
        console.log(`Fetching salaries with URL: ${url}`);
        const res = await axios.get(url);

        if (res.data.success) {
          setSalaryRecords(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching salaries:', err);
        setError('Failed to load salary records. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalaries();
  }, [filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(`Filter changed: ${name} = ${value}`);

    if (name === 'month') {
      // For month input, ensure we're using the HTML input type="month" format (YYYY-MM)
      if (value) {
        console.log(`Setting month filter to: ${value}`);
      } else {
        console.log('Clearing month filter');
      }
    }

    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatMonth = (monthStr) => {
    if (!monthStr) return '';

    // Check if the month is in MM/YYYY format
    const mmYYYYMatch = monthStr.match(/^(\d{2})\/(\d{4})$/);
    if (mmYYYYMatch) {
      const [, month, year] = mmYYYYMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    // Check if the month is in YYYY-MM format
    const yyyyMMMatch = monthStr.match(/^(\d{4})-(\d{2})$/);
    if (yyyyMMMatch) {
      const [, year, month] = yyyyMMMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    return monthStr; // Return as is if not in expected format
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Salary Management</h1>
          {user && ['admin', 'principal', 'accountant'].includes(user.role) && (
            <Link
              to="/salaries/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Salary Record
            </Link>
          )}
        </div>

        {/* Filter Controls */}
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="processing">Processing</option>
              </select>
            </div>
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
              <input
                type="month"
                name="month"
                id="month"
                value={filter.month}
                onChange={handleFilterChange}
                className="mt-1 focus:ring-yellow-500 focus:border-yellow-500 block w-full shadow-sm sm:text-sm border-yellow-300 rounded-md bg-yellow-50"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
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

        {/* Current filter indicator */}
        {filter.month && (
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Showing salary records for: <span className="font-medium">{formatMonth(filter.month)}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : salaryRecords.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No salary records found for the selected filters
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salaryRecords.map((salary) => (
                    <tr key={salary._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                            {salary.teacher?.user?.name?.charAt(0) || 'T'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {salary.teacher?.user?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {salary.teacher?.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatMonth(salary.month)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(salary.amount)}
                        </div>
                        {salary.status === 'partial' && (
                          <div className="text-sm text-gray-500">
                            Paid: {formatCurrency(salary.paidAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          salary.status === 'paid' ? 'bg-green-100 text-green-800' :
                          salary.status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                          salary.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                          salary.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {salary.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link to={`/salaries/${salary._id}`} className="text-blue-600 hover:text-blue-900">
                            View
                          </Link>
                          {user && ['admin', 'principal', 'accountant'].includes(user.role) && (
                            <>
                              <Link to={`/salaries/edit/${salary._id}`} className="text-green-600 hover:text-green-900">
                                Edit
                              </Link>
                              {salary.status !== 'paid' && (
                                <Link to={`/salaries/process-payment/${salary._id}`} className="text-indigo-600 hover:text-indigo-900">
                                  Process Payment
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalariesPage;
