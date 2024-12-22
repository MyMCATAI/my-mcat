import { Dialog, DialogContent } from "@/components/ui/dialog";

interface OptionsDialogProps {
  showOptionsModal: boolean;
  setShowOptionsModal: (show: boolean) => void;
  handleTabChange: (tab: string) => void;
}

export const OptionsDialog = ({ 
  showOptionsModal, 
  setShowOptionsModal, 
  handleTabChange 
}: OptionsDialogProps) => (
  <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
    <DialogContent className="bg-[#001226] text-white border border-sky-500 rounded-lg max-w-3xl">
      <h2 className="text-2xl font-semibold text-sky-300 text-center mb-6">Pick one</h2>
      <div className="grid grid-cols-3 gap-6">
        <button 
          onClick={() => {
            setShowOptionsModal(false);
            handleTabChange("Schedule");
          }}
          className="flex flex-col items-center p-4 rounded-lg hover:bg-sky-900/50 transition-colors"
        >
          <img src="/kalypsocalendar.png" alt="Calendar" className="w-32 h-32 object-contain mb-3" />
          <span className="text-center font-medium">ADAPTIVE TUTORING</span>
          <span className="text-sm text-sky-300">(5 coins)</span>
        </button>

        <button 
          onClick={() => {
            setShowOptionsModal(false);
            handleTabChange("flashcards");
          }}
          className="flex flex-col items-center p-4 rounded-lg hover:bg-sky-900/50 transition-colors"
        >
          <img src="/kalypsodiagnostic.png" alt="Flashcards" className="w-32 h-32 object-contain mb-3" />
          <span className="text-center font-medium">ANKI GAME</span>
          <span className="text-sm text-sky-300">(5 coins)</span>
        </button>

        <button 
          onClick={() => {
            setShowOptionsModal(false);
            handleTabChange("KnowledgeProfile");
          }}
          className="flex flex-col items-center p-4 rounded-lg hover:bg-sky-900/50 transition-colors"
        >
          <img src="/kalypotesting.png" alt="Testing" className="w-32 h-32 object-contain mb-3" />
          <span className="text-center font-medium">ENHANCED TEST REVIEW</span>
          <span className="text-sm text-sky-300">(50 coins)</span>
        </button>
      </div>
    </DialogContent>
  </Dialog>
);