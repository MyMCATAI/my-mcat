import { useState } from 'react';
import { UWorldTask } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import pdfToText from 'react-pdftotext';
import { parseUWorldPDF } from './UWorldParser';

/* ----- Types ---- */
interface UWorldUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksChange: (tasks: UWorldTask[]) => void;
  pastScheduledDate: boolean;
}

const UWorldUploadDialog = ({ isOpen, onClose, onTasksChange, pastScheduledDate }: UWorldUploadDialogProps) => {
  /* ---- State ----- */
  const [isProcessing, setIsProcessing] = useState(false);

  /* ----- Callbacks --- */
  const onDrop = async (acceptedFiles: File[]) => {
    if (pastScheduledDate || isProcessing) return;

    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      console.log('Processing PDF file:', file.name);
      const text = await pdfToText(file);
      console.log('Converted PDF to text, length:', text.length);
      
      const parsedData = parseUWorldPDF(text);
      if (!parsedData) {
        toast.error('Could not parse UWorld data from the PDF');
        return;
      }

      // Tasks are already in the correct format from the parser
      const completedTasks = parsedData.tasks.map(task => ({
        ...task,
        completed: true // Mark as completed since we have scores
      }));

      console.log('Created completed tasks:', completedTasks);
      onTasksChange(completedTasks);
      onClose();
      toast.success('PDF processed successfully');
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Error processing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: pastScheduledDate || isProcessing
  });

  /* ---- Render Methods ----- */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-black">Upload UWorld PDF</DialogTitle>
        </DialogHeader>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8
            flex flex-col items-center justify-center
            transition-colors cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${pastScheduledDate || isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-blue-50'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Drop the PDF here'
              : isProcessing
              ? 'Processing...'
              : pastScheduledDate
              ? 'Upload disabled - past scheduled date'
              : 'Drag and drop your UWorld PDF here, or click to select'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UWorldUploadDialog; 