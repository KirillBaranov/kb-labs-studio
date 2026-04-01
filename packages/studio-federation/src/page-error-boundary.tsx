import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Result, Button } from 'antd';

interface Props {
  pageId: string;
  pluginId: string;
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary that isolates plugin page crashes.
 * A crashed page does NOT bring down the entire Studio.
 */
export class PageErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `[PageErrorBoundary] Plugin "${this.props.pluginId}" page "${this.props.pageId}" crashed:`,
      error,
      errorInfo,
    );
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Page Crashed"
          subTitle={`Plugin "${this.props.pluginId}" page "${this.props.pageId}" encountered an error: ${this.state.error?.message ?? 'Unknown error'}`}
          extra={
            <Button type="primary" onClick={this.handleRetry}>
              Retry
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}
