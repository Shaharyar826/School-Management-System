import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import ImageUpload from '../../components/common/ImageUpload';

const AddAdminStaff = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [userData, setUserData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'admin',
    profileImage: ''
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [validateForm, setValidateForm] = useState(false);

  const [adminStaffData, setAdminStaffData] = useState({
    employeeId: '',
    phoneNumber: '',
    qualification: '',
    position: '',
    department: '',
    joiningDate: '',
    salary: '',
    dateOfBirth: '',
    gender: '',
    experience: '',
    responsibilities: [],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const handleUserChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileImageSelect = (imageFile) => {
    if (imageFile) {
      setProfileImageFile(imageFile);
    }
  };

  const handleAdminStaffChange = (e) => {
    const { name, value } = e.target;

    if (name === 'responsibilities') {
      // Convert comma-separated string to array
      setAdminStaffData({
        ...adminStaffData,
        [name]: value.split(',').map(item => item.trim())
      });
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setAdminStaffData({
        ...adminStaffData,
        [parent]: {
          ...adminStaffData[parent],
          [child]: value
        }
      });
    } else {
      setAdminStaffData({
        ...adminStaffData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidateForm(true);

    // Check if profile image is selected and uploaded (will be a string path if uploaded)
    if (!profileImageFile || typeof profileImageFile !== 'string') {
      setError('Please upload a profile picture');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Set the profile image path in userData
      userData.profileImage = profileImageFile;

      const res = await axios.post('/api/admin-staff', {
        userData,
        adminStaffData
      });

      if (res.data.success) {
        navigate('/admin-staff');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add administrative staff');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Add Administrative Staff</h1>
        </div>

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

        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 relative z-20">
          <form onSubmit={handleSubmit} className="relative z-30">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">User Information</h3>
                <div className="mt-5 space-y-6">
                  <FormInput
                    id="firstName"
                    name="firstName"
                    type="text"
                    label="First Name"
                    required
                    value={userData.firstName}
                    onChange={handleUserChange}
                    placeholder="Enter first name"
                  />

                  <FormInput
                    id="middleName"
                    name="middleName"
                    type="text"
                    label="Middle Name"
                    value={userData.middleName}
                    onChange={handleUserChange}
                    placeholder="Enter middle name (optional)"
                  />

                  <FormInput
                    id="lastName"
                    name="lastName"
                    type="text"
                    label="Last Name"
                    required
                    value={userData.lastName}
                    onChange={handleUserChange}
                    placeholder="Enter last name"
                  />

                  <FormInput
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    required
                    value={userData.email}
                    onChange={handleUserChange}
                    placeholder="Enter email address"
                  />

                  <FormInput
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    required
                    value={userData.password}
                    onChange={handleUserChange}
                    placeholder="Enter password"
                  />

                  <ImageUpload
                    onImageSelect={handleProfileImageSelect}
                    label="Profile Picture"
                    required={true}
                    imageType="profile"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mt-5 md:mt-0">Personal Information</h3>
                <div className="mt-5 space-y-6">
                  <FormInput
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    label="Employee ID"
                    required
                    value={adminStaffData.employeeId}
                    onChange={handleAdminStaffChange}
                    placeholder="Enter employee ID"
                  />

                  <FormInput
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    label="Phone Number"
                    required
                    value={adminStaffData.phoneNumber}
                    onChange={handleAdminStaffChange}
                    placeholder="Enter phone number"
                  />

                  <div className="floating-input-container">
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      required
                      className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                      value={adminStaffData.dateOfBirth}
                      onChange={handleAdminStaffChange}
                    />
                    <label
                      htmlFor="dateOfBirth"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${adminStaffData.dateOfBirth ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                    >
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="floating-input-container">
                    <select
                      id="gender"
                      name="gender"
                      required
                      className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                      value={adminStaffData.gender}
                      onChange={handleAdminStaffChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <label
                      htmlFor="gender"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${adminStaffData.gender ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                    >
                      Gender <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Professional Information</h3>
                  <div className="mt-5 space-y-6">
                    <div className="floating-input-container">
                      <select
                        id="position"
                        name="position"
                        required
                        className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                        value={adminStaffData.position}
                        onChange={handleAdminStaffChange}
                      >
                        <option value="">Select Position</option>
                        <option value="accountant">Accountant</option>
                        <option value="clerk">Clerk</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="librarian">Librarian</option>
                        <option value="lab-assistant">Lab Assistant</option>
                        <option value="office-assistant">Office Assistant</option>
                        <option value="other">Other</option>
                      </select>
                      <label
                        htmlFor="position"
                        className={`absolute left-4 transition-all duration-200 pointer-events-none
                          ${adminStaffData.position ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                      >
                        Position <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <FormInput
                      id="department"
                      name="department"
                      type="text"
                      label="Department"
                      required
                      value={adminStaffData.department}
                      onChange={handleAdminStaffChange}
                      placeholder="Enter department"
                    />

                    <FormInput
                      id="qualification"
                      name="qualification"
                      type="text"
                      label="Qualification"
                      required
                      value={adminStaffData.qualification}
                      onChange={handleAdminStaffChange}
                      placeholder="Enter qualification"
                    />

                    <FormInput
                      id="experience"
                      name="experience"
                      type="number"
                      label="Years of Experience"
                      required
                      min="0"
                      value={adminStaffData.experience}
                      onChange={handleAdminStaffChange}
                      placeholder="Enter years of experience"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mt-5 md:mt-0">Employment Details</h3>
                  <div className="mt-5 space-y-6">
                    <div className="floating-input-container">
                      <input
                        type="date"
                        name="joiningDate"
                        id="joiningDate"
                        required
                        className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                        value={adminStaffData.joiningDate}
                        onChange={handleAdminStaffChange}
                      />
                      <label
                        htmlFor="joiningDate"
                        className={`absolute left-4 transition-all duration-200 pointer-events-none
                          ${adminStaffData.joiningDate ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                      >
                        Joining Date <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <FormInput
                      id="salary"
                      name="salary"
                      type="number"
                      label="Salary"
                      required
                      min="0"
                      value={adminStaffData.salary}
                      onChange={handleAdminStaffChange}
                      placeholder="Enter salary amount"
                    />

                    <div className="floating-input-container">
                      <textarea
                        id="responsibilities"
                        name="responsibilities"
                        rows={3}
                        className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                        value={adminStaffData.responsibilities.join(', ')}
                        onChange={handleAdminStaffChange}
                        placeholder=" "
                      />
                      <label
                        htmlFor="responsibilities"
                        className={`absolute left-4 transition-all duration-200 pointer-events-none
                          ${adminStaffData.responsibilities.length > 0 ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                      >
                        Responsibilities (comma-separated) <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Address Information</h3>
              <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <FormInput
                    id="address.street"
                    name="address.street"
                    type="text"
                    label="Street Address"
                    value={adminStaffData.address.street}
                    onChange={handleAdminStaffChange}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormInput
                    id="address.city"
                    name="address.city"
                    type="text"
                    label="City"
                    value={adminStaffData.address.city}
                    onChange={handleAdminStaffChange}
                    placeholder="Enter city"
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormInput
                    id="address.state"
                    name="address.state"
                    type="text"
                    label="State / Province"
                    value={adminStaffData.address.state}
                    onChange={handleAdminStaffChange}
                    placeholder="Enter state/province"
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormInput
                    id="address.zipCode"
                    name="address.zipCode"
                    type="text"
                    label="ZIP / Postal Code"
                    value={adminStaffData.address.zipCode}
                    onChange={handleAdminStaffChange}
                    placeholder="Enter ZIP/postal code"
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormInput
                    id="address.country"
                    name="address.country"
                    type="text"
                    label="Country"
                    value={adminStaffData.address.country}
                    onChange={handleAdminStaffChange}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate('/admin-staff')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAdminStaff;
