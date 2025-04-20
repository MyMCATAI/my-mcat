import type { ClerkOptions } from '@clerk/types';

// Session timeout configuration
export const clerkOptions: Partial<ClerkOptions> = {
  // Customize sign-in and sign-up URLs
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
};

// Export default config
export default clerkOptions; 