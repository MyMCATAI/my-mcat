import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MVPDialogProps {
  university: string;
}

const MVPDialog: React.FC<MVPDialogProps> = ({ university }) => {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{`${university}'s MVPs`}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4 text-gray-900">
        <p>Here are the standout performers from {university}:</p>
        <ul className="list-disc pl-5">
          <li>{"Season's Haul: 5250 Cupcakes"}</li>
          <li>Most Earned: Sarah Johnson</li>
          <li>Most Improvement: Emily Rodriguez</li>
          <li>Most Dedicated: Olivia Thompson</li>
        </ul>
        <p>These students have shown exceptional dedication and skill in CARs, embodying the spirit of the institution.</p>
      </div>
    </DialogContent>
  );
};

export default MVPDialog;
