import { Navbar } from "@/components/navbar";
import { checkSubscription } from "@/lib/subscription";
import { getBio } from "@/lib/user-info";

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const isPro = await checkSubscription();
  const subscription = isPro ? "pro":"free"
  return ( 
    <div className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/vaporandnightbackground.png)'}}>
        <Navbar subscription={subscription}/>
        <main className="w-full pb-10">
        {children}
      </main>
    </div>
   );
}
 
export default DashboardLayout;