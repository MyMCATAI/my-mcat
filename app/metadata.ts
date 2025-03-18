//app/metadata.ts
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mymcat.ai'),
  title: 'MyMCAT',
  description: 'MCAT preparation made simple',
  keywords: 'AI MCAT prep, adaptive learning technology, high-tech medical education, active learning platform, personalized MCAT AI, real-time adaptation, medical school admission, learning analytics, CARS mastery, Fee Assistance Program',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'MyMCAT - AI-Powered Active Learning That Adapts in Real-Time',
    description: 'Beyond passive videos: Our high-tech AI platform actively analyzes your performance, adapts your study plan, and transforms how you prepare for medicine—building both knowledge and narrative competence.',
    images: [
      {
        url: '/knowledge.png',
        width: 1200,
        height: 630,
        alt: 'MyMCAT AI-Powered Adaptive Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyMCAT - High-Tech, Active & Adaptive: The AI Revolution in MCAT Prep',
    description: 'Our AI actively tracks your performance, adapts your resources in real-time, and integrates trusted tools like Anki and UWorld—creating a high-tech learning experience that evolves with you.',
    images: ['/knowledge.png'],
  },
  verification: {
    google: 'F6e4Rh-tPmtWbb_Ij-lgHvb2cXGQjy_h-UNxh9E-9Xc',
  },
  alternates: {
    canonical: 'https://www.mymcat.ai',
  },
} 