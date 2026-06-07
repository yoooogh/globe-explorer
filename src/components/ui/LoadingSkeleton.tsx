import './LoadingSkeleton.css';

interface Props {
  fullscreen?: boolean;
  text?: string;
}

export function LoadingSkeleton({ fullscreen, text = '加载中...' }: Props) {
  if (fullscreen) {
    return (
      <div className="skeleton-fullscreen">
        <div className="skeleton-spinner" />
        <p>{text}</p>
      </div>
    );
  }

  return (
    <div className="skeleton-card">
      <div className="skeleton-row skeleton-row--title" />
      <div className="skeleton-row" />
      <div className="skeleton-row" />
      <div className="skeleton-row skeleton-row--short" />
    </div>
  );
}
