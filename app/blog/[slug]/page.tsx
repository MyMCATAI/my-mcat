import { getAllPosts, getPostBySlug } from '../../../lib/blogapi'
import { MDXRemote } from 'next-mdx-remote/rsc'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function Post({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  
  return (
    <article className="prose prose-invert max-w-none">
      <h1>{post.title}</h1>
      <div className="flex gap-4 text-sm text-gray-400">
        <time dateTime={post.date}>{post.date}</time>
        <span>By {post.author}</span>
      </div>
      <MDXRemote source={post.content} />
    </article>
  )
} 