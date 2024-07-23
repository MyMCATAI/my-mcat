import { LandingNavbar } from "@/components/landing-navbar";
import { LandingHero } from "@/components/landing-hero";
import { LandingContent } from "@/components/landing-content";
import Youtube from "../../components/landingpage/Youtube";
import CheckListing from "../../components/landingpage/CheckListing";
import Faqs from "../../components/landingpage/Faqs";
import Testimonials from "../../components/landingpage/Testimonials";
import Methodlogy from "../../components/landingpage/Methodlogy";
import Footer from "../../components/landingpage/Footer";

const LandingPage = () => {
  return (
    <div className="h-full w-full bg-[#2A507E]">
      <LandingNavbar />
      <LandingHero />
      <Methodlogy/>
      <Testimonials/>
      <Youtube />
      <CheckListing />
      <Faqs />
      {/* <LandingContent /> */}
      <Footer/>
    </div>
  );
};

export default LandingPage;
