import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useExamActivities } from '@/hooks/useCalendarActivities';
import { toast } from "@/components/ui/use-toast";

interface EditPracticeTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEditTest: (params: {
    id: string;
    company: string;
    testNumber: string;
    scores?: {
      cp: number;
      cars: number;
      bb: number;
      ps: number;
    };
    scheduledDate?: Date;
  }) => Promise<void>;
  test?: {
    id: string;
    name: string;
    company: string;
    score?: number;
    breakdown?: string;
    startedAt?: string;
  };
}

const EditPracticeTestDialog: React.FC<EditPracticeTestDialogProps> = ({
  isOpen,
  onClose,
  onEditTest,
  test
}) => {
  const [editedTest, setEditedTest] = React.useState({
    scores: {
      cp: 118,
      cars: 118,
      bb: 118,
      ps: 118
    },
    scheduledDate: undefined as Date | undefined,
    dateInputValue: ''
  });

  const [showError, setShowError] = React.useState(false);

  // Initialize form when test changes
  React.useEffect(() => {
    if (test) {
      const scores = test.breakdown?.split('/').map(Number) || [118, 118, 118, 118];
      
      setEditedTest({
        scores: {
          cp: scores[0],
          cars: scores[1],
          bb: scores[2],
          ps: scores[3]
        },
        scheduledDate: test.startedAt ? new Date(test.startedAt) : undefined,
        dateInputValue: test.startedAt ? new Date(test.startedAt).toISOString().split('T')[0] : ''
      });
    }
  }, [test]);

  const handleSubmit = async () => {
    if (!test?.id) {
      return;
    }

    // Validate total score instead of individual scores
    const totalScore = Object.values(editedTest.scores).reduce((a, b) => a + b, 0);
    if (totalScore < 472 || totalScore > 528) {
      setShowError(true);
      toast({
        title: "Invalid total score",
        description: "Total score must be between 472 and 528",
        variant: "destructive",
      });
      return;
    }
    setShowError(false);

    try {
      // Update the full length exam scores
      const response = await fetch(`/api/full-length-exam/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calendarActivityId: test.id,
          scores: {
            total: Object.values(editedTest.scores).reduce((a, b) => a + b, 0),
            ...editedTest.scores
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update exam scores');
      }

      // Then update the calendar activity date if changed
      await onEditTest({
        id: test.id,
        company: test.company,
        testNumber: test.name.match(/\d+/)?.[0] || "",
        scores: editedTest.scores,
        scheduledDate: editedTest.scheduledDate
      });

      toast({
        title: "Success",
        description: "Test scores and details updated successfully",
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to update test:', error);
      toast({
        title: "Error",
        description: "Failed to update test scores. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!test) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[40rem] bg-[#f8fafc] text-black">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">
            Edit {test.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-8 py-6">
          <div className="bg-[#8e9aab] bg-opacity-10 p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
            <div className="space-y-6">
              <div className="grid gap-4">
                <label className="text-sm font-medium text-gray-700">Section Scores</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Chemical/Physical</label>
                    <Input
                      type="number"
                      min="118"
                      max="132"
                      value={editedTest.scores.cp}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                        setEditedTest({
                          ...editedTest,
                          scores: { ...editedTest.scores, cp: value }
                        });
                      }}
                      className="bg-white border-gray-300 h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">CARS</label>
                    <Input
                      type="number"
                      min="118"
                      max="132"
                      value={editedTest.scores.cars}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                        setEditedTest({
                          ...editedTest,
                          scores: { ...editedTest.scores, cars: value }
                        });
                      }}
                      className="bg-white border-gray-300 h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Biology/Biochemistry</label>
                    <Input
                      type="number"
                      min="118"
                      max="132"
                      value={editedTest.scores.bb}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                        setEditedTest({
                          ...editedTest,
                          scores: { ...editedTest.scores, bb: value }
                        });
                      }}
                      className="bg-white border-gray-300 h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Psychology/Sociology</label>
                    <Input
                      type="number"
                      min="118"
                      max="132"
                      value={editedTest.scores.ps}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                        setEditedTest({
                          ...editedTest,
                          scores: { ...editedTest.scores, ps: value }
                        });
                      }}
                      className="bg-white border-gray-300 h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Test Date</label>
                <Input
                  type="date"
                  value={editedTest.dateInputValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditedTest(prev => ({
                      ...prev,
                      dateInputValue: value
                    }));
                    
                    if (!value) {
                      setEditedTest(prev => ({
                        ...prev,
                        scheduledDate: undefined
                      }));
                      return;
                    }
                    
                    // Validate date format (YYYY-MM-DD)
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (!dateRegex.test(value)) {
                      return;
                    }
                    
                    // Create date in local time by parsing the YYYY-MM-DD string
                    const [year, month, day] = value.split('-').map(Number);
                    
                    // Basic validation for month and day
                    if (month < 1 || month > 12 || day < 1 || day > 31) {
                      return;
                    }
                    
                    const localDate = new Date(year, month - 1, day);
                    setEditedTest(prev => ({
                      ...prev,
                      scheduledDate: localDate
                    }));
                  }}
                  className="w-full h-10 bg-white border-gray-300"
                />
              </div>

              <div className="text-sm text-gray-500 mt-2">
                Total Score: {Object.values(editedTest.scores).reduce((a, b) => a + b, 0)}
                {showError && (
                  <div className="text-red-500 mt-1">
                    Your score is not between 472 and 528!
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPracticeTestDialog; 