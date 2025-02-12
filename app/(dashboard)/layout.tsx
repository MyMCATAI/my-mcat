'use client'

import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import ThemeInitializer from "@/components/home/ThemeInitializer";
import Script from 'next/script';
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useUserInfo } from "@/hooks/useUserInfo";

const DashboardLayoutContent = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { theme } = useTheme();
  const [backgroundImage, setBackgroundImage] = useState('');
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoading, isSubscribed } = useUserInfo();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && isSignedIn && !isLoading) {
      console.log('🎫 Subscription Status:', 
        isSubscribed ? 'GOLD or PREMIUM' : 'FREE'
      );
    }
  }, [isLoaded, isSignedIn, isLoading, isSubscribed]);

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

  if (!isLoaded || isLoading) {
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
}

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <MusicPlayerProvider>
      <Script
        src="https://tally.so/widgets/embed.js"
        strategy="lazyOnload"
      />
      <ThemeInitializer />
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </MusicPlayerProvider>
  </ThemeProvider>
);

export default DashboardLayout;
