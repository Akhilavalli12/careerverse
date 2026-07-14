import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In a production deployment this is the spot to forward to an error-tracking
    // service (Sentry, etc.) — kept as a console.error here since no such service
    // is configured in this project.
    console.error('CareerVerse UI error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
          <div className="glass rounded-lg p-8 max-w-md">
            <AlertTriangle className="mx-auto text-clay-500 mb-4" size={32} strokeWidth={1.75} />
            <h1 className="font-display text-2xl mb-2">Something went off the record</h1>
            <p className="text-sm text-ink-soft dark:text-paper-light/70 mb-6">
              This page hit an unexpected error. Your data is safe — try heading back and starting again.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 rounded-full bg-primary-600 text-paper-light hover:bg-primary-700 transition"
            >
              Back to start
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
