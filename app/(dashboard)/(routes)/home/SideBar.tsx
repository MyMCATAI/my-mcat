import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FetchedActivity } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle } from 'lucide-react';
import { FaCheckCircle, FaYoutube } from 'react-icons/fa';
import { toast } from "react-hot-toast";
import { isToday, isSameDay, isTomorrow, format } from "date-fns";
import RedditPosts from "@/components/RedditPosts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TutorialContent from "@/components/home/TutorialContent";
import TutorialVidDialog from '@/components/ui/TutorialVidDialog';
import ChatBot from "@/components/chatbot/ChatBot";
import { useUser } from "@clerk/nextjs";
import { Star, StarHalf } from 'lucide-react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tutor, tutors as initialTutors, tutorExpertise, getTutorDescription } from "@/constants/tutors";
import { Checkbox } from "@/components/ui/checkbox";
import CompletionDialog from "@/components/home/CompletionDialog";
import { useRouter } from "next/navigation";
import UWorldPopup from '@/components/home/UWorldPopup';
import HelpContent from "@/components/guides/HelpContent";
import HelpContentCARS from "@/components/guides/HelpContentCARs";
import HelpContentSchedule from "@/components/guides/HelpContentSchedule";
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

interface SideBarProps {
  activities: FetchedActivity[];
  currentPage: string;
  chatbotContext: any;
  chatbotRef: React.MutableRefObject<{
    sendMessage: (message: string) => void;
  }>;
  handleSetTab: (tab: string) => void;
}

type TabContent = 
  | { type: 'insights'; videos: { id: string; title: string }[] }
  | { type: 'tutors'; schools: Tutor[] }
  | { type: 'tutorial' }
  | { type: 'tasks' };

type VideoCategory = 'RBT' | 'RWT' | 'CMP';

