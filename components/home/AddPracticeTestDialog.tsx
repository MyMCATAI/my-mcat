import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDisplayDate } from '@/lib/utils';
import { toast } from "@/components/ui/use-toast";

const COMPANIES = ["AAMC", "Blueprint", "Jack Westin", "Altius", "Kaplan", "Princeton Review"] as const;
type Company = typeof COMPANIES[number];

const COMPANY_INFO = {
  "Jack Westin": {
    url: "https://jackwestin.com/mcat-cars-practice-exams",
    note: "(6 Free FLs)"
  },
  "Blueprint": {
    url: "https://blueprintprep.com/mcat/free-resources/free-mcat-practice-bundle",
    note: "(One Free HL)"
  },
  "AAMC": {
    url: "https://students-residents.aamc.org/prepare-mcat-exam/practice-mcat-exam-official-low-cost-products",
    note: "(Two Free Samples)"
  },
  "Altius": {
    url: "https://altiustestprep.com/practice-exam/free-exam/",
    note: "(One Free FL)"
  },
  "Kaplan": {
    url: "https://www.kaptest.com/mcat/free/mcat-free-practice-test?srsltid=AfmBOorJX4XYIkNFESFKrB3XdzJubLdpDVBH0-aq6GFSjHE9QLKQPBS7",
    note: "(One Free FL)"
  },
  "Princeton Review": {
    url: "https://www.princetonreview.com/product/details/?id=MAR-MCAT15-OLTEST&z=23116",
    note: "(One Free FL)"
  }
} as const;

export const AAMC_TESTS = [
  { value: "0", label: "Unscored Sample", backendName: "Unscored Sample" },
  { value: "1", label: "FL1", backendName: "Full Length Exam 1" },
  { value: "2", label: "FL2", backendName: "Full Length Exam 2" },
  { value: "3", label: "FL3", backendName: "Full Length Exam 3" },
  { value: "4", label: "FL4", backendName: "Full Length Exam 4" },
  { value: "5", label: "Scored", backendName: "Sample Scored (FL5)" }
] as const;

interface AddPracticeTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTest: (params: {
    company: Company;
    testNumber: string;
    date: Date | null;
    useRecommendedDate: boolean;
    takenBefore: boolean;
  }) => Promise<void>;
  existingTests?: { name: string }[];
}

