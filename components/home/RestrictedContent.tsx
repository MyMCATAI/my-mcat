"use client";

import { useUserInfo } from "@/hooks/useUserInfo";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function RestrictedContent() {
  const { userInfo } = useUserInfo();
  const router = useRouter();

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Welcome back, {userInfo?.firstName || 'future doctor'}!
          </h1>
          <p className="text-[--theme-text-color] opacity-80">
            Continue your MCAT preparation journey
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-[--theme-leaguecard-color] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-[--theme-mainbox-color] rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Study Streak</h3>
              <p className="text-3xl font-bold text-amber-500">{userInfo?.streak || 0} days</p>
            </div>
            <div className="text-center p-4 bg-[--theme-mainbox-color] rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Study Coins</h3>
              <p className="text-3xl font-bold text-amber-500">{userInfo?.score || 0}</p>
            </div>
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="bg-[--theme-leaguecard-color] rounded-lg p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/MD_Premium_Pro.png"
                alt="Gold Features"
                width={100}
                height={100}
                className="rounded-lg"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-4">
              Unlock Full MCAT Preparation
            </h2>
            
            <p className="text-center mb-8 opacity-80">
              Upgrade to Gold for complete access to personalized study plans, 
              advanced analytics, and AI-powered tutoring.
            </p>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => router.push('/pitch')}
                className="w-full max-w-md px-6 py-3 text-lg rounded-lg font-semibold
                  bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-900
                  shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]
                  transform hover:scale-[1.02] transition-all duration-300"
              >
                Upgrade to Gold
              </button>
              
              <button
                onClick={() => router.push('/doctorsoffice')}
                className="text-sm opacity-80 hover:opacity-100 transition-opacity"
              >
                Continue with Basic Access →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 