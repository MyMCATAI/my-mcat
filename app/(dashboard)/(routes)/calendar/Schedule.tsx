import React, { useState, useEffect } from "react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { useUser } from "@clerk/nextjs";
import SettingContent from "./SettingContent";
import { NewActivity, FetchedActivity } from "@/types";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogOverlay } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import Image from 'next/image'

interface ScheduleProps {
  activities: FetchedActivity[];
  onShowDiagnosticTest: () => void;
}

const Schedule: React.FC<ScheduleProps> = ({ activities,onShowDiagnosticTest }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
  const [showGif, setShowGif] = useState(true);
  const [todayActivities, setTodayActivities] = useState('');
  const [noActivitiesText, setNoActivitiesText] = useState('');
  
  const [newActivity, setNewActivity] = useState<NewActivity>({
    activityTitle: "",
    activityText: "",
    hours: "",
    activityType: "",
    scheduledDate: new Date().toISOString().split("T")[0],
  });

  const { user } = useUser();
  const activitiesText = ``;

  useEffect(() => {
    setCurrentDate(new Date());
    // Simulate GIF playing for 4.5 seconds
    const timer = setTimeout(() => {
      setShowGif(false);
      startTypingAnimation();
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const handleStudyPlanSaved = () => {
    setShowSettings(false);
    setShowThankYouDialog(true);
  };

  const handleTakeDiagnosticTest = () => {
    setShowThankYouDialog(false);
    onShowDiagnosticTest();
  };

  const startTypingAnimation = () => {
    let index = 0;
    const timer = setInterval(() => {
      setTodayActivities(activitiesText.slice(0, index));
      index++;
      if (index > activitiesText.length) {
        clearInterval(timer);
        if (getActivitiesForDate(startOfDay(new Date())).length === 0) {
          typeNoActivitiesMessage();
        }
      }
    }, 25); // Adjust the speed of typing here
  };

  const typeNoActivitiesMessage = () => {
    const message = "nothing for today! yay, break!";
    let index = 0;
    const timer = setInterval(() => {
      setNoActivitiesText(message.slice(0, index));
      index++;
      if (index > message.length) {
        clearInterval(timer);
      }
    }, 25); // Adjust the speed of typing here
  };

  const toggleSettings = () => setShowSettings(!showSettings);
  const toggleNewActivityForm = () => setShowNewActivityForm(!showNewActivityForm);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setNewActivity({ ...newActivity, [name]: value });
  };

  const createNewActivity = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/calendar-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newActivity,
          userId: user?.id,
          studyPlanId: "placeholder-study-plan-id", // Replace with actual study plan ID
        }),
      });

      if (!response.ok) throw new Error("Failed to create activity");

      await response.json();
      setShowNewActivityForm(false);
      setNewActivity({
        activityTitle: "",
        activityText: "",
        hours: "",
        activityType: "",
        scheduledDate: new Date().toISOString().split("T")[0],
      });
      // TODO: Update activities list or refetch activities
      // TODO: Show a success message to the user
    } catch (error) {
      console.error("Error creating activity:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getActivitiesForDate = (date: Date) => {
    return activities.filter((activity) =>
      isSameDay(new Date(activity.scheduledDate), date)
    );
  };

  return (
    <div className="relative p-3">
      <div className="relative z-10 text-white rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={toggleNewActivityForm}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <g id="SVGRepo_iconCarrier">
              <path d="M11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8V11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H13V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V13H8C7.44771 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11H11V8Z" fill="#efefef"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z" fill="#efefef"/>
            </g>
          </svg>
          <div className="flex-grow"></div>
          <button onClick={toggleSettings}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#ffffff"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.25001 22L8.85001 18.8C8.63335 18.7167 8.42918 18.6167 8.23751 18.5C8.04585 18.3833 7.85835 18.2583 7.67501 18.125L4.70001 19.375L1.95001 14.625L4.52501 12.675C4.50835 12.5583 4.50001 12.4458 4.50001 12.3375V11.6625C4.50001 11.5542 4.50835 11.4417 4.52501 11.325L1.95001 9.375L4.70001 4.625L7.67501 5.875C7.85835 5.74167 8.05001 5.61667 8.25001 5.5C8.45001 5.38333 8.65001 5.28333 8.85001 5.2L9.25001 2H14.75L15.15 5.2C15.3667 5.28333 15.5708 5.38333 15.7625 5.5C15.9542 5.61667 16.1417 5.74167 16.325 5.875L19.3 4.625L22.05 9.375L19.475 11.325C19.4917 11.4417 19.5 11.5542 19.5 11.6625V12.3375C19.5 12.4458 19.4833 12.5583 19.45 12.675L22.025 14.625L19.275 19.375L16.325 18.125C16.1417 18.2583 15.95 18.3833 15.75 18.5C15.55 18.6167 15.35 18.7167 15.15 18.8L14.75 22H9.25001ZM12.05 15.5C13.0167 15.5 13.8417 15.1583 14.525 14.475C15.2083 13.7917 15.55 12.9667 15.55 12C15.55 11.0333 15.2083 10.2083 14.525 9.525C13.8417 8.84167 13.0167 8.5 12.05 8.5C11.0667 8.5 10.2375 8.84167 9.56251 9.525C8.88751 10.2083 8.55001 11.0333 8.55001 12C8.55001 12.9667 8.88751 13.7917 9.56251 14.475C10.2375 15.1583 11.0667 15.5 12.05 15.5Z"
                fill="#ffffff"
              />
            </svg>
          </button>
        </div>

        <Dialog open={showThankYouDialog} onOpenChange={setShowThankYouDialog}>
          <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl max-w-md w-full z-50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-4 text-gray-800">Thank You!</DialogTitle>
              <DialogDescription className="text-gray-600 mb-6">
                Your study plan has been saved successfully. We recommend taking a diagnostic test to help us personalize your learning experience.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end space-x-4 mt-4">
              <Button variant="outline" onClick={() => setShowThankYouDialog(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">
                Maybe Later
              </Button>
              <Button onClick={handleTakeDiagnosticTest} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Take Diagnostic Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {showSettings && (
           <div className="absolute top-10 right-1 w-100 bg-white text-black p-1 rounded-lg shadow-lg z-[9999999]">
          <SettingContent 
            onShowDiagnosticTest={onShowDiagnosticTest} 
            onStudyPlanSaved={handleStudyPlanSaved}
          />
        </div>
        )}

        {showNewActivityForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
              <h3 className="text-xl font-bold mb-4 text-black">
                add new activity
              </h3>
              <form onSubmit={createNewActivity}>
                <input
                  type="text"
                  name="activityTitle"
                  value={newActivity.activityTitle}
                  onChange={handleInputChange}
                  placeholder="Activity Title"
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                />
                <textarea
                  name="activityText"
                  value={newActivity.activityText}
                  onChange={handleInputChange}
                  placeholder="Activity Description"
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                ></textarea>
                <input
                  type="number"
                  name="hours"
                  value={newActivity.hours}
                  onChange={handleInputChange}
                  placeholder="Hours"
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                />
                <input
                  type="text"
                  name="activityType"
                  value={newActivity.activityType}
                  onChange={handleInputChange}
                  placeholder="Activity Type"
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                />
                <input
                  type="date"
                  name="scheduledDate"
                  value={newActivity.scheduledDate}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={toggleNewActivityForm}
                    className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add Activity"}
                  </button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </form>
            </div>
          </div>
        )}

        {/* Updated Fixed-size Today Section with GIF and content */}
        <div className="bg-[#001226] text-white px-6 py-8 rounded-[30px] mb-5 shadow-lg overflow-hidden">
          <div className="relative w-full h-[185px]">
            {showGif ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[#FFFCFC] text-lg font-light leading-normal shadow-text mb-3">building your schedule...</p>
                <div className="w-[300px] h-[300px] relative">
                  <Image 
                    src="/kalypsotyping.gif" 
                    alt="Eating catnip..." 
                    layout="fill" 
                    objectFit="contain" 
                  />
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 overflow-visible flex">
                <div className="w-1/2 pr-4 h-full flex items-center justify-center">
                  <div className="w-full h-full bg-transparent flex items-center justify-center rounded-lg overflow-visible">
                    <Image
                      src="/profile.png"
                      alt="Profile"
                      width={250}
                      height={250}
                      objectFit="cover"
                    />
                  </div>
                </div>
                <div className="w-1/2 pl-2 h-full">
                  <div className="bg-[black] p-4 rounded-lg h-full overflow-y-auto" style={{
                    boxShadow: '0 0 12px 8px rgba(0, 123, 255, 0.5)',
                    transition: 'box-shadow 0.3s ease-in-out'}}>
                    {getActivitiesForDate(startOfDay(new Date())).length === 0 ? (
                      <p className="py-2 text-[15px] text-white font-light leading-normal">
                        {noActivitiesText}
                      </p>
                    ) : (
                      getActivitiesForDate(startOfDay(new Date())).map(
                        (activity, index) => (
                          <div key={index} className="text-sm mt-4">
                            <p className="font-semibold">{activity.activityTitle}</p>
                            <p className="mt-1">{activity.activityText}</p>
                            <p className="mt-1">{activity.hours} hours</p>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Future Days Grid */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[...Array(12)].map((_, index) => {
            const futureDate = addDays(new Date(), index + 1);
            const dayActivities = getActivitiesForDate(futureDate);
            return (
              <div
                key={`future-day-${index}`}
                className="bg-[#7999e4] text-white p-3 rounded-[10px] h-[80px] relative flex flex-col justify-between group overflow-hidden shadow-md transition-transform duration-300 ease-in-out transform hover:scale-105"
              >
                <div className="flex justify-between">
                  <div className="text-sm text-white text-lg font-light leading-normal shadow-text">{format(futureDate, "d")}</div>
                  <span className="text-sm text-white text-lg font-light leading-normal shadow-text">{format(futureDate, "MMM")}</span>
                </div>
                <div className="flex-grow overflow-y-auto">
                  {dayActivities.map((activity, idx) => (
                    <div key={idx} className="text-xs mt-1">
                      {activity.activityTitle}
                    </div>
                  ))}
                </div>
                {dayActivities.length === 0 && (
                  <div className="text-sm mt-1 text-white text-lg font-light leading-normal shadow-text">No tasks</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Schedule;