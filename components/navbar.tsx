"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SubscriptionButton } from "./subscription-button";

export const Navbar = ({ isPro = false }: { isPro: boolean }) => {
  const pathname = usePathname();

  return (
    <>
   
    <nav className="flex items-center justify-between bg-[#0E2247] shadow-sm h-24 ps-6">
      <div className="flex items-center space-x-4">
        <Image src="/logo.png" alt="Kalypso Education" width={48} height={48} />
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white">myMCAT.ai</span>
          {/* <span className="text-xs text-gray-500">mymcat.ai</span> */}
        </div>
      </div>
      <div className="flex items-end h-full">
        <div className="flex h-1/2">
          {[
            // { href: "/home", label: "Home" },
            { href: "/calendar", label: "Calendar" },
            // { href: "/dashboard", label: "Acquire" },
            // { href: "/apply", label: "Apply" },
            { href: "/test", label: "Test" },
            // { href: "/review", label: "Review" },
            // { href: "/test", label: "Test" },
            // TODO add auth check so this only appears for specific users
            { href: "/admin", label: "Admin" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-end justify-center px-6 pb-2 font-medium text-sm cursor-pointer hover:text-white hover:bg-[#001326] transition h-full",
                pathname === link.href
                  ? "bg-[#001326] text-white"
                  : "text-zinc-400"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex h-full items-center ml-6 space-x-4">
          <Search className="text-gray-500" size={20} />
          <UserButton afterSignOutUrl="/" />
          <SubscriptionButton isPro={isPro} />
        </div>
        <span
          className="flex  items-start h-full ml-6  bg-[#021226] "
          style={{
            clipPath:
              "polygon(100% 0%, 100% 51%, 100% 73%, 18% 72%, 11% 48%, 0 0)",
          }}
        >
          <p className="text-white ms-12 mt-2 text-md">
            designed by <br />a certified baller
          </p>
          <div className="mt-3">
            <Image
              src="/linkedin.svg"
              className="mx-3 "
              alt="Kalypso Education"
              width={30}
              height={30}
            />
          </div>
          <div className="mt-3">
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
