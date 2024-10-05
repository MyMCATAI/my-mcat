'use client'

import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import ThemeInitializer from "@/components/home/ThemeInitializer";
import Script from 'next/script';

const checkSubscription = async (): Promise<boolean> => {
  // Implement your subscription check logic here
  // For now, we'll return a mock value
  return Promise.resolve(false);
};

const DashboardLayoutContent = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { theme } = useTheme();
  const [isPro, setIsPro] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const proStatus = await checkSubscription();
        setIsPro(proStatus);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setIsPro(false); // Default to free if there's an error
      }
    };
    checkProStatus();

    const updateBackgroundImage = () => {
      if (theme === 'sakuraTrees') {
        setBackgroundImage('url(/sakuratreesbackground.png)');
      } else if (theme === 'sunsetCity') {
        setBackgroundImage('url(/sunsetcitybackground.png)');
      } else {
        setBackgroundImage('url(/vaporandnightbackground.png)');
      }
    };

    updateBackgroundImage();
    window.addEventListener('resize', updateBackgroundImage);

    return () => window.removeEventListener('resize', updateBackgroundImage);
  }, [theme]);

  const subscription = isPro ? "pro" : "free";


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
    <Script
      src="https://tally.so/widgets/embed.js"
      strategy="lazyOnload"
    />
    <ThemeInitializer />
    <DashboardLayoutContent>{children}</DashboardLayoutContent>
  </ThemeProvider>
);

export default DashboardLayout;