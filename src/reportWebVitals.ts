import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

type Metric = {
  name: string;
  value: number;
  rating: string;
  delta: number;
  entries: PerformanceEntry[];
};

const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals; 