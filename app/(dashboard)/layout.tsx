'use client'

import { useEffect, useState, memo, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Script from 'next/script';

import { useUI, useUser } from "@/store/selectors";
import { useUserInfo } from "@/hooks/useUserInfo";

import Navbar from "@/components/navbar/navbar";
import ThemeInitializer from "@/components/home/ThemeInitializer";
import StoreInitializer from '@/components/StoreInitializer';
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';

/* --- Types ---- */
interface LayoutProps {
  children: React.ReactNode;
}

interface DashboardLayoutContentProps {
  children: React.ReactNode;
}

// Debug component that has access to all contexts
const ContextDebugger = () => {
  const searchParams = useSearchParams();
  const isDebugMode = searchParams?.get('debug') === 'true';
  const zustandUserState = useUser();
    
  return null; // This component doesn't render anything
};

// Memoize the DashboardLayoutContent to prevent unnecessary re-renders
const DashboardLayoutContent = memo(({ children }: DashboardLayoutContentProps) => {
  /* ---- State ----- */
  const { theme } = useUI();
  const [backgroundImage, setBackgroundImage] = useState('');
  const { isLoaded, isSignedIn } = useAuth();
  const { isSubscribed } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  /* --- Effects --- */
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Remove or conditionally log based on debug mode
      console.log('🎫 Subscription Status:', 
        isSubscribed ? 'GOLD or PREMIUM' : 'FREE'
      );
    }
  }, [isLoaded, isSignedIn, isSubscribed]);

  useEffect(() => {
    const updateBackgroundImage = () => {
      switch (theme) {
        case 'sakuraTrees':
          setBackgroundImage('url(/sakuratreesbackground.png)');
          break;
        case 'sunsetCity':
          setBackgroundImage('url(/sunsetcitybackground.png)');
          break;
        case 'mykonosBlue':
          setBackgroundImage('url(/mykonosbluebackground.png)');
          break;
        default:
          setBackgroundImage('url(/vaporandnightbackground.png)');
      }
    };

    updateBackgroundImage();
    window.addEventListener('resize', updateBackgroundImage);

    return () => window.removeEventListener('resize', updateBackgroundImage);
  }, [theme]);

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const subscription = isSubscribed ? "pro" : "free";

  return ( 
    <div 
      className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat" 
      style={{ backgroundImage }}
    >
      <Navbar subscription={subscription}/>
      <main className="w-full pb-10">
        {children}
      </main>
    </div>
   );
});

// Add display name for memo component
DashboardLayoutContent.displayName = 'DashboardLayoutContent';

const DashboardLayout = ({ children }: LayoutProps) => {
  return (
    <MusicPlayerProvider>
      <Script
        src="https://tally.so/widgets/embed.js"
        strategy="lazyOnload"
      />
      <ThemeInitializer />
      <StoreInitializer />
      {/* Only include ContextDebugger when debug mode is enabled */}
      {/* <ContextDebugger /> */}
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </MusicPlayerProvider>
  );
};

export default DashboardLayout;
