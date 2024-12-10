import { useState } from 'react'
import { Check, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

type NotificationPreference = 'all' | 'important' | 'none'

interface NotificationPreferencesProps {
  initialPreference?: NotificationPreference
  className?: string
}

export function NotificationPreferences({ 
  initialPreference = 'all',
  className 
}: NotificationPreferencesProps) {
  const [preference, setPreference] = useState<NotificationPreference>(initialPreference)
  const [isLoading, setIsLoading] = useState(false)

  const preferences: { value: NotificationPreference; label: string }[] = [
    { value: 'all', label: 'All Emails' },
    { value: 'important', label: 'Important Only' },
    { value: 'none', label: 'No Emails' },
  ]

  const updatePreference = async (newPreference:  NotificationPreference) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationPreference: newPreference }),
      })

      if (!response.ok) {
        throw new Error('Failed to update notification preferences')
      }

      setPreference(newPreference)
      toast.success('Notification preferences updated')
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      toast.error('Failed to update notification preferences')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className={cn(
            "w-10 h-10 rounded-full bg-[--theme-leaguecard-color] border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color]",
            isLoading && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={isLoading}
        >
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {preferences.map((pref) => (
          <DropdownMenuItem
            key={pref.value}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              preference === pref.value && "bg-[--theme-hover-color] text-[--theme-hover-text]"
            )}
            onClick={() => updatePreference(pref.value)}
          >
            {pref.label}
            {preference === pref.value && (
              <Check className="h-4 w-4 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 