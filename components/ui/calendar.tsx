// components/Calendar.jsx
export default function Calendar() {
    return (
      <div className="bg-[#0E2247] text-white p-4 rounded-lg shadow-md mt-4">
        <h2 className="text-xl mb-2">Calendar</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white text-black p-4 rounded-md h-40">Tomorrow</div>
          <div className="bg-white text-black p-4 rounded-md h-40">Tuesday</div>
          <div className="bg-white text-black p-4 rounded-md h-40">Wednesday</div>
          <div className="bg-white text-black p-4 rounded-md h-40">Thursday</div>
        </div>
        <div className="mt-4">64 Days Left</div>
      </div>
    );
  }
  