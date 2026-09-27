import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#faf6f0',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            padding: '36px',
            borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            maxWidth: '520px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍲</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1c1917', marginBottom: '12px' }}>
              Restaurant l'Amitié
            </h2>
            <p style={{ color: '#78716c', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Une mise à jour a été effectuée. Cliquez sur le bouton ci-dessous pour recharger l'interface en toute sécurité.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('amitie_restaurant_settings');
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                color: '#ffffff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)'
              }}
            >
              🔄 Recharger le Site
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
