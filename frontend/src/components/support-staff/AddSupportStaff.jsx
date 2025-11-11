import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import ImageUpload from '../../components/common/ImageUpload';

const AddSupportStaff = () => {
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
    role: 'support-staff',
    profileImage: ''
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [validateForm, setValidateForm] = useState(false);

  const [supportStaffData, setSupportStaffData] = useState({
    employeeId: '',
    phoneNumber: '',
    position: '',
    joiningDate: '',
    salary: '',
    dateOfBirth: '',
    gender: '',
    experience: '',
    workingHours: {
      startTime: '',
      endTime: '',
      daysOfWeek: []
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    },
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

  const handleSupportStaffChange = (e) => {
    const { name, value } = e.target;

    if (name === 'workingHours.daysOfWeek') {
      // Handle checkbox selection for days of week
      const daysArray = [...supportStaffData.workingHours.daysOfWeek];
      if (e.target.checked) {
        daysArray.push(e.target.value);
      } else {
        const index = daysArray.indexOf(e.target.value);
        if (index > -1) {
          daysArray.splice(index, 1);
        }
      }

      setSupportStaffData({
        ...supportStaffData,
        workingHours: {
          ...supportStaffData.workingHours,
          daysOfWeek: daysArray
        }
      });
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSupportStaffData({
        ...supportStaffData,
        [parent]: {
          ...supportStaffData[parent],
          [child]: value
        }
      });
    } else {
      setSupportStaffData({
        ...supportStaffData,
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

      const res = await axios.post('/api/support-staff', {
        userData,
        supportStaffData
      });

      if (res.data.success) {
        navigate('/support-staff');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add support staff');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Add Support Staff</h1>
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
                    label="Middle Name (Optional)"
                    value={userData.middleName}
                    onChange={handleUserChange}
                    placeholder="Enter middle name"
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
                    value={supportStaffData.employeeId}
                    onChange={handleSupportStaffChange}
                    placeholder="Enter employee ID"
                  />

                  <FormInput
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    label="Phone Number"
                    required
                    value={supportStaffData.phoneNumber}
                    onChange={handleSupportStaffChange}
                    placeholder="Enter phone number"
                  />

                  <div className="floating-input-container">
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      required
                      className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                      value={supportStaffData.dateOfBirth}
                      onChange={handleSupportStaffChange}
                    />
                    <label
                      htmlFor="dateOfBirth"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${supportStaffData.dateOfBirth ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
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
                      value={supportStaffData.gender}
                      onChange={handleSupportStaffChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <label
                      htmlFor="gender"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${supportStaffData.gender ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
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
                        value={supportStaffData.position}
                        onChange={handleSupportStaffChange}
                      >
                        <option value="">Select Position</option>
                        <option value="janitor">Janitor</option>
                        <option value="security">Security</option>
                        <option value="gardener">Gardener</option>
                        <option value="driver">Driver</option>
                        <option value="cleaner">Cleaner</option>
                        <option value="cook">Cook</option>
                        <option value="other">Other</option>
                      </select>
                      <label
                        htmlFor="position"
                        className={`absolute left-4 transition-all duration-200 pointer-events-none
                          ${supportStaffData.position ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                      >
                        Position <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <FormInput
                      id="experience"
                      name="experience"
                      type="number"
                      label="Years of Experience"
                      required
                      min="0"
                      value={supportStaffData.experience}
                      onChange={handleSupportStaffChange}
                      placeholder="Enter years of experience"
                    />

                    <div className="floating-input-container">
                      <input
                        type="time"
                        name="workingHours.startTime"
                        id="workingHours.startTime"
                        className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                        value={supportStaffData.workingHours.startTime}
                        onChange={handleSupportStaffChange}
                      />
                      <label
                        htmlFor="workingHours.startTime"
                        className={`absolute left-4 transition-all duration-200 pointer-events-none
                          ${supportStaffData.workingHours.startTime ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                      >
                        Working Hours - Start Time
                      </label>
                    </div>

                    <div className="floating-input-container">
                      <input
                        type="time"
                        name="workingHours.endTime"
                        id="workingHours.endTime"
                        className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                        value={supportStaffData.workingHours.endTime}
                        onChange={handleSupportStaffChange}
                      />
                      <label
                        htmlFor="workingHours.endTime"
                        className={`absolute left-4 transition-all duration-200 pointer-events-none
                          ${supportStaffData.workingHours.endTime ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                      >
                        Working Hours - End Time
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Working Days
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <div key={day} className="flex items-center">
                            <input
                              id={`day-${day}`}
                              name="workingHours.daysOfWeek"
                              type="checkbox"
                              value={day}
                              checked={supportStaffData.workingHours.daysOfWeek.includes(day)}
                              onChange={handleSupportStaffChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`day-${day}`} className="ml-2 block text-sm text-gray-700">
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
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
                        value={supportStaffData.joiningDate}
                        onChange={handleSupportStaffChange}
                      />
                      <label
                        htmlFor="joiningDate"
                        className={`absolute left-4 transition-all duration-200 pointer-events-none
                          ${supportStaffData.joiningDate ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
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
                      value={supportStaffData.salary}
                      onChange={handleSupportStaffChange}
                      placeholder="Enter salary amount"
                    />

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h4>
                      <div className="space-y-4">
                        <FormInput
                          id="emergencyContact.name"
                          name="emergencyContact.name"
                          type="text"
                          label="Name"
                          value={supportStaffData.emergencyContact.name}
                          onChange={handleSupportStaffChange}
                          placeholder="Enter emergency contact name"
                        />

                        <FormInput
                          id="emergencyContact.relationship"
                          name="emergencyContact.relationship"
                          type="text"
                          label="Relationship"
                          value={supportStaffData.emergencyContact.relationship}
                          onChange={handleSupportStaffChange}
                          placeholder="Enter relationship"
                        />

                        <FormInput
                          id="emergencyContact.phoneNumber"
                          name="emergencyContact.phoneNumber"
                          type="text"
                          label="Phone Number"
                          value={supportStaffData.emergencyContact.phoneNumber}
                          onChange={handleSupportStaffChange}
                          placeholder="Enter emergency contact phone"
                        />
                      </div>
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
                    value={supportStaffData.address.street}
                    onChange={handleSupportStaffChange}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormInput
                    id="address.city"
                    name="address.city"
                    type="text"
                    label="City"
                    value={supportStaffData.address.city}
                    onChange={handleSupportStaffChange}
                    placeholder="Enter city"
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormInput
                    id="address.state"
                    name="address.state"
                    type="text"
                    label="State / Province"
                    value={supportStaffData.address.state}
                    onChange={handleSupportStaffChange}
                    placeholder="Enter state/province"
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormInput
                    id="address.zipCode"
                    name="address.zipCode"
                    type="text"
                    label="ZIP / Postal Code"
                    value={supportStaffData.address.zipCode}
                    onChange={handleSupportStaffChange}
                    placeholder="Enter ZIP/postal code"
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormInput
                    id="address.country"
                    name="address.country"
                    type="text"
                    label="Country"
                    value={supportStaffData.address.country}
                    onChange={handleSupportStaffChange}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate('/support-staff')}
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

export default AddSupportStaff;
