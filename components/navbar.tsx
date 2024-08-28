"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useProModal } from "@/hooks/use-pro-modal";
import { motion } from "framer-motion";
import axios from "axios";

export const Navbar = ({ subscription = "free" }: { subscription: string }) => {
  const pathname = usePathname();
  const ballerSectionRef = useRef(null);
  const proModal = useProModal();
  const [isLoading, setIsLoading] = useState(false);

  // Hiding navbar on test questions page
  if (pathname.includes('/test/testquestions')) {
    return null;
  }

  const handleBadgeClick = async () => {
    const isPro = subscription !== "free";
    
    if (isPro) {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/stripe"); // todo right now all customers are test customers, need to test with real
        
        window.location.href = response.data.url;
      } catch (error) {
        console.error("Error creating Stripe session:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      proModal.onOpen();
    }
  };
  
  const isPro = subscription !== "free";

  return (
    <>
      <nav className="flex items-center justify-between bg-transparent shadow-sm h-24 px-4">
        <Link href="/home" className="flex items-center space-x-4">
          <div className="flex flex-col">
            <span className="text-xl text-white">MyMCAT.ai</span>
          </div>
        </Link>
        <div className="flex items-center h-full">
          <div className="flex items-center space-x-4 mr-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge 
                variant={isPro ? "default" : "secondary"} 
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm font-medium",
                  isPro ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white" : "hover:bg-secondary-hover",
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                )}
                onClick={handleBadgeClick}
              >
                {isLoading ? "Loading..." : (isPro ? "Pro Plan" : "Upgrade to Pro")}
              </Badge>
            </motion.div>
            <UserButton afterSignOutUrl="/" />
          </div>
          <span
            ref={ballerSectionRef}
            className="flex items-start h-full bg-[#021226]"
            style={{
              clipPath:
                "polygon(100% 0%, 100% 51%, 100% 73%, 18% 72%, 11% 48%, 0 0)",
              transform: "translateY(3px)",
            }}
          >
            <p className="text-white ms-12 mt-4 pr-1 text-sm">
              designed by <br />&nbsp;&nbsp;&nbsp;&nbsp;a certified baller
            </p>
            <div className="mt-6">
              <Image
                src="/linkedin.svg"
                className="mx-3"
                alt="Kalypso Education"
                width={25}
                height={25}
              />
            </div>
            <div className="mt-5">
              <Link href="https://www.instagram.com/an0thermanicmonday/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/insta.svg"
                  className="mx-2 bg-[#007AFF] p-1 rounded-lg cursor-pointer"
                  alt="Instagram"
                  width={30}
                  height={30}
                />
              </Link>
            </div>
          </span>
        </div>
      </nav>
    </>
  );
};