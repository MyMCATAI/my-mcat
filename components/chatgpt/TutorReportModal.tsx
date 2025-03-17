import { X } from "lucide-react";
import { motion } from "framer-motion";

/* ----- Types ---- */
interface TutorReportModalProps {
  onClose: () => void;
}

const TutorReportModal = ({ onClose }: TutorReportModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[90vw] max-w-4xl bg-[--theme-leaguecard-color] rounded-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[--theme-border-color]">
          <h2 className="text-2xl font-semibold text-[--theme-text-color]">Last Tutoring Session Report</h2>
          <button onClick={onClose} className="text-[--theme-text-color] hover:opacity-70">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Video Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[--theme-text-color]">Session Recording</h3>
            <div className="aspect-video bg-black/20 rounded-lg overflow-hidden">
              <iframe 
                src="https://drive.google.com/file/d/13dgWPngVzMsAzC19hp0M6m2CKK-JKisC/preview" 
                width="100%" 
                height="100%" 
                allow="autoplay"
                className="w-full h-full"
              ></iframe>
            </div>
          </div>

          {/* Summary Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[--theme-text-color]">Session Summary</h3>
            <div className="prose prose-invert max-w-none">
              <h4>CARS Strategy Review</h4>
              <ul>
                <li>Focused on improving reading comprehension speed while maintaining accuracy</li>
                <li>Practiced the "Scaffolding Technique" for complex passages</li>
                <li>Identified patterns in question types that consistently challenge you</li>
              </ul>

              <h4>Key Takeaways</h4>
              <ul>
                <li>Start with a quick 30-second passage overview before detailed reading</li>
                <li>Use active reading techniques: highlight key terms and topic sentences</li>
                <li>Practice timing: aim for 3 minutes reading, 4 minutes answering questions</li>
              </ul>

              <h4>Tutor's Tips</h4>
              <blockquote>
                "Remember, CARS isn't about memorization – it's about developing a systematic approach. 
                Your improvement in timing is notable, but don't sacrifice comprehension for speed. 
                Keep using the highlighting technique we practiced – it's making a difference!"
              </blockquote>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[--theme-text-color]">Focus Areas for Next Week</h3>
            <ul className="list-disc pl-5 space-y-2 text-[--theme-text-color]">
              <li>Complete 2 CARS passages daily using the new timing strategy</li>
              <li>Review highlighted portions of passages before answering questions</li>
              <li>Practice identifying author's tone in complex humanities passages</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TutorReportModal; 