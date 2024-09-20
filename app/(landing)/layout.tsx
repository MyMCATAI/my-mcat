import { LandingNavbar } from "@/components/landing-navbar";
import Footer from "@/components/landingpage/Footer";
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  other: {
    'preload': '/landingpage/krungthep.ttf'
  }
};

const LandingLayout = ({
    children
  }: {
    children: React.ReactNode;
  }) => {
    return (
      <>
        <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
        <main className="h-full bg-white overflow-auto">
          <div className="mx-auto h-full w-full pt-14">
            <LandingNavbar/>
            {children}
            <Footer/>
          </div>
        </main>
      </>
     );
  }
   
  export default LandingLayout;