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
  const { deleteExamActivity } = useExamActivities();
  const [editedTest, setEditedTest] = React.useState({
    scores: {
      cp: 118,
      cars: 118,
      bb: 118,
      ps: 118
    },
    scheduledDate: undefined as Date | undefined
  });

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
        scheduledDate: test.startedAt ? new Date(test.startedAt) : undefined
      });
    }
  }, [test]);

  const handleSubmit = async () => {
    if (!test?.id) {
      return;
    }

    await onEditTest({
      id: test.id,
      company: test.company,
      testNumber: test.name.match(/\d+/)?.[0] || "",
      ...editedTest
    });
    onClose();
  };

  const handleDelete = async () => {
    if (!test?.id) return;
    
    try {
      await deleteExamActivity(test.id);
      toast({
        title: "Test deleted",
        description: "The test has been successfully deleted.",
        variant: "default",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the test. Please try again.",
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
            Edit Practice Test
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
                      onChange={(e) => setEditedTest({
                        ...editedTest,
                        scores: { ...editedTest.scores, cp: Number(e.target.value) }
                      })}
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
                      onChange={(e) => setEditedTest({
                        ...editedTest,
                        scores: { ...editedTest.scores, cars: Number(e.target.value) }
                      })}
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
                      onChange={(e) => setEditedTest({
                        ...editedTest,
                        scores: { ...editedTest.scores, bb: Number(e.target.value) }
                      })}
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
                      onChange={(e) => setEditedTest({
                        ...editedTest,
                        scores: { ...editedTest.scores, ps: Number(e.target.value) }
                      })}
                      className="bg-white border-gray-300 h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Test Date</label>
                <input
                  type="date"
                  value={editedTest.scheduledDate ? editedTest.scheduledDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setEditedTest({ ...editedTest, scheduledDate: undefined });
                      return;
                    }
                    const [year, month, day] = e.target.value.split('-').map(Number);
                    const localDate = new Date(year, month - 1, day);
                    setEditedTest({ ...editedTest, scheduledDate: localDate });
                  }}
                  className="w-full p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handleDelete}
              className="px-4 py-1.5 text-red-300 hover:text-red-800 transition text-sm"
            >
              Delete Test
            </button>
            <div className="flex space-x-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPracticeTestDialog; 