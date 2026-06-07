import { useRef } from 'react';
import { useCesiumViewer } from '../../hooks/useCesiumViewer';
import './GlobeViewer.css';

export function GlobeViewer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isReady, error } = useCesiumViewer(containerRef);

  return (
    <div className="globe-container">
      <div
        ref={containerRef}
        className={`globe-canvas ${isReady ? 'globe-canvas--ready' : ''}`}
      />
      {error && (
        <div className="globe-loading globe-loading--error">
          <span style={{ fontSize: 48, marginBottom: 16 }}>⚠️</span>
          <p className="globe-loading__text">地球加载失败</p>
          <p className="globe-loading__subtext">{error}</p>
          <button
            className="globe-retry-btn"
            onClick={() => window.location.reload()}
          >
            刷新页面重试
          </button>
        </div>
      )}
      {!isReady && !error && (
        <div className="globe-loading">
          <div className="globe-loading__spinner" />
          <p className="globe-loading__text">正在加载3D地球...</p>
          <p className="globe-loading__subtext">首次加载约需 5-10 秒</p>
        </div>
      )}
    </div>
  );
}
