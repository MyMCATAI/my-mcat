import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import profile from "../../../../public/knowledge.png";
import { format, isBefore, isAfter, startOfDay } from 'date-fns';
import { FetchedActivity } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star } from 'lucide-react'; // Import the Star icon
import MVPDialog from "@/components/MVPDialog";

interface KnowledgeProfileProps {
  activities: FetchedActivity[];
}

interface Category {
  conceptCategory: string;
  icon: string;
  color: string;
}

interface School {
  name: string;
  location: string;
  rank: number;
  tuition: number;
  funRanking: string;
}

type TabContent = {
  categories: Category[];
  activities?: FetchedActivity[];
  schools?: School[];
};

const KnowledgeProfile: React.FC<KnowledgeProfileProps> = ({ activities: initialActivities }) => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [activities, setActivities] = useState(initialActivities);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const statusOrder = ["Not Started", "In Progress", "Complete"];
  
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const url = new URL("/api/category", window.location.origin);
      url.searchParams.append("page", "1");
      url.searchParams.append("pageSize", "7");
      url.searchParams.append("useKnowledgeProfiles", "true");

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setCategories(data.items);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    setActivities(initialActivities)
  }, [initialActivities]);


  const updateActivityStatus = async (activityId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/calendar-activity', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: activityId, status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update activity status');
      return await response.json();
    } catch (error) {
      console.error('Error updating activity status:', error);
      // Optionally, revert the optimistic update here
      throw error;
    }
  };

  const handleStatusToggle = async (activityId: string) => {
    const activityToUpdate = activities.find(activity => activity.id === activityId);
    if (!activityToUpdate) return;

    const currentStatusIndex = statusOrder.indexOf(activityToUpdate.status);
    const nextStatusIndex = (currentStatusIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextStatusIndex];

    // Optimistic update
    setActivities(prevActivities => 
      prevActivities.map(activity => 
        activity.id === activityId ? { ...activity, status: newStatus } : activity
      )
    );

    try {
      await updateActivityStatus(activityId, newStatus);
    } catch (error) {
      // Revert the optimistic update if the API call fails
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId ? { ...activity, status: activityToUpdate.status } : activity
        )
      );
    }
  };

  const categorizedActivities = useMemo(() => {
    const today = startOfDay(new Date());
    return {
      past: [], // Emptied out the past activities
      present: activities.filter(activity => format(new Date(activity.scheduledDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')),
    };
  }, [activities]);

  const tabs = [
    { id: "tab1", label: "Insights", content: { categories: categories, activities: categorizedActivities.present } },
    { id: "tab2", label: "League", content: { categories: categories, schools: schools } },
  ];
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete": return "bg-green-800";
      case "In Progress": return "bg-yellow-800";
      default: return "bg-red-800";
    }
  };

  const renderActivities = (activities: FetchedActivity[]) => (
    <ScrollArea className="h-full">
      {activities.length > 0 ? (
        activities.map((activity) => {
          const minutesFormatted = (activity.hours * 60).toFixed(2);
          
          return (
            <div key={activity.id} className="mb-4 p-3 bg-[--theme-mainbox-color] rounded">
              {activity.link ? (
                <Link
                  href={activity.link}
                  className="block text-sm font-bold text-[--theme-text-color] leading-normal shadow-text mb-1 hover:underline"
                >
                  {activity.activityTitle}
                </Link>
              ) : (
                <h3 className="text-sm font-bold text-[--theme-text-color] leading-normal shadow-text mb-1">
                  {activity.activityTitle}
                </h3>
              )}
              <p className="text-xs text-gray-300 mb-1">{activity.activityText}</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{format(new Date(activity.scheduledDate), 'MMM d, yyyy')}</span>
                <span>{minutesFormatted} minutes</span>
              </div>
              <div className="mt-2 flex justify-between items-center text-xs">
                <button
                  onClick={() => handleStatusToggle(activity.id)}
                  className={`px-2 py-1 rounded ${getStatusColor(activity.status)} hover:opacity-80 transition-opacity`}
                >
                  {activity.status}
                </button>
                <span className="text-blue-300">{activity.activityType}</span>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center mt-4 text-[--theme-text-color] text-lg font-light leading-normal shadow-text">No activities</p>
      )}
    </ScrollArea>
  );

  const renderCategories = (categories: Category[]) => (
    <ScrollArea className="h-full">
      {categories.map((category, index) => (
        <div
          key={index}
          className="flex items-center p-2 mb-2 bg-[[#021326]] rounded-lg hover:bg-[#072E6F] transition-colors duration-200"
        >
          <div className="mr-3">
            <Icon 
              name={category.icon} 
              className="w-6 h-6" 
              color={category.color}
            />
          </div>
          <p className="text-[--theme-text-color] text-sm">{category.conceptCategory}</p>
        </div>
      ))}
    </ScrollArea>
  );

  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isMVPDialogOpen, setIsMVPDialogOpen] = useState(false);

  const renderSchools = (schools: School[]) => (
    <ScrollArea className="h-full">
      {schools.map((school, index) => {
        // Calculate cupcakes based on rank (320 for rank 1, decreasing by 20 for each rank)
        const cupcakes = 320 - (school.rank - 1) * 20;
        
        return (
          <div key={index} className="mb-4 p-4 bg-[--theme-leaguecard-color] rounded-lg shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <Image
                  src={`/colleges/${school.name.replace(/\s+/g, '')}.png`}
                  alt={school.name}
                  width={100}
                  height={100}
                  className="rounded-lg border border-[--theme-border-color]"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-[--theme-text-color]">{school.name}</h3>
                <p className="text-sm text-[--theme-text-color] opacity-80">{school.location}</p>
                <div className="mt-2">
                  <span className="inline-block bg-[--theme-hover-color] text-[--theme-hover-text] text-xs px-2 py-1 rounded-full">
                    #{school.rank} in {school.funRanking}
                  </span>
                </div>
                <div className="mt-2 flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill={star <= 4 ? 'currentColor' : 'none'}
                    />
                  ))}
                  <span className="ml-2 text-sm" style={{ color: 'var(--theme-hover-color)' }}>
                    {cupcakes} cupcakes
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
                  <button className="mt-3 text-sm text-blue-600 hover:underline">
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

  const getMascotDescription = (schoolName: string): string => {
    switch (schoolName) {
      case "Pomona College":
        return "Cecil the Sagehen, a rare bird native to California, is Pomona's unique mascot. Known for its distinctive call and vibrant plumage, Cecil embodies the college's spirit of individuality. Interestingly, Pomona is the only college in the U.S. with a Sagehen mascot, making it truly one-of-a-kind in collegiate sports.";
      case "Princeton University":
        return "The Tiger, Princeton's fierce mascot since 1882, is a symbol of strength and pride. Its iconic stripes and powerful presence have inspired generations of students. The famous 'Eye of the Tiger' song was actually inspired by Princeton's mascot, further cementing its place in pop culture and sports history.";
      case "Rice University":
        return "Sammy the Owl, named after Rice's first president William Marsh Rice, is known for his dramatic entrances at games. Often arriving by helicopter, Sammy embodies the university's innovative spirit. This wise owl has been the official mascot since 1917, representing intelligence and foresight in Rice's academic pursuits.";
      case "University of Houston":
        return "Shasta the Cougar, named after the school's original location on San Jacinto Street, was a live mascot until 1989. Now a costumed character, Shasta continues to embody the spirit and tenacity of UH students. The cougar represents strength, agility, and the fierce determination that Houston is known for.";
      case "University of Richmond":
        return "WebstUR the Spider was chosen due to a unique spider species discovered on campus in 1842. This eight-legged mascot represents the university's connection to nature and scientific discovery. Interestingly, Richmond is the only university in the U.S. with a spider as its mascot, making it stand out in collegiate sports.";
      case "UT Dallas":
        return "Temoc, whose name is 'comet' spelled backwards, is a blue-skinned cosmic humanoid mascot. This unique character perfectly represents UTD's focus on space, technology, and innovation. Temoc's otherworldly appearance and name reflect the university's forward-thinking approach and its strong programs in science and engineering.";
      case "Tulane University":
        return "Riptide the Pelican, inspired by Louisiana's state bird, replaced the former 'angry wave' mascot in 1998. This coastal bird represents Tulane's strong connection to New Orleans and the Gulf region. Riptide is known for its energetic presence at games and its ability to unite students with its distinctive pelican charm.";
      case "Cornell University":
        return "The Big Red Bear, unofficially named 'Touchdown', has a fascinating history. It first arrived on campus by train in 1915 as Cornell's live bear mascot. Today, the costumed version continues to rally crowds at sporting events. The bear represents strength, courage, and the wild spirit of Cornell's natural surroundings.";
      case "UC San Diego":
        return "King Triton, the mythical sea god, is an apt choice for UCSD's coastal campus. This powerful deity of the ocean embodies the university's strong connection to marine science and oceanography. Triton's trident is a symbol of the school's three pillars: education, research, and service, making waves in academia and beyond.";
      case "Northwestern University":
        return "Willie the Wildcat, introduced in 1933, has a legendary status among college mascots. Once, Willie reportedly tackled an opposing team's player who was running towards the wrong end zone, showcasing true team spirit. This purple-clad feline represents Northwestern's fierce competitive nature both in academics and athletics.";
      default:
        return "This school boasts a unique and spirited mascot with its own fascinating history. From its origins to its current incarnation, the mascot embodies the values, traditions, and spirit of the institution. It serves as a rallying point for students, alumni, and fans, creating a sense of unity and pride on campus and beyond.";
    }
  };

  const renderContent = (content: TabContent) => {
    if (content.activities) {
      return renderActivities(content.activities);
    } else if (content.schools) {
      return renderSchools(content.schools);
    }
    return null;
  };

  return (
    <div className="relative p-2 overflow-auto h-[calc(100vh-6.5rem)]">
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