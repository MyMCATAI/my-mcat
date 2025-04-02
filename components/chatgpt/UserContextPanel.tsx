"use client"

import { useState, useEffect } from "react"
import { useClinicData, useUser } from "@/store/selectors"
import { CheckCircle2, Circle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { FetchedActivity } from "@/types"

const TASKS = [
  {
    id: 'use-anki',
    title: 'Try out Anki flashcards',
    route: '/ankiclinic',
  },
  {
    id: 'plan-exam',
    title: 'Plan your exam and study schedule',
    route: '/examcalendar',
  },
  {
    id: 'join-discord',
    title: 'Join our Discord',
    route: 'https://discord.gg/jcWVAxKS',
    isExternal: true,
  },
]

interface UserContextPanelProps {
  activities?: FetchedActivity[];
}

const UserContextPanel = ({ activities }: UserContextPanelProps) => {
  const { userInfo } = useUser()
  const {
    reportData,
    isLoading,
    userRooms,
    streakDays,
    totalPatients
  } = useClinicData()
  
  const router = useRouter()
  const [joinedDiscord, setJoinedDiscord] = useState(false)
  
  // Check local storage for Discord join status on component mount
  useEffect(() => {
    if (!userInfo?.userId) return
    
    const hasJoinedDiscord = localStorage.getItem(`joined-discord-${userInfo.userId}`)
    if (hasJoinedDiscord === 'true') {
      setJoinedDiscord(true)
    }
  }, [userInfo?.userId])
  
  const handleTaskClick = (taskId: string, route: string, isExternal = false) => {
    if (taskId === 'join-discord' && !joinedDiscord) {
      setJoinedDiscord(true)
      localStorage.setItem(`joined-discord-${userInfo?.userId}`, 'true')
    }
    
    if (isExternal) {
      window.open(route, '_blank')
    } else {
      router.push(route)
    }
  }
  
  // Determine task completion based directly on data state
  const getIsTaskComplete = (taskId: string) => {
    if (taskId === 'plan-exam') {
      // Task is complete only if activities exist
      return activities && activities.length > 0
    }
    
    if (taskId === 'use-anki') {
      // Task is complete if user has treated patients
      return totalPatients && totalPatients > 0
    }
    
    if (taskId === 'join-discord') {
      return joinedDiscord
    }
    
    return false
  }
  
  // Check if all tasks are completed
  const areAllTasksComplete = TASKS.every(task => getIsTaskComplete(task.id))
  
  // If all tasks are complete, don't render the panel
  if (areAllTasksComplete) {
    return null
  }
  
  return (
    <div className="absolute top-16 right-5 w-72 rounded-xl backdrop-blur-md z-10 animate-in fade-in slide-in-from-right duration-300 bg-gradient-to-b from-white/95 to-white/90 dark:from-slate-800/95 dark:to-slate-800/90 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Get Started with MyMCAT
        </h3>
      </div>
      
      <div className="p-3 space-y-1.5">
        {TASKS.map((task) => {
          const isComplete = getIsTaskComplete(task.id)
          
          return (
            <div 
              key={task.id}
              className={cn(
                "group flex items-start p-2.5 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-700/50 cursor-pointer transition-all duration-200",
                "border border-transparent hover:border-slate-200/50 dark:hover:border-slate-600/50",
                isComplete && "opacity-75"
              )}
              onClick={() => handleTaskClick(task.id, task.route, task.isExternal)}
            >
              <div className={cn(
                "mt-0.5 mr-3 transition-colors duration-200",
                isComplete ? "text-emerald-500" : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"
              )}>
                {isComplete ? (
                  <CheckCircle2 size={18} className="transition-transform duration-200 group-hover:scale-110" />
                ) : (
                  <Circle size={18} className="transition-transform duration-200 group-hover:scale-110" />
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className={cn(
                  "font-medium leading-tight",
                  isComplete ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-slate-100"
                )}>
                  {task.title}
                </p>
              </div>
              <ChevronRight size={16} className={cn(
                "text-slate-400 mt-0.5 transition-transform duration-200",
                "group-hover:translate-x-0.5 group-hover:text-slate-500 dark:group-hover:text-slate-300"
              )} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UserContextPanel 