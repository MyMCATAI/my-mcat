import { LandingNavbar } from "@/components/landing-navbar";
import Footer from "@/components/landingpage/Footer";

const LandingLayout = ({
    children
  }: {
    children: React.ReactNode;
  }) => {
    return (
      <main className="h-full bg-[#111827] overflow-auto">
        <div className="mx-auto h-full w-full">
        <LandingNavbar/>
          {children}
          <Footer/>
        </div>
      </main>
     );
  }
   
  export default LandingLayout;