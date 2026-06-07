import { useEffect, useRef, useState } from 'react';
import { useGlobeStore } from '../store/globeStore';
import { createViewer } from '../services/cesium/viewerFactory';

export function useCesiumViewer(containerRef: React.RefObject<HTMLDivElement | null>) {
  const viewerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setViewer = useGlobeStore((s) => s.setViewer);
  const setViewerReady = useGlobeStore((s) => s.setViewerReady);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    // Lazy-load Cesium (~30MB) — this triggers code splitting
    import('cesium')
      .then((Cesium) => {
        if (cancelled || !containerRef.current) return;

        try {
          const viewer = createViewer(containerRef.current, Cesium);
          viewerRef.current = viewer;
          setViewer(viewer);
          (viewer as any).__CesiumModule = Cesium;
          setIsReady(true);
          setViewerReady(true);
        } catch (e) {
          console.error('Failed to create Cesium viewer:', e);
          setError((e as Error).message || '无法创建 3D 地球');
        }
      })
      .catch((e) => {
        console.error('Failed to load Cesium:', e);
        if (!cancelled) {
          setError('Cesium 加载失败，请刷新页面重试');
        }
      });

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
      setViewer(null!);
      setViewerReady(false);
      setIsReady(false);
    };
  }, []);

  return { isReady, error, viewerRef };
}
