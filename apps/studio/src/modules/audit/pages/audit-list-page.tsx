import { useState } from 'react';
import { useDataSources } from '@/providers/data-sources-provider';
import { useAuditSummary } from '@kb-labs/data-client';
import {
  PageContainer,
  PageHeader,
  Section,
  KBCard,
  KBCardHeader,
  KBCardTitle,
  KBCardContent,
  KBSkeleton,
  KBButton,
  DataTable,
  InfoPanel,
  Stack,
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
    { label: 'OK', value: <span className="text-green-600 dark:text-green-400">{data.totals.ok}</span> },
    { label: 'Warnings', value: <span className="text-yellow-600 dark:text-yellow-400">{data.totals.warn}</span> },
    { label: 'Failed', value: <span className="text-red-600 dark:text-red-400">{data.totals.fail}</span> },
  ] : [];

  return (
    <PageContainer>
      <PageHeader
        title="Audit"
        description="Package audit results and reports"
        action={<KBButton>Run Audit</KBButton>}
      />

      <Section>
        <KBCard>
          <KBCardHeader>
            <KBCardTitle>Summary</KBCardTitle>
          </KBCardHeader>
          <KBCardContent>
            {isLoading ? (
              <Stack>
                <KBSkeleton className="h-8 w-full" />
                <KBSkeleton className="h-8 w-full" />
              </Stack>
            ) : summaryItems.length > 0 ? (
              <InfoPanel items={summaryItems} columns={4} />
            ) : null}
          </KBCardContent>
        </KBCard>
      </Section>

      <Section>
        <KBCard>
          <KBCardHeader>
            <KBCardTitle>Packages</KBCardTitle>
          </KBCardHeader>
          <KBCardContent>
            {isLoading ? (
              <Stack>
                <KBSkeleton className="h-10 w-full" />
                <KBSkeleton className="h-10 w-full" />
                <KBSkeleton className="h-10 w-full" />
              </Stack>
            ) : (
              <DataTable
                columns={columns}
                data={tableData}
                onRowClick={(row) => setSelectedPackage(row.package)}
              />
            )}
          </KBCardContent>
        </KBCard>
      </Section>

      <AuditReportDrawer packageName={selectedPackage} onClose={() => setSelectedPackage(null)} />
    </PageContainer>
  );
}

