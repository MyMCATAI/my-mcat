import Link from 'next/link'
import { Metadata } from 'next'

// This would normally come from your database/CMS
const blogPosts = [
  { id: 1, title: 'Optimizing Student Scores on the Medical College Admissions Test', slug: 'first-post', description: 'The scientific basis for MyMCAT.' },
  { id: 2, title: 'Resource List for the MCAT', slug: 'second-post', description: 'Useful resources for the MCAT.' },
]

// Add metadata
export const metadata: Metadata = {
  title: 'Blog | My MCAT',
  description: 'Learn about MCAT preparation strategies, study tips, and exam insights',
  openGraph: {
    title: 'Blog | My MCAT',
    description: 'Learn about MCAT preparation strategies, study tips, and exam insights',
    type: 'website',
    url: 'https://yourdomain.com/blog',
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
    <main aria-label="Blog content" className="bg-[#121212]">
      <div className="max-w-[90rem] mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content area */}
          <article className="md:w-3/4 bg-[#212121] min-h-screen rounded-2xl shadow-xl">
            <div className="max-w-[60rem] mx-auto px-6 py-16">
              <div className="prose prose-invert max-w-none mx-auto
                prose-h1:text-5xl prose-h1:font-bold prose-h1:mb-8 prose-h1:text-center
                prose-h2:text-4xl prose-h2:font-bold prose-h2:mt-16 prose-h2:mb-2 prose-h2:text-center
                prose-strong:text-gray-400 prose-strong:font-normal prose-strong:text-xl prose-strong:block prose-strong:text-center prose-strong:mb-8
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-lg prose-p:mx-auto prose-p:max-w-[45rem] prose-p:mb-16
                prose-li:text-gray-300 prose-li:leading-relaxed prose-li:text-lg prose-li:mx-auto prose-li:max-w-[45rem]
                prose-ul:mx-auto prose-ul:max-w-[45rem]
                prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
                prose-blockquote:border-blue-400 prose-blockquote:text-gray-300
                prose-code:text-blue-300 prose-pre:bg-[#2a2a2a]">
                {children}
              </div>
            </div>
          </article>
          
          {/* Sidebar with post list */}
          <aside className="md:w-1/4 bg-[#171717] min-h-screen rounded-2xl p-8 shadow-xl">
            <div className="sticky top-8">
              <h2 className="text-2xl font-bold mb-8 text-white border-b border-gray-700 pb-4">
                All Posts
              </h2>
              <nav aria-label="Blog posts navigation">
                <ul className="space-y-6">
                  {blogPosts.map((post) => (
                    <li key={post.id}>
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="group block"
                        title={post.description}
                      >
                        <h3 className="text-lg text-blue-400 group-hover:text-blue-300 transition-colors duration-200">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {post.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
} 