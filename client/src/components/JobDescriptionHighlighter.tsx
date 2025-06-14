"use client";


interface JobDescriptionHighlighterProps {
  text: string;
  matchedKeywords: string[];
  missingKeywords: string[];
}

export function JobDescriptionHighlighter({ 
  text, 
  matchedKeywords, 
  missingKeywords 
}: JobDescriptionHighlighterProps) {
  
  const highlightText = (text: string) => {
    // Combine all keywords and sort by length (longest first) to avoid partial matches
    const allKeywords = [...matchedKeywords, ...missingKeywords]
      .sort((a, b) => b.length - a.length);
    
    if (allKeywords.length === 0) {
      return [{ text, type: 'normal' }];
    }

    // Create regex pattern for all keywords (case insensitive, word boundaries)
    const keywordPattern = allKeywords
      .map(keyword => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex chars
      .join('|');
    
    const regex = new RegExp(`\\b(${keywordPattern})\\b`, 'gi');
    
    const parts: Array<{ text: string; type: 'normal' | 'matched' | 'missing' }> = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, match.index),
          type: 'normal'
        });
      }

      // Determine if this keyword is matched or missing
      const matchedKeyword = match[0];
      const isMatched = matchedKeywords.some(keyword => 
        keyword.toLowerCase() === matchedKeyword.toLowerCase()
      );

      parts.push({
        text: matchedKeyword,
        type: isMatched ? 'matched' : 'missing'
      });

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        text: text.slice(lastIndex),
        type: 'normal'
      });
    }

    return parts;
  };

  const textParts = highlightText(text);

  return (
    <div className="w-full whitespace-pre-line text-left pl-4 overflow-auto  leading-relaxed">
      {textParts.map((part, index) => {
        if (part.type === 'matched') {
          return (
            <span
              key={index}
              className="bg-green-200 text-green-800 px-1 rounded font-medium"
              title="Keyword found in resume"
            >
              {part.text}
            </span>
          );
        } else if (part.type === 'missing') {
          return (
            <span
              key={index}
              className="bg-red-200 text-red-800 px-1 rounded font-medium"
              title="Keyword missing from resume"
            >
              {part.text}
            </span>
          );
        } else {
          return <span key={index}>{part.text}</span>;
        }
      })}
    </div>
  );
}
