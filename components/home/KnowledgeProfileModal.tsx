"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

/* ----- Types ---- */
interface KnowledgeProfileItem {
  subject: string;
  content: string;
  concept: string;
  mastery: number;
  correctAnswers: number;
  totalAttempts: number;
  lastAttempt: Date;
}

interface SectionSummary {
  section: string;
  averageMastery: number;
  totalConcepts: number;
}

interface WeakConcept {
  subject: string;
  content: string;
  concept: string;
  mastery: number;
  section: string;
}

interface KnowledgeProfileData {
  sections: Record<string, KnowledgeProfileItem[]>;
  sectionSummaries: SectionSummary[];
  weakestConcepts: WeakConcept[];
}

interface KnowledgeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KnowledgeProfileModal: React.FC<KnowledgeProfileModalProps> = ({ isOpen, onClose }) => {
  /* ---- State ----- */
  const [profileData, setProfileData] = useState<KnowledgeProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  /* --- Animations & Effects --- */
  useEffect(() => {
    const fetchKnowledgeProfiles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/knowledge-profile");
        if (!response.ok) throw new Error("Failed to fetch knowledge profiles");
        
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching knowledge profiles:", error);
        toast.error("Failed to load knowledge profile");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      fetchKnowledgeProfiles();
    }
  }, [isOpen]);
  
  /* ---- Memoized Values ---- */
  const sections = profileData?.sections ? Object.keys(profileData.sections) : [];
  const sectionSummaries = profileData?.sectionSummaries || [];
  const weakestConcepts = profileData?.weakestConcepts || [];
  
  const getSectionData = (sectionName: string) => {
    return profileData?.sections?.[sectionName] || [];
  };
  
  const getAllData = () => {
    if (!profileData?.sections) return [];
    return Object.values(profileData.sections).flat();
  };
  
  /* ---- Event Handlers ----- */
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  /* ---- Render Methods ----- */
  const renderProfileItem = (item: KnowledgeProfileItem) => {
    // Determine color based on mastery level
    const getColorClass = (value: number) => {
      if (value >= 80) return "bg-green-500";
      if (value >= 60) return "bg-yellow-500";
      if (value >= 40) return "bg-orange-500";
      return "bg-red-500";
    };
    
    return (
      <div key={`${item.subject}-${item.content}-${item.concept}`} className="mb-2">
        <div className="p-2 rounded-lg transition-all duration-300 bg-[--theme-leaguecard-color] text-[--theme-text-color]">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{item.concept}</h4>
            <p className="text-xs opacity-80">{item.subject} - {item.content}</p>
            
            <div className="mt-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Mastery:</span>
                <span>{item.mastery.toFixed(0)}%</span>
              </div>
              <Progress 
                value={item.mastery} 
                className={cn("h-1.5", "[&>[data-state='progress']]:"+getColorClass(item.mastery))}
              />
              
              <div className="flex items-center justify-between text-xs">
                <span>Correct Answers:</span>
                <span>{item.correctAnswers}/{item.totalAttempts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderSectionSummary = (summary: SectionSummary) => {
    const getColorClass = (value: number) => {
      if (value >= 80) return "bg-green-500";
      if (value >= 60) return "bg-yellow-500";
      if (value >= 40) return "bg-orange-500";
      return "bg-red-500";
    };
    
    return (
      <div key={summary.section} className="mb-4 p-3 rounded-lg bg-[--theme-leaguecard-color] text-[--theme-text-color]">
        <h3 className="font-medium">{summary.section}</h3>
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs">
            <span>Average Mastery:</span>
            <span>{summary.averageMastery.toFixed(0)}%</span>
          </div>
          <Progress 
            value={summary.averageMastery} 
            className={cn("h-1.5", "[&>[data-state='progress']]:"+getColorClass(summary.averageMastery))}
          />
          <div className="text-xs mt-1">
            Total Concepts: {summary.totalConcepts}
          </div>
        </div>
      </div>
    );
  };
  
  const renderSectionItems = (sectionName: string) => {
    const items = getSectionData(sectionName);
    
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="mb-2 h-24 w-full rounded-lg bg-[--theme-leaguecard-color] animate-pulse" />
      ));
    }
    
    if (items.length === 0) {
      return (
        <div className="text-center py-4 text-[--theme-text-color] opacity-70">
          No data found for this section
        </div>
      );
    }
    
    return items.map(renderProfileItem);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden">
      <div className="w-[90vw] max-w-4xl max-h-[90vh] bg-[--theme-leaguecard-color] rounded-xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-[--theme-border-color] flex-shrink-0">
          <h2 className="text-xl font-medium text-[--theme-text-color]">Knowledge Profile</h2>
          <button 
            onClick={onClose}
            className="text-[--theme-text-color] hover:text-[--theme-hover-text]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <ScrollArea className="flex-grow overflow-auto">
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-text-color]" />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Weakest Concepts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weakestConcepts.map(concept => (
                      <div key={concept.concept} className="p-3 rounded-lg bg-[--theme-leaguecard-color] border border-[--theme-border-color]">
                        <h4 className="font-medium">{concept.concept}</h4>
                        <p className="text-xs opacity-80">{concept.subject} - {concept.content}</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Mastery:</span>
                            <span>{concept.mastery.toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={concept.mastery} 
                            className={cn("h-1.5", "[&>[data-state='progress']]:bg-red-500")}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Section Summaries</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sectionSummaries.map(renderSectionSummary)}
                  </div>
                </div>
                
                <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-5 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    {sections.slice(0, 4).map(section => (
                      <TabsTrigger key={section} value={section}>{section}</TabsTrigger>
                    ))}
                  </TabsList>
                  
                  <div className="min-h-[300px]">
                    <TabsContent value="all" className="mt-0">
                      {getAllData().map(renderProfileItem)}
                    </TabsContent>
                    
                    {sections.map(section => (
                      <TabsContent key={section} value={section} className="mt-0">
                        {renderSectionItems(section)}
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default KnowledgeProfileModal; 