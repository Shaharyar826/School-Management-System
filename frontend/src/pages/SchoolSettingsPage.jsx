import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import SchoolSettingsForm from '../components/settings/SchoolSettingsForm';
import { FaSchool } from 'react-icons/fa';

const SchoolSettingsPage = () => {
  const { user } = useContext(AuthContext);

  // Only admin and principal can access this page
  if (user && user.role !== 'admin' && user.role !== 'principal') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-lg mr-4">
              <FaSchool className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">School Settings</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your school information and customize the landing page
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <SchoolSettingsForm />
      </div>
    </>
  );
};

export default SchoolSettingsPage;
