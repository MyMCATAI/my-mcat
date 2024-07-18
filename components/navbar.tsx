"use client";

import Image from 'next/image';
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SubscriptionButton } from './subscription-button';

export const Navbar = ({
  isPro = false
}: {
  isPro: boolean;
}) => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between bg-white shadow-sm h-24 px-6">
      <div className="flex items-center space-x-4">
        <Image src="/logo.png" alt="Kalypso Education" width={48} height={48} />
        <div className="flex flex-col">
          <span className="text-lg font-bold text-blue-900">KALYPSO EDUCATION</span>
          <span className="text-xs text-gray-500">mymcat.ai</span>
        </div>
      </div>
      <div className="flex items-end h-full">
        <div className="flex h-1/2">
          {[
            { href: "/dashboard", label: "Acquire" },
            { href: "/apply", label: "Apply" },
            { href: "/quiz", label: "quiz" },
            { href: "/review", label: "Review" },
            // TODO add auth check so this only appears for specific users
            { href: "/admin", label: "Admin" },

          ].map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-end justify-center px-6 pb-2 font-medium text-sm cursor-pointer hover:text-white hover:bg-[#001326] transition h-full",
                pathname === link.href ? "bg-[#001326] text-white" : "text-zinc-400",
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
      </div>
    </nav>
  );
}