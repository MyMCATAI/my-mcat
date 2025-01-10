import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useExamActivities } from '@/hooks/useCalendarActivities';

interface DeleteExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (testId: string) => void;
  testId?: string;
  testName?: string;
}

const DeleteExamDialog: React.FC<DeleteExamDialogProps> = ({
  isOpen,
  onClose,
  onDelete,
  testId,
  testName
}) => {
  const { deleteExamActivity, activities, setActivities } = useExamActivities();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!testId) return;

    try {
      setIsDeleting(true);
      await deleteExamActivity(testId);
      
      if (activities) {
        setActivities(activities.filter(activity => activity.id !== testId));
      }
      
      onDelete(testId);
      onClose();
    } catch (error) {
      console.error('Failed to delete exam:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Test</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {testName ? `"${testName}"` : 'this test'}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteExamDialog; 