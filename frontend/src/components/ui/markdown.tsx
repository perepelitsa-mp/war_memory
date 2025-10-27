'use client'

import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  content: string
  className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      className={cn('prose prose-memorial max-w-none', className)}
      components={{
        // Customize heading styles
        h1: ({ node, ...props }) => (
          <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-xl font-semibold mb-3 mt-5" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-lg font-semibold mb-2 mt-4" {...props} />
        ),

        // Customize paragraph
        p: ({ node, ...props }) => (
          <p className="mb-4 leading-relaxed" {...props} />
        ),

        // Customize lists
        ul: ({ node, ...props }) => (
          <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="leading-relaxed" {...props} />
        ),

        // Customize links
        a: ({ node, ...props }) => (
          <a
            className="text-ribbon-orange underline hover:text-ribbon-orange/80 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),

        // Customize blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-ribbon-orange pl-4 italic my-4 text-muted-foreground"
            {...props}
          />
        ),

        // Customize code blocks
        code: ({ node, className, children, ...props }) => {
          const isInline = !className
          if (isInline) {
            return (
              <code
                className="bg-muted rounded px-1.5 py-0.5 text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            )
          }
          return (
            <code
              className="block bg-muted rounded p-4 overflow-x-auto text-sm font-mono my-4"
              {...props}
            >
              {children}
            </code>
          )
        },

        // Customize horizontal rule
        hr: ({ node, ...props }) => (
          <hr className="my-8 border-t-2 border-border" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
