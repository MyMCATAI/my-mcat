import { LandingNavbar } from "@/components/landing-navbar";
import Footer from "@/components/landingpage/Footer";
import { Analytics } from '@vercel/analytics/react';

const LandingLayout = ({
    children
  }: {
    children: React.ReactNode;
  }) => {
    return (
      <main className="h-full bg-white overflow-auto">
        <div className="mx-auto h-full w-full pt-14">
        <LandingNavbar/>
          {children}
          <Footer/>
        </div>
        <Analytics />
      </main>
     );
  }
   
  export default LandingLayout;