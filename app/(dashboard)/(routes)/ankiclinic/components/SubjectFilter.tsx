import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGame } from "@/store/selectors";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";

interface SubjectFilterProps {
  onFilterApplied?: () => void;
  compact?: boolean;
  className?: string;
}

const SubjectFilter: React.FC<SubjectFilterProps> = ({ 
  onFilterApplied,
  compact = false,
  className = "" 
}) => {
  // Get subject data and actions from store
  const { 
    availableSubjects, 
    selectedSubjects,
    setSelectedSubjects, 
    toggleSubject, 
    resetSubjects 
  } = useGame();
  
  // Local state for tracking changes before applying
  const [localSelectedSubjects, setLocalSelectedSubjects] = useState<string[]>(selectedSubjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Update local state when store changes
  useEffect(() => {
    setLocalSelectedSubjects(selectedSubjects);
  }, [selectedSubjects]);

  // Handle local toggle
  const handleToggle = (subject: string) => {
    // Don't allow deselecting the last subject
    if (localSelectedSubjects.includes(subject) && localSelectedSubjects.length <= 1) {
      return;
    }
    
    setLocalSelectedSubjects((prev) => {
      const newSelection = prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject];
      return newSelection;
    });
  };

  // Apply changes to the store
  const handleApply = () => {
    setSelectedSubjects(localSelectedSubjects);
    setIsDialogOpen(false);
    if (onFilterApplied) {
      onFilterApplied();
    }
  };

  // Reset to all subjects
  const handleReset = () => {
    const allSubjects = availableSubjects.map(s => s.name);
    setLocalSelectedSubjects(allSubjects);
  };

  // Compact view for inline usage
  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <span>{selectedSubjects.length} Subjects</span>
        </Button>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Game by Subjects</DialogTitle>
              <DialogDescription>
                Select which subjects you want to include in your Anki Clinic games
              </DialogDescription>
            </DialogHeader>
            
            {renderSubjectCheckboxes()}
            
            <DialogFooter>
              <Button variant="outline" onClick={handleReset}>Reset All</Button>
              <Button onClick={handleApply}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Full view for settings panel
  return (
    <div className={`bg-[--theme-leaguecard-color] text-[--theme-text-color] p-4 rounded-lg shadow-md ${className}`}>
      <h3 className="text-xs mb-4 text-center opacity-60 uppercase tracking-wide">
        Filter Game by Subjects
      </h3>
      
      {renderSubjectCheckboxes()}
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
        >
          Reset All
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={handleApply}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );

  // Helper function to render the checkboxes
  function renderSubjectCheckboxes() {
    return (
      <div className="max-h-[10rem] overflow-y-auto py-2">
        <div className="grid grid-cols-2 gap-2">
          {availableSubjects.map((subject) => (
            <div
              key={subject.name}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[--theme-hover-color] transition-colors"
            >
              <Checkbox
                id={`game-filter-${subject.name}`}
                checked={localSelectedSubjects.includes(subject.name)}
                disabled={localSelectedSubjects.includes(subject.name) && localSelectedSubjects.length <= 1}
                onCheckedChange={() => handleToggle(subject.name)}
                className="h-4 w-4"
              />
              <label
                htmlFor={`game-filter-${subject.name}`}
                className="text-sm font-medium cursor-pointer"
                style={{ color: subject.color }}
              >
                {subject.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export default SubjectFilter; 