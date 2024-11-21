'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'

type BlogPost = {
  id: number
  title: string
  slug: string
  description: string
  section: 'MCAT Prep' | 'Application Prep' | 'Random BS'
  subsections?: {
    title: string
    slug: string
    description: string
  }[]
}

const blogPosts: BlogPost[] = [
  { 
    id: 1, 
    title: 'Optimizing Student Scores on the Medical College Admissions Test', 
    slug: 'first-post', 
    description: 'The scientific basis for MyMCAT.',
    section: 'MCAT Prep'
  },
  { 
    id: 2, 
    title: 'Tier List for the MCAT', 
    slug: 'second-post', 
    description: 'Useful resources for the MCAT.',
    section: 'Random BS'
  },
  { 
    id: 3, 
    title: 'CARs Strategy Guide', 
    slug: 'best-cars-strategy', 
    description: 'A comprehensive guide to mastering the CARS section.',
    section: 'MCAT Prep',
    subsections: [
      {
        title: '1. How To Read A CARs Passage',
        slug: 'best-cars-strategy',
        description: 'Master the scaffolding technique'
      },
      {
        title: '2. How To Answer CARs Questions',
        slug: 'how-to-answer-cars-questions',
        description: 'Strategies for different question types'
      },
      {
        title: '3. How To Use AI To Help',
        slug: 'cars-ai-help',
        description: 'Leverage AI tools effectively'
      }
    ]
  },
]

export function BlogSidebar() {
  const pathname = usePathname()
  const currentSlug = pathname?.split('/').pop()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
  // Find the section of the current post
  const currentPost = blogPosts.find(post => post.slug === currentSlug)
  const currentSection = currentPost?.section

  // Set the current section to be initially expanded
  useEffect(() => {
    if (currentSection) {
      setExpandedSection(currentSection)
    }
  }, [currentSection])

  const sections = ['MCAT Prep', 'Application Prep', 'Random BS']

  return (
    <aside className="md:w-1/4 bg-[#E6E3E3] min-h-screen rounded-2xl p-8 shadow-xl">
      <div className="sticky top-8">
        <h2 className="text-2xl font-bold mb-8 text-black border-b border-gray-400 pb-4">
          Blog Categories
        </h2>
        <nav aria-label="Blog posts navigation">
          {sections.map((section) => (
            <div key={section} className="mb-6">
              <button
                onClick={() => setExpandedSection(expandedSection === section ? null : section)}
                className="flex items-center w-full text-left text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-300"
                aria-expanded={expandedSection === section}
              >
                <div className="transform transition-transform duration-300 ease-in-out">
                  {expandedSection === section ? (
                    <ChevronDown className="w-5 h-5 mr-2" />
                  ) : (
                    <ChevronRight className="w-5 h-5 mr-2" />
                  )}
                </div>
                {section}
              </button>
              
              <div className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${expandedSection === section ? 'max-h-[31.25rem] opacity-100' : 'max-h-0 opacity-0'}
              `}>
                <ul className="mt-4 ml-7 space-y-4">
                  {blogPosts
                    .filter(post => post.section === section)
                    .map((post) => (
                      <li 
                        key={post.id}
                        className={`transform transition-all duration-300 ease-in-out ${
                          currentSlug === post.slug ? 'bg-white/50 rounded-lg' : ''
                        }`}
                      >
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="group block p-2"
                          title={post.description}
                        >
                          <h3 className={`text-lg font-medium transition-colors duration-300 ${
                            currentSlug === post.slug 
                              ? 'text-blue-600'
                              : 'text-gray-900 group-hover:text-gray-700'
                          }`}>
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-700 mt-1 group-hover:text-gray-800 transition-colors duration-300">
                            {post.description}
                          </p>
                        </Link>
                        {post.subsections && (
                          <div className={`mt-2 ml-4 space-y-2 transition-all duration-300 ${
                            currentSlug && ['best-cars-strategy', 'how-to-answer-cars-questions', 'cars-ai-help'].includes(currentSlug)
                              ? 'block'
                              : 'hidden'
                          }`}>
                            {post.subsections.map((subsection, index) => (
                              <Link 
                                key={index}
                                href={`/blog/${subsection.slug}`}
                                className={`block p-2 rounded-lg transition-colors duration-300 ${
                                  currentSlug === subsection.slug 
                                    ? 'bg-white/75 text-blue-600'
                                    : 'hover:bg-white/25'
                                }`}
                              >
                                <h4 className="text-xs font-medium text-gray-800">{subsection.title}</h4>
                              </Link>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </nav>
        
        <Link 
          href="/"
          className="mt-8 block w-full text-center py-2 px-4 bg-black hover:bg-gray-500 text-white rounded-lg transition-colors duration-300"
        >
          Return Home
        </Link>
      </div>
    </aside>
  )
} 