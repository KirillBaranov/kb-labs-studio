/**
 * @module @kb-labs/studio-ui-react/components/kb-full-page-loader
 * Full-page loading overlay with animated spinner
 */

import * as React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export interface KBFullPageLoaderProps {
  /** Whether to show the loader */
  show: boolean;
  /** Loading message to display */
  message?: string;
  /** Tip text to show below the message */
  tip?: string;
  /** Custom icon size (default: 64px) */
  iconSize?: number;
}

export function KBFullPageLoader({
  show,
  message = 'Loading...',
  tip,
  iconSize = 64,
}: KBFullPageLoaderProps) {
  if (!show) {return null;}

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998, // Below theme transition (9999)
        opacity: show ? 1 : 0,
        transition: 'opacity 300ms ease-in-out, background-color 150ms ease-in-out',
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          opacity: show ? 1 : 0,
          transition: 'opacity 200ms ease-in-out',
          transitionDelay: show ? '100ms' : '0ms',
        }}
      >
        <Spin
          indicator={
            <LoadingOutlined
              style={{
                fontSize: iconSize,
                color: 'var(--link)',
                transition: 'color 150ms ease-in-out',
              }}
              spin
            />
          }
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              transition: 'color 150ms ease-in-out',
            }}
          >
            {message}
          </div>

          {tip && (
            <div
              style={{
                fontSize: '14px',
                fontWeight: 400,
                color: 'var(--text-secondary)',
                transition: 'color 150ms ease-in-out',
              }}
            >
              {tip}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