const AddPracticeTestDialog: React.FC<AddPracticeTestDialogProps> = ({
  isOpen,
  onClose,
  onAddTest,
  existingTests = []
}) => {
  const [newTest, setNewTest] = React.useState({
    company: "" as Company,
    testNumber: "",
    date: null as Date | null,
    useRecommendedDate: true,
    takenBefore: false
  });
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (newTest.useRecommendedDate && newTest.company && newTest.testNumber && !newTest.takenBefore) {
      fetchNextAvailableDate();
    }
  }, [newTest.useRecommendedDate, newTest.company, newTest.testNumber, newTest.takenBefore]);

  const fetchNextAvailableDate = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/calendar/next-available-test-date');
      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to get next available date",
          variant: "destructive",
        });
        return;
      }
      const data = await response.json();
      setNewTest(prev => ({ ...prev, date: new Date(data.date) }));
    } catch (error) {
      console.error('Error fetching next available date:', error);
      toast({
        title: "Error",
        description: "Failed to get next available date",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newTest.company || !newTest.testNumber || (!newTest.date && !newTest.useRecommendedDate)) {
      return;
    }

    if (newTest.takenBefore && !newTest.date) {
      toast({
        title: "Date required",
        description: "Please select the date when you took this test",
        variant: "destructive",
      });
      return;
    }

    await onAddTest(newTest);
    setNewTest({ company: "" as Company, testNumber: "", date: null, useRecommendedDate: true, takenBefore: false });
  };

  // Helper function to check if a test exists
  const isTestExists = (testName: string) => {
    return existingTests.some(test => test.name === testName);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[40rem] bg-[#f8fafc] text-black">
        <DialogHeader>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <DialogTitle className="text-2xl font-bold text-black">
                  Add Practice Test
                </DialogTitle>
                <div className="text-[0.7rem] text-gray-400 italic">
                  Our study tool is unaffiliated. Click visit to access their websites.
                </div>
              </div>
              {newTest.company && (
                <a 
                  href={COMPANY_INFO[newTest.company].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-all shadow-sm hover:shadow-md"
                >
                  <span>Visit</span>
                  <span className="text-[0.625rem] text-gray-500">*</span>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col space-y-8 py-6">
          <div className="bg-[#8e9aab] bg-opacity-10 p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
            <div className="space-y-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Company</label>
                <Select
                  value={newTest.company}
                  onValueChange={(value) => setNewTest({ ...newTest, company: value as Company })}
                >
                  <SelectTrigger className="bg-white border-gray-300 h-10">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANIES.map((company) => (
                      <SelectItem key={company} value={company}>
                        <span className="flex items-center justify-between w-full">
                          <span>{company}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {COMPANY_INFO[company].note}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Full Length Number</label>
                {newTest.company === "AAMC" ? (
                  <Select
                    value={newTest.testNumber}
                    onValueChange={(value) => setNewTest({ ...newTest, testNumber: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 h-10">
                      <SelectValue placeholder="Select AAMC test" />
                    </SelectTrigger>
                    <SelectContent>
                      {AAMC_TESTS.map((test) => {
                        const exists = isTestExists(test.backendName);
                        return (
                          <SelectItem 
                            key={test.value} 
                            value={test.value}
                            disabled={exists}
                            className={exists ? 'opacity-50' : ''}
                          >
                            <span className="flex items-center justify-between w-full">
                              <span>{test.label}</span>
                              {exists && (
                                <span className="text-xs text-gray-500 ml-2">
                                  (Already added)
                                </span>
                              )}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newTest.testNumber}
                    onChange={(e) => setNewTest({ ...newTest, testNumber: e.target.value })}
                    placeholder="Enter test number"
                    className="bg-white border-gray-300 h-10"
                  />
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Test Date</label>
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={newTest.takenBefore}
                        onChange={(e) => setNewTest({ 
                          ...newTest, 
                          takenBefore: e.target.checked,
                          useRecommendedDate: e.target.checked ? false : newTest.useRecommendedDate,
                          date: null
                        })}
                        className="rounded border-gray-300"
                        id="takenBefore"
                      />
                      <label htmlFor="takenBefore" className="text-sm text-gray-600">
                        Taken it before
                      </label>
                    </div>
                    {!newTest.takenBefore && (
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={newTest.useRecommendedDate}
                          onChange={(e) => setNewTest({ 
                            ...newTest, 
                            useRecommendedDate: e.target.checked,
                            date: null
                          })}
                          className="rounded border-gray-300"
                          id="pickForMe"
                        />
                        <label htmlFor="pickForMe" className="text-sm text-gray-600">
                          Pick for me
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                
                {newTest.useRecommendedDate && !newTest.takenBefore ? (
                  <div className="text-sm text-gray-600 italic p-2 bg-gray-50 rounded text-center">
                    {isLoading ? (
                      "Finding the next available test date..."
                    ) : newTest.date ? (
                      `Next available test date: ${formatDisplayDate(newTest.date)}`
                    ) : (
                      "We'll recommend the next available test date based on your study schedule"
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Input
                      type="date"
                      value={newTest.date ? newTest.date.toISOString().split('T')[0] : ''}
                      min={newTest.takenBefore ? undefined : new Date().toISOString().split('T')[0]}
                      max={newTest.takenBefore ? new Date().toISOString().split('T')[0] : undefined}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) {
                          setNewTest({ ...newTest, date: null });
                          return;
                        }
                        
                        // Simply create a new Date object from the input value
                        // This will handle the date in the user's local timezone
                        const date = new Date(value);
                        setNewTest({ ...newTest, date });
                      }}
                      className="w-full h-10 bg-white border-gray-300"
                    />
                  </div>
                )}
                
                {newTest.date && !newTest.useRecommendedDate && (
                  <div className="text-sm text-gray-600 mt-1 text-center">
                    Selected date: {formatDisplayDate(newTest.date)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!newTest.company || !newTest.testNumber || 
                (!newTest.takenBefore && !newTest.date && !newTest.useRecommendedDate) || 
                (newTest.takenBefore && !newTest.date) || 
                isLoading}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Add Test
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPracticeTestDialog; 