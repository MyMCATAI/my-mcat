import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface UpdateNotificationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpdateNotificationPopup: React.FC<UpdateNotificationPopupProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <DialogContent
          className="bg-[--theme-text-color] text-center p-8 bg-[--theme-leaguecard-color] border border-[--theme-border-color] rounded-lg p-6"
          closeButtonClassName="text-[--theme-text-color] hover:text-[--theme-text-color] focus:ring-[--theme-text-color]"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[--theme-text-color] text-center mb-4">
              🚧 Site Updates in Progress 🚧
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-[--theme-text-color]">
            <p>
              We&apos;re currently working on exciting new features for MyMCAT
              AI!
            </p>
            <p>Our code monkeys are hard at work adding:</p>
            <ul className="list-disc list-inside">
              <li>Personalized study schedules</li>
              <li>New study content (readings, videos, etc.)</li>
              <li>Thousands of flashcards</li>
              <li>Advanced analytics</li>
              <li>And more!</li>
            </ul>
            <p className="italic mt-4">
              Please bear with us and submit any feedback if you notice bugs.
              Your input helps us improve!
            </p>
          </div>
          <DialogFooter className="mt-6">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-[--theme-border-color] text-[--theme-text-color] hover:bg-[--theme-border-color-hover]"
            >
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};

export default UpdateNotificationPopup;
