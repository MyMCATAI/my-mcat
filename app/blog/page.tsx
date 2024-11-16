import { getAllPosts } from '../../lib/blogapi'
import Link from 'next/link'

export default function BlogIndex() {
  const posts = getAllPosts()
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Latest Posts</h1>
      
      <div className="space-y-12">
        {posts.map((post) => (
          <article key={post.slug} className="space-y-4">
            <h2 className="text-2xl font-semibold">
              <Link 
                href={`/blog/${post.slug}`}
                className="hover:text-blue-400"
              >
                {post.title}
              </Link>
            </h2>
            <div className="flex gap-4 text-sm text-gray-400">
              <time dateTime={post.date}>{post.date}</time>
              <span>By {post.author}</span>
            </div>
            <p className="text-gray-300">{post.description}</p>
          </article>
        ))}
      </div>
    </div>
  )
} 