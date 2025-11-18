/**
 * @module @kb-labs/studio-app/layouts/TwoPane
 * Two Pane layout - flex-based with optional resizer
 */

import * as React from 'react';

export interface TwoPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: string;
  resizable?: boolean;
  minLeftWidth?: string;
  maxLeftWidth?: string;
}

export function TwoPane({
  left,
  right,
  leftWidth = '50%',
  resizable = false,
  minLeftWidth = '20%',
  maxLeftWidth = '80%',
}: TwoPaneProps) {
  const [leftWidthState, setLeftWidthState] = React.useState(leftWidth);
  const [isResizing, setIsResizing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    if (!resizable) return;
    setIsResizing(true);
  };

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;

      // Apply min/max constraints
      const min = parseFloat(minLeftWidth);
      const max = parseFloat(maxLeftWidth);
      const clamped = Math.max(min, Math.min(max, newLeftWidth));

      setLeftWidthState(`${clamped}%`);
    },
    [isResizing, minLeftWidth, maxLeftWidth]
  );

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove]);

  return (
    <div className="widget-two-pane" ref={containerRef}>
      <div
        className="widget-two-pane__left"
        style={
          {
            width: leftWidthState,
            minWidth: minLeftWidth,
            maxWidth: maxLeftWidth,
          } as React.CSSProperties
        }
      >
        {left}
      </div>
      {resizable && (
        <div
          className="widget-two-pane__resizer"
          onMouseDown={handleMouseDown}
          data-resizing={isResizing}
        />
      )}
      <div className="widget-two-pane__right">{right}</div>
      <style>{`
        .widget-two-pane {
          display: flex;
          height: 100%;
          width: 100%;
        }
        .widget-two-pane__left {
          flex-shrink: 0;
          overflow: auto;
          border-right: 1px solid var(--border-primary);
        }
        .widget-two-pane__resizer {
          width: 4px;
          background: var(--border-primary);
          cursor: col-resize;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .widget-two-pane__resizer:hover,
        .widget-two-pane__resizer[data-resizing="true"] {
          background: var(--link);
        }
        .widget-two-pane__right {
          flex: 1;
          overflow: auto;
        }
      `}</style>
    </div>
  );
}


