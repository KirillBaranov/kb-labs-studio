import { useState } from 'react';
import { useDataSources } from '@/providers/data-sources-provider';
import { useAuditSummary } from '@kb-labs/data-client';
import {
  KBCard,
  KBCardHeader,
  KBCardTitle,
  KBCardContent,
  KBSkeleton,
  KBButton,
  DataTable,
  type Column,
} from '@kb-labs/ui-react';
import { AuditReportDrawer } from '../components/audit-report-drawer';

interface PackageRow extends Record<string, unknown> {
  package: string;
  ok: number;
  fail: number;
  warn: number;
}

export function AuditListPage() {
  const sources = useDataSources();
  const { data, isLoading } = useAuditSummary(sources.audit);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const columns: Column<PackageRow>[] = [
    {
      id: 'package',
      label: 'Package',
      sortable: true,
    },
    {
      id: 'ok',
      label: 'OK',
      sortable: true,
    },
    {
      id: 'warn',
      label: 'Warnings',
      sortable: true,
    },
    {
      id: 'fail',
      label: 'Failures',
      sortable: true,
    },
  ];

  const tableData: PackageRow[] = data?.topFailures.map((failure) => ({
    package: failure.pkg,
    ok: 0,
    warn: 0,
    fail: failure.checks.length,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit</h1>
          <p className="mt-2 text-gray-600">Package audit results and reports</p>
        </div>
        <KBButton>Run Audit</KBButton>
      </div>

      <KBCard>
        <KBCardHeader>
          <KBCardTitle>Summary</KBCardTitle>
        </KBCardHeader>
        <KBCardContent>
          {isLoading ? (
            <div className="space-y-2">
              <KBSkeleton className="h-8 w-full" />
              <KBSkeleton className="h-8 w-full" />
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-500">Total Packages</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totals.packages}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">OK</p>
                  <p className="text-2xl font-bold text-green-600">{data.totals.ok}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{data.totals.warn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{data.totals.fail}</p>
                </div>
              </div>
            </div>
          ) : null}
        </KBCardContent>
      </KBCard>

      <KBCard>
        <KBCardHeader>
          <KBCardTitle>Packages</KBCardTitle>
        </KBCardHeader>
        <KBCardContent>
          {isLoading ? (
            <div className="space-y-2">
              <KBSkeleton className="h-10 w-full" />
              <KBSkeleton className="h-10 w-full" />
              <KBSkeleton className="h-10 w-full" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={tableData}
              onRowClick={(row) => setSelectedPackage(row.package)}
            />
          )}
        </KBCardContent>
      </KBCard>

      <AuditReportDrawer packageName={selectedPackage} onClose={() => setSelectedPackage(null)} />
    </div>
  );
}

