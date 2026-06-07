export type Breakpoint = 'mobile' | 'tablet' | 'desktop';
export type PanelTab = 'ai' | 'weather' | 'climate' | 'vegetation' | 'attractions' | 'culture';

export interface ToastMessage {
  id: string;
  type: 'info' | 'warning' | 'error';
  text: string;
  durationMs: number;
}
