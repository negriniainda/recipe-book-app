import { InteractionManager, Dimensions } from 'react-native';

// Performance metrics interfaces
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface RenderMetrics {
  componentName: string;
  renderTime: number;
  renderCount: number;
  propsChanges: number;
  timestamp: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export interface NetworkMetrics {
  url: string;
  method: string;
  duration: number;
  size: number;
  status: number;
  timestamp: number;
}

export interface UserInteractionMetrics {
  type: 'tap' | 'scroll' | 'swipe' | 'long_press';
  target: string;
  duration?: number;
  timestamp: number;
}

// Performance monitoring service
class PerformanceMonitorService {
  private static instance: PerformanceMonitorService;
  private metrics: PerformanceMetric[] = [];
  private renderMetrics: RenderMetrics[] = [];
  private memoryMetrics: MemoryMetrics[] = [];
  private networkMetrics: NetworkMetrics[] = [];
  private userInteractionMetrics: UserInteractionMetrics[] = [];
  private isEnabled = __DEV__; // Only enable in development by default
  private maxMetrics = 1000; // Limit stored metrics
  private reportingInterval: NodeJS.Timeout | null = null;

  static getInstance(): PerformanceMonitorService {
    if (!PerformanceMonitorService.instance) {
      PerformanceMonitorService.instance = new PerformanceMonitorService();
    }
    return PerformanceMonitorService.instance;
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (enabled) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }
  }

  // Start automatic monitoring
  private startMonitoring(): void {
    if (this.reportingInterval) return;

    // Monitor memory usage every 30 seconds
    this.reportingInterval = setInterval(() => {
      this.recordMemoryMetrics();
      this.cleanupOldMetrics();
    }, 30000);

    // Monitor frame rate
    this.startFrameRateMonitoring();
  }

  // Stop monitoring
  private stopMonitoring(): void {
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }
  }

  // Record a performance metric
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    this.limitMetricsArray(this.metrics);
  }

  // Record render metrics
  recordRenderMetrics(metrics: Omit<RenderMetrics, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const renderMetric: RenderMetrics = {
      ...metrics,
      timestamp: Date.now(),
    };

    this.renderMetrics.push(renderMetric);
    this.limitMetricsArray(this.renderMetrics);
  }

  // Record memory metrics
  recordMemoryMetrics(): void {
    if (!this.isEnabled) return;

    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryMetric: MemoryMetrics = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timestamp: Date.now(),
      };

      this.memoryMetrics.push(memoryMetric);
      this.limitMetricsArray(this.memoryMetrics);
    }
  }

  // Record network metrics
  recordNetworkMetrics(metrics: Omit<NetworkMetrics, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const networkMetric: NetworkMetrics = {
      ...metrics,
      timestamp: Date.now(),
    };

    this.networkMetrics.push(networkMetric);
    this.limitMetricsArray(this.networkMetrics);
  }

  // Record user interaction metrics
  recordUserInteraction(metrics: Omit<UserInteractionMetrics, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const interactionMetric: UserInteractionMetrics = {
      ...metrics,
      timestamp: Date.now(),
    };

    this.userInteractionMetrics.push(interactionMetric);
    this.limitMetricsArray(this.userInteractionMetrics);
  }

  // Measure function execution time
  measureExecutionTime<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    if (!this.isEnabled) return fn();

    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    this.recordMetric(name, endTime - startTime, metadata);
    
    return result;
  }

  // Measure async function execution time
  async measureAsyncExecutionTime<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.isEnabled) return fn();

    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    this.recordMetric(name, endTime - startTime, metadata);
    
    return result;
  }

  // Start frame rate monitoring
  private startFrameRateMonitoring(): void {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFrameRate = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) { // Every second
        const fps = frameCount;
        this.recordMetric('fps', fps);
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFrameRate);
    };

    requestAnimationFrame(measureFrameRate);
  }

  // Get performance summary
  getPerformanceSummary(): {
    averageRenderTime: number;
    averageFPS: number;
    memoryUsage: number;
    slowestRenders: RenderMetrics[];
    networkPerformance: {
      averageResponseTime: number;
      totalRequests: number;
      failedRequests: number;
    };
  } {
    const renderTimes = this.renderMetrics.map(m => m.renderTime);
    const fpsMetrics = this.metrics.filter(m => m.name === 'fps');
    const latestMemory = this.memoryMetrics[this.memoryMetrics.length - 1];
    const slowestRenders = this.renderMetrics
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, 10);

    const networkResponseTimes = this.networkMetrics.map(m => m.duration);
    const failedRequests = this.networkMetrics.filter(m => m.status >= 400).length;

    return {
      averageRenderTime: renderTimes.length > 0 
        ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length 
        : 0,
      averageFPS: fpsMetrics.length > 0 
        ? fpsMetrics.reduce((a, b) => a + b.value, 0) / fpsMetrics.length 
        : 0,
      memoryUsage: latestMemory 
        ? (latestMemory.usedJSHeapSize / latestMemory.jsHeapSizeLimit) * 100 
        : 0,
      slowestRenders,
      networkPerformance: {
        averageResponseTime: networkResponseTimes.length > 0 
          ? networkResponseTimes.reduce((a, b) => a + b, 0) / networkResponseTimes.length 
          : 0,
        totalRequests: this.networkMetrics.length,
        failedRequests,
      },
    };
  }

  // Export metrics for analysis
  exportMetrics(): {
    metrics: PerformanceMetric[];
    renderMetrics: RenderMetrics[];
    memoryMetrics: MemoryMetrics[];
    networkMetrics: NetworkMetrics[];
    userInteractionMetrics: UserInteractionMetrics[];
    deviceInfo: {
      screenWidth: number;
      screenHeight: number;
      pixelRatio: number;
      platform: string;
    };
  } {
    const { width, height } = Dimensions.get('window');
    
    return {
      metrics: [...this.metrics],
      renderMetrics: [...this.renderMetrics],
      memoryMetrics: [...this.memoryMetrics],
      networkMetrics: [...this.networkMetrics],
      userInteractionMetrics: [...this.userInteractionMetrics],
      deviceInfo: {
        screenWidth: width,
        screenHeight: height,
        pixelRatio: require('react-native').PixelRatio.get(),
        platform: require('react-native').Platform.OS,
      },
    };
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
    this.renderMetrics = [];
    this.memoryMetrics = [];
    this.networkMetrics = [];
    this.userInteractionMetrics = [];
  }

  // Limit array size to prevent memory leaks
  private limitMetricsArray<T>(array: T[]): void {
    if (array.length > this.maxMetrics) {
      array.splice(0, array.length - this.maxMetrics);
    }
  }

  // Clean up old metrics (older than 1 hour)
  private cleanupOldMetrics(): void {
    const oneHourAgo = Date.now() - 3600000;
    
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    this.renderMetrics = this.renderMetrics.filter(m => m.timestamp > oneHourAgo);
    this.memoryMetrics = this.memoryMetrics.filter(m => m.timestamp > oneHourAgo);
    this.networkMetrics = this.networkMetrics.filter(m => m.timestamp > oneHourAgo);
    this.userInteractionMetrics = this.userInteractionMetrics.filter(m => m.timestamp > oneHourAgo);
  }

  // Send metrics to analytics service
  async sendMetricsToAnalytics(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const metrics = this.exportMetrics();
      
      // Replace with your analytics endpoint
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      });
      
      console.log('Performance metrics sent to analytics');
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitorService.getInstance();

