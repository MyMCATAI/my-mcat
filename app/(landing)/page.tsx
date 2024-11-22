import dynamic from 'next/dynamic';
import LandingHero from "@/components/landing-hero";
import CheckListing from "../../components/landingpage/CheckListing";
import Faqs from "../../components/landingpage/Faqs";
import Mission from "../../components/landingpage/Mission";
import ProductWrapper from '@/components/ProductWrapper';

const LandingPage = () => {
  return (
    <div className="w-full bg-[#12233c] relative">
      <LandingHero />
      <div className="relative z-10">
        <ProductWrapper />
      </div>
      <div id="mission" className="relative z-20">
        <Mission />
      </div>
      <div className="relative z-10 mt-[-100px] pt-[100px] bg-[#12233c]">
        <CheckListing />
        <Faqs />      
      </div>
    </div>
  ); 
};

export default LandingPage;