import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiUpload, FiFile, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const ReceiptUpload = ({ onDataExtracted, studentInfo }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadTips, setUploadTips] = useState(false);
  const [renamedFile, setRenamedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Show upload tips when component mounts
  useEffect(() => {
    setUploadTips(true);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    setRenamedFile(null);

    if (!selectedFile) {
      return;
    }

    // Check file type
    const fileType = selectedFile.name.split('.').pop().toLowerCase();
    if (fileType !== 'pdf') {
      setError('Invalid file type. Please upload a PDF file.');
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`File size exceeds the limit of 5MB.`);
      return;
    }

    // Create a more descriptive filename to help with data extraction
    // This will be used for display purposes only, the actual file object remains unchanged
    let enhancedFilename = 'fee_receipt';

    // Add student info if available
    if (studentInfo) {
      if (studentInfo.name) {
        enhancedFilename += `_${studentInfo.name.toLowerCase().replace(/\s+/g, '_')}`;
      }
      if (studentInfo.class) {
        enhancedFilename += `_class_${studentInfo.class}`;
      }
      if (studentInfo.section) {
        enhancedFilename += `_section_${studentInfo.section}`;
      }
      if (studentInfo.rollNumber) {
        enhancedFilename += `_roll_${studentInfo.rollNumber}`;
      }
    }

    // Add timestamp to make filename unique
    enhancedFilename += `_${Date.now()}.pdf`;

    // Create a new file object with the enhanced name
    const renamedFileObj = new File([selectedFile], enhancedFilename, {
      type: selectedFile.type,
      lastModified: selectedFile.lastModified
    });

    setFile(selectedFile);
    setRenamedFile(renamedFileObj);
    console.log('File selected and renamed for better data extraction:', enhancedFilename);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();

      // Use the renamed file if available, otherwise use the original file
      formData.append('file', renamedFile || file);

      console.log('Uploading file:', renamedFile ? renamedFile.name : file.name);

      // Upload the receipt
      const uploadResponse = await axios.post('/api/fee-receipts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (uploadResponse.data.success) {
        console.log('Receipt uploaded successfully, extracting data...');

        // Extract data from the receipt
        const receiptId = uploadResponse.data.data.receiptId;

        // Add query parameters if student info is available
        let extractUrl = `/api/fee-receipts/extract/${receiptId}`;
        const queryParams = [];

        if (studentInfo) {
          if (studentInfo.id) {
            queryParams.push(`studentId=${studentInfo.id}`);
          }
          if (studentInfo.class) {
            queryParams.push(`className=${studentInfo.class}`);
          }
          if (studentInfo.section) {
            queryParams.push(`section=${studentInfo.section}`);
          }
        }

        if (queryParams.length > 0) {
          extractUrl += `?${queryParams.join('&')}`;
        }

        console.log('Extracting data with URL:', extractUrl);
        const extractResponse = await axios.get(extractUrl);

        if (extractResponse.data.success) {
          console.log('Data extracted successfully:', extractResponse.data.data);
          // Pass the extracted data to the parent component
          onDataExtracted(extractResponse.data.data);
        } else {
          setError('Failed to extract data from the receipt');
        }
      } else {
        setError('Failed to upload receipt');
      }
    } catch (err) {
      console.error('Error uploading receipt:', err);
      setError(err.response?.data?.message || 'Failed to upload receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Upload Fee Receipt
          </label>
          <button
            type="button"
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            onClick={() => setUploadTips(!uploadTips)}
          >
            <FiInfo className="mr-1" />
            {uploadTips ? 'Hide Tips' : 'Show Tips'}
          </button>
        </div>

        {uploadTips && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800">
            <h4 className="font-medium mb-1">Tips for better data extraction:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use clear, high-quality PDF receipts</li>
              <li>Make sure student name, class, and fee amount are clearly visible</li>
              <li>Receipts should include fee type (tuition, exam, etc.)</li>
              <li>For best results, use official school fee receipts</li>
              <li>The system will try to extract student information and fee details automatically</li>
            </ul>
          </div>
        )}

        <div
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            <div className="flex flex-col items-center">
              {file ? (
                <FiFile className="h-12 w-12 text-blue-500" />
              ) : (
                <FiUpload className="h-12 w-12 text-gray-400" />
              )}
              <span className="mt-2 block text-sm font-medium text-gray-700">
                {file ? (renamedFile ? renamedFile.name : file.name) : 'Drag and drop your receipt, or click to select'}
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                PDF up to 5MB
              </span>
            </div>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {!file && (
              <button
                type="button"
                className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleUploadClick}
              >
                Select File
              </button>
            )}
            {file && (
              <button
                type="button"
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleUpload}
                disabled={loading}
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
                  'Process Receipt'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md flex items-start">
          <FiAlertTriangle className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && !error && (
        <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded-md flex items-start">
          <FiCheckCircle className="mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p><span className="font-medium">File selected:</span> {file.name}</p>
            {renamedFile && (
              <p className="text-xs text-green-500 mt-1">
                File will be processed as: {renamedFile.name}
              </p>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
          <div className="flex items-center justify-center">
            <svg className="animate-spin mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Analyzing receipt and extracting data...</span>
          </div>
          <p className="mt-2 text-xs text-center">This may take a few moments. Please wait while we process your receipt.</p>
        </div>
      )}
    </div>
  );
};

export default ReceiptUpload;
