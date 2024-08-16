import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import 'katex/dist/katex.min.css';
import DOMPurify from 'dompurify';

// Import languages for syntax highlighting as needed
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);

interface ContentRendererProps {
  content: string;
  onLinkClick: (href: string, event: React.MouseEvent) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content, onLinkClick }) => {
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({node, inline, className, children, ...props}: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={tomorrow as { [key: string]: React.CSSProperties }}
              language={match[1]}
              PreTag="div"
              {...props as SyntaxHighlighterProps}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
        a({node, children, href, ...props}: any) {
          return (
            <a 
              href={href} 
              className="text-blue-400 hover:underline" 
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                onLinkClick(href || '', e);
              }}
              {...props}
            >
              {children}
            </a>
          )
        },
        img({node, alt, src, ...props}: any) {
          return <img src={src} alt={alt} className="max-w-full h-auto my-2" {...props} />
        }
      }}
      className="text-lg text-left text-white space-y-2"
    >
      {sanitizedContent}
    </ReactMarkdown>
  );
};

export default ContentRenderer;