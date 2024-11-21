import { getAllPosts, getPostBySlug } from '../../../lib/blogapi'
import { MDXRemote } from 'next-mdx-remote/rsc'
import HighlightableText from '../components/HighlightableText'
import { FaLinkedin, FaInstagram } from 'react-icons/fa'
import { BiSolidError } from "react-icons/bi"
import Link from 'next/link'

const components = {
  HighlightableText
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function Post({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  
  return (
    <article className="prose prose-invert max-w-none relative mx-4">
      <h1 className="text-center">{post.title}</h1>
      <div className="flex flex-col items-center justify-center gap-2rem text-lg text-black">
        <time dateTime={post.date}>{post.date}</time>
        <span className="flex items-center gap-2rem">
          By Prynce Karki 
          <Link href="https://www.linkedin.com/in/your-linkedin" target="_blank" rel="noopener noreferrer" className="ml-2rem">
            <FaLinkedin 
              size={20} 
              className="transition-colors ml-3 duration-200 hover:text-blue-400"
            />
          </Link>
          <Link href="https://www.instagram.com/an0thermanicmonday/" target="_blank" rel="noopener noreferrer">
            <FaInstagram 
              size={20} 
              className="transition-colors duration-200 hover:text-pink-400"
            />
          </Link>
        </span>
        {params.slug === 'first-post' && (
          <div className="flex items-center mt-4 gap-2rem text-yellow-500 group relative">
            <BiSolidError size={20} />
            <span className="text-sm">This article is under construction</span>
          </div>
        )}
      </div>
      <MDXRemote 
        source={post.content} 
        components={components}
      />
    </article>
  )
} 