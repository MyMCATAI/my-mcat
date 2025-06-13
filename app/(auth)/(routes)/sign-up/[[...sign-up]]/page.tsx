"use client";

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
          borderRadius: '1rem',
          colorNeutral: 'white',
          spacingUnit: '1.2rem',
        },
        elements: {
          cardBox: {
            border: '1px solid #5F7E92',
            width: '30rem',
            maxWidth: '100%'
          },
          card: {
            border: 'none',
            boxShadow: 'none'
          }
        }
      }}
    />
  );
}