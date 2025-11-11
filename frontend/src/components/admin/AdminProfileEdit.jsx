import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../common/FormInput';
import ImageUpload from '../common/ImageUpload';

const AdminProfileEdit = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [userData, setUserData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    name: '',
    email: '',
    profileImage: ''
  });

  const [profileImageFile, setProfileImageFile] = useState(null);

  const [adminData, setAdminData] = useState({
    phoneNumber: '',
    qualification: '',
    position: '',
    department: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch user data
        const userRes = await axios.get('/api/auth/me');

        if (userRes.data.success) {
          const userData = userRes.data.data;
          setUserData({
            firstName: userData.firstName || '',
            middleName: userData.middleName || '',
            lastName: userData.lastName || '',
            name: userData.name || '',
            email: userData.email || '',
            profileImage: userData.profileImage || ''
          });
        }

        // Fetch admin staff data if it exists
        try {
          const adminRes = await axios.get('/api/admin-staff/profile');

          if (adminRes.data.success) {
            const adminData = adminRes.data.data;
            setAdminData({
              phoneNumber: adminData.phoneNumber || '',
              qualification: adminData.qualification || '',
              position: adminData.position || '',
              department: adminData.department || '',
              dateOfBirth: adminData.dateOfBirth ? new Date(adminData.dateOfBirth).toISOString().split('T')[0] : '',
              gender: adminData.gender || '',
              address: {
                street: adminData.address?.street || '',
                city: adminData.address?.city || '',
                state: adminData.address?.state || '',
                zipCode: adminData.address?.zipCode || '',
                country: adminData.address?.country || ''
              }
            });
          }
        } catch (err) {
          // It's okay if admin staff data doesn't exist yet
          console.log('No admin staff profile found, will create one if needed');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleProfileImageSelect = (url, metadata) => {
    if (url) {
      setUserData(prev => ({
        ...prev,
        profileImage: {
          url,
          metadata
        }
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        profileImage: null
      }));
    }
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      // Handle nested address fields
      const [parent, child] = name.split('.');
      setAdminData({
        ...adminData,
        [parent]: {
          ...adminData[parent],
          [child]: value
        }
      });
    } else {
      setAdminData({
        ...adminData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // If a new profile image was selected, update userData with the new image
      if (profileImageFile && typeof profileImageFile === 'string') {
        userData.profileImage = profileImageFile;
      }

      // Update user profile
      const res = await axios.put('/api/admin-staff/profile', {
        userData,
        adminStaffData: adminData
      });

      if (res.data.success) {
        setSuccess('Profile updated successfully');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Profile</h1>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
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
        )}

        {success && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 relative z-20">
          <form onSubmit={handleSubmit} className="relative z-30">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">User Information</h3>
                <div className="mt-5 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <FormInput
                      id="firstName"
                      name="firstName"
                      type="text"
                      label="First Name"
                      required
                      value={userData.firstName}
                      onChange={handleUserChange}
                    />

                    <FormInput
                      id="middleName"
                      name="middleName"
                      type="text"
                      label="Middle Name"
                      value={userData.middleName}
                      onChange={handleUserChange}
                    />

                    <FormInput
                      id="lastName"
                      name="lastName"
                      type="text"
                      label="Last Name"
                      required
                      value={userData.lastName}
                      onChange={handleUserChange}
                    />
                  </div>

                  <FormInput
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    required
                    value={userData.email}
                    onChange={handleUserChange}
                  />

                  <ImageUpload
                    onImageSelect={handleProfileImageSelect}
                    initialImage={userData.profileImage}
                    label="Profile Picture"
                    imageType="profile"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mt-5 md:mt-0">Personal Information</h3>
                <div className="mt-5 space-y-6">
                  <FormInput
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    label="Phone Number"
                    value={adminData.phoneNumber}
                    onChange={handleAdminChange}
                  />

                  <FormInput
                    id="qualification"
                    name="qualification"
                    type="text"
                    label="Qualification"
                    value={adminData.qualification}
                    onChange={handleAdminChange}
                  />

                  <FormInput
                    id="position"
                    name="position"
                    type="text"
                    label="Position"
                    value={adminData.position}
                    onChange={handleAdminChange}
                  />

                  <FormInput
                    id="department"
                    name="department"
                    type="text"
                    label="Department"
                    value={adminData.department}
                    onChange={handleAdminChange}
                    placeholder="Enter department"
                  />

                  <FormInput
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    label="Date of Birth"
                    value={adminData.dateOfBirth}
                    onChange={handleAdminChange}
                  />

                  <div className="floating-input-container">
                    <select
                      name="gender"
                      id="gender"
                      className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                      value={adminData.gender}
                      onChange={handleAdminChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <label
                      htmlFor="gender"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${adminData.gender ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                    >
                      Gender
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Address Information</h3>
              <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <FormInput
                    id="address.street"
                    name="address.street"
                    type="text"
                    label="Street Address"
                    value={adminData.address.street}
                    onChange={handleAdminChange}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="sm:col-span-2">
                  <FormInput
                    id="address.city"
                    name="address.city"
                    type="text"
                    label="City"
                    value={adminData.address.city}
                    onChange={handleAdminChange}
                    placeholder="Enter city"
                  />
                </div>

                <div className="sm:col-span-2">
                  <FormInput
                    id="address.state"
                    name="address.state"
                    type="text"
                    label="State / Province"
                    value={adminData.address.state}
                    onChange={handleAdminChange}
                    placeholder="Enter state"
                  />
                </div>

                <div className="sm:col-span-2">
                  <FormInput
                    id="address.zipCode"
                    name="address.zipCode"
                    type="text"
                    label="ZIP / Postal Code"
                    value={adminData.address.zipCode}
                    onChange={handleAdminChange}
                    placeholder="Enter ZIP code"
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormInput
                    id="address.country"
                    name="address.country"
                    type="text"
                    label="Country"
                    value={adminData.address.country}
                    onChange={handleAdminChange}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileEdit;
