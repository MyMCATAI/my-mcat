import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <SignIn
      afterSignInUrl="/ankiclinic"
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
            border: '1px solid rgb(66, 150, 205)',
            width: '28rem',
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