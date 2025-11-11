import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                // Style headers
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold mt-3 mb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold mt-2 mb-2">{children}</h3>
                ),
                // Style paragraphs
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                ),
                // Style strong/bold
                strong: ({ children }) => (
                  <strong className="font-bold text-gray-900">{children}</strong>
                ),
                // Style emphasis/italic
                em: ({ children }) => (
                  <em className="italic">{children}</em>
                ),
                // Style unordered lists
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-3 space-y-2">{children}</ul>
                ),
                // Style ordered lists
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 mb-3 space-y-2">{children}</ol>
                ),
                // Style list items
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                // Style code
                code: ({ children }) => (
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
                // Style blockquotes
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-3 italic my-3">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <p className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}