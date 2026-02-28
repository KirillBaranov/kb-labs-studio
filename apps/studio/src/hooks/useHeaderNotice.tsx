/**
 * Hook for header policy notice rendering
 *
 * Generates HeaderPolicyCallout component based on widget configuration
 * and studio settings. Shows notice when headers are required or missing.
 *
 * Features:
 * - Respects widget-level header options
 * - Falls back to global studio config
 * - Auto-expands when required headers are missing
 * - Collapsible/expanded state control
 *
 * @example
 * ```tsx
 * const headerNotice = useHeaderNotice(widget, widgetData, headerHints);
 *
 * return (
 *   <>
 *     {headerNotice}
 *     <WidgetComponent {...props} />
 *   </>
 * );
 * ```
 */

import * as React from 'react';
import { useStudioConfig } from '../providers/config-provider';
import { HeaderPolicyCallout } from '../components/header-policy-callout';

interface WidgetOptions {
  headers?: {
    enabled?: boolean;
    title?: string;
    description?: string;
    collapsible?: boolean;
    expanded?: boolean;
    showProvided?: boolean;
  };
}

interface WidgetWithOptions {
  options?: WidgetOptions;
}

interface WidgetDataWithHeaders {
  headers?: {
    missingRequired?: string[];
  };
}

/**
 * Generate header policy notice component
 *
 * @param widget - Widget configuration with header options
 * @param widgetData - Widget data with header status
 * @param headerHints - Header policy hints from manifest
 * @returns HeaderPolicyCallout component or null
 */
export function useHeaderNotice(
  widget: WidgetWithOptions | undefined,
  widgetData: WidgetDataWithHeaders,
  headerHints: unknown | undefined
): React.ReactElement | null {
  const studioConfig = useStudioConfig();

  const headerNotice = React.useMemo(() => {
    const rawHeaderOptions = (widget?.options as any)?.headers as
      | {
          enabled?: boolean;
          title?: string;
          description?: string;
          collapsible?: boolean;
          expanded?: boolean;
          showProvided?: boolean;
        }
      | undefined;

    const missingHeadersCount = widgetData.headers?.missingRequired?.length ?? 0;
    const headerNoticeEnabled =
      !!headerHints &&
      ((rawHeaderOptions?.enabled ?? studioConfig.headerNotices.enabled) || missingHeadersCount > 0);

    if (!headerNoticeEnabled || !headerHints) {
      return null;
    }

    return (
      <HeaderPolicyCallout
        hints={headerHints}
        status={widgetData.headers}
        title={rawHeaderOptions?.title || 'Header policy'}
        description={
          rawHeaderOptions?.description ||
          'Studio forwards headers that match this manifest-defined policy.'
        }
        collapsible={rawHeaderOptions?.collapsible ?? studioConfig.headerNotices.collapsible}
        defaultExpanded={
          rawHeaderOptions?.expanded ??
          (missingHeadersCount > 0 || studioConfig.headerNotices.defaultExpanded)
        }
        showProvided={rawHeaderOptions?.showProvided ?? studioConfig.headerNotices.showProvided}
      />
    );
  }, [widget?.options, widgetData.headers, headerHints, studioConfig]);

  return headerNotice;
}
