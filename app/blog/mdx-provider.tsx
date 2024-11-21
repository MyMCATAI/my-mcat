'use client'

import { MDXProvider } from '@mdx-js/react'

const components = {
  div: (props: any) => <div {...props} />,
  p: (props: any) => <p {...props} />,
  // Add other HTML elements you want to customize
}

export default function MDXLayout({ children }: { children: React.ReactNode }) {
  return (
    <MDXProvider components={components}>
      {children}
    </MDXProvider>
  )
} 