import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const [preference, setPreference] = useState<NotificationPreference | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPreference = async () => {
      try {
        const response = await fetch('/api/user-info')
        if (!response.ok) {
          throw new Error('Failed to fetch user preferences')
        }
        const data = await response.json()
        setPreference(data.notificationPreference || initialPreference)
      } catch (error) {
        console.error('Error fetching notification preferences:', error)
        setPreference(initialPreference)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreference()
  }, [initialPreference])

  const preferences: { value: NotificationPreference; label: string }[] = [
    { value: 'all', label: 'All Emails' },
    { value: 'important', label: 'Important Emails' },
    { value: 'none', label: 'Not Committed to Medicine' },
  ]

  const updatePreference = async (newPreference:  NotificationPreference) => {
    if (isLoading || preference === newPreference) return
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
    <div className={cn("w-full space-y-2", className)}>
      {preferences.map((pref) => (
        <div
          key={pref.value}
          onClick={() => !isLoading && updatePreference(pref.value)}
          className={cn(
            "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all",
            "border-2 border-[#5F7E92]",
            "hover:bg-[#1A334D] hover:text-white",
            preference === pref.value && "bg-[#1A334D] text-white",
            (isLoading || !preference) && "opacity-50 cursor-not-allowed"
          )}
        >
          <span>{pref.label}</span>
          {preference === pref.value && (
            <Check className="h-5 w-5 ml-2" />
          )}
        </div>
      ))}
    </div>
  )
} 