import React from 'react';
import { Video } from 'lucide-react';
import SimplePieChart from '@/components/pie-chart'

interface DataPoint {
  name: string;
  value: number;
}

const UWorldBlitzPage: React.FC = () => {
  const incorrectData: DataPoint[] = [
    { name: '7. Stereochem', value: 11.8 },
    { name: '2. Enzymes', value: 26.5 },
    { name: '3. Fluids', value: 26.5 },
    { name: '5. Work and E', value: 35.3 },
  ];

  return (
    <div className="bg-[#001326] min-h-screen p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">UWorld Blitz</h1>
        
        <div className="bg-black p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-4xl font-bold">Blitz:</h2>
            <Video className="w-8 h-8" />
          </div>
          <p className="text-gray-300">
            "a sudden, energetic, and concerted effort, typically on a specific task."
          </p>
        </div>
        
        <div className="mb-8">
          <h3 className="mb-2">We recommend doing....</h3>
          <div className="bg-white text-black p-4 rounded-lg">
            ...20 questions in organic chemistry, biochemistry, and organic.
          </div>
        </div>
        
        <div className="flex mb-8">
          <div className="w-1/2">
            <h3 className="text-xl mb-4">Incorrects: Overall</h3>
            <SimplePieChart data={incorrectData} />
          </div>
          <div className="w-1/2">
            <h3 className="text-xl mb-4">Most Missed</h3>
            <ul className="list-disc pl-5">
              <li>5. Work and Energ</li>
              <li>2. Enzymes</li>
              <li>3. Fluids</li>
              <li>7. Stereochemistr</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl mb-4">Enter previous scores below.</h3>
          <div className="bg-[#0A2744] h-16 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default UWorldBlitzPage;