import React, { useEffect, useRef } from "react";
import Joyride, { CallBackProps, STATUS, Step, EVENTS } from "react-joyride";
import { motion } from "framer-motion";

interface TutorialProps {
  runPart1: boolean;
  setRunPart1: (run: boolean) => void;
  runPart2: boolean;
  setRunPart2: (run: boolean) => void;
  runPart3: boolean;
  setRunPart3: (run: boolean) => void;
  runPart4: boolean;
  setRunPart4: (run: boolean) => void;
}

const Tutorial: React.FC<TutorialProps> = ({
  runPart1,
  setRunPart1,
  runPart2,
  setRunPart2,
  runPart3,
  setRunPart3,
  runPart4,
  setRunPart4,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((error) => console.error("Audio playback failed:", error));
    }
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, action } = data;
    
    if (type === EVENTS.TOUR_START) {
      playNotification();
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (runPart1) setRunPart1(false);
      if (runPart2) setRunPart2(false);
      if (runPart3) setRunPart3(false);
      if (runPart4) setRunPart4(false);
    }
  };

  useEffect(() => {
    if (runPart1 || runPart2 || runPart3 || runPart4) {
      playNotification();
    }
  }, [runPart1, runPart2, runPart3, runPart4]);

  const endAllTutorials = () => {
    if (runPart1) setRunPart1(false);
    if (runPart2) setRunPart2(false);
    if (runPart3) setRunPart3(false);
    if (runPart4) setRunPart4(false);
  };

  useEffect(() => {
    const scheduleContent = document.querySelector(".schedule-content");
    if (scheduleContent) {
      const handleScheduleClick = (event: Event) => {
        const target = event.target as HTMLElement;
        if (runPart1 && target.closest(".settings-button")) {
          endAllTutorials();
        }
      };

      scheduleContent.addEventListener("click", handleScheduleClick);

      return () => {
        scheduleContent.removeEventListener("click", handleScheduleClick);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runPart1]);

  const createShakeAnimation = (delay: number) => ({
    animate: { x: [0, -2, 2, -2, 2, 0] },
    transition: {
      duration: 0.4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      repeatDelay: 1.2,
      delay: delay,
    },
  });

  const welcomeContent = (
    <div className="space-y-6 text-black">
      <h1 className="text-3xl font-bold text-center mb-4">
        Welcome to MyMCAT.ai!
      </h1>

      <section className="bg-white p-4 rounded-lg shadow-lg">
        <p className="mb-4">
          The MCAT is a beast of a test that requires your best.
        </p>

        <details className="mb-4">
          <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
            Watch Video Overview ▶️
          </summary>
          <div className="mt-4">
            <video
              src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/MyMCATVideo.mp4"
              controls
              className="w-full rounded-lg"
            />
          </div>
        </details>

        <p className="mb-4">
          To beat your competition, some of the brightest students in the world, you must answer these three questions:
        </p>
        <ul className="list-none space-y-2">
          {[
            "When should I study?",
            "What should I study?",
            "How should I study?",
          ].map((goal, index) => (
            <li key={index}>
              <motion.span
                animate={createShakeAnimation(index * 0.1).animate}
                transition={createShakeAnimation(index * 0.1).transition}
                className="inline-block mr-2"
              >
                🎯
              </motion.span>
              <motion.span
                animate={createShakeAnimation(index * 0.1 + 0.1).animate}
                transition={createShakeAnimation(index * 0.1 + 0.1).transition}
                className="inline-block"
              >
                {goal}
              </motion.span>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-lg font-semibold">
        Let&apos;s begin solving your first problem of{" "}
        <span style={{ color: "blue" }}>when should I study?</span>
      </p>
    </div>
  );

  const tutorialPart2Content = (
    <div className="space-y-6 text-black w-full">
      <h1 className="text-3xl font-bold text-center mb-4">
        Customize Your Schedule
      </h1>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <p className="text-lg mb-6">
          We calculate the best time to take FLs, do AAMC, and use 3rd party
          resources.
        </p>
        <div className="mb-4 max-w-[35rem] mx-auto">
          <video 
            src="https://my-mcat.s3.us-east-2.amazonaws.com/public/CalendarReview.mp4"
            autoPlay
            loop
            muted
            className="w-full rounded-lg"
          />
        </div>
        <p className="text-lg mt-6">Click a cell and add an activity to your calendar.</p>
      </div>
    </div>
  );

  const tutorialPart3Content = (
    <div className="space-y-6 text-black">
      <h1 className="text-3xl font-bold text-center mb-4">Ask Kalypso</h1>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <p className="text-lg">
          {
            "Great job! Now, let's wake up Kalypso and ask him a question about your schedule."
          }
        </p>
        <p className="text-lg mt-5"></p>
      </div>
    </div>
  );

  const tutorialPart4Content = (
    <div className="space-y-6 text-black">
      <h1 className="text-3xl font-bold text-center mb-4">
        Complete Your First Task
      </h1>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <p className="text-lg">
          {
            "Yay! You've mastered the dashboard! Go ahead and checkmark it off in your Daily To-Do List!"
          }
        </p>
      </div>
    </div>
  );

  const part1Steps: Step[] = [
    {
      target: "body",
      content: welcomeContent,
      placement: "center",
      disableBeacon: true,
      styles: {
        options: {
          width: 600,
        },
      },
    },
    {
      target: ".tutorial-settings-button",
      content: "Click the settings button ⚙️ to customize your study plan.",
      placement: "left-start",
      styles: {
        options: {
          width: 250,
        },
      },
      spotlightPadding: 5,
    },
  ];

  const part2Steps: Step[] = [
    {
      target: "body",
      content: tutorialPart2Content,
      placement: "center",
      disableBeacon: true,
      styles: {
        options: {
          width: 700,
        },
      },
    },
    {
      target: ".schedule-content",
      content: "Enter a new activity!",
      placement: "right",
      styles: {
        options: {
          width: 200,
        },
      },
    },
  ];

  const part3Steps: Step[] = [
    {
      target: "body",
      content: tutorialPart3Content,
      placement: "center",
      disableBeacon: true,
    },
    {
      target: ".knowledge-profile-component",
      content:
        "Ask Kalypso your question here (you can also enable voice up top!)",
      placement: "left",
      styles: {
        options: {
          width: 300,
        },
      },
    },
  ];

  const part4Steps: Step[] = [
    {
      target: "body",
      content: tutorialPart4Content,
      placement: "center",
      disableBeacon: true,
    },
    {
      target: ".daily-todo-list",
      content: "Check off tutorial tasks here!",
      placement: "right",
      styles: {
        options: {
          width: 300,
        },
      },
    },
  ];

  return (
    <>
      <audio ref={audioRef} src="/notification.mp3" />
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={runPart1}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={part1Steps}
        spotlightClicks={true}
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
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={runPart2}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={part2Steps}
        spotlightClicks={true}
        styles={{
          options: {
            backgroundColor: "#ffffff",
            textColor: "#000000",
            primaryColor: "var(--theme-hover-color)",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          },
        }}
      />
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={runPart3}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={part3Steps}
        spotlightClicks={true}
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
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={runPart4}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={part4Steps}
        spotlightClicks={true}
        styles={{
          options: {
            backgroundColor: "#ffffff",
            textColor: "black",
            primaryColor: "var(--theme-border-color)",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          },
        }}
      />
    </>
  );
};

export default Tutorial;
