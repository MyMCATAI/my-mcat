import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import pdfToText from 'react-pdftotext';
import { UWorldTask } from './types';
import { parseUWorldPDF } from './UWorldParser';

/* ----- Types ---- */
interface UWorldUploadContainerProps {
  onTasksChange: (tasks: UWorldTask[]) => void;
  pastScheduledDate: boolean;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}

const UWorldUploadContainer = ({ 
  onTasksChange, 
  pastScheduledDate, 
  isProcessing, 
  setIsProcessing,
  className = '',
  children
}: UWorldUploadContainerProps) => {
  /* ----- Callbacks --- */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
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
      toast.success('PDF processed successfully');
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Error processing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [pastScheduledDate, isProcessing, onTasksChange, setIsProcessing]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: pastScheduledDate || isProcessing,
    noClick: true
  });

  /* ---- Render Methods ----- */
  return (
    <div className={`relative ${className}`} {...getRootProps()}>
      <input {...getInputProps()} />
      <div className={isDragActive || isProcessing ? 'opacity-0' : ''}>
        {children}
      </div>
      {(isDragActive || isProcessing) && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-blue-500 font-medium">
              {isProcessing ? 'Adding scores...' : 'Drop your PDF here'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UWorldUploadContainer; 