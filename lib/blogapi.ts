import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'app/blog/_posts')

export function getAllPosts() {
  // Get file names under /blog/posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPosts = fileNames
    .filter(fileName => fileName.endsWith('.mdx'))
    .map(fileName => {
      // Remove ".mdx" from file name to get slug
      const slug = fileName.replace(/\.mdx$/, '')

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')

      // Use gray-matter to parse the post metadata section
      const { data } = matter(fileContents)

      return {
        slug,
        title: data.title,
        date: data.date,
        author: data.author,
        description: data.description,
      }
    })

  // Sort posts by date
  return allPosts.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 10)
}

export function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const { data, content } = matter(fileContents)

  return {
    slug,
    content,
    title: data.title,
    date: data.date,
    author: data.author,
    description: data.description,
  }
} 