import React, { useState, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';

const FileUploadComponent = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      // Here you would typically send the file to a server
      console.log('Uploading file:', file.name);
      // Reset the file state after upload
      setFile(null);
    } else {
      console.log('No file selected');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="p-1.5 bg-blue-400 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer"
        title="Select File"
      >
        <Upload size={22} />
      </label>
      <button
        onClick={handleUpload}
        className="px-3 py-1 bg-blue-400 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        disabled={!file}
      >
        Upload
      </button>
      {file && <span className="text-sm text-gray-600">{file.name}</span>}
    </div>
  );
};

export default FileUploadComponent;