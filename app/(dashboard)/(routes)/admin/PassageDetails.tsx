import React from "react";

interface PassageDetailsProps {
  title: string;
  content: string;
  citation: string;
  onEdit: () => void;
  onCancel: () => void;
}

const PassageDetails: React.FC<PassageDetailsProps> = ({
  title,
  content,
  citation,
  onEdit,
  onCancel,
}) => {
  return (
    <div className="text-black">
      <h2 className="text-xl font-bold mb-6">Passage Details</h2>
      <div className="border p-4 rounded mb-4">
        <h3 className="font-bold">{title}</h3>
        <div dangerouslySetInnerHTML={{ __html: content }} />
        <p className="text-sm text-gray-600 mt-2">{citation}</p>
      </div>
      <div className="mt-6 flex justify-between">
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Edit
        </button>
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PassageDetails;
