import { SignIn } from "@clerk/nextjs";
import { dark, neobrutalism } from "@clerk/themes";

export default function Page() {
  return (
    <SignIn
      appearance={{
        baseTheme: neobrutalism,
        variables: { colorPrimary: '#ef4781', colorTextSecondary: 'white', colorBackground: 'white' },
        elements: {
          formButtonPrimary: {
            fontSize: 14,
            textTransform: 'none',
            backgroundColor: '#ed5d7d6d6ac',
            '&:hover, &:focus, &:active': {
              backgroundColor: 'black',
            },
          },
          card: {
            border: '3px solid #f05c90',
            borderRadius: '12px', // Add this line to round the edges
          },
          logoBox: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              maxHeight: '50px', // Adjust this value as needed
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