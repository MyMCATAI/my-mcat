import React from 'react';
import { ExternalLink } from 'lucide-react';

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  url: string;
}

const SAMPLE_POSTS: BlogPost[] = [
  {
    title: "How to Approach MCAT Practice Tests: A Strategic Guide",
    excerpt: "Learn the most effective strategies for taking and reviewing MCAT practice tests. We break down the key differences between major test providers and how to maximize your learning from each attempt.",
    date: "Mar 15, 2024",
    readTime: "8 min read",
    url: "/blog/mcat-practice-tests-guide"
  },
  {
    title: "AAMC FL vs Third-Party Tests: What's the Difference?",
    excerpt: "A detailed comparison of AAMC Full Length exams and third-party practice tests. Understanding scoring differences, difficulty levels, and how to use each type effectively in your prep.",
    date: "Mar 10, 2024",
    readTime: "6 min read",
    url: "/blog/aamc-vs-third-party-tests"
  },
  {
    title: "The Perfect Practice Test Review Strategy",
    excerpt: "Master the art of reviewing your practice tests with our comprehensive guide. Learn how to identify patterns in your mistakes and turn them into opportunities for improvement.",
    date: "Mar 5, 2024",
    readTime: "10 min read",
    url: "/blog/practice-test-review-strategy"
  },
  {
    title: "Timing Strategies for MCAT Practice Tests",
    excerpt: "Develop effective timing strategies for each section of the MCAT. Learn how to pace yourself and when to guess vs. when to spend more time on challenging questions.",
    date: "Feb 28, 2024",
    readTime: "7 min read",
    url: "/blog/mcat-timing-strategies"
  },
  {
    title: "Making the Most of Your Final Month of Practice Tests",
    excerpt: "A week-by-week guide for your final month of MCAT preparation. Learn how to schedule your remaining practice tests and make the most of your review time.",
    date: "Feb 20, 2024",
    readTime: "9 min read",
    url: "/blog/final-month-practice-guide"
  }
];

const BlogPosts: React.FC = () => {
  return (
    <div 
      className="space-y-4 overflow-y-auto"
      style={{ 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {SAMPLE_POSTS.map((post, index) => (
        <div 
          key={index}
          className="p-4 bg-[--theme-reddit-color] rounded-lg shadow-md"
        >
          <div className="flex justify-between items-start">
            <h3 className="text-base font-medium text-blue-500 hover:underline mb-2 flex-grow">
              {post.title}
            </h3>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-[--theme-text-color] opacity-60 hover:opacity-100 transition-opacity"
            >
              <ExternalLink size={14} />
            </a>
          </div>
          
          <p className="text-sm text-[--theme-text-color] mb-2">
            {post.excerpt}
          </p>
          
          <div className="flex items-center text-xs text-gray-600">
            <span>{post.date}</span>
            <span className="mx-2">•</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogPosts; 