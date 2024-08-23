import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton = () => (
    <div className="space-y-4">
      
      <Skeleton className="h-[430px] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );