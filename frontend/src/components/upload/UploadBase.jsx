import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../config/axios';
import FileUpload from '../common/FileUpload';
import { FiDownload, FiUpload, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const UploadBase = ({
  title,
  description,
  templateUrl,
  uploadUrl,
  instructions = []
}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError('');
  };

  const handleDownloadTemplate = async () => {
    try {
      setError('');
      
      // Create axios instance without auth headers for public template downloads
      const publicAxios = axios.create({
        baseURL: axios.defaults.baseURL,
        withCredentials: false
      });
      
      // Use axios to download the file with proper headers
      const response = await publicAxios.get(templateUrl, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from templateUrl
      const filename = templateUrl.split('/').pop() + '.xlsx';
      link.setAttribute('download', filename);
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading template:', err);
      
      let errorMessage = 'Failed to download template. Please try again.';
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Validate file type on frontend
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
        setError(`Invalid file type: .${fileExtension}. Please upload an Excel (.xlsx, .xls) or CSV file.`);
        setLoading(false);
        return;
      }

      console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload response:', response.data);
      setResult(response.data);
    } catch (err) {
      console.error('Error uploading file:', err);

      // Extract detailed error message
      let errorMessage = 'Failed to upload file. Please try again.';

      if (err.response) {
        console.error('Error response:', err.response);
        // Server responded with an error
        if (err.response.data) {
          errorMessage = err.response.data.message || err.response.data.error || errorMessage;

          // If there's a more detailed error message
          if (err.response.data.error && err.response.data.message) {
            errorMessage = `${err.response.data.message}: ${err.response.data.error}`;
          }
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Error in setting up the request
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <Link
            to="/upload/history"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Upload History
          </Link>
        </div>

        <p className="mt-2 text-sm text-gray-600">{description}</p>

        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Instructions</h3>
              <div className="mt-2 text-sm text-gray-600">
                <ul className="list-disc pl-5 space-y-2">
                  {instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                  <li>Download the template file to see the required format.</li>
                  <li>Fill in the data according to the template.</li>
                  <li>Upload the completed file.</li>
                </ul>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiDownload className="mr-2" />
                  Download Template
                </button>
              </div>
            </div>

            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Upload File</h3>
                  <FileUpload onFileSelect={handleFileSelect} />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FiAlertTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result && (
                  <div className={`rounded-md ${
                    result.data && result.data.errorCount === 0
                      ? 'bg-green-50'
                      : result.data && result.data.successCount > 0 && result.data.errorCount > 0
                        ? 'bg-yellow-50'
                        : 'bg-red-50'
                  } p-4`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {result.data && result.data.errorCount === 0 ? (
                          <FiCheckCircle className="h-5 w-5 text-green-400" />
                        ) : result.data && result.data.successCount > 0 && result.data.errorCount > 0 ? (
                          <FiInfo className="h-5 w-5 text-yellow-400" />
                        ) : (
                          <FiAlertTriangle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-800">Upload Result</h3>
                        <div className="mt-2 text-sm text-gray-700">
                          <p>{result.message}</p>
                          {result.data && (
                            <div className="mt-3">
                              <p>Total Records: {result.data.totalRecords}</p>
                              <p className={result.data.successCount > 0 ? "text-green-600 font-medium" : "text-gray-600"}>
                                Success: {result.data.successCount}
                              </p>
                              <p className={result.data.errorCount > 0 ? "text-red-600 font-medium" : "text-gray-600"}>
                                Failed: {result.data.errorCount}
                              </p>

                              {result.data.errors && result.data.errors.length > 0 && (
                                <div className="mt-2">
                                  <p className="font-medium text-red-800">Errors:</p>
                                  <ul className="list-disc pl-5 mt-1 text-red-700">
                                    {result.data.errors.slice(0, 5).map((err, index) => (
                                      <li key={index}>
                                        Row {err.row}: {err.message}
                                      </li>
                                    ))}
                                    {result.data.errors.length > 5 && (
                                      <li>...and {result.data.errors.length - 5} more errors</li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      !file || loading
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiUpload className="mr-2" />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadBase;
