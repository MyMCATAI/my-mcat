import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from "@/components/ui/checkbox";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { isToday } from "date-fns";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface Task {
  text: string;
  completed: boolean;
}

interface Activity {
  id: string;
  scheduledDate: string;
  activityTitle: string;
  activityText: string;
  hours: number;
  activityType: string;
  link?: string | null;
  tasks?: Task[];
  source?: string;
}

interface FloatingTaskListProps {
  activities?: Activity[];
  onTasksUpdate?: (tasks: Activity[]) => void;
  onHover: (hovering: boolean) => void;
}

const FloatingTaskList: React.FC<FloatingTaskListProps> = ({
  activities = [],
  onTasksUpdate,
  onHover,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const todayActivities = activities.filter((activity: Activity) => 
    isToday(new Date(activity.scheduledDate))
  );

  const goToNext = () => {
    setCurrentIndex((prev) => 
      prev === todayActivities.length - 1 ? 0 : prev + 1
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? todayActivities.length - 1 : prev - 1
    );
  };

  const handleTaskCompletion = async (activityId: string, taskIndex: number, completed: boolean) => {
    try {
      const activity = todayActivities.find((a: Activity) => a.id === activityId);
      if (!activity || !activity.tasks) return;

      const updatedTasks = activity.tasks.map((task: Task, index: number) =>
        index === taskIndex ? { ...task, completed: true } : task
      );

      // Update backend
      const response = await fetch(`/api/calendar-activity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activityId,
          tasks: updatedTasks,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      // Call onTasksUpdate to refresh parent state
      onTasksUpdate?.([activity]);

      // Check if all tasks are completed for this activity
      const allTasksCompleted = updatedTasks.every((task: Task) => task.completed);
      if (allTasksCompleted) {
        // Play success sound
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }

        // Get activity details from backend
        const activityResponse = await fetch(`/api/calendar-activity`);
        const activities = await activityResponse.json();
        const completedActivity = activities.find((a: Activity) => a.id === activityId);

        if (completedActivity.source === "generated" && isToday(new Date(completedActivity.scheduledDate))) {
          // Update user coin count
          await fetch("/api/user-info", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 1 }),
          });
          
          toast.success(
            `You've completed all tasks for ${activity.activityTitle}! You earned a coin!`
          );
        } else {
          toast.success(
            `You've completed all tasks for ${activity.activityTitle}!`
          );
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const isActivityCompleted = (activity: Activity) => {
    return (
      activity.tasks &&
      activity.tasks.length > 0 &&
      activity.tasks.every((task) => task.completed)
    );
  };

  // Handle scroll events to prevent body scroll when list is scrolled
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = listElement;
      const isScrollingUp = e.deltaY < 0;
      const isScrollingDown = e.deltaY > 0;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;

      if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
        e.preventDefault();
      }
    };

    listElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => listElement.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -320 }}
      animate={{ opacity: 1, x: -16 }}
      exit={{ opacity: 0, x: -320 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-80 left-1 z-40"
      onMouseEnter={() => {
        setIsHovered(true);
        onHover(true);
      }}
      onMouseLeave={(e) => {
        // Add buffer zone check
        const rect = e.currentTarget.getBoundingClientRect();
        const buffer = 32; // 2rem buffer zone
        
        const isInBufferZone = 
          e.clientX >= rect.left - buffer &&
          e.clientX <= rect.right + buffer &&
          e.clientY >= rect.top - buffer &&
          e.clientY <= rect.bottom + buffer;

        if (!isInBufferZone) {
          setIsHovered(false);
          onHover(false);
        }
      }}
    >
      <div 
        className="w-[24rem] rounded-lg shadow-xl transition-shadow duration-300 hover:shadow-lg relative"
        style={{
          backgroundColor: 'var(--theme-leaguecard-color)',
          color: "var(--theme-text-color)",
          boxShadow: isHovered ? 'var(--theme-adaptive-tutoring-boxShadow-hover)' : 'var(--theme-button-boxShadow-hover)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <div className="absolute inset-[-2rem] z-[-1] pointer-events-auto" />

        <div className="p-2 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xs ml-5 opacity-60 uppercase tracking-wide">Current Task</h2>
          {todayActivities.length > 1 && (
            <div 
              onClick={goToNext}
              className="flex items-center gap-3 p-1.5 cursor-pointer rounded-lg
                       hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]
                       transition-all"
            >
              <span className="text-xs opacity-60">
                {todayActivities.filter(a => !isActivityCompleted(a)).length} remaining
              </span>
              <IoChevronForward size={16} />
            </div>
          )}
        </div>

        <div 
          ref={listRef}
          className="px-6 pt-3 pb-4 space-y-2"
        >
          {todayActivities.length > 0 ? (
            <div className="space-y-3">
              <div key={todayActivities[currentIndex].id}>
                <button
                  className={`w-full py-4 px-5 
                    ${isActivityCompleted(todayActivities[currentIndex])
                      ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
                      : "bg-[--theme-leaguecard-color] text-[--theme-text-color]"}
                    border-2 border-[--theme-border-color]
                    hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]
                    font-semibold shadow-md rounded-lg transition relative flex items-center justify-between
                    text-base`}
                >
                  <span>{todayActivities[currentIndex].activityTitle}</span>
                  {isActivityCompleted(todayActivities[currentIndex]) ? (
                    <FaCheckCircle
                      className="min-w-[1.5rem] min-h-[1.5rem] w-[1.5rem] h-[1.5rem]"
                      style={{ color: "var(--theme-hover-text)" }}
                    />
                  ) : (
                    <svg
                      className="min-w-[1.5rem] min-h-[1.5rem] w-[1.5rem] h-[1.5rem]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </button>

                <div className="bg-[--theme-leaguecard-color] shadow-md p-5 mt-3 space-y-3 rounded-lg">
                  {todayActivities[currentIndex].tasks && todayActivities[currentIndex].tasks.length > 0 ? (
                    todayActivities[currentIndex].tasks.map((task, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Checkbox
                          id={`floating-task-${todayActivities[currentIndex].id}-${index}`}
                          checked={task.completed}
                          onCheckedChange={(checked) =>
                            handleTaskCompletion(
                              todayActivities[currentIndex].id,
                              index,
                              checked as boolean
                            )
                          }
                        />
                        <label
                          htmlFor={`floating-task-${todayActivities[currentIndex].id}-${index}`}
                          className="text-base leading-tight cursor-pointer flex-grow"
                        >
                          {task.text}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic">No tasks for this activity</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center italic text-white">
              No activities scheduled for today
            </p>
          )}
        </div>

        <audio ref={audioRef} src="/levelup.mp3" />
      </div>
    </motion.div>
  );
};

export default FloatingTaskList; 