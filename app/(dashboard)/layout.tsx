import { Navbar } from "@/components/navbar";
import { checkSubscription } from "@/lib/subscription";
import { getBio } from "@/lib/user-info";

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const isPro = await checkSubscription();

  return ( 
    <div className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/background.png)'}}>
        <Navbar isPro={isPro}/>
        <main className="w-full pb-10">
        {children}
      </main>
    </div>
   );
}
 
export default DashboardLayout;