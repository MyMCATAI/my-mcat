import React, { useState, useEffect } from 'react';
import { CalendarActivity } from '@/types'; // Make sure to create this type

const StudyPlanCalendar: React.FC = () => {
  const [activities, setActivities] = useState<CalendarActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/calendar-activity');
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        } else {
          throw new Error('Failed to fetch activities');
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (isLoading) {
    return <div>Loading study plan...</div>;
  }

  return (
    <div className="bg-[--theme-leaguecard-color] rounded-lg border-[--theme-border-color] border-2 shadow-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Your Study Plan</h2>
      {activities.length === 0 ? (
        <p>No activities found. Generate a study plan to get started!</p>
      ) : (
        <ul>
          {activities.map((activity) => (
            <li key={activity.id} className="mb-2">
              <strong>{new Date(activity.scheduledDate).toLocaleDateString()}</strong>: {activity.activityTitle} ({activity.hours} hours)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudyPlanCalendar;
