import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageErrorBoundary } from '../page-error-boundary';

function BrokenChild(): never {
  throw new Error('Component crashed!');
}

function GoodChild() {
  return <div>Working fine</div>;
}

describe('PageErrorBoundary', () => {
  // Suppress React error boundary console.error in tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when no error', () => {
    render(
      <PageErrorBoundary pageId="test.page" pluginId="@kb-labs/test">
        <GoodChild />
      </PageErrorBoundary>,
    );
    expect(screen.getByText('Working fine')).toBeDefined();
  });

  it('catches errors and shows fallback', () => {
    render(
      <PageErrorBoundary pageId="test.page" pluginId="@kb-labs/test">
        <BrokenChild />
      </PageErrorBoundary>,
    );
    expect(screen.getByText('Page Crashed')).toBeDefined();
    expect(screen.getByText(/Component crashed!/)).toBeDefined();
  });

  it('shows plugin and page info in error message', () => {
    render(
      <PageErrorBoundary pageId="commit.overview" pluginId="@kb-labs/commit">
        <BrokenChild />
      </PageErrorBoundary>,
    );
    expect(screen.getByText(/@kb-labs\/commit/)).toBeDefined();
    expect(screen.getByText(/commit\.overview/)).toBeDefined();
  });

  it('calls onError callback', () => {
    const onError = vi.fn();
    render(
      <PageErrorBoundary pageId="test.page" pluginId="@kb-labs/test" onError={onError}>
        <BrokenChild />
      </PageErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  it('resets error state on retry click', () => {
    // Use a component that crashes only on first render
    let shouldCrash = true;
    function MaybeBroken() {
      if (shouldCrash) throw new Error('first crash');
      return <div>Recovered</div>;
    }

    render(
      <PageErrorBoundary pageId="test.page" pluginId="@kb-labs/test">
        <MaybeBroken />
      </PageErrorBoundary>,
    );

    expect(screen.getByText('Page Crashed')).toBeDefined();

    // Fix the component, then retry
    shouldCrash = false;
    fireEvent.click(screen.getByText('Retry'));

    expect(screen.getByText('Recovered')).toBeDefined();
  });
});
