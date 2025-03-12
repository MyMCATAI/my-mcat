"use client";
import React, { useRef, useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step, EVENTS } from "react-joyride";
import { useAudio } from '@/store/selectors';

interface ATSTutorialProps {
  runPart1: boolean;
  setRunPart1: (run: boolean) => void;
  runPart2: boolean;
  setRunPart2: (run: boolean) => void;
  runPart3: boolean;
  setRunPart3: (run: boolean) => void;
  runPart4: boolean;
  setRunPart4: (run: boolean) => void;
  catIconInteracted: boolean;
}

const ATSTutorial: React.FC<ATSTutorialProps> = ({
  runPart1,
  setRunPart1,
  runPart2,
  setRunPart2,
  runPart3,
  setRunPart3,
  runPart4,
  setRunPart4,
  catIconInteracted,
}) => {
  const audio = useAudio();
  const [showSettingsSteps, setShowSettingsSteps] = useState(false);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, action } = data;
    
    if (runPart1 && (status === STATUS.FINISHED || status === STATUS.SKIPPED)) {
      setRunPart1(false);
      localStorage.setItem("initialTutorialPlayed", "true");
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (runPart1) {
        setRunPart1(false);
        localStorage.setItem("initialTutorialPlayed", "true");
      }
      if (runPart4) {
        setRunPart4(false);
        localStorage.setItem("atsIconTutorialPlayed", "true");
      }
    }

    if (type === EVENTS.STEP_AFTER) {
      audio.playSound('notification');
    }

    if (type === EVENTS.TARGET_NOT_FOUND) {
      console.warn('Could not find Joyride target');
    }
  };

  const initialSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-6 text-black">
          <h1 className="text-3xl font-bold text-center mb-4">
            {"Welcome to the Adaptive Tutoring Suite!"}
          </h1>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-lg mb-4">
              {"Based on your diagnostic scores, we've created a personalized learning path for you."}
            </p>
            <p className="text-lg">
              {"Let's explore the different ways you can learn and practice."}
            </p>
          </div>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '.camera-button',
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Video Content"}</h2>
          <p>{"Watch curated videos that focus on your weak areas."}</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.book-button',
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Reading Materials"}</h2>
          <p>{"Access detailed explanations and study guides."}</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.quiz-button',
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Practice Questions"}</h2>
          <p>{"Test your knowledge with adaptive quizzes."}</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.cat-icon',
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Meet Kalypso"}</h2>
          <p>{"Your AI tutor is here to help explain concepts and answer questions."}</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '.ats-topic-icons',
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Topic Selection"}</h2>
          <p>{"Here you have six subjects selected for you based on your weaknesses. Press the question mark on the right for more help! Then over the settings button (left) for more!"}</p>
        </div>
      ),
      placement: 'bottom',
      spotlightClicks: true,
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div className="space-y-4 text-black">
          <h1 className="text-3xl font-bold text-center mb-4">
            {"Great! Now press play on the first video and try clicking the cat icon to ask Kalypso about what you're watching"}
          </h1>
          <div className="flex justify-center">
            <video 
              src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/ATSHowTo.mp4"
              autoPlay 
              loop 
              muted 
              playsInline
              className="rounded-lg max-w-[22rem]"
            />
          </div>
        </div>
      ),
      placement: 'center',
    }
  ];
  
  // const topicSelectionStep: Step[] = [
  //   {
  //     target: '.ats-topic-icons',
  //     content: (
  //       <div className="space-y-4 text-black">
  //         <h2 className="text-xl font-bold">{"Topic Selection"}</h2>
  //         <p>{"Here you have six subjects selected for you based on your weaknesses. Press the question mark on the right for more help! Then over the settings button (left) for more!"}</p>
  //       </div>
  //     ),
  //     placement: 'bottom',
  //     spotlightClicks: true,
  //   }
  // ];

  // const settingsSteps: Step[] = [
  //   {
  //     target: '.checkmark-button',
  //     content: (
  //       <div className="space-y-4 text-black">
  //         <h2 className="text-xl font-bold">{"Track Your Progress"}</h2>
  //         <p>{"You can checkmark off categories once you're done with them."}</p>
  //       </div>
  //     ),
  //     placement: 'bottom',
  //   },
  //   {
  //     target: '.shuffle-button',
  //     content: (
  //       <div className="space-y-4 text-black">
  //         <h2 className="text-xl font-bold">{"Shuffle Subjects"}</h2>
  //         <p>{"If you'd like to shuffle based upon subjects, we have a button for that."}</p>
  //       </div>
  //     ),
  //     placement: 'bottom',
  //   },
  //   {
  //     target: '.topic-search',
  //     content: (
  //       <div className="space-y-4 text-black">
  //         <h2 className="text-xl font-bold">{"Find Specific Topics"}</h2>
  //         <p>{"If you'd like a specific topic, you can search for it here."}</p>
  //       </div>
  //     ),
  //     placement: 'bottom',
  //   },
  //   {
  //     target: '.algorithm-button',
  //     content: (
  //       <div className="space-y-4 text-black">
  //         <h2 className="text-xl font-bold">{"Smart Recommendations"}</h2>
  //         <p>{"If you don't know what to study, we keep tab on the questions you've missed and can give you subjects to study!"}</p>
  //       </div>
  //     ),
  //     placement: 'bottom',
  //   }
  // ];

  return (
    <>
      <Joyride
        steps={initialSteps}
        run={runPart1}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            primaryColor: 'var(--theme-hover-color)',
            zIndex: 1000,
          },
        }}
      />
      {/* <Joyride
        steps={topicSelectionStep}
        run={runPart4}
        continuous
        showProgress
        showSkipButton
        callback={(data) => {
          if (data.type === EVENTS.STEP_AFTER && data.index === 0) {
            setShowSettingsSteps(true);
          }
          handleJoyrideCallback(data);
        }}
        styles={{
          options: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            primaryColor: 'var(--theme-hover-color)',
            zIndex: 1000,
          },
        }}
      /> */}
      {/* <Joyride
        steps={settingsSteps}
        run={showSettingsSteps}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            primaryColor: 'var(--theme-hover-color)',
            zIndex: 1000,
          },
        }}
      /> */}
    </>
  );
};
  
export default ATSTutorial; 