// React hooks for performance monitoring
export const usePerformanceMonitor = () => {
  React.useEffect(() => {
    performanceMonitor.setEnabled(true);
    
    return () => {
      performanceMonitor.setEnabled(false);
    };
  }, []);

  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    measureExecutionTime: performanceMonitor.measureExecutionTime.bind(performanceMonitor),
    measureAsyncExecutionTime: performanceMonitor.measureAsyncExecutionTime.bind(performanceMonitor),
    getPerformanceSummary: performanceMonitor.getPerformanceSummary.bind(performanceMonitor),
    exportMetrics: performanceMonitor.exportMetrics.bind(performanceMonitor),
  };
};

// Hook for measuring component render performance
export const useRenderPerformance = (componentName: string) => {
  const renderCountRef = React.useRef(0);
  const propsChangesRef = React.useRef(0);
  const lastPropsRef = React.useRef<any>(null);

  React.useEffect(() => {
    renderCountRef.current++;
    
    const startTime = performance.now();
    
    // Measure render time after the component has rendered
    InteractionManager.runAfterInteractions(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      performanceMonitor.recordRenderMetrics({
        componentName,
        renderTime,
        renderCount: renderCountRef.current,
        propsChanges: propsChangesRef.current,
      });
    });
  });

  const trackPropsChanges = React.useCallback((props: any) => {
    if (lastPropsRef.current) {
      const hasChanged = JSON.stringify(props) !== JSON.stringify(lastPropsRef.current);
      if (hasChanged) {
        propsChangesRef.current++;
      }
    }
    lastPropsRef.current = props;
  }, []);

  return { trackPropsChanges };
};

