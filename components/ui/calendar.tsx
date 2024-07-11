import React from 'react';
import { format, addDays } from 'date-fns';

export default function Calendar() {
  const today = new Date();
  console.log("Today's date:", today); // Debugging line

  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2);
  const threeDaysAfter = addDays(today, 3);
  const fourDaysAfter = addDays(today, 4);

  return (
    <div className="bg-[#0E2247] text-white p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl mb-2">Calendar</h2>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-[#001326] text-white p-4 rounded-md h-40">
          <div>Tomorrow</div>
          <div>{format(tomorrow, 'MMMM do')}</div>
          <div>Debug: {tomorrow.toISOString()}</div> {/* Debugging line */}
        </div>
        {/* ... (other days) ... */}
      </div>
      <h2 className="text-xl mb-2 text-center">Later this month...</h2>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {[...Array(25)].map((_, index) => {
          const futureDate = addDays(today, index + 5);
          return (
            <div
              key={index}
              className="bg-[#001326] text-white p-2 rounded-md h-16 relative"
              aria-label={`Day ${format(futureDate, 'd')}`}
            >
              <span className="absolute top-1 left-1 text-xs">{format(futureDate, 'd')}</span>
              <span className="absolute bottom-1 right-1 text-xs">{futureDate.toISOString().split('T')[0]}</span> {/* Debugging line */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
