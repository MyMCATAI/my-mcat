import React from 'react';
import { DayPicker, DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

type CalendarMode = "single" | "multiple" | "range";

interface BaseCalendarProps {
  className?: string;
  classNames?: Record<string, string>;
}

interface SingleCalendarProps extends BaseCalendarProps {
  mode: "single";
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
}

interface MultipleCalendarProps extends BaseCalendarProps {
  mode: "multiple";
  selected?: Date[];
  onSelect?: (date: Date[]) => void;
}

interface RangeCalendarProps extends BaseCalendarProps {
  mode: "range";
  selected?: DateRange | undefined;
  onSelect?: (range: DateRange | undefined) => void;
  required?: boolean;
}

type CalendarProps = 
  | (Omit<SingleCalendarProps, 'mode'> & { mode?: 'single' })
  | MultipleCalendarProps 
  | RangeCalendarProps;

export default function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
  classNames,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      mode={mode}
      selected={selected as any}
      onSelect={onSelect as any}
      className={cn("p-3", className)}
      {...(mode === "range" ? { required: false } : {})}
      {...props}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground focus:outline-none"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
    />
  );
}