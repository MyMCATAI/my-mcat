import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Users, BookOpen, Play, DollarSign } from 'lucide-react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import "react-big-calendar/lib/css/react-big-calendar.css";

/* --- Constants ----- */
const locales = {
  'en-US': require('date-fns/locale/en-US'),
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Pricing tiers for the embedded pricing section
const PRICING_TIERS = [
  {
    id: 'tutoring',
    title: 'Tutoring',
    price: '$150',
    period: '/hour',
    icon: Users,
    color: 'from-purple-500 to-purple-700',
    bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30',
    description: 'One-on-one expert sessions'
  },
  {
    id: 'classes',
    title: 'Classes',
    price: '$75',
    period: '/session',
    icon: BookOpen,
    color: 'from-cyan-500 to-cyan-700',
    bgColor: 'from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/30',
    description: 'Small group learning'
  },
  {
    id: 'content',
    title: 'Content',
    price: '$49',
    period: '/month',
    icon: Play,
    color: 'from-amber-500 to-amber-700',
    bgColor: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30',
    description: 'Video lessons & materials'
  }
];

// Comprehensive May-June MCAT prep schedule for tutoring firms
const SAMPLE_CALENDAR_EVENTS = [
  // Week 1 of May (May 6-10, 2024)
  {
    id: '1',
    title: 'FREE Diagnostic Assessment',
    start: new Date(2024, 4, 6, 10, 0), // May 6, 10 AM
    end: new Date(2024, 4, 6, 13, 0),
    resource: {
      activityTitle: 'FREE Diagnostic Assessment',
      activityText: 'Complete MCAT diagnostic test',
      hours: 3,
      eventType: 'free',
      status: 'Scheduled'
    }
  },
  {
    id: '2',
    title: 'Biology Fundamentals - Tutoring',
    start: new Date(2024, 4, 7, 14, 0), // May 7, 2 PM
    end: new Date(2024, 4, 7, 16, 0),
    resource: {
      activityTitle: 'Biology Fundamentals',
      activityText: 'One-on-one tutoring session',
      hours: 2,
      eventType: 'tutoring',
      status: 'Scheduled'
    }
  },
  {
    id: '3',
    title: 'Chemistry Review - Group Class',
    start: new Date(2024, 4, 8, 18, 0), // May 8, 6 PM
    end: new Date(2024, 4, 8, 20, 0),
    resource: {
      activityTitle: 'Chemistry Review',
      activityText: 'Group class session',
      hours: 2,
      eventType: 'class',
      status: 'Scheduled'
    }
  },
  {
    id: '4',
    title: 'Physics Practice - Content Review',
    start: new Date(2024, 4, 9, 16, 0), // May 9, 4 PM
    end: new Date(2024, 4, 9, 18, 0),
    resource: {
      activityTitle: 'Physics Practice',
      activityText: 'Self-paced content review',
      hours: 2,
      eventType: 'content',
      status: 'Scheduled'
    }
  },
  {
    id: '5',
    title: 'CARS Strategy - Tutoring',
    start: new Date(2024, 4, 10, 15, 0), // May 10, 3 PM
    end: new Date(2024, 4, 10, 17, 0),
    resource: {
      activityTitle: 'CARS Strategy',
      activityText: 'Critical Analysis and Reasoning Skills',
      hours: 2,
      eventType: 'tutoring',
      status: 'Scheduled'
    }
  },

  // Week 2 of May (May 13-17, 2024)
  {
    id: '6',
    title: 'Organic Chemistry - Tutoring',
    start: new Date(2024, 4, 13, 14, 0), // May 13, 2 PM
    end: new Date(2024, 4, 13, 16, 0),
    resource: {
      activityTitle: 'Organic Chemistry',
      activityText: 'Reaction mechanisms focus',
      hours: 2,
      eventType: 'tutoring',
      status: 'Scheduled'
    }
  },
  {
    id: '7',
    title: 'Biochemistry - Group Class',
    start: new Date(2024, 4, 14, 18, 0), // May 14, 6 PM
    end: new Date(2024, 4, 14, 20, 0),
    resource: {
      activityTitle: 'Biochemistry',
      activityText: 'Metabolic pathways',
      hours: 2,
      eventType: 'class',
      status: 'Scheduled'
    }
  },
  {
    id: '8',
    title: 'Practice Test 1',
    start: new Date(2024, 4, 15, 9, 0), // May 15, 9 AM
    end: new Date(2024, 4, 15, 16, 30),
    resource: {
      activityTitle: 'Practice Test 1',
      activityText: 'Full-length AAMC practice exam',
      hours: 7.5,
      eventType: 'exam',
      status: 'Scheduled'
    }
  },
  {
    id: '9',
    title: 'Test Review - FREE Session',
    start: new Date(2024, 4, 16, 16, 0), // May 16, 4 PM
    end: new Date(2024, 4, 16, 18, 0),
    resource: {
      activityTitle: 'Test Review Session',
      activityText: 'Analyze practice test results',
      hours: 2,
      eventType: 'free',
      status: 'Scheduled'
    }
  },
  {
    id: '10',
    title: 'Psychology/Sociology - Tutoring',
    start: new Date(2024, 4, 17, 15, 0), // May 17, 3 PM
    end: new Date(2024, 4, 17, 17, 0),
    resource: {
      activityTitle: 'Psychology/Sociology',
      activityText: 'Behavioral sciences review',
      hours: 2,
      eventType: 'tutoring',
      status: 'Scheduled'
    }
  },

  // Week 3 of May (May 20-24, 2024)
  {
    id: '11',
    title: 'Advanced Biology - Tutoring',
    start: new Date(2024, 4, 20, 14, 0), // May 20, 2 PM
    end: new Date(2024, 4, 20, 16, 0),
    resource: {
      activityTitle: 'Advanced Biology',
      activityText: 'Genetics and molecular biology',
      hours: 2,
      eventType: 'tutoring',
      status: 'Scheduled'
    }
  },
  {
    id: '12',
    title: 'Math Skills - Group Class',
    start: new Date(2024, 4, 21, 18, 0), // May 21, 6 PM
    end: new Date(2024, 4, 21, 20, 0),
    resource: {
      activityTitle: 'Math Skills for MCAT',
      activityText: 'Essential calculations and formulas',
      hours: 2,
      eventType: 'class',
      status: 'Scheduled'
    }
  },
  {
    id: '13',
    title: 'CARS Practice - Content Review',
    start: new Date(2024, 4, 22, 16, 0), // May 22, 4 PM
    end: new Date(2024, 4, 22, 18, 0),
    resource: {
      activityTitle: 'CARS Practice',
      activityText: 'Reading comprehension drills',
      hours: 2,
      eventType: 'content',
      status: 'Scheduled'
    }
  },
  {
    id: '14',
    title: 'Physics Problem Solving - Tutoring',
    start: new Date(2024, 4, 23, 15, 0), // May 23, 3 PM
    end: new Date(2024, 4, 23, 17, 0),
    resource: {
      activityTitle: 'Physics Problem Solving',
      activityText: 'Mechanics and thermodynamics',
      hours: 2,
      eventType: 'tutoring',
      status: 'Scheduled'
    }
  },
  {
    id: '15',
    title: 'Practice Test 2',
    start: new Date(2024, 4, 24, 9, 0), // May 24, 9 AM
    end: new Date(2024, 4, 24, 16, 30),
    resource: {
      activityTitle: 'Practice Test 2',
      activityText: 'Full-length practice exam',
      hours: 7.5,
      eventType: 'exam',
      status: 'Scheduled'
    }
  },

  // Week 4 of May (May 27-31, 2024)
  {
    id: '16',
    title: 'Test Analysis - FREE Session',
    start: new Date(2024, 4, 28, 16, 0), // May 28, 4 PM
    end: new Date(2024, 4, 28, 18, 0),
    resource: {
      activityTitle: 'Test Analysis Session',
      activityText: 'Detailed score breakdown',
      hours: 2,
      eventType: 'free',
      status: 'Scheduled'
    }
  },
  {
    id: '17',
    title: 'Weak Areas Focus - Tutoring',
    start: new Date(2024, 4, 29, 14, 0), // May 29, 2 PM
    end: new Date(2024, 4, 29, 16, 0),
    resource: {
      activityTitle: 'Weak Areas Focus',
      activityText: 'Personalized tutoring',
      hours: 2,
      eventType: 'tutoring',
      status: 'Scheduled'
    }
  },
  {
    id: '18',
    title: 'Final Review - Group Class',
    start: new Date(2024, 4, 30, 18, 0), // May 30, 6 PM
    end: new Date(2024, 4, 30, 20, 0),
    resource: {
      activityTitle: 'Final Review Session',
      activityText: 'Comprehensive review',
      hours: 2,
      eventType: 'class',
      status: 'Scheduled'
    }
  },
  {
    id: '19',
    title: 'Test Day Prep - Tutoring',
    start: new Date(2024, 4, 31, 15, 0), // May 31, 3 PM
    end: new Date(2024, 4, 31, 17, 0),
    resource: {
      activityTitle: 'Test Day Preparation',
      activityText: 'Strategy and mindset coaching',
      hours: 2,
      eventType: 'tutoring',
      status: 'Scheduled'
    }
  },

  // June - Final Prep Week (June 3-7, 2024)
  {
    id: '20',
    title: 'Final Practice Test',
    start: new Date(2024, 5, 3, 9, 0), // June 3, 9 AM
    end: new Date(2024, 5, 3, 16, 30),
    resource: {
      activityTitle: 'Final Practice Test',
      activityText: 'Official AAMC practice exam',
      hours: 7.5,
      eventType: 'exam',
      status: 'Scheduled'
    }
  },
  {
    id: '21',
    title: 'Last-Minute Review - FREE',
    start: new Date(2024, 5, 5, 16, 0), // June 5, 4 PM
    end: new Date(2024, 5, 5, 18, 0),
    resource: {
      activityTitle: 'Last-Minute Review',
      activityText: 'Quick concepts refresh',
      hours: 2,
      eventType: 'free',
      status: 'Scheduled'
    }
  },
  {
    id: '22',
    title: 'MCAT EXAM DAY',
    start: new Date(2024, 5, 7, 8, 0), // June 7, 8 AM
    end: new Date(2024, 5, 7, 17, 0),
    resource: {
      activityTitle: 'MCAT EXAM DAY',
      activityText: 'Official MCAT examination',
      hours: 9,
      eventType: 'exam-day',
      status: 'Scheduled'
    }
  }
];

/* ----- Types ---- */
interface CalendarViewProps {
  title: string;
  message: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ title, message }) => {
  /* ---- State ----- */
  const [calendarDate, setCalendarDate] = useState(new Date(2024, 4, 1)); // Start in May 2024
  const [selectedPricing, setSelectedPricing] = useState<string | null>(null);

  /* ---- Render Methods ----- */
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent text-center"
      >
        {title}
      </motion.div>
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed text-center font-medium bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm"
        >
          {message}
        </motion.div>
      )}
      
      {/* Enhanced Calendar View */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl"
      >
        <div className="h-[300px]">
          <BigCalendar
            localizer={localizer}
            events={SAMPLE_CALENDAR_EVENTS}
            startAccessor="start"
            endAccessor="end"
            className="custom-calendar w-full h-full bg-transparent"
            views={['month']}
            defaultView="month"
            date={calendarDate}
            onNavigate={setCalendarDate}
            toolbar={true}
            popup
            eventPropGetter={(event) => {
              let backgroundColor = '#3b82f6'; // Default blue
              let textColor = 'white';
              
              switch (event.resource.eventType) {
                case 'exam':
                case 'exam-day':
                  backgroundColor = '#ef4444'; // Red for exams
                  break;
                case 'tutoring':
                  backgroundColor = '#8b5cf6'; // Purple for tutoring
                  break;
                case 'class':
                  backgroundColor = '#06b6d4'; // Cyan for group classes
                  break;
                case 'free':
                  backgroundColor = '#10b981'; // Green for free sessions
                  break;
                case 'content':
                  backgroundColor = '#f59e0b'; // Amber for content review
                  break;
                default:
                  backgroundColor = '#3b82f6'; // Blue default
              }

              return {
                className: `calendar-event ${event.resource.eventType}-event`,
                style: {
                  backgroundColor,
                  color: textColor,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  fontWeight: '600',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }
              };
            }}
            components={{
              toolbar: ({ label, onNavigate }) => (
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => onNavigate('PREV')}
                    className="p-2 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 dark:hover:from-gray-700 dark:hover:to-gray-600 rounded-lg transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <span className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{label}</span>
                  <button 
                    onClick={() => onNavigate('NEXT')}
                    className="p-2 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 dark:hover:from-gray-700 dark:hover:to-gray-600 rounded-lg transition-all duration-200"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              )
            }}
            style={{
              fontSize: '0.75rem'
            }}
          />
        </div>
        
        {/* Enhanced Calendar Legend */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 px-3 py-1.5 rounded-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded shadow-sm"></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">Exams</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 px-3 py-1.5 rounded-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded shadow-sm"></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">Tutoring</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 px-3 py-1.5 rounded-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded shadow-sm"></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">Group Classes</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 px-3 py-1.5 rounded-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded shadow-sm"></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">FREE Sessions</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 px-3 py-1.5 rounded-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded shadow-sm"></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">Content Review</span>
          </div>
        </div>
      </motion.div>

      {/* Embedded Pricing Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-white via-gray-50/50 to-blue-50/50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl"
      >
        {/* Pricing Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-2 mb-3"
          >
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pricing
            </h3>
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            Choose the perfect plan for your students
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRICING_TIERS.map((tier, index) => {
            const IconComponent = tier.icon;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.2 }}
                className={`relative bg-gradient-to-br ${tier.bgColor} rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group`}
                onClick={() => setSelectedPricing(selectedPricing === tier.id ? null : tier.id)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Icon */}
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${tier.color} text-white shadow-md group-hover:shadow-lg transition-all duration-300`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                  {tier.title}
                </h4>

                {/* Price */}
                <div className="text-center mb-3">
                  <span className={`text-2xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    {tier.price}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    {tier.period}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 text-center text-sm font-medium">
                  {tier.description}
                </p>

                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />

                {/* Selection Indicator */}
                {selectedPricing === tier.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Revenue Potential */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="mt-6 text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-800/30 rounded-lg p-4"
        >
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Revenue Potential: <span className="text-green-600 dark:text-green-400">$15K+/month</span>
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            With 50+ students per month across all pricing tiers
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CalendarView; 