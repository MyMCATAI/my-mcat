import { SignIn } from "@clerk/nextjs";
import {neobrutalism } from "@clerk/themes";

export default function Page() {
  return (
    <SignIn
      appearance={{
        baseTheme: neobrutalism,
        variables: { 
          colorPrimary: '#ef4781', 
          colorTextSecondary: 'white', 
          colorBackground: 'white', 
          colorNeutral: '#ef4781',
        },
        elements: {
          formButtonPrimary: {
            fontSize: 14,
            textTransform: 'none',
            backgroundColor: '#ed5d7d6d6ac',
            '&:hover, &:focus, &:active': {
              backgroundColor: 'black',
            },
          },
          logoBox: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              maxHeight: '60px', // Adjust this value as needed
            },

          }
        },
        layout: {
          logoImageUrl: "/cupcakelogo.png",
        },
      }}
    />
  );
}