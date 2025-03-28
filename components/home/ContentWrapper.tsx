// components/home/ContentWrapper.tsx
import { memo } from "react";
import type { ReactNode } from "react";

interface ContentWrapperProps {
  children: ReactNode;
}

export const ContentWrapper = memo(({ children }: ContentWrapperProps) => (
  <div className="w-full px-[2rem] lg:px-[2.7rem] xl:px-[7rem] overflow-visible">
    <div className="text-[--theme-text-color] flex gap-[1.5rem] overflow-visible">
      {children}
    </div>
  </div>
));

ContentWrapper.displayName = 'ContentWrapper'; 