import React, { useRef, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step, EVENTS } from "react-joyride";

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
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (catIconInteracted) {
      console.log('Cat icon was interacted with, waiting 8 seconds...');
      const timer = setTimeout(() => {
        console.log('Starting part 4');
        setRunPart4(true);
      }, 8000); // 8 seconds

      return () => clearTimeout(timer); // Cleanup timeout if component unmounts
    }
  }, [catIconInteracted, setRunPart4]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;
    
    console.log('Joyride callback:', { type, index, catIconInteracted });

    if (index === 5 && type === EVENTS.STEP_AFTER) {
      console.log('Video step completed, ending initial tutorial');
      setRunPart1(false);
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (runPart1) setRunPart1(false);
      if (runPart2) setRunPart2(false);
      if (runPart3) setRunPart3(false);
      if (runPart4) setRunPart4(false);
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

  const atsIconStep: Step[] = [
    {
      target: '.ats-topic-icons',
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Topic Selection"}</h2>
          <p>{"Here, you have seven topics from the MCAT curated for you based upon your weaknesses. This is updated after tests and reviews as well as quiz results."}</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.ats-settings-button',
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Manual Selection"}</h2>
          <p>{"Click here to go to settings and select topics manually if you prefer not to use our algorithm."}</p>
        </div>
      ),
      placement: 'left',
    }
  ];

  return (
    <>
      <audio ref={audioRef} src="/notification.mp3" />
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
            primaryColor: 'var(--theme-border-color)',
            zIndex: 1000,
          },
        }}
      />
      <Joyride
        steps={atsIconStep}
        run={runPart4}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            primaryColor: 'var(--theme-border-color)',
            zIndex: 1000,
          },
        }}
      />
    </>
  );
};
  
export default ATSTutorial; 