import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from "@/components/ui/checkbox";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { isToday } from "date-fns";

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
  activities: Activity[];
  onTasksUpdate: () => void;
  onHover: (isHovered: boolean) => void;
}

const FloatingTaskList: React.FC<FloatingTaskListProps> = ({
  activities,
  onTasksUpdate,
  onHover,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const todayActivities = activities.filter(activity => 
    isToday(new Date(activity.scheduledDate))
  );

  const handleTaskCompletion = async (activityId: string, taskIndex: number, completed: boolean) => {
    try {
      const activity = todayActivities.find((a) => a.id === activityId);
      if (!activity || !activity.tasks) return;

      // If task is already completed, prevent unchecking
      if (activity.tasks[taskIndex].completed) {
        return;
      }

      const updatedTasks = activity.tasks.map((task, index) =>
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
      onTasksUpdate();

      // Check if all tasks are completed for this activity
      const allTasksCompleted = updatedTasks.every((task) => task.completed);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-[16rem] left-[0.625rem] z-50 w-[24rem] max-h-[40rem] rounded-lg shadow-xl transition-shadow duration-300 hover:shadow-lg"
      style={{
        backgroundColor: 'var(--theme-leaguecard-color)',
        color: "var(--theme-text-color)",
        boxShadow: 'var(--theme-button-boxShadow-hover)',
        transition: 'box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--theme-adaptive-tutoring-boxShadow-hover)';
        onHover(true);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--theme-button-boxShadow-hover)';
        onHover(false);
      }}
    >
      <div 
        ref={listRef}
        className="p-6 space-y-6 overflow-y-auto max-h-[40rem]"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {todayActivities.map((activity) => (
          <div key={activity.id} className="mb-6">
            <button
              className={`w-full py-4 px-5 
                ${
                  isActivityCompleted(activity)
                    ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
                    : "bg-[--theme-leaguecard-color] text-[--theme-text-color]"
                }
                border-2 border-[--theme-border-color]
                hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]
                font-semibold shadow-md rounded-lg transition relative flex items-center justify-between
                text-base`}
            >
              <span>{activity.activityTitle}</span>
              {isActivityCompleted(activity) ? (
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
              {activity.tasks && activity.tasks.length > 0 ? (
                activity.tasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Checkbox
                      id={`floating-task-${activity.id}-${index}`}
                      checked={task.completed}
                      onCheckedChange={(checked) =>
                        handleTaskCompletion(
                          activity.id,
                          index,
                          checked as boolean
                        )
                      }
                    />
                    <label
                      htmlFor={`floating-task-${activity.id}-${index}`}
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
        ))}

        {todayActivities.length === 0 && (
          <p className="text-center italic text-white">
            No activities scheduled for today
          </p>
        )}
      </div>

      <audio ref={audioRef} src="/levelup.mp3" />

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  );
};

export default FloatingTaskList; 