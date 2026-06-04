import React from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { MeshApp } from '@uniformdev/mesh-sdk-react';
import '@/styles/globals.css';

const PAGES_WITHOUT_MESH = ['/_error', '/'];

function LoadingComponent() {
  return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <span>Loading...</span>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  return (
    <div style={styles.error}>
      <span>Error: {error.message}</span>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();

  if (PAGES_WITHOUT_MESH.includes(pathname)) {
    return <Component {...pageProps} />;
  }

  return (
    <MeshApp loadingComponent={LoadingComponent} errorComponent={ErrorComponent}>
      <Component {...pageProps} />
    </MeshApp>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '12px',
    color: '#6B7280',
    fontSize: '14px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid #E5E7EB',
    borderTopColor: '#6366F1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: '#DC2626',
    fontSize: '14px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: '20px',
    textAlign: 'center',
  },
};
