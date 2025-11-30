/**
 * @module @kb-labs/studio-app/hooks/useExport
 * Hook for exporting widget data
 */

import { useCallback } from 'react';
import { exportToCSV, exportToJSON, exportToPNG, generateFilename } from '../utils/export';

export interface UseExportOptions {
  /** Widget ID for filename generation */
  widgetId?: string;
  /** Default filename prefix */
  filenamePrefix?: string;
}

/**
 * Hook for exporting widget data
 */
export function useExport(options: UseExportOptions = {}) {
  const { widgetId, filenamePrefix = 'widget-export' } = options;

  const exportCSV = useCallback(
    (data: unknown[], filename?: string) => {
      const finalFilename = filename || generateFilename(filenamePrefix, 'csv');
      exportToCSV(data, finalFilename);
    },
    [filenamePrefix]
  );

  const exportJSON = useCallback(
    (data: unknown, filename?: string, pretty?: boolean) => {
      const finalFilename = filename || generateFilename(filenamePrefix, 'json');
      exportToJSON(data, finalFilename, { pretty });
    },
    [filenamePrefix]
  );

  const exportPNG = useCallback(
    (element: HTMLElement | HTMLCanvasElement, filename?: string, scale?: number) => {
      const finalFilename = filename || generateFilename(filenamePrefix, 'png');
      exportToPNG(element, finalFilename, { scale });
    },
    [filenamePrefix]
  );

  return {
    exportCSV,
    exportJSON,
    exportPNG,
    generateFilename: useCallback(
      (extension: string) => generateFilename(filenamePrefix, extension),
      [filenamePrefix]
    ),
  };
}

