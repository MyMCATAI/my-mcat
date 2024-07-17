import { Navbar } from "@/components/navbar";
import { checkSubscription } from "@/lib/subscription";
import { getBio } from "@/lib/user-info";

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const userBio = await getBio();
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