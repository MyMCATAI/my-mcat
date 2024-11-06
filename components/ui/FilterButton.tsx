import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface FilterButtonProps {
  subjects: string[];
  onFilterChange: (subject: string) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  subjects,
  onFilterChange,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const { theme } = useTheme();

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const subject = event.target.value;
    setSelectedSubject(subject);
    onFilterChange(subject);
  };

  return (
    <select
      value={selectedSubject}
      onChange={handleSubjectChange}
      className={`border rounded-md p-2 bg-[--theme-background-color] text-[--theme-text-color] border-[--theme-border-color]`}
      style={{
        color: "var(--theme-text-color)", // Ensure text color is set
      }}
    >
      <option value="">All Subjects</option>
      {subjects.map((subject) => (
        <option key={subject} value={subject}>
          {subject}
        </option>
      ))}
    </select>
  );
};

export default FilterButton;
