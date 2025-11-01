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
          <h1 className="text-3xl font-bold text-gray-900">Release</h1>
          <p className="mt-2 text-gray-600">Package release preview and execution</p>
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
              <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('packages')}
                    className={`border-b-2 px-1 py-4 text-sm font-medium ${
                      activeTab === 'packages'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Packages
                  </button>
                  <button
                    onClick={() => setActiveTab('markdown')}
                    className={`border-b-2 px-1 py-4 text-sm font-medium ${
                      activeTab === 'markdown'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setActiveTab('json')}
                    className={`border-b-2 px-1 py-4 text-sm font-medium ${
                      activeTab === 'json'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    JSON
                  </button>
                </nav>
              </div>

              <div className="mt-4">
                {activeTab === 'packages' && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-4">
                      From: <span className="font-mono">{data.range.from}</span> → To: <span className="font-mono">{data.range.to}</span>
                    </p>
                    <div className="space-y-2">
                      {data.packages.map((pkg, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <div>
                            <p className="font-medium text-gray-900">{pkg.name}</p>
                            <p className="text-sm text-gray-500">
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
                  <pre className="overflow-x-auto rounded-md bg-gray-50 p-4 text-sm">
                    {data.markdown}
                  </pre>
                )}
                {activeTab === 'json' && (
                  <pre className="overflow-x-auto rounded-md bg-gray-50 p-4 text-sm">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">No release preview data available</p>
          )}
        </KBCardContent>
      </KBCard>
    </div>
  );
}