// Hook for measuring user interactions
export const useInteractionTracking = () => {
  const trackInteraction = React.useCallback(
    (type: UserInteractionMetrics['type'], target: string, duration?: number) => {
      performanceMonitor.recordUserInteraction({
        type,
        target,
        duration,
      });
    },
    []
  );

  return { trackInteraction };
};

// Network performance interceptor
export const createNetworkInterceptor = () => {
  const originalFetch = global.fetch;
  
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const startTime = performance.now();
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';
    
    try {
      const response = await originalFetch(input, init);
      const endTime = performance.now();
      
      // Estimate response size (not always accurate)
      const contentLength = response.headers.get('content-length');
      const size = contentLength ? parseInt(contentLength, 10) : 0;
      
      performanceMonitor.recordNetworkMetrics({
        url,
        method,
        duration: endTime - startTime,
        size,
        status: response.status,
      });
      
      return response;
    } catch (error) {
      const endTime = performance.now();
      
      performanceMonitor.recordNetworkMetrics({
        url,
        method,
        duration: endTime - startTime,
        size: 0,
        status: 0, // Network error
      });
      
      throw error;
    }
  };
  
  return () => {
    global.fetch = originalFetch;
  };
};

// Performance warning system
export const checkPerformanceWarnings = (): string[] => {
  const warnings: string[] = [];
  const summary = performanceMonitor.getPerformanceSummary();
  
  if (summary.averageRenderTime > 16.67) { // 60fps threshold
    warnings.push(`Average render time (${summary.averageRenderTime.toFixed(2)}ms) exceeds 60fps threshold`);
  }
  
  if (summary.averageFPS < 55) {
    warnings.push(`Average FPS (${summary.averageFPS.toFixed(1)}) is below optimal range`);
  }
  
  if (summary.memoryUsage > 80) {
    warnings.push(`Memory usage (${summary.memoryUsage.toFixed(1)}%) is high`);
  }
  
  if (summary.networkPerformance.averageResponseTime > 2000) {
    warnings.push(`Average network response time (${summary.networkPerformance.averageResponseTime.toFixed(0)}ms) is slow`);
  }
  
  if (summary.networkPerformance.failedRequests > summary.networkPerformance.totalRequests * 0.1) {
    warnings.push(`High network failure rate (${((summary.networkPerformance.failedRequests / summary.networkPerformance.totalRequests) * 100).toFixed(1)}%)`);
  }
  
  return warnings;
};

// Bundle analyzer utility
export const analyzeBundleSize = async (): Promise<{
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{ name: string; size: number }>;
}> => {
  // This would typically be implemented with webpack-bundle-analyzer or similar
  // For now, return mock data
  return {
    totalSize: 2048000, // 2MB
    gzippedSize: 512000, // 512KB
    chunks: [
      { name: 'main', size: 1024000 },
      { name: 'vendor', size: 512000 },
      { name: 'runtime', size: 256000 },
      { name: 'async-components', size: 256000 },
    ],
  };
};