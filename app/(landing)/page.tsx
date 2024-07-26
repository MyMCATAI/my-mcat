
import { LandingHero } from "@/components/landing-hero";
import { LandingContent } from "@/components/landing-content";
import Youtube from "../../components/landingpage/Youtube";
import CheckListing from "../../components/landingpage/CheckListing";
import Faqs from "../../components/landingpage/Faqs";
import Testimonials from "../../components/landingpage/Testimonials";
import Methodlogy from "../../components/landingpage/Methodlogy";


const LandingPage = () => {
  return (
    <div className="h-full w-full bg-[#2A507E]">
     
      <LandingHero />
      <Methodlogy/>
      <Testimonials/>
      <Youtube />
      <CheckListing />
      <Faqs />
      {/* <LandingContent /> */}
      
    </div>
  ); 
};

export default LandingPage;
