// app/(dashboard)/(routes)/ankiclinic/components/CommunityFeedbackDialog.tsx
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
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
import { CheckCircle, XCircle, Loader2, MessageSquare, TrendingUp, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

/* --- Constants ----- */
const AMINO_ACID_TOPICS = [
  { name: "Essential vs Non-essential", learned: true },
  { name: "Protein Structure", learned: true },
  { name: "Hydrophobic Amino Acids", learned: true },
  { name: "Polar Amino Acids", learned: false },
  { name: "Charged Amino Acids", learned: false },
  { name: "Aromatic Amino Acids", learned: true },
  { name: "Branched-chain Amino Acids", learned: false },
  { name: "Amino Acid Metabolism", learned: false },
  { name: "Peptide Bond Formation", learned: true },
  { name: "Isoelectric Point", learned: false },
];

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
  const [questionText, setQuestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
/* ---- Callbacks --- */
  const handleSubmitToTutor = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Progress summary sent to your tutor!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to send summary. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!questionText.trim()) {
      toast.error("Please enter a question before submitting");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Your question has been sent to your tutor!");
      setQuestionText('');
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to send your question. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

/* --- Animations & Effects --- */
  useEffect(() => {
    if (isOpen) {
      setIsAnalyzing(true);
      setAnalysisComplete(false);
      
      // Simulate analysis time
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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

  const learnedTopics = AMINO_ACID_TOPICS.filter(topic => topic.learned);
  const notLearnedTopics = AMINO_ACID_TOPICS.filter(topic => !topic.learned);
  const progressPercentage = Math.round((learnedTopics.length / AMINO_ACID_TOPICS.length) * 100);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
      modal
    >
      <DialogContent 
        className={`${
          isMobile ? 'max-w-[95vw] h-[85vh] p-4' : 'max-w-[60rem] max-h-[85vh] p-6'
        } bg-gradient-to-br from-[--theme-flashcard-color] via-[--theme-flashcard-color] to-[--theme-hover-color]/5 border-2 text-[--theme-text-color] border-[--theme-border-color]/30 shadow-2xl backdrop-blur-sm flex flex-col z-[100] focus:outline-none rounded-2xl overflow-hidden`}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="mb-6 flex-shrink-0">
          <DialogTitle className="w-full text-[--theme-hover-text] text-center items-center justify-center rounded-xl bg-gradient-to-r from-[--theme-hover-color] to-[--theme-gradient-startstreak] p-4 flex shadow-lg">
            <Brain className="w-6 h-6 mr-3" />
            <span className="flex-grow text-xl font-semibold">Tutor Hub</span>
            <TrendingUp className="w-6 h-6 ml-3" />
          </DialogTitle>
          <DialogDescription className="text-center pt-3 text-lg text-[--theme-text-color]/80">
            AI-powered analysis of your study progress
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto px-2 pb-6 space-y-6">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[--theme-hover-color] to-[--theme-gradient-startstreak] p-1">
                  <div className="w-full h-full rounded-full bg-[--theme-flashcard-color] flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[--theme-hover-color]" />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-semibold bg-gradient-to-r from-[--theme-hover-color] to-[--theme-gradient-startstreak] bg-clip-text text-transparent">
                  Learning your strengths and weaknesses...
                </p>
                <p className="text-[--theme-text-color]/70 text-lg">Analyzing your Amino Acids progress</p>
              </div>
            </div>
          ) : analysisComplete ? (
            <>
              <div className="bg-gradient-to-r from-[--theme-hover-color]/10 to-[--theme-gradient-startstreak]/10 rounded-2xl p-6 border border-[--theme-border-color]/20 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[--theme-hover-color] to-[--theme-gradient-startstreak] flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[--theme-text-color]">Amino Acids Progress</h3>
                    <p className="text-[--theme-text-color]/70">Comprehensive learning analysis</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-medium">Overall Progress</span>
                    <span className="text-2xl font-bold text-[--theme-hover-color]">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-[--theme-border-color]/30 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-[--theme-hover-color] to-[--theme-gradient-startstreak] h-4 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-[--theme-text-color]/60 mt-2">
                    {learnedTopics.length} of {AMINO_ACID_TOPICS.length} topics mastered
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50/80 to-green-100/60 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-green-700 dark:text-green-300">Topics Mastered</h4>
                      <p className="text-green-600 dark:text-green-400 text-sm">{learnedTopics.length} completed</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {learnedTopics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/60 dark:bg-green-900/20 rounded-xl border border-green-200/30 dark:border-green-700/20">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="font-medium text-green-800 dark:text-green-200">{topic.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50/80 to-red-100/60 dark:from-red-900/20 dark:to-red-800/10 rounded-2xl p-6 border border-red-200/50 dark:border-red-700/30 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-red-700 dark:text-red-300">Areas for Improvement</h4>
                      <p className="text-red-600 dark:text-red-400 text-sm">{notLearnedTopics.length} remaining</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {notLearnedTopics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/60 dark:bg-red-900/20 rounded-xl border border-red-200/30 dark:border-red-700/20">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="font-medium text-red-800 dark:text-red-200">{topic.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[--theme-flashcard-color] to-[--theme-hover-color]/5 rounded-2xl p-6 border border-[--theme-border-color]/20 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-[--theme-hover-color]" />
                  <h4 className="text-xl font-semibold">Questions for Your Tutor</h4>
                </div>
                <p className="text-[--theme-text-color]/70 mb-4">
                  Have specific questions about amino acids? Ask your tutor directly.
                </p>
                <Textarea 
                  placeholder="What would you like to ask your tutor about amino acids?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="min-h-[6rem] text-base border-[--theme-border-color]/30 focus:border-[--theme-hover-color] transition-colors rounded-xl"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={handleSubmitQuestion}
                  disabled={isSubmitting || !questionText.trim()}
                  variant="outline"
                  className="flex-1 h-12 text-base border-[--theme-hover-color] text-[--theme-hover-color] hover:bg-[--theme-hover-color] hover:text-white transition-all duration-200 rounded-xl"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Sending Question...' : 'Send Question'}
                </Button>
                <Button 
                  onClick={handleSubmitToTutor}
                  disabled={isSubmitting}
                  className="flex-1 h-12 text-base bg-gradient-to-r from-[--theme-hover-color] to-[--theme-gradient-startstreak] hover:from-[--theme-gradient-startstreak] hover:to-[--theme-hover-color] text-white shadow-lg transition-all duration-200 rounded-xl"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Submit to Tutor'}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
});

CommunityFeedbackDialog.displayName = 'CommunityFeedbackDialog';

export default CommunityFeedbackDialog; 