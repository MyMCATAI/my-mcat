'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface FullLengthExamCompleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scores: {
    total: number;
    cp: number;
    cars: number;
    bb: number;
    ps: number;
  }) => void;
  testTitle: string;
  calendarActivityId?: string;
}

const FullLengthExamCompleteDialog: React.FC<FullLengthExamCompleteDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  testTitle,
  calendarActivityId
}) => {
  const [scores, setScores] = useState({
    cp: '',
    cars: '',
    bb: '',
    ps: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateTotal = (): number => {
    const values = Object.values(scores).map(score => parseInt(score) || 0);
    return values.reduce((sum, score) => sum + score, 0);
  };

  const isFormValid = () => {
    return Object.values(scores).every(score => {
      const num = parseInt(score);
      return !isNaN(num) && num >= 118 && num <= 132;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please enter valid scores (118-132) for all sections");
      return;
    }

    const numericScores = {
      cp: parseInt(scores.cp),
      cars: parseInt(scores.cars),
      bb: parseInt(scores.bb),
      ps: parseInt(scores.ps),
      total: calculateTotal()
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/full-length-exam/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calendarActivityId,
          title: testTitle,
          scores: numericScores
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save exam scores');
      }

      onSubmit(numericScores);
      onClose();
      toast.success("Exam scores saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save exam scores. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset scores when dialog opens
  useEffect(() => {
    if (isOpen) {
      setScores({
        cp: '',
        cars: '',
        bb: '',
        ps: ''
      });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[28rem] text-black">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mb-4">
            Complete {testTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">C/P</label>
                  <Input
                    type="number"
                    min="118"
                    max="132"
                    value={scores.cp}
                    onChange={(e) => setScores({ ...scores, cp: e.target.value })}
                    className="bg-white"
                    placeholder="118-132"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CARS</label>
                  <Input
                    type="number"
                    min="118"
                    max="132"
                    value={scores.cars}
                    onChange={(e) => setScores({ ...scores, cars: e.target.value })}
                    className="bg-white"
                    placeholder="118-132"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">B/B</label>
                  <Input
                    type="number"
                    min="118"
                    max="132"
                    value={scores.bb}
                    onChange={(e) => setScores({ ...scores, bb: e.target.value })}
                    className="bg-white"
                    placeholder="118-132"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">P/S</label>
                  <Input
                    type="number"
                    min="118"
                    max="132"
                    value={scores.ps}
                    onChange={(e) => setScores({ ...scores, ps: e.target.value })}
                    className="bg-white"
                    placeholder="118-132"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Score</label>
                <div className="w-full py-2 px-3 bg-gray-100 rounded-md text-lg font-semibold">
                  {calculateTotal()}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-gray-600 hover:text-gray-900 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Saving..." : "Submit Scores"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullLengthExamCompleteDialog; 