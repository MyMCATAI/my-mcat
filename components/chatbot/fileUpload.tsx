import React, { useState, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';

const FileUploadComponent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      await handleUpload(selectedFile);
    }
  };

  const handleUpload = async (fileToUpload: File) => {
    setUploading(true);
    try {
      // Here you would typically send the file to a server
      // This is a simulated upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Uploading file:', fileToUpload.name);
      // Reset the file state after upload
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        disabled={uploading}
      />
      <label
        htmlFor="file-upload"
        className={`p-1.5 ${uploading ? 'bg-gray-400' : 'bg-gray-400'} text-white rounded-full hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer`}
        title={uploading ? 'Uploading...' : 'Select File'}
      >
        <Upload size={22} />
      </label>
      {uploading && <span className="text-sm text-gray-600">Uploading...</span>}
      {file && !uploading && <span className="text-sm text-gray-600">{file.name}</span>}
    </div>
  );
};

export default FileUploadComponent;