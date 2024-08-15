import React, { useState, useEffect } from "react";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { StudyPlan } from '@/types';
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";


type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Tab {
  id: string;
  label: string;
}

interface Option {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: "tab1", label: "Calendar" },
  { id: "tab2", label: "Tutoring" },
  { id: "tab3", label: "Flashcards" },
];

const options: Option[] = [
  { id: "option1", label: "When is your test?" },
  { id: "option2", label: "When can you take full lengths?" },
  { id: "option3", label: "How many hours each day?" },
  { id: "option4", label: "What resources do you have?" },
];

const days: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const resources: string[] = ["UWorld", "AAMC", "Kaplan Books"];

interface SettingContentProps {
  onShowDiagnosticTest?: () => void;
  onStudyPlanSaved?: () => void;
}


const SettingContent: React.FC<SettingContentProps> = ({ onShowDiagnosticTest, onStudyPlanSaved }) => {
  const [activeTab, setActiveTab] = useState<string>("tab1");
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [calendarValue, setCalendarValue] = useState<Value>(new Date());
  const [hoursPerDay, setHoursPerDay] = useState<Record<string, string>>({});
  const [selectedResources, setSelectedResources] = useState<Record<string, boolean>>({});
  const [existingStudyPlan, setExistingStudyPlan] = useState<StudyPlan | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [fullLengthDays, setFullLengthDays] = useState<Record<string, boolean>>({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [setName, setSetName] = useState('');
  const [section, setSection] = useState('');
  const [subjectCategory, setSubjectCategory] = useState('');
  const [contentCategory, setContentCategory] = useState('');
  const [conceptCategory, setConceptCategory] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState('');

  useEffect(() => {
    fetchExistingStudyPlan();
  }, []);

  // use later for admin things
  const generateNewTest = async () => {
    try {
      const testData: {
        title: string;
        description: string;
        setName: string;
        section?: string;
        subjectCategory?: string;
        contentCategory?: string;
        conceptCategory?: string;
        numberOfQuestions?: number;
      } = {
        title,
        description,
        setName,
      };

      if (section) testData.section = section;
      if (subjectCategory) testData.subjectCategory = subjectCategory;
      if (contentCategory) testData.contentCategory = contentCategory;
      if (conceptCategory) testData.conceptCategory = conceptCategory;
      if (numberOfQuestions) testData.numberOfQuestions = parseInt(numberOfQuestions);

      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        const newTest = await response.json();
        console.log('New test generated:', newTest);
        // You can add state update logic here if needed
        // For example: setLatestTest(newTest);
        
        // Clear the input fields after successful generation
        setTitle('');
        setDescription('');
        setSetName('');
        setSection('');
        setSubjectCategory('');
        setContentCategory('');
        setConceptCategory('');
        setNumberOfQuestions('');
      } else {
        console.error('Failed to generate new test');
      }
    } catch (error) {
      console.error('Error generating new test:', error);
    }
  };

  const fetchExistingStudyPlan = async () => {
    try {
      const response = await fetch('/api/study-plan');
      if (response.ok) {
        const data = await response.json();
        if (data.studyPlans && data.studyPlans.length > 0) {
          const plan = data.studyPlans[0];
          setExistingStudyPlan(plan);
          setCalendarValue(new Date(plan.examDate));
          setSelectedResources(plan.resources.reduce((acc: any, resource: any) => ({ ...acc, [resource]: true }), {}));
          setHoursPerDay(plan.hoursPerDay);
          setFullLengthDays(plan.fullLengthDays);
        }
      }
    } catch (error) {
      console.error('Error fetching existing study plan:', error);
    }
  };

  const handleOptionClick = (optionId: string) => {
    setActiveOption(activeOption === optionId ? null : optionId);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    const studyPlanData = {
      examDate: calendarValue,
      resources: Object.keys(selectedResources).filter(key => selectedResources[key]),
      hoursPerDay,
      fullLengthDays,
    };

    try {
      const method = existingStudyPlan ? 'PUT' : 'POST';
      const body = existingStudyPlan ? JSON.stringify({ ...studyPlanData, id: existingStudyPlan.id }) : JSON.stringify(studyPlanData);

      const response = await fetch('/api/study-plan', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (response.ok) {
        const updatedPlan = await response.json();
        setExistingStudyPlan(updatedPlan);
        if (onStudyPlanSaved) onStudyPlanSaved();
      } else {
        // Create new study plan
        const response = await fetch('/api/study-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studyPlanData),
        });
        if (response.ok) {
          const newPlan = await response.json();
          setExistingStudyPlan(newPlan);
          if (onShowDiagnosticTest) onShowDiagnosticTest();
        }
      }
    } catch (error) {
      console.error('Error saving study plan:', error);
      alert('Error saving study plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderOptionContent = () => {
    switch (activeOption) {
      case "option1":
        return (
          <div className="flex justify-center items-center bg-transparent p-4 rounded-lg shadow-md">
            <Calendar 
              onChange={setCalendarValue} 
              value={calendarValue} 
              className="text-black"
            />
          </div>
        );
      case "option2":
        return (
          <div className="bg-black p-4 rounded-lg shadow-md">
            {days.map((day) => (
              <div key={day} className="flex items-center justify-between mb-2">
                <span className="text-white">{day}</span>
                <input
                  type="checkbox"
                  checked={fullLengthDays[day] || false}
                  onChange={(e) => setFullLengthDays({ ...fullLengthDays, [day]: e.target.checked })}
                />
              </div>
            ))}
          </div>
        );
      case "option3":
        return (
          <div className="bg-black p-4 rounded-lg shadow-md">
            {days.map((day) => (
              <div key={day} className="flex items-center justify-between mb-2">
                <span className="text-white">{day}</span>
                <input
                  type="number"
                  value={hoursPerDay[day] || ""}
                  onChange={(e) => setHoursPerDay({ ...hoursPerDay, [day]: e.target.value })}
                  className="w-16 p-1 border rounded text-black"
                />
              </div>
            ))}
          </div>
        );
      case "option4":
        return (
          <div className="bg-black p-4 rounded-lg shadow-md">
            {resources.map((resource) => (
              <div key={resource} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedResources[resource] || false}
                  onChange={(e) => setSelectedResources({ ...selectedResources, [resource]: e.target.checked })}
                />
                <span className="ml-2 text-white">{resource}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const handleUpdateKnowledgeProfile = async () => {
    //todo, make this look nicer
    try {
      const response = await fetch("/api/knowledge-profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update knowledge profile");
      }
      console.log(response)
    } catch (error) {
      console.error("Error updating knowledge profile:", error);
    } 
  };
  return (
    <div className="bg-transparent rounded-lg border-gray-500 border shadow-lg relative">
      <div className="bg-transparent rounded-lg overflow-hidden">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 py-2 px-4 text-sm font-medium [box-shadow:inset_0_0_10px_rgba(0,0,246,0.9)] ${
                activeTab === tab.id
                  ? "text-blue-600 relative"
                  : "text-white hover:text-blue-600"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative z-10 ">
          {activeTab === "tab1" && (
            <div 
              className="bg-transparent p-4 space-y-4"
              style={{
                backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 18, 38, 0.6)), url('/circuitpattern2.png')",
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 246, 0.7)'
              }}
            >
              {options.map((option) => (
                <div key={option.id} className="relative">
                  <button
                    className={`w-full text-left p-3 rounded-lg ${
                      activeOption === option.id
                        ? "bg-transparent text-sm text-blue-600 font-mono"
                        : "bg-transparent text-blue-200 font-mono text-sm hover:text-blue-600"
                    }`}
                    onClick={() => handleOptionClick(option.id)}
                  >
                   <div className="flex justify-between items-center">
                    <span>{option.label}</span>
                    {option.id === "option1" && calendarValue instanceof Date && (
                      <span className="text-sm font-medium">
                        {formatDate(calendarValue)}
                      </span>
                    )}
                  </div>
                  </button>
                  {activeOption === option.id && (
                    <div className="mt-2">
                      {renderOptionContent()}
                    </div>
                  )}
                </div>
              ))}
              
              <button
                className="w-full text-blue-500 font-mono py-2 px-4 rounded-lg hover:text-blue-600 transition duration-200"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : (existingStudyPlan ? 'Update Study Plan' : 'Save Study Plan')}
              </button>
            </div>
          )}
          {activeTab === "tab2" && (
            <div className="bg-white p-4 space-y-4">
              <h1 className="text-lg text-blue-600">Regenerate Study Plan</h1>
              
                
              <button
                onClick={handleUpdateKnowledgeProfile}
                className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
              >
                Regenerate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingContent;