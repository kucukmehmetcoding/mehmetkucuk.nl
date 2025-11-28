'use client';

import { useMemo, useState, useEffect } from 'react';

export default function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>('');

  const headings = useMemo(() => {
    // Parse markdown headings
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];
    
    return matches.map((match) => ({
      id: match[2].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      text: match[2],
      level: match[1].length,
    }));
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        📖 Table of Contents
      </h3>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              className={`text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors block ${
                activeId === heading.id
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
