import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FetchedActivity } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MVPDialog from "@/components/MVPDialog";
import RedditPosts from "../../../../components/RedditPosts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface KnowledgeProfileProps {
  activities: FetchedActivity[];
}

interface School {
  name: string;
  location: string;
  rank: number;
  tuition: number;
  funRanking: string;
}

type TabContent = 
  | { type: 'insights'; videos: { id: string; title: string }[] }
  | { type: 'league'; schools: School[] };

type VideoCategory = 'RBT' | 'RWT' | 'CMP';

const KnowledgeProfile: React.FC<KnowledgeProfileProps> = ({ activities: initialActivities }) => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [schools, setSchools] = useState<School[]>([
    { name: "Pomona College", location: "Claremont, CA", rank: 1, tuition: 500, funRanking: "Cupcake Rankings" },
    { name: "Princeton University", location: "Princeton, NJ", rank: 2, tuition: 450, funRanking: "Cupcake Rankings" },
    { name: "Rice University", location: "Houston, TX", rank: 3, tuition: 400, funRanking: "Cupcake Rankings" },
    { name: "University of Houston", location: "Houston, TX", rank: 4, tuition: 350, funRanking: "Cupcake Rankings" },
    { name: "University of Richmond", location: "Richmond, VA", rank: 5, tuition: 300, funRanking: "Cupcake Rankings" },
    { name: "UT Dallas", location: "Richardson, TX", rank: 6, tuition: 250, funRanking: "Cupcake Rankings" },
    { name: "Tulane University", location: "New Orleans, LA", rank: 7, tuition: 200, funRanking: "Cupcake Rankings" },
    { name: "Cornell University", location: "Ithaca, NY", rank: 8, tuition: 150, funRanking: "Cupcake Rankings" },
    { name: "UC San Diego", location: "La Jolla, CA", rank: 9, tuition: 100, funRanking: "Cupcake Rankings" },
    { name: "Northwestern University", location: "Evanston, IL", rank: 10, tuition: 50, funRanking: "Cupcake Rankings" }
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

  useEffect(() => {
    setVideos([...shuffleVideos(videoCategories[selectedCategory])]);
    setCurrentVideoIndex(0);
  }, [selectedCategory]);

  const renderInsights = () => (
    <div className="h-full flex flex-col space-y-4">
      <Card>
        <CardContent className="p-4">
        <a 
            href={`https://www.youtube.com/watch?v=${firstVideo.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline mb-4 block font-semibold"
          >
            Start Here: {firstVideo.title}
          </a>
          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as VideoCategory)} className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="RBT">RBT</TabsTrigger>
              <TabsTrigger value="RWT">RWT</TabsTrigger>
              <TabsTrigger value="CMP">CMP</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative aspect-video">
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
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setCurrentVideoIndex((prev) => (prev + 1) % videos.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="flex-grow">
        <CardContent className="p-4">
          <RedditPosts />
        </CardContent>
      </Card>
    </div>
  );


  const renderSchools = (schools: School[]) => (
    <ScrollArea className="h-full">
      {schools.map((school, index) => {
        return (
          <div key={index} className="mb-4 p-4 bg-[--theme-leaguecard-color] rounded-lg shadow-md">
            <div className="flex items-start">
              <div className="mr-4 flex-shrink-0">
                <Image
                  src={`/colleges/${school.name.replace(/\s+/g, '')}.png`}
                  alt={school.name}
                  width={80}
                  height={80}
                  className="rounded-lg border border-[--theme-border-color] object-cover xl:w-24 xl:h-24"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-semibold text-[--theme-text-color]">{school.name}</h3>
                <p className="text-sm text-[--theme-text-color] opacity-80">{school.location}</p>
                <div className="mt-1">
                  <span className="inline-block text-[--theme-hover-color] text-sm">
                    #{school.rank} in {school.funRanking}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-[--theme-text-color] opacity-90">
              {getMascotDescription(school.name)}
            </p>
            {school.rank === 1 && (
              <Dialog open={isMVPDialogOpen} onOpenChange={setIsMVPDialogOpen}>
                <DialogTrigger asChild>
                  <button className="mt-2 text-sm text-blue-600 hover:underline">
                    Highlighting the MVPs»
                  </button>
                </DialogTrigger>
                <MVPDialog university={school.name} />
              </Dialog>
            )}
          </div>
        );
      })}
    </ScrollArea>
  );

  const renderContent = (content: TabContent) => {
    if (content.type === 'insights') {
      return renderInsights();
    } else if (content.type === 'league') {
      return renderSchools(content.schools);
    }
    return null;
  };

  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isMVPDialogOpen, setIsMVPDialogOpen] = useState(false);

  const tabs: { id: string; label: string; content: TabContent }[] = [
    { id: "tab1", label: "Insights", content: { type: 'insights', videos: videos } },
    { id: "tab2", label: "League", content: { type: 'league', schools: schools } },
  ];

  return (
    <div className="relative p-2 overflow-auto h-[calc(100vh-4.8rem)]">
      <div className="relative z-10 text-[--theme-text-color] p-2 rounded-lg h-full flex flex-col">
        <div className="flex w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 text-[12px] py-1 border border-[#79747E] text-center ${
                activeTab === tab.id
                  ? "bg-[--theme-hover-color] text-[--theme-hover-text]"
                  : "bg-white text-black"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={`mt-4 ${activeTab === 'tab2' ? 'bg-transparent' : 'bg-[--theme-mainbox-color]'} flex-grow mb-8 overflow-hidden`}>
          {renderContent(tabs.find(tab => tab.id === activeTab)!.content)}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeProfile;