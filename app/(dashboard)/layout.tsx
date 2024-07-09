import { Navbar } from "@/components/navbar";
import { checkSubscription } from "@/lib/subscription";
import { getApiLimitCount } from "@/lib/api-limit";

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const apiLimitCount = await getApiLimitCount();
  const isPro = await checkSubscription();

  return ( 
    <div className="h-full relative">
      
        <Navbar isPro={isPro}/>
        <main className="w-full pb-10">
        {children}
      </main>
    </div>
   );
}
 
export default DashboardLayout;