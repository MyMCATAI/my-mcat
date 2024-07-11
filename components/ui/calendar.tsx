// components/Calendar.jsx
export default function Calendar() {
  return (
    <div className="bg-[#0E2247] text-white p-4 rounded-lg shadow-md mt-4">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white text-black p-4 rounded-md h-40">Tomorrow</div>
        <div className="bg-white text-black p-4 rounded-md h-40">Tuesday</div>
        <div className="bg-white text-black p-4 rounded-md h-40">Wednesday</div>
        <div className="bg-white text-black p-4 rounded-md h-40">Thursday</div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-4">
        <h2 className="text-xl mb-2 text-center">Monthly Calendar</h2>
        {[...Array(25)].map((_, index) => (
          <div key={index} className="bg-[#001326] text-white p-2 rounded-md h-16 relative">
            <span className="absolute top-1 left-1 text-xs">{index + 5}</span>
          </div>
        ))}
      </div>
      <div className="mt-4">64 Days Left</div>
    </div>
  );
}
