import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1)); // Static initial date

  useEffect(() => {
    setCurrentDate(new Date()); // Update to current date on client-side
  }, []);

  const tomorrow = addDays(currentDate, 1);
  const dayAfterTomorrow = addDays(currentDate, 2);
  const threeDaysAfter = addDays(currentDate, 3);
  const fourDaysAfter = addDays(currentDate, 4);

  return (
    <div className="bg-[#0E2247] text-white p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl mb-2">Calendar</h2>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-[#001326] text-white p-4 rounded-md h-40">
          <div>Tomorrow</div>
          <div>{format(tomorrow, 'MMMM do')}</div>
        </div>
      </div>
      <h2 className="text-xl mb-2 text-center">Later this month...</h2>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {[...Array(25)].map((_, index) => {
          const futureDate = addDays(currentDate, index + 5);
          return (
            <div
              key={index}
              className="bg-[#001326] text-white p-2 rounded-md h-16 relative"
              aria-label={`Day ${format(futureDate, 'd')}`}
            >
              <span className="absolute top-1 left-1 text-xs">{format(futureDate, 'd')}</span>
              <span className="absolute bottom-1 right-1 text-xs">{format(futureDate, 'MMM')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}