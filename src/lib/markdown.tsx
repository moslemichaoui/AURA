import React from 'react';

interface MarkdownProps {
  content: string;
  className?: string;
  variant?: 'assistant' | 'user';
  onOrderClick?: (orderId: string) => void;
}

export const RichMarkdown: React.FC<MarkdownProps> = ({ content, className = '', variant = 'assistant', onOrderClick }) => {
  if (!content) return null;

  const isUser = variant === 'user';
  const headingClass = isUser ? 'text-white' : 'text-[#2d261f]';
  const bodyClass = isUser ? 'text-white' : 'text-[#2d261f]';
  const mutedClass = isUser ? 'text-[#dfead0]' : 'text-[#6d5b4b]';
  const accentClass = isUser ? 'text-[#dff5d0]' : 'text-[#51683d]';
  const codeClass = isUser
    ? 'bg-[#3d5635] text-[#edf5d8] border border-[#71935d]'
    : 'bg-[#eeeadf] text-[#4a5b3b] border border-[#d1c1a4]';
  const linkClass = isUser
    ? 'text-[#effad3] underline decoration-[#effad3]/70 hover:text-white'
    : 'text-[#4f6b39] underline decoration-[#4f6b39]/60 hover:text-[#3e5630]';

  const renderInlineFormatted = (text: string) => {
    const orderRegex = /(#?AUR-\d{4})/g;
    const linkRegex = /(\[[^\]]+\]\([^\)]+\))/g;
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[[^\]]+\]\([^\)]+\)|#?AUR-\d{4})/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className={`font-semibold ${isUser ? 'text-white' : 'text-[#1f1a17]'}`}>{part.slice(2, -2)}</strong>;
      }

      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className={`px-1.5 py-0.5 rounded font-mono text-xs border ${codeClass}`}>
            {part.slice(1, -1)}
          </code>
        );
      }

      const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            {linkMatch[1]}
          </a>
        );
      }

      if (orderRegex.test(part)) {
        orderRegex.lastIndex = 0;
        const cleanId = part.replace('#', '');
        return (
          <button
            key={index}
            type="button"
            onClick={() => onOrderClick?.(cleanId)}
            className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-xs font-medium cursor-pointer transition-colors border ${
              isUser
                ? 'bg-[#3a4d35] text-[#edf5d8] border-[#6f8a62] hover:bg-[#405a3d]'
                : 'bg-[#edf3e4] text-[#3f6848] border-[#9ab285] hover:bg-[#e3edd9]'
            }`}
            title="Click to view order details"
          >
            {part}
          </button>
        );
      }
      orderRegex.lastIndex = 0;

      return part;
    });
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let isList = false;

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) {
      if (isList && currentList.length > 0) {
        elements.push(
          <ul key={`ul-${i}`} className="space-y-1.5 my-2.5 pl-2 list-none">
            {currentList}
          </ul>
        );
        currentList = [];
        isList = false;
      }
      return;
    }

    if (trimmed.startsWith('###')) {
      if (isList && currentList.length > 0) {
        elements.push(<ul key={`ul-${i}`} className="space-y-1.5 my-2 pl-2 list-none">{currentList}</ul>);
        currentList = [];
        isList = false;
      }
      elements.push(
        <h4 key={`h4-${i}`} className={`text-sm font-bold mt-3 mb-1 uppercase tracking-wide ${headingClass}`}>
          {renderInlineFormatted(trimmed.replace(/^###\s*/, ''))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
      isList = true;
      const itemText = trimmed.replace(/^[•\-\*]\s*/, '');
      currentList.push(
        <li key={`li-${i}`} className={`flex items-start gap-2 text-sm leading-relaxed ${bodyClass}`}>
          <span className={`mt-1 shrink-0 ${accentClass}`}>•</span>
          <span>{renderInlineFormatted(itemText)}</span>
        </li>
      );
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      isList = true;
      const numMatch = trimmed.match(/^(\d+)\.\s/);
      const num = numMatch ? numMatch[1] : '1';
      const itemText = trimmed.replace(/^\d+\.\s*/, '');
      currentList.push(
        <li key={`li-${i}`} className={`flex items-start gap-2 text-sm leading-relaxed ${bodyClass}`}>
          <span className={`font-mono text-xs font-semibold mt-0.5 shrink-0 ${accentClass}`}>{num}.</span>
          <span>{renderInlineFormatted(itemText)}</span>
        </li>
      );
      return;
    }

    if (isList && currentList.length > 0) {
      elements.push(<ul key={`ul-${i}`} className="space-y-1.5 my-2 pl-2 list-none">{currentList}</ul>);
      currentList = [];
      isList = false;
    }

    elements.push(
      <p key={`p-${i}`} className={`text-sm leading-relaxed mb-2 last:mb-0 ${bodyClass}`}>
        {renderInlineFormatted(trimmed)}
      </p>
    );
  });

  if (isList && currentList.length > 0) {
    elements.push(<ul key="ul-last" className="space-y-1.5 my-2 pl-2 list-none">{currentList}</ul>);
  }

  return <div className={`space-y-1.5 ${className}`}>{elements}</div>;
};
