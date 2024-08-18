
import { LandingHero } from "@/components/landing-hero";
import CheckListing from "../../components/landingpage/CheckListing";
import Faqs from "../../components/landingpage/Faqs";
import Methodlogy from "../../components/landingpage/Methodlogy";


const LandingPage = () => {
  return (
    <div className="h-full w-full bg-[#2A507E]">
     
      <LandingHero />
      <Methodlogy/>
      <CheckListing />
      <Faqs />      
    </div>
  ); 
};

export default LandingPage;
