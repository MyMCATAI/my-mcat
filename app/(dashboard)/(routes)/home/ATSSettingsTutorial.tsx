import React, { useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface ATSSettingsTutorialProps {
  showSettingsSteps: boolean;
  setShowSettingsSteps: (show: boolean) => void;
}

const ATSSettingsTutorial: React.FC<ATSSettingsTutorialProps> = ({
  showSettingsSteps,
  setShowSettingsSteps,
}) => {
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if (showSettingsSteps && (status === STATUS.FINISHED || status === STATUS.SKIPPED)) {
      setShowSettingsSteps(false);
    }
  };

  const settingsSteps: Step[] = [
    {
      target: '.checkmark-button',
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Track Your Progress"}</h2>
          <p>{"You can checkmark off categories once you're done with them."}</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.shuffle-button',
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Shuffle Subjects"}</h2>
          <p>{"If you'd like to shuffle based upon subjects, we have a button for that."}</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.topic-search',
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Find Specific Topics"}</h2>
          <p>{"If you'd like a specific topic, you can search for it here."}</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.reset-button',
      content: (
        <div className="space-y-4 text-black">
          <h2 className="text-xl font-bold">{"Smart Recommendations"}</h2>
          <p>{"If you don't know what to study, we keep tabs on the questions you've missed and can recommend subjects to study!"}</p>
        </div>
      ),
      placement: 'bottom',
    }
  ];

  return (
    <Joyride
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
    />
  );
};

export default ATSSettingsTutorial; 