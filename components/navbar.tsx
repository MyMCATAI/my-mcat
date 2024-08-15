"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SubscriptionButton } from "./subscription-button";

export const Navbar = ({ isPro = false }: { isPro: boolean }) => {
  const pathname = usePathname();
  const ballerSectionRef = useRef(null);

  // Hiding navbar on test questions page
  if (pathname.includes('/test/testquestions')) {
    return null;
  }

  return (
    <>
      <nav className="flex items-center justify-between bg-transparent shadow-sm h-24 ps-4">
        <Link href="/home" className="flex items-center space-x-4">
        <Image src="/logo.png" alt="Kalypso Education" width={48} height={48} />
        <div className="flex flex-col">
          <span className="text-xl text-white pl-3">myMCAT.ai</span>
        </div>
      </Link>
        <div className="flex items-end h-full">
          <div className="flex h-full items-center ml-4 space-x-4 transform -translate-y-2">
            <UserButton afterSignOutUrl="/" />
          </div>
          <span
            ref={ballerSectionRef}
            className="flex items-start h-full ml-4 pl-2 bg-[#021226]"
            style={{
              clipPath:
                "polygon(100% 0%, 100% 51%, 100% 73%, 18% 72%, 11% 48%, 0 0)",
              transform: "translateY(3px)", // Add this line to move the polygon down by 3px
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
              <Image
                src="/insta.svg"
                className="mx-2 bg-[#007AFF] p-1 rounded-lg"
                alt="Kalypso Education"
                width={30}
                height={30}
              />
            </div>
          </span>
        </div>
      </nav>
    </>
  );
};