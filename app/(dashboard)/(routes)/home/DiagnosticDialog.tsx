import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface DiagnosticDialogProps {
  isOpen: boolean;
  onSubmit: (scores: {
    total: string;
    cp: string;
    cars: string;
    bb: string;
    ps: string;
  }) => void;
}

const DiagnosticDialog: React.FC<DiagnosticDialogProps> = ({
  isOpen,
  onSubmit,
}) => {
  const [scores, setScores] = useState({
    total: '',
    cp: '',
    cars: '',
    bb: '',
    ps: ''
  });
  const [noDiagnostic, setNoDiagnostic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = () => {
    if (noDiagnostic) return true;
    return Object.values(scores).every(score => score !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("/api/diagnostic-scores", {
        diagnosticScores: noDiagnostic ? null : scores
      });
      
      toast.success("Diagnostic scores saved successfully!");
      onSubmit(scores);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save diagnostic scores. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="sm:max-w-[28rem] text-black" 
        onPointerDownOutside={(e) => e.preventDefault()}
        closeButtonClassName="hidden"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mb-4">
            Welcome to the Adaptive Tutoring Suite
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-center mb-6 text-lg">
            Where you can get all of the content you need delivered to you. Please enter your diagnostic score!
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Total Score</label>
                <Input
                  type="number"
                  min="472"
                  max="528"
                  value={scores.total}
                  onChange={(e) => setScores({ ...scores, total: e.target.value })}
                  disabled={noDiagnostic}
                  className="w-full bg-white"
                  placeholder="472-528"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">C/P</label>
                  <Input
                    type="number"
                    min="118"
                    max="132"
                    value={scores.cp}
                    onChange={(e) => setScores({ ...scores, cp: e.target.value })}
                    disabled={noDiagnostic}
                    className="bg-white"
                    placeholder="118-132"
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
                    disabled={noDiagnostic}
                    className="bg-white"
                    placeholder="118-132"
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
                    disabled={noDiagnostic}
                    className="bg-white"
                    placeholder="118-132"
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
                    disabled={noDiagnostic}
                    className="bg-white"
                    placeholder="118-132"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="noDiagnostic"
                checked={noDiagnostic}
                onCheckedChange={(checked) => setNoDiagnostic(checked as boolean)}
              />
              <label htmlFor="noDiagnostic" className="text-sm">
                {"I don't have a diagnostic score"}
              </label>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Next'
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiagnosticDialog; 