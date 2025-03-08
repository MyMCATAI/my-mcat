import React, { useEffect, useRef } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface TutorialProps {
  runTutorial: boolean;
  setRunTutorial: (run: boolean) => void;
}

const Tutorial: React.FC<TutorialProps> = ({ runTutorial, setRunTutorial }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (runTutorial) {
      // Play sound when tutorial first shows
      audioRef.current?.play().catch(error => 
        console.error("Audio playback failed:", error)
      );
    }
  }, [runTutorial]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTutorial(false);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  };

  const welcomeContent = (
    <div className="space-y-6 text-black">
      <h1 className="text-3xl font-bold text-center mb-4">
        Welcome to MyMCAT.ai!
      </h1>
      <section className="bg-white p-4 rounded-lg shadow-lg">
        <p className="text-lg mb-4">
          Please play the minute video below to learn how to use MyMCAT.ai.
        </p>
        <video 
          className="w-full rounded-lg"
          controls
          src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/introvideo.mp4"
        />
      </section>
    </div>
  );

  const steps: Step[] = [
    {
      target: "body",
      content: welcomeContent,
      placement: "center",
      disableBeacon: true,
      styles: {
        options: {
          width: '60vw',
        },
      },
    }
  ];

  return (
    <>
      <audio ref={audioRef} src="/audio/notification.mp3" />
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={runTutorial}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={steps}
        styles={{
          options: {
            backgroundColor: "#ffffff",
            textColor: "black",
            primaryColor: "var(--theme-hover-color)",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          },
        }}
      />
    </>
  );
};

export default Tutorial;
