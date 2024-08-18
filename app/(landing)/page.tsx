import { LandingHero } from "@/components/landing-hero";
import CheckListing from "../../components/landingpage/CheckListing";
import Faqs from "../../components/landingpage/Faqs";
import Mission from "../../components/landingpage/Mission";

const LandingPage = () => {
  return (
    <div className="h-full w-full bg-[#2A507E]">
      <LandingHero />
      <div id="mission">
        <Mission />
      </div>
      <CheckListing />
      <Faqs />      
    </div>
  ); 
};

export default LandingPage;