const SideBar: React.FC<SideBarProps> = ({ 
  activities: initialActivities, 
  currentPage, 
  chatbotContext, 
  chatbotRef,
  handleSetTab 
}) => {
  const getInitialActiveTab = () => {
    switch (currentPage) {
      case "Schedule":
        return "tab2"; // Tasks tab
      case "CARS":
      case "AdaptiveTutoringSuite":
        return "tab1"; // Insights tab
      case "Tests":
        return "tab4"; // Help tab
      default:
        return "tab1";
    }
  };

  const [activeTab, setActiveTab] = useState(getInitialActiveTab());
  
  useEffect(() => {
    setActiveTab(getInitialActiveTab());
  }, [currentPage]);

  const [tutors, setTutors] = useState<Tutor[]>(initialTutors);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('RBT');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Add task-related state
  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);

  const firstVideo = { id: "gn10W2awwqw", title: "Scaffolding Strategy " };

  const videoCategories: Record<VideoCategory, { id: string; title: string }[]> = {
    RBT: [
      { id: "0KZwYQPggl8", title: "RBT Video 1" },
      { id: "f1k4eXELEIE", title: "RBT Video 2" },
      { id: "7p9-NXGOS7Y", title: "RBT Video 3" },
      { id: "rfMZkZV9iSk", title: "RBT Video 4" },
      { id: "gUW2jit3uvo", title: "RBT Video 5" },
      { id: "-DqMlYom0JQ", title: "RBT Video 6" },
      { id: "NKEhdsnKKHs", title: "RBT Video 7" },
      { id: "-wrCpLJ1XAw", title: "RBT Video 8" },
    ],
    RWT: [
      { id: "srInq08DTCw", title: "RWT Video 1" },
      { id: "5CQTgY2fqxM", title: "RWT Video 2" },
      { id: "IlPHkPo3jj8", title: "RWT Video 3" },
      { id: "V2XekjyG2Mw", title: "RWT Video 4" },
      { id: "pP8dWURrEF0", title: "RWT Video 5" },
      { id: "8Xjpu-qJK74", title: "RWT Video 6" },
      { id: "dPvWRYPadFg", title: "RWT Video 7" },
      { id: "XlcrKfaJBRM", title: "RBT Video 9" },
    ],
    CMP: [
      { id: "srInq08DTCw", title: "CMP Video 1" },
      { id: "z6H2NLPqWtI", title: "CMP Video 2" },
      { id: "aptsr0CrpWY", title: "CMP Video 3" },
      { id: "lqGvYT5CJqs", title: "CMP Video 4" },
      { id: "f1k4eXELEIE", title: "CMP Video 5" },
      { id: "TMCWtto__VI", title: "CMP Video 6" },
      { id: "pfXzfF6mXsk", title: "CMP Video 7" },
      { id: "MfQB3y8ayRU", title: "CMP Video 8" },
    ],
  };

  const shuffleVideos = (videos: { id: string; title: string }[]) => {
    for (let i = videos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [videos[i], videos[j]] = [videos[j], videos[i]];
    }
    return videos;
  };

  const [videos, setVideos] = useState([firstVideo, ...shuffleVideos(videoCategories[selectedCategory])]);

  const selectRandomCategory = () => {
    const categories: VideoCategory[] = ['RBT', 'RWT', 'CMP'];
    const randomIndex = Math.floor(Math.random() * categories.length);
    setSelectedCategory(categories[randomIndex]);
  };

  useEffect(() => {
    selectRandomCategory();
  }, []);

  useEffect(() => {
    setVideos([...shuffleVideos(videoCategories[selectedCategory])]);
    setCurrentVideoIndex(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const [isTutorialDialogOpen, setIsTutorialDialogOpen] = useState(false);
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState('');

  const openTutorialDialog = (videoUrl: string) => {
    setTutorialVideoUrl(videoUrl);
    setIsTutorialDialogOpen(true);
  };

  const renderInsights = () => {
    if (currentPage !== "CARS") {
      return (
        <div className="h-[calc(100vh-11.6rem)] flex flex-col">
          <div className="flex-1 min-h-0">
            <ChatBot
              chatbotRef={chatbotRef}
              chatbotContext={chatbotContext}
              width="100%"
              height="100%"
              backgroundColor="transparent"
              avatar="/kalypsoend.gif"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="h-[calc(100vh-11.6rem)] flex flex-col space-y-4 overflow-auto">
        <Card className="flex-shrink-0">
          <CardContent className="p-4 relative">
            <div className="flex items-center mb-4">
              <FaYoutube className="text-3xl text-red-600 mr-2" />
              <span className="font-semibold text-lg text-[--theme-text-color]">Videos from YouTube</span>
            </div>
            <HelpCircle 
              className="absolute top-2 right-2 text-[--theme-border-color] hover:text-gray-200 transition-colors duration-200 cursor-pointer" 
              size={20}
              onClick={() => openTutorialDialog('https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/KnowledgeProfileInformation.mp4')}
            />
            <div className="relative aspect-video group">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videos[currentVideoIndex].id}`}
                title={videos[currentVideoIndex].title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              ></iframe>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10"
                onClick={() => setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10"
                onClick={() => setCurrentVideoIndex((prev) => (prev + 1) % videos.length)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-grow overflow-hidden">
          <CardContent className="p-4 h-full overflow-hidden">
            <div className="h-full overflow-auto">
              <RedditPosts />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTutors = (tutors: Tutor[]) => (
    <div className="h-[calc(100vh-12.3rem)] flex flex-col">
      <ScrollArea className="flex-grow">
        <div className="pb-4">
          <div className="mb-3 flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-opacity">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-sm font-medium">Add yourself to the tutoring board</span>
                </button>
              </DialogTrigger>
              <AddTutorDialog />
            </Dialog>
          </div>

          {tutors.map((tutor, index) => {
            const firstName = tutor.name.split(/[\s.]/, 1)[0];
            
            return (
              <div 
                key={index} 
                className="mb-4 p-4 bg-[--theme-leaguecard-color] rounded-lg shadow-md"
              >
                <div className="flex items-start">
                  <div className="mr-4 flex-shrink-0">
                    <Image
                      src={`/tutors/${tutor.name.replace(/\s+/g, '')}.png`}
                      alt={tutor.name}
                      width={80}
                      height={80}
                      className="rounded-lg border border-[--theme-border-color] object-cover xl:w-24 xl:h-24"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[--theme-text-color]">{tutor.name}</h3>
                        {tutorExpertise[tutor.name] && (
                          <div className="flex items-center gap-1">
                            {tutorExpertise[tutor.name].map((expertise, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-xs rounded-full bg-[--theme-hover-color] text-[--theme-hover-text]"
                              >
                                {expertise}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-[--theme-text-color] opacity-80">{tutor.university}</p>
                    <div className="mt-1 flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => {
                          const starValue = i + 1;
                          const isHalfStar = tutor.stars % 1 !== 0 && Math.ceil(tutor.stars) === starValue;
                          
                          return isHalfStar ? (
                            <StarHalf
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
                          ) : (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < tutor.stars 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "fill-none text-gray-300"
                              }`}
                            />
                          );
                        })}
                        <span className="ml-2 text-sm text-[--theme-text-color] opacity-80">
                          ({tutor.reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[--theme-text-color] opacity-90">
                  {getTutorDescription(tutor.name)}
                </p>
                <div className="mt-4 flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button 
                        className="text-sm font-medium text-blue-500 hover:text-[--theme-hover-color] transition-colors duration-200 underline-offset-4 hover:underline"
                      >
                        {tutor.name === "Prynce K." 
                          ? "Book (50 coins/meeting)"
                          : `Book ($${tutor.price}/hr)`
                        }
                      </button>
                    </DialogTrigger>
                    <BookTutorDialog tutor={tutor} />
                  </Dialog>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  const [currentDate, setCurrentDate] = useState(new Date());

  const renderTasks = () => (
    <div className="h-[calc(100vh-12.3rem)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-[--theme-leaguecard-color] rounded-lg mb-4">
        <button
          onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setDate(newDate.getDate() - 1);
            setCurrentDate(newDate);
          }}
          className="p-2 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-medium">
          {isToday(currentDate) 
            ? "Today"
            : isTomorrow(currentDate)
              ? "Tomorrow"
              : format(currentDate, 'EEEE, MMMM d')}
        </span>
        <button
          onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setDate(newDate.getDate() + 1);
            setCurrentDate(newDate);
          }}
          className="p-2 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <ScrollArea className="flex-grow">
        <div className="px-4 space-y-6">
          {todayActivities.map((activity) => (
            <div key={activity.id} className="mb-6">
              <button
                className={`w-full py-2 px-3 
                  ${
                    isActivityCompleted(activity)
                      ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
                      : "bg-[--theme-leaguecard-color] text-[--theme-text-color]"
                  }
                  border border-[--theme-border-color]
                  hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]
                  font-semibold rounded-lg transition relative flex items-center justify-between
                  text-sm`}
                onClick={() => handleButtonClick(activity.activityTitle)}
              >
                <span>{activity.activityTitle}</span>
                {isActivityCompleted(activity) ? (
                  <FaCheckCircle
                    className="min-w-[1.25rem] min-h-[1.25rem] w-[1.25rem] h-[1.25rem]"
                    style={{ color: "var(--theme-hover-text)" }}
                  />
                ) : (
                  <svg
                    className="min-w-[1.25rem] min-h-[1.25rem] w-[1.25rem] h-[1.25rem]"
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

              <div className="bg-[--theme-mainbox-color] p-3 mt-2 space-y-2 rounded-lg">
                {activity.tasks && activity.tasks.length > 0 ? (
                  activity.tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Checkbox
                        id={`task-${activity.id}-${index}`}
                        checked={task.completed}
                        onCheckedChange={(checked) =>
                          isToday(currentDate)
                            ? handleTaskCompletion(
                                activity.id,
                                index,
                                checked as boolean
                              )
                            : null
                        }
                        disabled={!isToday(currentDate)}
                        className={!isToday(currentDate) ? "opacity-50 cursor-not-allowed" : ""}
                      />
                      <label
                        htmlFor={`task-${activity.id}-${index}`}
                        className={`text-sm leading-tight cursor-pointer flex-grow ${
                          !isToday(currentDate) ? "opacity-50" : ""
                        }`}
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
            <p className="text-center italic">
              No activities scheduled for this day
            </p>
          )}
        </div>
      </ScrollArea>
      <audio ref={audioRef} src="/levelup.mp3" />
    </div>
  );

  const renderContent = (content: TabContent) => {
    if (content.type === 'insights') {
        return renderInsights();
    } else if (content.type === 'tutors') {
        return renderTutors(content.schools);
    } else if (content.type === 'tutorial') {
        switch (currentPage) {
            case "CARS":
                return <HelpContentCARS onClose={() => {}} />;
            case "Schedule":
                return <HelpContentSchedule onClose={() => {}} />;
            case "AdaptiveTutoringSuite":
                return <HelpContent onClose={() => {}} onResetTutorials={() => {}} />;
            default:
                return (
                    <div className="h-[calc(100vh-11.6rem)] flex items-center justify-center text-center p-4">
                        <p className="text-[--theme-text-color]">
                            Select a specific section to view its help content.
                        </p>
                    </div>
                );
        }
    } else if (content.type === 'tasks') {
        return renderTasks();
    }
    return null;
  };

  const tabs: { id: string; label: string; content: TabContent }[] = [
    { id: "tab1", label: "Insights", content: { type: 'insights', videos: videos } },
    { id: "tab2", label: "Tasks", content: { type: 'tasks' } },
    { id: "tab3", label: "Tutors", content: { type: 'tutors', schools: tutors } },
    { id: "tab4", label: "Help", content: { type: 'tutorial' } },
  ];

  const AddTutorDialog = () => (
    <DialogContent className="max-w-[60rem] bg-[--theme-leaguecard-color] border text-[--theme-text-color] border-[--theme-border-color]">
      <DialogHeader>
        <DialogTitle className="text-[--theme-text-color] text-center">Listing Yourself as an MCAT Tutor</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <div className="space-y-4">
          <div>
            <p className="font-medium mb-2">Enlisting with MyMCAT requires three things:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>A score of 515+, verified by screensharing</li>
              <li>A tutoring session with Prynce to verify skills</li>
            </ol>
            <p className="text-md mt-3">
              Please book an initial session with Prynce to verify your skills for listing.
            </p>
          </div>
          <div className="w-[calc(100%-2rem)] bg-white h-[calc(100vh-20rem)] rounded-lg overflow-hidden mx-auto">
            <iframe 
              src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3hMOL4oJtFVHit6w6WyM2EuvBFRPoG59w6a-T0rU14-PWTIPMVRDlOx3PrYoVMpNYOVo4UhVXk?gv=true" 
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    </DialogContent>
  );

  const BookTutorDialog = ({ tutor }: { tutor: Tutor }) => {
    const { user } = useUser();
    const [messageForm, setMessageForm] = useState({ message: '' });

    const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
        toast.error('You must be logged in to send a message.');
        return;
      }
      try {
        const response = await fetch('/api/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageForm.message,
          }),
        });

        if (response.ok) {
          toast.success('Message sent successfully!');
          setMessageForm({ message: '' });
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message. Please try again.');
      }
    };

    if (tutor.name === "Prynce K.") {
      return (
        <DialogContent className="max-w-[40rem] bg-[--theme-leaguecard-color] border text-[--theme-text-color] border-[--theme-border-color]">
          <DialogHeader>
            <DialogTitle className="text-[--theme-text-color] text-center">Book a Session</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center mb-4">
              Click the link below to meet with Prynce.
            </p>
            <div className="w-[calc(100%-2rem)] bg-white h-[calc(100vh-30rem)] rounded-lg overflow-hidden mx-auto">
              <iframe 
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3hMOL4oJtFVHit6w6WyM2EuvBFRPoG59w6a-T0rU14-PWTIPMVRDlOx3PrYoVMpNYOVo4UhVXk?gv=true" 
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </DialogContent>
      );
    }

    return (
      <DialogContent className="max-w-[40rem] bg-[--theme-leaguecard-color] border text-[--theme-text-color] border-[--theme-border-color]">
        <DialogHeader>
          <DialogTitle className="text-[--theme-text-color] text-center">Book a Session</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center mb-4">
            Please send us your preferred time slots to book a session with {tutor.name}
          </p>
          <form onSubmit={handleSendMessage} className="space-y-2">
            <textarea
              placeholder="Enter your preferred time slots..."
              value={messageForm.message}
              onChange={(e) => setMessageForm({ message: e.target.value })}
              className="w-full p-2 rounded resize-none text-gray-800"
              required
              rows={3}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="py-2 px-4 border border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] rounded-md transition-opacity"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    );
  };

  useEffect(() => {
    const activitiesForDate = initialActivities.filter((activity: Activity) => 
      isSameDay(new Date(activity.scheduledDate), currentDate)
    );
    setTodayActivities(activitiesForDate);
  }, [initialActivities, currentDate]);

  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const fanfareRef = useRef<HTMLAudioElement>(null);

  const handleTaskCompletion = async (activityId: string, taskIndex: number, completed: boolean) => {
    try {
      const activity = todayActivities.find((a: Activity) => a.id === activityId);
      if (!activity || !activity.tasks) return;

      // If task is already completed, prevent unchecking
      if (activity.tasks[taskIndex].completed) {
        return;
      }

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

      // Update local state
      const updatedActivities = todayActivities.map((a) =>
        a.id === activityId ? { ...a, tasks: updatedTasks } : a
      );
      setTodayActivities(updatedActivities);

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

      // Check if ALL activities have ALL tasks completed
      const areAllTasksCompleted = updatedActivities.every((activity) => 
        activity.tasks?.every((task) => task.completed)
      );

      // If everything is complete, play fanfare and show completion dialog
      if (areAllTasksCompleted) {
        if (fanfareRef.current) {
          fanfareRef.current.play().catch(console.error);
        }
        setShowCompletionDialog(true);
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

  function getUWorldTasks() {
    const uWorldActivity = todayActivities.find(activity => activity.activityTitle === "UWorld");
    if (!uWorldActivity?.tasks) return [];
    
    return uWorldActivity.tasks
      .filter(task => {
        // Only include tasks that match the format "X Q UWorld - Subject"
        const pattern = /^\d+\s*Q\s*UWorld\s*-\s*.+$/i;
        return pattern.test(task.text);
      })
      .map(task => ({
        text: task.text,
        completed: task.completed,
        subject: task.text.split(' - ')[1]?.trim()
      }));
  }

  const router = useRouter();

  const handleButtonClick = (section: string) => {
    switch (section) {
      case "MyMCAT Daily CARs":
        handleSetTab("CARS");
        break;
      case "Anki Clinic":
        router.push("/doctorsoffice");
        break;
      case "Adaptive Tutoring Suite":
        handleSetTab("AdaptiveTutoringSuite");
        break;
      case "AAMC Materials":
        break;
      case "UWorld":
        setShowUWorldPopup(true);
        break;
      default:
        break;
    }
  };

  const [showUWorldPopup, setShowUWorldPopup] = useState(false);

  const handleUWorldScoreSubmit = (scores: number[]) => {
    console.log("UWorld scores:", scores);
    // You can add additional score handling logic here if needed
  };

  return (
    <div className="relative p-2 rounded-lg overflow-hidden h-[calc(100vh-4.1rem)]">
      <div className="relative z-10 text-[--theme-text-color] p-2 rounded-lg h-full flex flex-col">
        <div className="flex w-full flex-shrink-0 p-[1%] bg-[--theme-leaguecard-color] rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              className={`flex-1 text-m py-[2%] px-[3%] rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-[--theme-hover-color] text-[--theme-hover-text] shadow-md transform scale-105"
                  : "bg-transparent text-[--theme-text-color] hover:opacity-50 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={`mt-4 ${
          activeTab === 'tab3'
            ? 'bg-transparent' 
            : 'bg-[--theme-mainbox-color]'
          } flex-1 min-h-0 mb-8 overflow-hidden relative rounded-lg transition-all duration-300`}>
          {renderContent(tabs.find(tab => tab.id === activeTab)!.content)}
        </div>
      </div>
      <audio ref={audioRef} src="/levelup.mp3" />
      <audio ref={fanfareRef} src="/fanfare.mp3" />
      
      <CompletionDialog 
        isOpen={showCompletionDialog} 
        onClose={() => setShowCompletionDialog(false)}
      />
      
      <TutorialVidDialog
        isOpen={isTutorialDialogOpen}
        onClose={() => setIsTutorialDialogOpen(false)}
        videoUrl={tutorialVideoUrl}
      />
      
      <UWorldPopup
        isOpen={showUWorldPopup}
        onClose={() => setShowUWorldPopup(false)}
        onScoreSubmit={handleUWorldScoreSubmit}
        tasks={getUWorldTasks()}
      />
    </div>
  );
};

export default SideBar;