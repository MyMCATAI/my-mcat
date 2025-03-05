// Configuration for the AnkiClinic page
// This file contains Next.js configuration options

// Force dynamic rendering to prevent "window is not defined" errors
// This ensures the page is rendered at request time, not build time
export const dynamic = 'force-dynamic';

// Disable static generation for this route
export const generateStaticParams = () => {
  return [];
};

// Set revalidation time (optional)
export const revalidate = 0; // revalidate at every request