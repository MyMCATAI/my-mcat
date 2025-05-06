// Removing type declaration and simplifying imports
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWindowSize } from '@/store/selectors';
import { Upload, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

/* --- Constants ----- */
/* ----- Types ---- */
interface CommunityFeedbackDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommunityFeedbackDialog = forwardRef<{ open: () => void }, CommunityFeedbackDialogProps>(({
  isOpen,
  onOpenChange,
}, ref) => {
/* ---- State ----- */
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'feedback' | 'upload' | 'question'>('feedback');
  
/* ---- Callbacks --- */
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      toast.error("Please enter some feedback before submitting");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Your feedback has been submitted. Thank you!");
      setFeedbackText('');
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to submit your feedback. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic here
      toast.success(`File "${files[0].name}" selected for upload`);
      // In a real implementation, you would process the file here
    }
  };

/* ---- Event Handlers ----- */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onOpenChange(false);
    }
  };
  
/* ---- Render Methods ----- */
  // For mobile responsiveness
  const windowSize = useWindowSize();
  const isMobile = !windowSize.isDesktop;

  useImperativeHandle(ref, () => ({
    open: () => onOpenChange(true)
  }));

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
      modal
    >
      <DialogContent 
        className={`${
          isMobile ? 'max-w-[95vw] h-[80vh] p-3 overflow-hidden' : 'max-w-[55rem] max-h-[80vh]'
        } gradientbg border text-[--theme-text-color] border-[--theme-border-color] flex flex-col z-[100] focus:outline-none rounded-xl`}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className={`mb-2 flex-shrink-0 ${isMobile ? 'px-2' : 'px-6'}`}>
          <DialogTitle className="w-full text-[--theme-hover-text] text-center items-center justify-center rounded-lg bg-[--theme-hover-color] p-2 flex">
            <span className="flex-grow">Tutor Hub</span>
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Share your study experience and get help from your tutors
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex border-b border-[--theme-border-color] mb-4">
          <button
            className={`px-4 py-2 flex-1 ${activeTab === 'feedback' ? 'border-b-2 border-[--theme-hover-color] font-medium' : 'text-[--theme-text-color]/70'}`}
            onClick={() => setActiveTab('feedback')}
          >
            Study Feedback
          </button>
          <button
            className={`px-4 py-2 flex-1 ${activeTab === 'question' ? 'border-b-2 border-[--theme-hover-color] font-medium' : 'text-[--theme-text-color]/70'}`}
            onClick={() => setActiveTab('question')}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Ask a Question</span>
            </div>
          </button>
          <button
            className={`px-4 py-2 flex-1 ${activeTab === 'upload' ? 'border-b-2 border-[--theme-hover-color] font-medium' : 'text-[--theme-text-color]/70'}`}
            onClick={() => setActiveTab('upload')}
          >
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </div>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto px-4 pb-6">
          {activeTab === 'feedback' && (
            <div className="flex flex-col space-y-4 w-full">
              <h3 className="text-lg font-medium">How was your study session today?</h3>
              <Textarea 
                placeholder="Share your thoughts about today's study session..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[8rem] text-base"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting}
                  className="bg-[--theme-gradient-startstreak] hover:bg-[--theme-hover-color] text-white"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </div>
          )}
          {activeTab === 'upload' && (
            <div className="flex flex-col space-y-6 items-center justify-center w-full py-6">
              <div className="bg-[--theme-flashcard-color] rounded-lg p-8 w-full max-w-md flex flex-col items-center">
                <Upload className="w-16 h-16 mb-4 text-[--theme-hover-color]" />
                <h3 className="text-xl font-medium mb-2">Upload Homework and More</h3>
                <p className="text-center text-[--theme-text-color]/70 mb-4">
                  Submit assignments, questions, and other materials to your tutor
                </p>
                <label className="cursor-pointer">
                  <div className="bg-[--theme-hover-color] text-[--theme-hover-text] py-3 px-6 rounded-md hover:opacity-90 transition-opacity">
                    Select Files to Upload
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    multiple
                  />
                </label>
              </div>
            </div>
          )}
          {activeTab === 'question' && (
            <div className="flex flex-col space-y-4 w-full">
              <h3 className="text-lg font-medium">Ask a Question</h3>
              <Textarea 
                placeholder="What would you like to ask your tutor?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[8rem] text-base"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting}
                  className="bg-[--theme-gradient-startstreak] hover:bg-[--theme-hover-color] text-white"
                >
                  {isSubmitting ? 'Sending...' : 'Send Question'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

CommunityFeedbackDialog.displayName = 'CommunityFeedbackDialog';

export default CommunityFeedbackDialog; 