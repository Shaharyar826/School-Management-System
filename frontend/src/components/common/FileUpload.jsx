import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const FileUpload = ({ 
  onFileSelect, 
  acceptedFileTypes = '.xlsx,.xls,.csv', 
  maxSize = 10 * 1024 * 1024, // 10MB
  label = 'Upload File'
}) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    
    if (!selectedFile) {
      return;
    }

    // Check file type
    const fileType = selectedFile.name.split('.').pop().toLowerCase();
    const isValidType = acceptedFileTypes.includes(fileType);
    
    if (!isValidType) {
      setError(`Invalid file type. Please upload ${acceptedFileTypes} files only.`);
      return;
    }

    // Check file size
    if (selectedFile.size > maxSize) {
      setError(`File size exceeds the limit of ${maxSize / (1024 * 1024)}MB.`);
      return;
    }

    setFile(selectedFile);
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
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
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="mt-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : file 
              ? 'border-green-500 bg-green-50' 
              : error 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          className="hidden"
        />
        
        {file ? (
          <div className="flex flex-col items-center">
            <FiCheckCircle className="w-12 h-12 text-green-500 mb-2" />
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <button
              type="button"
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (onFileSelect) {
                  onFileSelect(null);
                }
              }}
            >
              Change file
            </button>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center">
            <FiAlertTriangle className="w-12 h-12 text-red-500 mb-2" />
            <p className="text-sm font-medium text-red-600">{error}</p>
            <p className="text-xs text-gray-500 mt-2">
              Click to select a different file
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {isDragging ? (
              <FiFile className="w-12 h-12 text-blue-500 mb-2" />
            ) : (
              <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
            )}
            <p className="text-sm font-medium text-gray-900">{label}</p>
            <p className="text-xs text-gray-500 mt-1">
              Drag and drop or click to select
            </p>
            <p className="text-xs text-gray-500">
              Accepted formats: {acceptedFileTypes}
            </p>
            <p className="text-xs text-gray-500">
              Max size: {maxSize / (1024 * 1024)}MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
