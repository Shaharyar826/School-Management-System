import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaUserEdit, FaSignOutAlt, FaUserCog, FaKey, FaShieldAlt, FaUser } from 'react-icons/fa';
import ProfileAvatar from '../components/common/ProfileAvatar';
import PasswordInput from '../components/common/PasswordInput';
import axios from 'axios';

const UserProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch user data based on role
        let response;
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        if (user.role === 'admin' || user.role === 'principal') {
          try {
            response = await axios.get('/api/admin-staff/profile', config);
            if (response.data.success) {
              // Combine user data with admin staff data
              setUserData({
                ...user,
                ...response.data.data.userData,
                adminStaffData: response.data.data.adminStaffData
              });
            }
          } catch (err) {
            console.error('Error fetching admin profile:', err);
            // Fall back to basic user data
            setUserData(user);
          }
        } else if (user.role === 'teacher') {
          try {
            response = await axios.get('/api/teachers/profile', config);
            if (response.data.success) {
              // Combine user data with teacher data
              setUserData({
                ...user,
                ...response.data.data.userData,
                teacherData: response.data.data.teacherData
              });
            }
          } catch (err) {
            console.error('Error fetching teacher profile:', err);
            // Fall back to basic user data
            setUserData(user);
          }
        } else {
          // For other roles, use the user data from context
          setUserData(user);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile data');
        // Fall back to using context data
        setUserData(user);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post('/api/users/reset-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        setPasswordSuccess('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Close the password reset form after 2 seconds
        setTimeout(() => {
          setShowPasswordReset(false);
          setPasswordSuccess('');
        }, 2000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountSettings = () => {
    // Future implementation for account settings
    alert('Account settings functionality will be implemented soon');
  };

  const handlePrivacySettings = () => {
    // Future implementation for privacy settings
    alert('Privacy settings functionality will be implemented soon');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-school-yellow"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">No user data available</div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-school-navy text-white">
          <h3 className="text-lg leading-6 font-medium">User Profile</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-300">Personal details and account settings</p>
        </div>

        <div className="border-t border-gray-200">
          <div className="flex flex-col md:flex-row">
            {/* Profile Information */}
            <div className="md:w-1/3 p-6 border-r border-gray-200">
              <div className="flex flex-col items-center">
                <div className="mb-4 border-4 border-school-yellow rounded-full">
                  <ProfileAvatar
                    profileImage={userData.profileImage}
                    name={userData.name}
                    role={userData.role}
                    size="2xl"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
                <p className="text-sm text-gray-500 capitalize">{userData.role}</p>
                <p className="text-sm text-gray-500 mt-1">{userData.email}</p>

                {/* Additional role-specific information */}
                {userData.role === 'teacher' && userData.teacherData && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">Employee ID: {userData.teacherData.employeeId}</p>
                    <p className="text-sm text-gray-600">Qualification: {userData.teacherData.qualification}</p>
                  </div>
                )}

                {userData.role === 'admin' && userData.adminStaffData && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">Employee ID: {userData.adminStaffData.employeeId}</p>
                    <p className="text-sm text-gray-600">Position: {userData.adminStaffData.position}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="md:w-2/3 p-6">
              {showPasswordReset ? (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
                    <button
                      onClick={() => setShowPasswordReset(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      &times; Close
                    </button>
                  </div>

                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                      {passwordSuccess}
                    </div>
                  )}

                  <form onSubmit={handlePasswordReset}>
                    <div className="mb-4">
                      <PasswordInput
                        id="currentPassword"
                        name="currentPassword"
                        label="Current Password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="mb-4">
                      <PasswordInput
                        id="newPassword"
                        name="newPassword"
                        label="New Password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="mb-4">
                      <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-school-navy hover:bg-school-navy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-school-yellow"
                      >
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Edit Profile */}
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <div className="rounded-full bg-school-yellow p-3 mr-4">
                        <FaUserEdit className="text-school-navy-dark text-xl" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-gray-900 font-medium">Edit Profile</h4>
                        <p className="text-gray-500 text-sm">Update your personal information</p>
                      </div>
                    </button>

                    {/* Reset Password */}
                    <button
                      onClick={() => setShowPasswordReset(true)}
                      className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <div className="rounded-full bg-school-yellow p-3 mr-4">
                        <FaKey className="text-school-navy-dark text-xl" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-gray-900 font-medium">Reset Password</h4>
                        <p className="text-gray-500 text-sm">Change your account password</p>
                      </div>
                    </button>

                    {/* Account Settings */}
                    <button
                      onClick={handleAccountSettings}
                      className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <div className="rounded-full bg-school-yellow p-3 mr-4">
                        <FaUserCog className="text-school-navy-dark text-xl" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-gray-900 font-medium">Account Settings</h4>
                        <p className="text-gray-500 text-sm">Manage your account preferences</p>
                      </div>
                    </button>

                    {/* Privacy Settings */}
                    <button
                      onClick={handlePrivacySettings}
                      className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <div className="rounded-full bg-school-yellow p-3 mr-4">
                        <FaShieldAlt className="text-school-navy-dark text-xl" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-gray-900 font-medium">Privacy Settings</h4>
                        <p className="text-gray-500 text-sm">Control your privacy preferences</p>
                      </div>
                    </button>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm hover:bg-red-100 transition-colors col-span-1 md:col-span-2"
                    >
                      <div className="rounded-full bg-red-500 p-3 mr-4">
                        <FaSignOutAlt className="text-white text-xl" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-red-700 font-medium">Logout</h4>
                        <p className="text-red-500 text-sm">Sign out of your account</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
