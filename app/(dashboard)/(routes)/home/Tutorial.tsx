import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { motion } from 'framer-motion';

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
  runPart1, setRunPart1, 
  runPart2, setRunPart2,
  runPart3, setRunPart3,
  runPart4, setRunPart4
}) => {
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunPart1(false);
      setRunPart2(false);
      setRunPart3(false);
      setRunPart4(false);
    }
  };

  const createShakeAnimation = (delay: number) => ({
    animate: { x: [0, -2, 2, -2, 2, 0] },
    transition: {
      duration: 0.4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      repeatDelay: 1.2,
      delay: delay
    }
  });

  const welcomeContent = (
    <div className="space-y-6 text-[--theme-text-color]">
      <h1 className="text-3xl font-bold text-center mb-4">Welcome to MyMCAT.ai!</h1>
      
      <section className="bg-[--theme-gradient-end] p-4 rounded-lg shadow-lg">
        <p className="mb-4">The MCAT is a seven hour and thirty minute exam that covers eight subjects.</p>
        
        <p className="mb-4">Traditionally, students use Kaplan books for content, Anki for flashcards, and UWorld and AAMC for practice questions. However, this approach is often inefficient for a lot of students who need better guidance.</p>
        
        <p className="mb-4">We offer a BETTER way to approach MCAT prep with an all-in-one software that integrates Anki cards, trusted content, and an adaptable schedule. We want to solve these three questions for you:</p>
        <ul className="list-none space-y-2">
          {['When should I study?', 'What should I study?', 'How should I study?'].map((goal, index) => (
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
        Let's begin solving your first problem — to the Dashboard!</p>
    </div>
  );

  const tutorialPart2Content = (
    <div className="space-y-6 text-[--theme-text-color]">
      <h1 className="text-3xl font-bold text-center mb-4">Customize Your Schedule</h1>
      
      <div className="bg-[--theme-gradient-end] p-4 rounded-lg shadow-lg">
        <div className="mb-4">
          [INSERT GIF HERE]
        </div>
        
        <p className="text-lg">
          Modify your calendar now. Maybe you need to enter a break, reduce the amount of review you do, change your hours. Change something!
        </p>
      </div>
    </div>
  );

  const tutorialPart3Content = (
    <div className="space-y-6 text-[--theme-text-color]">
      <h1 className="text-3xl font-bold text-center mb-4">Ask Kalypso</h1>
      
      <div className="bg-[--theme-gradient-end] p-4 rounded-lg shadow-lg">
        <p className="text-lg">
          Great job! Now, let's wake up Kalypso and ask him a question about your schedule. Let's start with a simple one: Do I have enough time until my test?
        </p>
      </div>
    </div>
  );

  const tutorialPart4Content = (
    <div className="space-y-6 text-[--theme-text-color]">
      <h1 className="text-3xl font-bold text-center mb-4">Complete Your First Task</h1>
      
      <div className="bg-[--theme-gradient-end] p-4 rounded-lg shadow-lg">
        <p className="text-lg">
          Yay! You've mastered the dashboard! Go ahead and checkmark it off in your Daily To-Do List!
        </p>
      </div>
    </div>
  );

  const part1Steps: Step[] = [
    {
      target: 'body',
      content: welcomeContent,
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.schedule-content',
      content: "Click the settings icon on the top right.",
      placement: 'right',
      styles: {
        options: {
          width: 300,
        },
      },
    },
  ];

  const part2Steps: Step[] = [
    {
      target: 'body',
      content: tutorialPart2Content,
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.calendar-component',
      content: "Use the calendar to make changes to your schedule.",
      placement: 'bottom',
      styles: {
        options: {
          width: 300,
        },
      },
    },
  ];

  const part3Steps: Step[] = [
    {
      target: 'body',
      content: tutorialPart3Content,
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.knowledge-profile-component',
      content: "Ask Kalypso your question here.",
      placement: 'left',
      styles: {
        options: {
          width: 300,
        },
      },
    },
  ];

  const part4Steps: Step[] = [
    {
      target: 'body',
      content: tutorialPart4Content,
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.daily-todo-list',
      content: "Check off your completed task here!",
      placement: 'right',
      styles: {
        options: {
          width: 300,
        },
      },
    },
  ];

  return (
    <>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={runPart1}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={part1Steps}
        disableOverlayClose
        disableCloseOnEsc
        spotlightClicks={false}
        styles={{
          options: {
            arrowColor: 'var(--theme-leaguecard-color)',
            backgroundColor: 'var(--theme-leaguecard-color)',
            overlayColor: 'rgba(0, 0, 0, 0.8)',
            primaryColor: 'var(--theme-border-color)',
            textColor: 'var(--theme-text-color)',
            zIndex: 1000,
          },
          overlay: {
            cursor: 'not-allowed',
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
        disableOverlayClose
        disableCloseOnEsc
        spotlightClicks={false}
        styles={{
          options: {
            arrowColor: 'var(--theme-leaguecard-color)',
            backgroundColor: 'var(--theme-leaguecard-color)',
            overlayColor: 'rgba(0, 0, 0, 0.8)',
            primaryColor: 'var(--theme-border-color)',
            textColor: 'var(--theme-text-color)',
            zIndex: 1000,
          },
          overlay: {
            cursor: 'not-allowed',
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
        disableOverlayClose
        disableCloseOnEsc
        spotlightClicks={false}
        styles={{
          options: {
            arrowColor: 'var(--theme-leaguecard-color)',
            backgroundColor: 'var(--theme-leaguecard-color)',
            overlayColor: 'rgba(0, 0, 0, 0.8)',
            primaryColor: 'var(--theme-border-color)',
            textColor: 'var(--theme-text-color)',
            zIndex: 1000,
          },
          overlay: {
            cursor: 'not-allowed',
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
        disableOverlayClose
        disableCloseOnEsc
        spotlightClicks={false}
        styles={{
          options: {
            arrowColor: 'var(--theme-leaguecard-color)',
            backgroundColor: 'var(--theme-leaguecard-color)',
            overlayColor: 'rgba(0, 0, 0, 0.8)',
            primaryColor: 'var(--theme-border-color)',
            textColor: 'var(--theme-text-color)',
            zIndex: 1000,
          },
          overlay: {
            cursor: 'not-allowed',
          },
        }}
      />
    </>
  );
};

export default Tutorial;
