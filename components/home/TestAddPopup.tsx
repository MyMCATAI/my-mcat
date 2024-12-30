import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const COMPANIES = ["AAMC", "Blueprint", "Jack Westin", "Altius"] as const;
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
  }
} as const;

interface TestAddPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (test: {
    company: Company;
    testNumber: string;
    date: Date | null;
    useRecommendedDate: boolean;
  }) => void;
}

const TestAddPopup: React.FC<TestAddPopupProps> = ({ isOpen, onClose, onAdd }) => {
  const [newTest, setNewTest] = React.useState({
    company: "" as Company,
    testNumber: "",
    date: null as Date | null,
    useRecommendedDate: true
  });

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleAdd = () => {
    onAdd(newTest);
    setNewTest({ company: "" as Company, testNumber: "", date: null, useRecommendedDate: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[40rem] bg-[#f8fafc] text-black">
        {/* ... Rest of the dialog content ... */}
        {/* Copy the entire DialogContent from your PracticeTests component */}
      </DialogContent>
    </Dialog>
  );
};

export default TestAddPopup;