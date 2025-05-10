"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

// --- TEMPORARY HIATUS REDIRECT ---
// This effect will redirect all sign-up attempts to the hiatus page.
// Remove this block to restore sign-up functionality.
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/hiatus");
  }, [router]);
  return null;
}
// --- END HIATUS REDIRECT ---

/*
// To restore sign-up, revert to the original code below:
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <SignUp
      appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: '#001226',
          colorText: 'white',
          fontSize: '1rem',
          borderRadius: '0.5rem',
          colorNeutral: 'white',
          spacingUnit: '1.2rem',
        },
        elements: {
          cardBox: {
            border: '1px solid #5F7E92',
            width: '30rem',
            maxWidth: '100%'
          }
        }
      }}
    />
  );
}
*/