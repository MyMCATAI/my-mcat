import React from "react";
import { useUI } from "@/store/selectors";

interface FilterButtonProps {
  subjects: string[];
  onFilterChange: (subject: string) => void;
  selectedValue: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  subjects,
  onFilterChange,
  selectedValue,
}) => {
  const { theme } = useUI();

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const subject = event.target.value;
    onFilterChange(subject);
  };

  return (
    <select
      value={selectedValue}
      onChange={handleSubjectChange}
      className={`border rounded-md p-2 bg-[--theme-background-color] text-[--theme-text-color] border-[--theme-border-color]`}
      style={{
        color: "var(--theme-text-color)",
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
