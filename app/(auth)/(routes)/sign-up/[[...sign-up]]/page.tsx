import { Waitlist } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <Waitlist
      afterJoinWaitlistUrl="https://discord.gg/c8VjPeKc"
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
            border: '1px solid #5F7E92'
          }
        }
      }}
    />
  );
}