// components/uworld/UWorldPopup.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import UWorldConcept from './UWorldConcept';
import UWorldUploadDialog from './UWorldUploadDialog';
import UWorldUploadContainer from './UWorldUploadContainer';
import SaveChangesDialog from './SaveChangesDialog';
import { uniqueCategories } from '@/constants/uworld';
import { UWorldTask } from './types';
import { startOfDay } from 'date-fns';

/* ----- Types ---- */
interface UWorldPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: UWorldTask[];
  onScoreSubmit: (tasks: UWorldTask[]) => void;
  hours: number;
  scheduledDate: string;
}

const UWorldPopup = ({
  isOpen,
  onClose,
  tasks: initialTasks,
  onScoreSubmit,
  hours,
  scheduledDate
}: UWorldPopupProps) => {
  /* ---- State ----- */
  const [currentTasks, setCurrentTasks] = useState<UWorldTask[]>(initialTasks);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const pastScheduledDate = startOfDay(new Date(scheduledDate)) < startOfDay(new Date());

  /* ---- Callbacks ----- */
  const handleTasksUpdate = useCallback((newTasks: UWorldTask[]) => {
    setCurrentTasks(newTasks);
    setHasUnsavedChanges(true);
  }, []);

  /* --- Effects --- */
  useEffect(() => {
    setCurrentTasks(initialTasks);
    setHasUnsavedChanges(false);
  }, [initialTasks]);

  /* ---- Event Handlers ----- */
  const handleCorrectChange = (index: number, value: string) => {
    if (pastScheduledDate) return;
    const newTasks = [...currentTasks];
    newTasks[index] = {
      ...newTasks[index],
      correctAnswers: parseInt(value) || 0
    };
    handleTasksUpdate(newTasks);
  };

  const handleIncorrectChange = (index: number, value: string) => {
    if (pastScheduledDate) return;
    const newTasks = [...currentTasks];
    newTasks[index] = {
      ...newTasks[index],
      incorrectAnswers: parseInt(value) || 0
    };
    handleTasksUpdate(newTasks);
  };

  const handleDelete = (index: number) => {
    if (pastScheduledDate) return;
    const newTasks = currentTasks.filter((_, i) => i !== index);
    handleTasksUpdate(newTasks);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onScoreSubmit(currentTasks);
      setHasUnsavedChanges(false);
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Error saving scores:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowSaveDialog(true);
    } else {
      onClose();
    }
  };

  const handleSaveAndClose = async () => {
    setIsSaving(true);
    try {
      await onScoreSubmit(currentTasks);
      setHasUnsavedChanges(false);
      setShowSaveDialog(false);
      onClose();
    } catch (error) {
      console.error('Error saving scores:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardAndClose = () => {
    setHasUnsavedChanges(false);
    setShowSaveDialog(false);
    onClose();
  };

  const handleRegenerate = async () => {
    if (pastScheduledDate) return;
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/uworld/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours })
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate tasks');
      }

      const { tasks: newTasks } = await response.json();
      handleTasksUpdate(newTasks);
    } catch (error) {
      console.error('Error regenerating tasks:', error);
      toast.error('Failed to regenerate tasks');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleClear = () => {
    if (pastScheduledDate) return;
    handleTasksUpdate([]);
  };

  const handleAddScore = () => {
    if (pastScheduledDate) return;
    const newTask: UWorldTask = {
      text: "",
      subject: uniqueCategories[0], // Use first category as default
      completed: false,
      correctAnswers: 0,
      incorrectAnswers: 0
    };
    
    handleTasksUpdate([...currentTasks, newTask]);
  };

  const handleTasksChange = (newTasks: UWorldTask[]) => {
    handleTasksUpdate(newTasks);
    setShowUploadModal(false);
  };

  /* ---- Render Methods ----- */
  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-2xl font-bold text-black">
                  <a 
                    href="https://www.uworld.com/app/index.html#/login/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    UWorld
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </DialogTitle>
              </div>
              {!pastScheduledDate && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className={`px-4 py-2 bg-gray-100 text-black rounded-lg transition-all shadow-sm hover:shadow-md ${
                      isRegenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
                    }`}
                  >
                    {isRegenerating ? 'Regenerating...' : 'Regenerate Tasks'}
                  </button>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            <UWorldUploadContainer
              onTasksChange={handleTasksUpdate}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              className="w-full"
              pastScheduledDate={pastScheduledDate}
            >
              {!currentTasks || currentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-center text-gray-500">
                    {pastScheduledDate ? 'Since the deadline passed, you can no longer generate new UWorld tasks or add scores for this day.' : 'You can generate UWorld tasks to complete or add scores at the bottom.'}
                  </p>
                </div>
              ) : (
                currentTasks.map((task, index) => (
                  <UWorldConcept
                    key={index}
                    task={task}
                    onCorrectChange={(value) => handleCorrectChange(index, value)}
                    onIncorrectChange={(value) => handleIncorrectChange(index, value)}
                    onDelete={() => handleDelete(index)}
                    onSubjectChange={(value) => {
                      if (pastScheduledDate) return;
                      const updatedTasks = [...currentTasks];
                      updatedTasks[index] = { ...task, subject: value };
                      handleTasksUpdate(updatedTasks);
                    }}
                    isReadOnly={pastScheduledDate}
                  />
                ))
              )}
            </UWorldUploadContainer>
          </div>

          {!pastScheduledDate && (
            <div className="flex justify-between mt-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAddScore}
                  className="px-4 py-2 bg-gray-100 text-black rounded-lg transition-all shadow-sm hover:shadow-md hover:bg-gray-200"
                >
                  Add Score
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-black rounded-lg transition-all shadow-sm hover:shadow-md hover:bg-gray-200"
                >
                  <Upload className="h-4 w-4" />
                  Upload Scores
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-gray-100 text-black rounded-lg transition-all shadow-sm hover:shadow-md hover:bg-gray-200"
                >
                  Clear Scores
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <UWorldUploadDialog
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onTasksChange={handleTasksChange}
        pastScheduledDate={pastScheduledDate}
      />

      <SaveChangesDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveAndClose}
        onDiscard={handleDiscardAndClose}
      />
    </>
  );
};

export default UWorldPopup;