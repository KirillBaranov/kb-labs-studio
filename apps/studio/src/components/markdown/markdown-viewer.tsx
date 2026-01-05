/**
 * @module studio/components/markdown/markdown-viewer
 * Reusable markdown viewer component with consistent styling
 *
 * Uses marked + DOMPurify for lightweight, secure markdown rendering
 * without React rendering issues from third-party libraries
 */

import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './markdown-viewer.css';

export interface MarkdownViewerProps {
  /**
   * Markdown content to render
   */
  children: string;

  /**
   * Custom CSS class name
   */
  className?: string;
}

/**
 * Markdown viewer with consistent styling across the app
 *
 * @example
 * ```tsx
 * <MarkdownViewer>
 *   # Hello World
 *   This is **bold** and *italic*
 * </MarkdownViewer>
 * ```
 */
export function MarkdownViewer({ children, className }: MarkdownViewerProps) {
  const html = useMemo(() => {
    // Configure marked
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });

    // Parse markdown to HTML
    const rawHtml = marked.parse(children) as string;

    // Sanitize HTML to prevent XSS
    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'strong', 'em', 'code', 'pre',
        'blockquote',
        'a',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'img',
      ],
      ALLOWED_ATTR: ['href', 'title', 'src', 'alt', 'class'],
    });
  }, [children]);

  return (
    <div
      className={`markdown-viewer ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
