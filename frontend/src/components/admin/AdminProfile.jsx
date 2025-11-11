import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        // Use relative URL to work with axios baseURL configuration
        const res = await axios.get('/api/admin-staff/profile', config);

        if (res.data.success) {
          setAdmin(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin profile:', err);

        // Get more specific error message
        if (err.response) {
          const errorMessage = err.response.data?.message || err.response.data?.error || 'Failed to fetch admin profile';
          setError(`${errorMessage} (Status: ${err.response.status})`);

          if (err.response.status === 401) {
            setError('Authentication error. Please log in again.');
          } else if (err.response.status === 403) {
            setError('You do not have permission to access this profile.');
          } else if (err.response.status === 404) {
            // Create a basic profile if one doesn't exist
            try {
              const token = localStorage.getItem('token');
              const config = {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              };

              const basicProfile = {
                adminStaffData: {
                  employeeId: `${user.role.toUpperCase()}-${Date.now()}`,
                  dateOfBirth: new Date(),
                  gender: 'other',
                  position: user.role,
                  department: 'Administration',
                  phoneNumber: 'Not Set',
                  qualification: 'Not Set',
                  experience: 0,
                  salary: 0,
                  user: user._id,
                  address: {
                    street: 'Not Set',
                    city: 'Not Set',
                    state: 'Not Set',
                    zipCode: 'Not Set',
                    country: 'Not Set'
                  }
                }
              };

              // Using old URL for screenshot
              const createRes = await axios.put('http://localhost:5000/api/admin-staff/profile', basicProfile, config);
              // New URL (commented for now - uncomment this and comment above line after screenshot)
              // const createRes = await axios.put('/api/admin-staff/profile', basicProfile, config);

              if (createRes.data.success) {
                setAdmin(createRes.data.data);
                setError('');
                return;
              }
            } catch (createErr) {
              console.error('Error creating admin profile:', createErr.response?.data || createErr);
              setError('Failed to create admin profile. Please contact system administrator.');
            }
          }
        } else if (err.request) {
          setError('No response from server. Please check your connection and try again.');
        } else {
          setError('Failed to fetch admin profile: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAdminProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">Admin profile not found. Please refresh the page to create a default profile.</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <Link
              to={`/profile/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden">
              {admin.user?.profileImage?.url ? (
                <img
                  src={admin.user.profileImage.url}
                  alt={admin.user?.name || 'Admin'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.user?.name?.charAt(0) || 'A')}&background=0D8ABC&color=fff&size=256`;
                  }}
                />
              ) : (
                <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {admin.user?.name?.charAt(0) || 'A'}
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{admin.user?.name}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">{admin.employeeId} | {admin.position}</p>
            </div>
            <div className="ml-auto">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{admin.user?.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{admin.user?.email}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Position</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{admin.position}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Department</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{admin.department}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{admin.phoneNumber}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {admin.dateOfBirth ? new Date(admin.dateOfBirth).toLocaleDateString() : 'Not specified'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {admin.gender ? admin.gender.charAt(0).toUpperCase() + admin.gender.slice(1) : 'Not specified'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Qualification</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{admin.qualification}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Experience (Years)</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{admin.experience}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;