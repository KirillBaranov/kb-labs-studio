import { useState } from 'react';
import { useDataSources } from '@/providers/data-sources-provider';
import { useReleasePreview, useRunRelease } from '@kb-labs/data-client';
import { KBCard, KBCardHeader, KBCardTitle, KBCardContent, KBButton, KBSkeleton } from '@kb-labs/ui-react';

export function ReleasePage() {
  const sources = useDataSources();
  const { data, isLoading } = useReleasePreview(sources.release);
  const { mutate: runRelease, isPending } = useRunRelease(sources.release);

  const [activeTab, setActiveTab] = useState<'packages' | 'markdown' | 'json'>('packages');

  const handleRun = () => {
    if (window.confirm('Are you sure you want to run the release?')) {
      runRelease(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Release</h1>
          <p className="mt-2">Package release preview and execution</p>
        </div>
        <KBButton onClick={handleRun} disabled={isPending || isLoading}>
          {isPending ? 'Running...' : 'Run Release'}
        </KBButton>
      </div>

      <KBCard>
        <KBCardHeader>
          <KBCardTitle>Release Preview</KBCardTitle>
        </KBCardHeader>
        <KBCardContent>
          {isLoading ? (
            <div className="space-y-2">
              <KBSkeleton className="h-8 w-full" />
              <KBSkeleton className="h-8 w-full" />
              <KBSkeleton className="h-8 w-full" />
            </div>
          ) : data ? (
            <>
              <div className="mb-4 border-b border-theme">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('packages')}
                    className={`border-b-2 px-1 py-4 text-sm font-medium ${
                      activeTab === 'packages'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-secondary hover:border-theme hover:text-primary'
                    }`}
                  >
                    Packages
                  </button>
                  <button
                    onClick={() => setActiveTab('markdown')}
                    className={`border-b-2 px-1 py-4 text-sm font-medium ${
                      activeTab === 'markdown'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-secondary hover:border-theme hover:text-primary'
                    }`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setActiveTab('json')}
                    className={`border-b-2 px-1 py-4 text-sm font-medium ${
                      activeTab === 'json'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-secondary hover:border-theme hover:text-primary'
                    }`}
                  >
                    JSON
                  </button>
                </nav>
              </div>

              <div className="mt-4">
                {activeTab === 'packages' && (
                  <div className="space-y-2">
                    <p className="text-sm mb-4">
                      From: <span className="font-mono">{data.range.from}</span> → To: <span className="font-mono">{data.range.to}</span>
                    </p>
                    <div className="space-y-2">
                      {data.packages.map((pkg, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-theme pb-2">
                          <div>
                            <p className="font-medium">{pkg.name}</p>
                            <p className="text-sm">
                              {pkg.prev} → {pkg.next} ({pkg.bump})
                            </p>
                          </div>
                          {pkg.breaking && (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                              {pkg.breaking} breaking
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'markdown' && (
                  <pre className="overflow-x-auto rounded-md bg-theme-secondary p-4 text-sm">
                    {data.markdown}
                  </pre>
                )}
                {activeTab === 'json' && (
                  <pre className="overflow-x-auto rounded-md bg-theme-secondary p-4 text-sm">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <p>No release preview data available</p>
          )}
        </KBCardContent>
      </KBCard>
    </div>
  );
}

