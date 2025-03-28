// components/home/LoadingSpinner.tsx
import { memo } from "react";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = memo(({ message = "Loading..." }: LoadingSpinnerProps) => (
  <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-[9999]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sky-500 mx-auto mb-4" />
      <p className="text-sky-300 text-xl">{message}</p>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner'; 