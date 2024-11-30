import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
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
  onLinkClick?: (href: string, event: React.MouseEvent) => void;
  imageWidth?: string;
  className?: string;
  isFullScreen?: boolean;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content, onLinkClick, imageWidth = '100%', className, isFullScreen }) => {
  const sanitizedContent = DOMPurify.sanitize(content);

  const generateAwsS3Url = (imageName: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_AWS_S3_URL || 'https://my-mcat.s3.us-east-2.amazonaws.com/';
    return `${baseUrl}content/${encodeURIComponent(imageName)}`;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
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
                onLinkClick && onLinkClick(href || '', e);
              }}
              {...props}
            >
              {children}
            </a>
          )
        },
        img({node, alt, src, ...props}: any) {
          const awsImageUrl = generateAwsS3Url(src);
          return <img 
            src={awsImageUrl} 
            alt={alt} 
            className="h-auto my-2" 
            style={{ maxWidth: imageWidth }}
            {...props} 
          />
        },
        em({node, children, ...props}: any) {
          return <em className="italic" {...props}>{children}</em>
        },
        strong({node, children, ...props}: any) {
          return <strong className="font-bold" {...props}>{children}</strong>
        },
        u({node, children, ...props}: any) {
          return <u className="underline" {...props}>{children}</u>
        },
        div({node, children, ...props}: any) {
          return <div className="my-2" {...props}>{children}</div>
        }
      }}
      className={`text-lg text-left space-y-2 ${
        isFullScreen ? 'text-black' : 'text-[--theme-text-color]'
      }`}
    >
      {sanitizedContent}
    </ReactMarkdown>
  );
};

export default ContentRenderer;