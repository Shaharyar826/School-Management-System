import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { FiUpload, FiUsers, FiUserCheck, FiUserPlus, FiTool, FiList, FiFileText } from 'react-icons/fi';

const UploadDashboardPage = () => {
  const { user } = useContext(AuthContext);

  const uploadOptions = [
    {
      id: 'students',
      name: 'Upload Students',
      description: 'Bulk upload student records from Excel or CSV files.',
      icon: FiUsers,
      href: '/upload/student',
      color: 'bg-blue-500'
    },
    {
      id: 'teachers',
      name: 'Upload Teachers',
      description: 'Bulk upload teacher records from Excel or CSV files.',
      icon: FiUserCheck,
      href: '/upload/teacher',
      color: 'bg-green-500'
    },
    {
      id: 'admin-staff',
      name: 'Upload Admin Staff',
      description: 'Bulk upload administrative staff records from Excel or CSV files.',
      icon: FiUserPlus,
      href: '/upload/admin-staff',
      color: 'bg-purple-500'
    },
    {
      id: 'support-staff',
      name: 'Upload Support Staff',
      description: 'Bulk upload support staff records from Excel or CSV files.',
      icon: FiTool,
      href: '/upload/support-staff',
      color: 'bg-orange-500'
    },
    {
      id: 'history',
      name: 'Upload History',
      description: 'View history of all bulk uploads and their status.',
      icon: FiList,
      href: '/upload/history',
      color: 'bg-gray-500'
    },
    {
      id: 'templates',
      name: 'Download Templates',
      description: 'Download Excel templates for all user types.',
      icon: FiFileText,
      href: '#',
      color: 'bg-teal-500',
      isTemplateSection: true
    }
  ];

  const templates = [
    {
      name: 'Student Template',
      url: '/api/upload/public/template/student',
      filename: 'student-template.xlsx'
    },
    {
      name: 'Teacher Template',
      url: '/api/upload/public/template/teacher',
      filename: 'teacher-template.xlsx'
    },
    {
      name: 'Admin Staff Template',
      url: '/api/upload/public/template/admin-staff',
      filename: 'admin-staff-template.xlsx'
    },
    {
      name: 'Support Staff Template',
      url: '/api/upload/public/template/support-staff',
      filename: 'support-staff-template.xlsx'
    }
  ];

  const handleDownloadTemplate = (url) => {
    try {
      // Open the URL in a new tab
      const downloadWindow = window.open(url, '_blank');

      // If popup is blocked, provide a fallback
      if (!downloadWindow || downloadWindow.closed || typeof downloadWindow.closed === 'undefined') {
        // Direct the user to the URL in the current window
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Bulk Upload Dashboard</h1>
        </div>

        <p className="mt-2 text-sm text-gray-600">
          Upload multiple records at once using Excel or CSV files. Download templates, fill them with data, and upload them to create records in bulk.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {uploadOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${option.color}`}>
                    <option.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-lg font-medium text-gray-900 truncate">
                        {option.name}
                      </dt>
                      <dd>
                        <div className="text-sm text-gray-500">
                          {option.description}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                {option.isTemplateSection ? (
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-2">Available Templates:</div>
                    <ul className="space-y-1">
                      {templates.map((template, index) => (
                        <li key={index}>
                          <button
                            onClick={() => handleDownloadTemplate(template.url)}
                            className="text-blue-600 hover:text-blue-900 hover:underline"
                          >
                            {template.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-sm">
                    <Link
                      to={option.href}
                      className="font-medium text-blue-600 hover:text-blue-900"
                    >
                      Go to {option.name} <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              <FiUpload className="inline-block mr-2" />
              Bulk Upload Instructions
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Follow these steps to successfully upload bulk data.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <ol className="list-decimal pl-5 space-y-3">
              <li className="text-gray-700">
                <span className="font-medium">Download the template</span> for the user type you want to upload.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Fill in the data</span> according to the template format. Make sure to follow the instructions in the header row.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Save the file</span> as an Excel (.xlsx) or CSV (.csv) file.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Go to the upload page</span> for the specific user type.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Upload the file</span> and wait for the system to process it.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Review the results</span> to see which records were successfully added and which ones failed.
              </li>
              <li className="text-gray-700">
                <span className="font-medium">Fix any errors</span> in the original file and re-upload if needed.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDashboardPage;
