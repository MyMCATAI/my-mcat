"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useProModal } from "@/hooks/use-pro-modal";
import { useEffect, useState } from "react";


declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'pricing-table-id': string;
        'publishable-key': string;
      };
    }
  }
}

export const ProModal = () => {
  const proModal = useProModal();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  // const tableKey=process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_KEY
  // const stripeAPIKey = process.env.NEXT_PUBLIC_STRIPE_API_KEY
   if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent className="lg:max-w-[1200px] bg-[#2d4778]">
          <stripe-pricing-table
            pricing-table-id="prctbl_1PrpLIAtAHX4wxMZOKvg5iZb"
            publishable-key="pk_test_51PTtB0AtAHX4wxMZJ8rT8lyenj8B7yFFtSKLIlnflc4cbWYokmW9VbULWOd7EcwgoNj33mexicFJd5mOCK8BEqDL008HE43E6Y"
            // client-reference-id="{{CLIENT_REFERENCE_ID}}"

          />
      </DialogContent>
    </Dialog>
  );
};