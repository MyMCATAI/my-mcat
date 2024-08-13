import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Test Questions',
}

export default function TestQuestionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}