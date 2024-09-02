'use client'

import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import ThemeInitializer from "@/components/home/ThemeInitializer";

const checkSubscription = async () => {
  try {
    const response = await fetch('/api/subscription');
    if (!response.ok) {
      throw new Error('Failed to fetch subscription status');
    }
    const data = await response.json();
    return data.isPro;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};

const DashboardLayoutContent = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { theme } = useTheme();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const checkProStatus = async () => {
      const proStatus = await checkSubscription();
      setIsPro(proStatus);
    };
    checkProStatus();
  }, []);

  const backgroundImage = theme === 'sakuraTrees' 
    ? 'url(/sakuratreesbackground.png)'
    : 'url(/vaporandnightbackground.png)';

  const subscription = isPro ? "pro" : "free";

  console.log('Current theme:', theme);
  console.log('Background image:', backgroundImage);

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
    <ThemeInitializer />
    <DashboardLayoutContent>{children}</DashboardLayoutContent>
  </ThemeProvider>
);

export default DashboardLayout;