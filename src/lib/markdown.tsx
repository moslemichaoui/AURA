import React from 'react';

interface MarkdownProps {
  content: string;
  className?: string;
  onOrderClick?: (orderId: string) => void;
}

export const RichMarkdown: React.FC<MarkdownProps> = ({ content, className = '', onOrderClick }) => {
  if (!content) return null;

  // Split into lines or paragraphs
  const lines = content.split('\n');

  const renderInlineFormatted = (text: string) => {
    // Check for order patterns like #AUR-XXXX or AUR-XXXX
    const orderRegex = /(#?AUR-\d{4})/g;
    
    // First format bold **text** and `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|#?AUR-\d{4})/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs border border-slate-700">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (orderRegex.test(part)) {
        const cleanId = part.replace('#', '');
        return (
          <button
            key={index}
            type="button"
            onClick={() => onOrderClick?.(cleanId)}
            className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900 font-mono text-xs font-medium cursor-pointer transition-colors"
            title="Click to view order details"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

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

    // Bullet points
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
      isList = true;
      const itemText = trimmed.replace(/^[•\-\*]\s*/, '');
      currentList.push(
        <li key={`li-${i}`} className="flex items-start gap-2 text-sm text-slate-200 leading-relaxed">
          <span className="text-indigo-400 mt-1 shrink-0">•</span>
          <span>{renderInlineFormatted(itemText)}</span>
        </li>
      );
    } 
    // Numbered list
    else if (/^\d+\.\s/.test(trimmed)) {
      isList = true;
      const numMatch = trimmed.match(/^(\d+)\.\s/);
      const num = numMatch ? numMatch[1] : '1';
      const itemText = trimmed.replace(/^\d+\.\s*/, '');
      currentList.push(
        <li key={`li-${i}`} className="flex items-start gap-2 text-sm text-slate-200 leading-relaxed">
          <span className="font-mono text-xs font-semibold text-indigo-400 mt-0.5 shrink-0">{num}.</span>
          <span>{renderInlineFormatted(itemText)}</span>
        </li>
      );
    }
    // Headings
    else if (trimmed.startsWith('###')) {
      if (isList && currentList.length > 0) {
        elements.push(<ul key={`ul-${i}`} className="space-y-1.5 my-2 pl-2 list-none">{currentList}</ul>);
        currentList = [];
        isList = false;
      }
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-bold text-slate-100 mt-3 mb-1 uppercase tracking-wide">
          {renderInlineFormatted(trimmed.replace(/^###\s*/, ''))}
        </h4>
      );
    } else {
      if (isList && currentList.length > 0) {
        elements.push(<ul key={`ul-${i}`} className="space-y-1.5 my-2 pl-2 list-none">{currentList}</ul>);
        currentList = [];
        isList = false;
      }
      elements.push(
        <p key={`p-${i}`} className="text-sm text-slate-200 leading-relaxed mb-2 last:mb-0">
          {renderInlineFormatted(trimmed)}
        </p>
      );
    }
  });

  if (isList && currentList.length > 0) {
    elements.push(<ul key="ul-last" className="space-y-1.5 my-2 pl-2 list-none">{currentList}</ul>);
  }

  return <div className={`space-y-1.5 ${className}`}>{elements}</div>;
};
