'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { NotificationPreferences } from '@/components/notification-preferences'

export default function EmailPreferencesPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: 'url(/Wallpaperwire.jpg)' }}
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10">
        <div className="w-full max-w-sm bg-[#001226] p-8 rounded-lg shadow-lg border border-[#5F7E92]">
          <h1 className="text-white text-2xl font-semibold mb-6 text-center">
            Email Preferences
          </h1>
          
          <div className="flex flex-col items-center space-y-4">
            <p className="text-white text-center mb-4">
              Choose how often you'd like to receive study reminders from us
            </p>
            
            <NotificationPreferences 
              className="[&>*]:border-[#5F7E92] [&>*]:text-white" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
