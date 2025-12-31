/**
 * @module @kb-labs/studio-app/components/page-transition
 * Page transition wrapper with configurable animation types
 */

import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '@/providers/settings-provider';
import { useFeatureFlags } from '@/hooks/use-feature-flags';

export interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const { settings } = useSettings();
  const { isEnabled } = useFeatureFlags();
  const [opacity, setOpacity] = React.useState(1);
  const [transform, setTransform] = React.useState('translateX(0)');

  const isFeatureEnabled = isEnabled('page-transitions');
  const transitionType = settings.appearance.pageTransition;

  // Trigger animation on route change
  React.useEffect(() => {
    if (!isFeatureEnabled || transitionType === 'none') return;

    // Start animation: fade out
    setOpacity(0);
    if (transitionType === 'slide') {
      setTransform('translateX(-30px)');
    }

    // After animation completes, fade back in
    const timeout = setTimeout(() => {
      setOpacity(1);
      if (transitionType === 'slide') {
        setTransform('translateX(0)');
      }
    }, 100); // Quick fade out, then content updates and fades in

    return () => clearTimeout(timeout);
  }, [location.pathname, isFeatureEnabled, transitionType]);

  // If feature is disabled or transition is 'none', render without animation
  if (!isFeatureEnabled || transitionType === 'none') {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        transition: 'opacity 300ms ease-in-out, transform 300ms ease-in-out',
        opacity,
        transform,
      }}
    >
      {children}
    </div>
  );
}
