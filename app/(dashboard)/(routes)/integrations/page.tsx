'use client'

import Link from "next/link";
import { useRef, useState } from "react";
import TestComponent from "./TestComponent";
import { ArrowLeft } from 'lucide-react';
import OpenAISettingsModal from './OpenAISettingsModal';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [selectedAI, setSelectedAI] = useState<'openai' | 'claude' | null>(null);
  const [isOpenAISettingsOpen, setIsOpenAISettingsOpen] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedPassage, setGeneratedPassage] = useState('');
  const [generatedExplanation, setGeneratedExplanation] = useState('');
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/home');
  };

  return (
    <div className="text-black min-h-screen p-2 bg-[url('/saraswatibg.png')] bg-cover bg-center font-calibri">
      {/* Header */}
      <div className="mb-2">
        <Link href="/dashboard/mcat" passHref>
          {/* Add your logo or button here */}
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-[98%] mx-auto">
        {/* TestComponent */}
        <div className="w-full h-[92vh] relative bg-gray-800 rounded-lg p-1 shadow-lg">
          <div className="w-full h-full bg-[white] rounded-lg shadow-md overflow-hidden">
            <TestComponent 
              showList={false}
              userPrompt={userPrompt} 
              generatedPassage={generatedPassage}
              setGeneratedPassage={setGeneratedPassage}
              generatedExplanation={generatedExplanation}
              setGeneratedExplanation={setGeneratedExplanation}
            />
          </div>
        </div>

        {/* Back Button */}
        <div className="absolute top-0 left-0 h-full flex flex-col justify-start pt-2">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors duration-200 bg-white border-gray-300 hover:bg-gray-500 hover:border-gray-600 border-2"
            onClick={handleBackClick}
          >
            <ArrowLeft size={20} color="black" />
          </button>
        </div>

        {/* OpenAI Settings Modal */}
        <OpenAISettingsModal
          isOpen={isOpenAISettingsOpen}
          onClose={() => setIsOpenAISettingsOpen(false)}
        />
      </div>
    </div>
  );
}
