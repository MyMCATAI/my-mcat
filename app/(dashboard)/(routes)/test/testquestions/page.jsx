"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Passage from "@/components/test/Passage";
import Questions from "@/components/test/Questions";

const TestQuestions = () => {
  const [passage, setPassage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const passageId = searchParams.get('id');

  useEffect(() => {
    const fetchPassage = async () => {
      if (!passageId) {
        setError("No passage ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/passage?id=${passageId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch passage');
        }
        const data = await response.json();
        console.log("data",data)
        setPassage(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPassage();
  }, [passageId]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error: {error}</div>;
  if (!passage) return <div className="text-white">No passage found</div>;

  return (
    <div className="bg-[#001326] min-h-[80vh] text-black flex justify-center flex-col">
      <div className="max-w-full w-full flex-grow">
        <div className="bg-gray-800 text-white p-4 flex justify-between border-b-2 border-sky-500">
          <h1 className="text-white text-lg font-semi-bold mb-0 mt-2">
            Medical College Admission Test - Labor Studies Department
          </h1>
          <p className="">Timer</p>
        </div>
        <div className="flex flex-row h-screen">
          <div className="w-1/2 border-r border-sky-500">
            <Passage passageData={passage} />
          </div>
          <div className="w-1/2">
            <Questions questions={passage.questions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestQuestions;