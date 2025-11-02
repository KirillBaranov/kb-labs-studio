import { useState } from 'react';
import { useDataSources } from '@/providers/data-sources-provider';
import { useAuditSummary } from '@kb-labs/data-client';
import {
  KBPageContainer,
  KBPageHeader,
  KBSection,
  KBCard,
  KBSkeleton,
  KBButton,
  KBDataTable,
  KBInfoPanel,
  KBStack,
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

  const summaryItems = data ? [
    { label: 'Total Packages', value: data.totals.packages },
    { label: 'OK', value: <span style={{ color: '#52c41a' }}>{data.totals.ok}</span> },
    { label: 'Warnings', value: <span style={{ color: '#faad14' }}>{data.totals.warn}</span> },
    { label: 'Failed', value: <span style={{ color: '#ff4d4f' }}>{data.totals.fail}</span> },
  ] : [];

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Audit"
        description="Package audit results and reports"
        extra={<KBButton>Run Audit</KBButton>}
      />

      <KBSection>
        <KBCard title="Summary">
          {isLoading ? (
            <KBStack>
              <KBSkeleton active paragraph={{ rows: 2 }} />
            </KBStack>
          ) : summaryItems.length > 0 ? (
            <KBInfoPanel items={summaryItems} columns={4} />
          ) : null}
        </KBCard>
      </KBSection>

      <KBSection>
        <KBCard title="Packages">
            {isLoading ? (
              <KBStack>
                <KBSkeleton active paragraph={{ rows: 3 }} />
              </KBStack>
            ) : (
              <KBDataTable
                columns={columns}
                data={tableData}
                onRowClick={(row) => setSelectedPackage(row.package as string)}
              />
            )}
        </KBCard>
      </KBSection>

      <AuditReportDrawer packageName={selectedPackage} onClose={() => setSelectedPackage(null)} />
    </KBPageContainer>
  );
}

