interface Props {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0a1a',
        color: '#c8d6e5',
        fontFamily: 'system-ui, sans-serif',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 48, marginBottom: 16 }}>🌍</span>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>出错了</h1>
      <p style={{ color: '#8899aa', marginBottom: 24, maxWidth: 400 }}>
        {error?.message || '应用遇到未知错误，请刷新页面重试'}
      </p>
      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            border: '1px solid rgba(79, 195, 247, 0.3)',
            background: 'rgba(79, 195, 247, 0.15)',
            color: '#4fc3f7',
            cursor: 'pointer',
            fontSize: 15,
          }}
        >
          重试
        </button>
      )}
    </div>
  );
}
