import Link from 'next/link'
import { Metadata } from 'next'

// This would normally come from your database/CMS
const blogPosts = [
  { id: 1, title: 'Science Behind MyMCAT', slug: 'first-post', description: 'Description of first post' },
  { id: 2, title: 'Studying for the MCAT', slug: 'second-post', description: 'Description of second post' },
  { id: 3, title: 'I Hate Anki A Lot', slug: 'second-post', description: 'Description of second post' },
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
    <main aria-label="Blog content">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Main content area */}
          <article className="md:w-3/4 bg-[#212121] min-h-screen p-8">
            {children}
          </article>
          
          {/* Sidebar with post list */}
          <aside className="md:w-1/4 bg-[#171717] min-h-screen p-8">
            <div className="sticky top-8">
              <h2 className="text-xl font-bold mb-4 text-white">All Posts</h2>
              <nav aria-label="Blog posts navigation">
                <ul className="space-y-2">
                  {blogPosts.map((post) => (
                    <li key={post.id}>
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                        title={post.description}
                      >
                        {post.title}
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