import React, { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step, EVENTS, Status } from "react-joyride";
import { toast } from "react-hot-toast";

interface CARsTutorialProps {
  runTutorial: boolean;
  setRunTutorial: (run: boolean) => void;
  kalypsoInteracted: boolean;
}

const CARsTutorial: React.FC<CARsTutorialProps> = ({
  runTutorial,
  setRunTutorial,
  kalypsoInteracted,
}) => {
  const [showAlgorithmStep, setShowAlgorithmStep] = useState(false);

  const handleJoyrideCallback = (data: CallBackProps) => {
    console.log("Joyride callback:", data);
    const { status, type } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTutorial(false);
      localStorage.setItem("carsTutorialPlayed", "true");
    }
  };

  useEffect(() => {
    if (kalypsoInteracted) {
      console.log("Kalypso was clicked, waiting 3 seconds...");
      const timer = setTimeout(() => {
        console.log("Showing algorithm message");
        setShowAlgorithmStep(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [kalypsoInteracted]);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="space-y-6 text-black">
          <h1 className="text-2xl font-bold text-center mb-4">
            Welcome to the Daily CARs suite!
          </h1>
          <div className="w-full max-w-[32rem] mx-auto">
            <video 
              src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/DailyCARs.mp4"
              controls 
              className="rounded-lg w-full"
            />
          </div>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
      styles: {
        tooltip: {
          maxWidth: '90vw',
          width: 'auto'
        }
      }
    },
    {
      target: ".cars-overview",
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"CARs Overview"}</h2>
          <p>{"This is where you'll see an overview of CARs as well as your passage of the day."}</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: ".cars-stats",
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Your CARs Stats"}</h2>
          <p>{"From left to right:"}</p>
          <ul className="list-disc pl-5 text-left">
            <li>{"Score: Your average score"}</li>
            <li>{"Watch: Average minutes per passage"}</li>
            <li>{"Coins: Size of your purse."}</li>
            <li>{"Tests: Reviewed tests vs. completed tests"}</li>
          </ul>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".kalypso-portrait",
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Meet Kalypso!"}</h2>
          <p>{"Kalypso will remind you what to prioritize. Click him!"}</p>
        </div>
      ),
      placement: "right",
    }
  ];

  const algorithmStep: Step[] = [
    {
      target: "body",
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Get started with your first CARs passage!"}</h2>
          <p>{"Our algorithm picks out a CARs passage that's your difficulty: it can go from really easy to brutally hard. You can start now, or go to Bulletin and see our recommended CARs strategies."}</p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    }
  ];

  return (
    <>
      <Joyride
        steps={steps}
        run={runTutorial}
        continuous
        showProgress
        showSkipButton
        disableOverlayClose
        hideBackButton
        spotlightClicks
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
        steps={algorithmStep}
        run={showAlgorithmStep}
        continuous={false}
        showProgress={false}
        showSkipButton={false}
        disableOverlayClose
        hideBackButton
        spotlightClicks
        callback={(data: CallBackProps) => {
          const { status } = data;
          if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
            setShowAlgorithmStep(false);
            localStorage.setItem("carsTutorialPlayed", "true");
          }
        }}
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

export default CARsTutorial;
