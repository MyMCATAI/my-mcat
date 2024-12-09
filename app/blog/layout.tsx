import Link from 'next/link'
import { Metadata } from 'next'
import { BlogNavbar } from './BlogNavbar';
import { BlogSidebar } from './BlogSidebar'
import MDXLayout from './mdx-provider'

// This would normally come from your database/CMS

// Add metadata
export const metadata: Metadata = {
  title: 'Blog | My MCAT',
  description: 'Learn about MCAT preparation strategies, study tips, and exam insights',
  openGraph: {
    title: 'Blog | My MCAT',
    description: 'Learn about MCAT preparation strategies, study tips, and exam insights',
    type: 'website',
    url: 'https://mymcat.ai/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | My MCAT',
    description: 'Learn about MCAT preparation strategies, study tips, and exam insights',
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BlogNavbar />
      <main aria-label="Blog content" className="bg-[#f6f6f6]">
        <div className="max-w-[90rem] mx-auto px-4 py-12">
          <div className="flex flex-col-reverse md:flex-row gap-8">
            {/* Main content area */}
            <article className="md:w-3/4 bg-white border border-gray-200 min-h-screen rounded-2xl shadow-lg">
              <div className="max-w-[60rem] mx-auto px-6 py-16">
                <div className="prose max-w-none mx-auto
                  prose-h1:text-[3rem] prose-h1:font-bold prose-h1:mb-8 prose-h1:text-center prose-h1:text-gray-900
                  prose-h2:text-[1.5rem] prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-2 prose-h2:text-center prose-h2:text-gray-900
                  prose-strong:text-gray-900 prose-strong:font-bold
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-[1.125rem] prose-p:mx-auto prose-p:max-w-[45rem] prose-p:mb-6 prose-p:first-line:indent-8
                  prose-li:text-gray-700 prose-li:leading-relaxed prose-li:text-[1.125rem] prose-li:mx-auto prose-li:max-w-[45rem]
                  prose-ul:mx-auto prose-ul:max-w-[45rem]
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-700
                  prose-blockquote:border-blue-600 prose-blockquote:text-gray-700
                  prose-code:text-blue-600 prose-pre:bg-gray-100">
                  <MDXLayout>
                    {children}
                  </MDXLayout>
                </div>
              </div>
            </article>
            
            <BlogSidebar />
          </div>
        </div>
      </main>
    </>
  )
} 