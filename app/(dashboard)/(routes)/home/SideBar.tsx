import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FetchedActivity } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import MVPDialog from "@/components/MVPDialog";
import RedditPosts from "../../../../components/RedditPosts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaYoutube } from 'react-icons/fa';
import TutorialContent from "../../../../components/home/TutorialContent";
import TutorialVidDialog from '../../../../components/ui/TutorialVidDialog';
import ChatBot from "@/components/chatbot/ChatBot";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { Star, StarHalf } from 'lucide-react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SideBarProps {
  activities: FetchedActivity[];
  currentPage: string;
  chatbotContext: any;
  chatbotRef: React.MutableRefObject<{
    sendMessage: (message: string) => void;
  }>;
}

interface Tutor {
  name: string;
  university: string;
  stars: number;
  reviews: number;
  price: number;
}

type TabContent = 
  | { type: 'insights'; videos: { id: string; title: string }[] }
  | { type: 'tutors'; schools: Tutor[] }
  | { type: 'tutorial' };

type VideoCategory = 'RBT' | 'RWT' | 'CMP';

const SideBar: React.FC<SideBarProps> = ({ activities: initialActivities, currentPage, chatbotContext, chatbotRef }) => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [tutors, setTutors] = useState<Tutor[]>([
    { name: "Ali N.", university: "Duke University", stars: 4.5, reviews: 5, price: 150 },
    { name: "Prynce K.", university: "Rice University", stars: 5, reviews: 16, price: 50 },
    { name: "Saanvi A.", university: "New York University", stars: 5, reviews: 3, price: 85 },
    { name: "Ethan K.", university: "Univ of Pennsylvania", stars: 4.5, reviews: 8, price: 200 }
  ]);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('RBT');

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

  const getTutorDescription = (tutorName: string): string => {
    switch (tutorName) {
      case "Ali N.":
        return "Hello hello y'all, I'm Ali! I scored a 520 with a 132 in Bio/Biochem and C/P. At Duke, I played basketball (okay, not for the D1 team, but I was pretty good!). I like to tutor very hands on: my sessions consist of working with you through practice tests and really drilling down into what you do wrong (and right!). I'm a huge fan of soccer and Lil Uzi Vert. Hit me up :)";
      case "Prynce K.":
        return "S'up. I'm the founder of the website you're on. I scored a 523 overall, with a 132 in CARs, and spent two years tutoring the MCAT at various firms (who all suck imo). My average increase is around 10-15 points, with a lot of students making massive leaps; but, nowdays, I have limited time as I'm making the most beautiful study software in history. If you're a dedicated student who uses this website frequently, then I'm very interested in meeting/working with you.";
      case "Saanvi A.":
        return "I'm Saanvi. My MCAT journey was a bit unconventional and a little embarassing: I actually scored a 492 on my first exam. Eventually, I worked hard to earn a 516 but I learned A LOT about what you should and shouldn't do. I really like working with non-trad students since I emphathize with the struggles you face. Recently, I graduated NYU and work as a Clinic Research Coordinator at Einstein.";
      case "Ethan K.":
        return "I'm a grad student at UPenn and I'm passionate about helping others succeed in CARs and Bio/Biochem. With my 525 score, I've developed a range of strategies to tackle the toughest passages and questions, and I'd love to share them with you. Let's work together to master the MCAT.";
      default:
        return "This tutor boasts a unique and spirited teaching style with its own fascinating history. From its origins to its current incarnation, the tutor embodies the values, traditions, and spirit of the institution. It serves as a rallying point for students, alumni, and fans, creating a sense of unity and pride on campus and beyond.";
    }
  };

  const tutorExpertise: Record<string, string[]> = {
    "Ali N.": ["B/B", "C/P"],
    "Prynce K.": ["CARS"],
    "Saanvi A.": ["P/S"],
    "Ethan K.": ["B/B", "CARS"],
  };

  const renderTutors = (tutors: Tutor[]) => (
    <div className="h-[calc(100vh-12.3rem)] flex flex-col">
      <ScrollArea className="flex-grow">
        <div className="pr-4 pb-4">
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
              <div key={index} className="mb-4 p-4 bg-[--theme-leaguecard-color] rounded-lg shadow-md">
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
                        Book {tutor.name === "Prynce K." ? `(50 coins/hr)` : `($${tutor.price}/hr)`}
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

  const renderContent = (content: TabContent) => {
    if (content.type === 'insights') {
      return renderInsights();
    } else if (content.type === 'tutors') {
      return renderTutors(content.schools);
    } else if (content.type === 'tutorial') {
      return <TutorialContent />;
    }
    return null;
  };

  const [isMVPDialogOpen, setIsMVPDialogOpen] = useState(false);

  const tabs: { id: string; label: string; content: TabContent }[] = [
    { id: "tab1", label: "Insights", content: { type: 'insights', videos: videos } },
    { id: "tab2", label: "Tutors", content: { type: 'tutors', schools: tutors } },
    { id: "tab3", label: "Help", content: { type: 'tutorial' } },
  ];

  const AddTutorDialog = () => (
    <DialogContent className="max-w-[60rem] bg-[--theme-leaguecard-color] border text-[--theme-text-color] border-[--theme-border-color]">
      <DialogHeader>
        <DialogTitle className="text-[--theme-text-color] text-center">Listing Yourself as an MCAT Tutor</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <div className="space-y-4">
          <p className="text-md">
            MyMCAT seeks to empower tutors, unlike tutoring firms that take a 50% cut while providing little value. For that reason, in our early stages, we do not take a cut off your labor, but we do expect excellence from everyone working to serve students — even for contractors.
          </p>
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
          <div className="w-[calc(100%-2rem)] bg-white h-[calc(100vh-30rem)] rounded-lg overflow-hidden mx-auto">
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

  return (
    <div className="relative p-2 overflow-hidden h-[calc(100vh-3.9rem)]">
      <div className="relative z-10 text-[--theme-text-color] p-2 rounded-lg h-full flex flex-col">
        <div className="flex w-full flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 text-m py-2 border border-[#79747E] text-center ${
                activeTab === tab.id
                  ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
                  : "bg-[white] text-black"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={`mt-4 ${activeTab === 'tab2' ? 'bg-transparent' : 'bg-[--theme-mainbox-color]'} flex-1 min-h-0 mb-8 overflow-hidden relative rounded-lg`}>
          {renderContent(tabs.find(tab => tab.id === activeTab)!.content)}
        </div>
      </div>
      <TutorialVidDialog
        isOpen={isTutorialDialogOpen}
        onClose={() => setIsTutorialDialogOpen(false)}
        videoUrl={tutorialVideoUrl}
      />
    </div>
  );
};

export default SideBar;