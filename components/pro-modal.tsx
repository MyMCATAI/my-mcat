"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useProModal } from "@/hooks/use-pro-modal";
import React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const StripePricingTable = () => {
  const { userId } = useAuth();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return React.createElement("stripe-pricing-table", {
    "pricing-table-id": process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID,
    "publishable-key": process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    "client-reference-id":userId
  });
};



export const ProModal = () => {
  const proModal = useProModal();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
   if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent className="lg:max-w-[1200px] bg-[#2d4778]">
        <StripePricingTable />
      </DialogContent>
    </Dialog>
  );
};