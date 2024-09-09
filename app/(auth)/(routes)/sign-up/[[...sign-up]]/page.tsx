import { SignUp } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/themes";

export default function Page() {
  return (
    <SignUp
      appearance={{
        baseTheme: neobrutalism,
        variables: { colorPrimary: '#ec4e95', colorTextSecondary: 'white', colorBackground: 'white' },
        elements: {
          formButtonPrimary: {
            fontSize: 14,
            textTransform: 'none',
            backgroundColor: '#ed5d7d6d6ac',
            '&:hover, &:focus, &:active': {
              backgroundColor: 'white',
            },
          },
          card: {
            border: '5px solid #f05c90',
            borderRadius: '12px',
          },
          logoBox: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              maxHeight: '50px',
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