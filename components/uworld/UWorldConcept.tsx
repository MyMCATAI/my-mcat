import { useState, useEffect } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { uniqueCategories } from '@/constants/uworld';
import { UWorldTask } from './types';

/* ----- Types ---- */
interface UWorldConceptProps {
  task: UWorldTask;
  onCorrectChange: (value: string) => void;
  onIncorrectChange: (value: string) => void;
  onDelete: () => void;
  onSubjectChange: (value: string) => void;
  isReadOnly: boolean;
}

const UWorldConcept = ({
  task,
  onCorrectChange,
  onIncorrectChange,
  onDelete,
  onSubjectChange,
  isReadOnly
}: UWorldConceptProps): JSX.Element => {
  /* ---- State ----- */
  const [isOpen, setIsOpen] = useState(false);
  const correctValue = typeof task.correctAnswers === 'number' ? task.correctAnswers.toString() : '';
  const incorrectValue = typeof task.incorrectAnswers === 'number' ? task.incorrectAnswers.toString() : '';

  /* ---- Event Handlers ----- */
  const handleCorrectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value !== correctValue) {
      onCorrectChange(value);
    }
  };

  const handleIncorrectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value !== incorrectValue) {
      onIncorrectChange(value);
    }
  };

  const handleSelectClick = () => {
    if (!isReadOnly) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (subject: string) => {
    onSubjectChange(subject);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-select')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex items-end gap-4 p-4 text-black bg-white rounded-lg shadow-sm">
      <div className="flex-1 relative custom-select">
        <button
          onClick={handleSelectClick}
          disabled={isReadOnly}
          className={`flex h-[38px] w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${isOpen ? 'border-gray-300' : ''}`}
        >
          <span className={task.subject ? 'text-black' : 'text-gray-500'}>
            {task.subject || 'Select subject'}
          </span>
          <ChevronDown className={`h-4 w-4 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <div 
          className={`absolute z-50 w-full mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-md transition-[max-height,opacity] duration-200 ease-in-out ${
            isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="py-1 pr-2 overflow-y-auto max-h-60 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
            {uniqueCategories.map((subject) => (
              <div
                key={subject}
                onClick={() => handleOptionClick(subject)}
                className="relative flex w-full cursor-pointer select-none items-center py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-50"
              >
                {subject === task.subject && (
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
                {subject}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-green-700 font-medium">Correct</span>
        <Input
          type="number"
          value={correctValue}
          onChange={handleCorrectChange}
          disabled={isReadOnly}
          className="w-20 h-[38px] px-3 py-1 border rounded-md disabled:opacity-50"
          min="0"
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-red-700 font-medium">Incorrect</span>
        <Input
          type="number"
          value={incorrectValue}
          onChange={handleIncorrectChange}
          disabled={isReadOnly}
          className="w-20 h-[38px] px-3 py-1 border rounded-md disabled:opacity-50"
          min="0"
        />
      </div>

      {!isReadOnly && (
        <div className="flex flex-col justify-end mb-[10px]">
          <button
            onClick={onDelete}
            className="text-gray-400 transition-colors hover:text-red-500"
            title="Delete task"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UWorldConcept;