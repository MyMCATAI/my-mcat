import { LandingNavbar } from "@/components/landing-navbar";
import Footer from "@/components/landingpage/Footer";
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'MyMCAT',
  description: 'Discover how My MCAT can revolutionize your MCAT preparation experience.',
  keywords: 'MCAT prep, MCAT AI, free MCAT course, MCAT practice questions, UWorld MCAT, MyMCAT',
  openGraph: {
    title: 'For MCAT Prep, You\'re Better With Us',
    description: 'No more boring, no more guessing, no more wasting time. Join MyMCAT and transform your study experience.',
    images: [
      {
        url: '/landing-preview.png',
        width: 1200,
        height: 630,
        alt: 'My MCAT Landing Page Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My MCAT - Innovative MCAT Preparation',
    description: 'Join My MCAT and transform your study experience. Boost your scores with our gamified learning platform.',
    images: ['/landing-preview.png'],
  },
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