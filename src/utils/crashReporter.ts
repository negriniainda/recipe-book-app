import { Platform } from 'react-native';

// Crash and error reporting interfaces
export interface CrashReport {
  id: string;
  timestamp: number;
  type: 'javascript' | 'native' | 'unhandled_promise';
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  sessionId: string;
  appVersion: string;
  platform: string;
  deviceInfo: DeviceInfo;
  breadcrumbs: Breadcrumb[];
  metadata: Record<string, any>;
}

export interface DeviceInfo {
  platform: string;
  version: string;
  model?: string;
  manufacturer?: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  memoryUsage?: number;
  diskSpace?: number;
  networkType?: string;
  batteryLevel?: number;
}

export interface Breadcrumb {
  timestamp: number;
  category: 'navigation' | 'user_action' | 'network' | 'state_change' | 'error';
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

export interface ErrorBoundaryInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

// Crash reporter service
class CrashReporterService {
  private static instance: CrashReporterService;
  private breadcrumbs: Breadcrumb[] = [];
  private sessionId: string;
  private userId?: string;
  private isEnabled = true;
  private maxBreadcrumbs = 50;
  private reportingEndpoint = 'https://your-crash-reporting-service.com/api/crashes';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): CrashReporterService {
    if (!CrashReporterService.instance) {
      CrashReporterService.instance = new CrashReporterService();
    }
    return CrashReporterService.instance;
  }

  // Setup global error handlers
  private setupGlobalErrorHandlers(): void {
    // JavaScript errors
    const originalErrorHandler = global.ErrorUtils?.getGlobalHandler();
    global.ErrorUtils?.setGlobalHandler((error: Error, isFatal?: boolean) => {
      this.reportCrash({
        type: 'javascript',
        error,
        isFatal: isFatal || false,
      });

      // Call original handler
      if (originalErrorHandler) {
        originalErrorHandler(error, isFatal);
      }
    });

    // Unhandled promise rejections
    const originalRejectionHandler = global.onunhandledrejection;
    global.onunhandledrejection = (event: PromiseRejectionEvent) => {
      this.reportCrash({
        type: 'unhandled_promise',
        error: new Error(event.reason?.toString() || 'Unhandled promise rejection'),
        isFatal: false,
      });

      if (originalRejectionHandler) {
        originalRejectionHandler(event);
      }
    };

    // Console errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      this.addBreadcrumb({
        category: 'error',
        message: args.join(' '),
        level: 'error',
      });

      originalConsoleError.apply(console, args);
    };
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Set user ID for crash reports
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Enable/disable crash reporting
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Add breadcrumb
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: Date.now(),
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Limit breadcrumbs to prevent memory issues
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  // Get device information
  private async getDeviceInfo(): Promise<DeviceInfo> {
    const { width, height } = require('react-native').Dimensions.get('window');
    const pixelRatio = require('react-native').PixelRatio.get();

    const deviceInfo: DeviceInfo = {
      platform: Platform.OS,
      version: Platform.Version.toString(),
      screenWidth: width,
      screenHeight: height,
      pixelRatio,
    };

    // Get additional device info if available
    try {
      const DeviceInfo = require('react-native-device-info');
      
      deviceInfo.model = await DeviceInfo.getModel();
      deviceInfo.manufacturer = await DeviceInfo.getManufacturer();
      deviceInfo.memoryUsage = await DeviceInfo.getUsedMemory();
      deviceInfo.diskSpace = await DeviceInfo.getFreeDiskStorage();
      deviceInfo.batteryLevel = await DeviceInfo.getBatteryLevel();
    } catch (error) {
      // DeviceInfo not available or failed
      console.warn('Could not get extended device info:', error);
    }

    // Get network info if available
    try {
      const NetInfo = require('@react-native-netinfo/netinfo');
      const netInfo = await NetInfo.fetch();
      deviceInfo.networkType = netInfo.type;
    } catch (error) {
      // NetInfo not available
    }

    return deviceInfo;
  }

  // Report crash
  async reportCrash(crashInfo: {
    type: CrashReport['type'];
    error: Error;
    isFatal: boolean;
    componentStack?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const deviceInfo = await this.getDeviceInfo();
      const appVersion = require('../../package.json').version;

      const crashReport: CrashReport = {
        id: `crash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: crashInfo.type,
        message: crashInfo.error.message,
        stack: crashInfo.error.stack,
        componentStack: crashInfo.componentStack,
        userId: this.userId,
        sessionId: this.sessionId,
        appVersion,
        platform: Platform.OS,
        deviceInfo,
        breadcrumbs: [...this.breadcrumbs],
        metadata: {
          isFatal: crashInfo.isFatal,
          ...crashInfo.metadata,
        },
      };

      // Send to crash reporting service
      await this.sendCrashReport(crashReport);

      // Store locally as backup
      await this.storeCrashReportLocally(crashReport);

      console.error('Crash reported:', crashReport.id);
    } catch (error) {
      console.error('Failed to report crash:', error);
    }
  }

  // Send crash report to service
  private async sendCrashReport(crashReport: CrashReport): Promise<void> {
    try {
      const response = await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(crashReport),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send crash report to service:', error);
      throw error;
    }
  }

  // Store crash report locally
  private async storeCrashReportLocally(crashReport: CrashReport): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const key = `crash_report_${crashReport.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(crashReport));
    } catch (error) {
      console.error('Failed to store crash report locally:', error);
    }
  }

  // Get stored crash reports
  async getStoredCrashReports(): Promise<CrashReport[]> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const keys = await AsyncStorage.getAllKeys();
      const crashKeys = keys.filter(key => key.startsWith('crash_report_'));
      
      const crashReports: CrashReport[] = [];
      for (const key of crashKeys) {
        try {
          const reportJson = await AsyncStorage.getItem(key);
          if (reportJson) {
            crashReports.push(JSON.parse(reportJson));
          }
        } catch (error) {
          console.error(`Failed to parse crash report ${key}:`, error);
        }
      }

      return crashReports.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to get stored crash reports:', error);
      return [];
    }
  }

  // Clear stored crash reports
  async clearStoredCrashReports(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const keys = await AsyncStorage.getAllKeys();
      const crashKeys = keys.filter(key => key.startsWith('crash_report_'));
      await AsyncStorage.multiRemove(crashKeys);
    } catch (error) {
      console.error('Failed to clear stored crash reports:', error);
    }
  }

  // Send stored crash reports
  async sendStoredCrashReports(): Promise<void> {
    const storedReports = await this.getStoredCrashReports();
    
    for (const report of storedReports) {
      try {
        await this.sendCrashReport(report);
        
        // Remove from local storage after successful send
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        await AsyncStorage.removeItem(`crash_report_${report.id}`);
      } catch (error) {
        console.error(`Failed to send stored crash report ${report.id}:`, error);
      }
    }
  }

  // Get crash statistics
  async getCrashStatistics(): Promise<{
    totalCrashes: number;
    crashesByType: Record<string, number>;
    crashesByPlatform: Record<string, number>;
    recentCrashes: CrashReport[];
    crashRate: number;
  }> {
    const storedReports = await this.getStoredCrashReports();
    const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
    const recentCrashes = storedReports.filter(report => report.timestamp > last24Hours);

    const crashesByType: Record<string, number> = {};
    const crashesByPlatform: Record<string, number> = {};

    storedReports.forEach(report => {
      crashesByType[report.type] = (crashesByType[report.type] || 0) + 1;
      crashesByPlatform[report.platform] = (crashesByPlatform[report.platform] || 0) + 1;
    });

    return {
      totalCrashes: storedReports.length,
      crashesByType,
      crashesByPlatform,
      recentCrashes: recentCrashes.slice(0, 10),
      crashRate: recentCrashes.length, // Crashes per day
    };
  }
}

// React Error Boundary with crash reporting
export class CrashReportingErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; resetError: () => void }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorBoundaryInfo) {
    crashReporter.reportCrash({
      type: 'javascript',
      error,
      isFatal: false,
      componentStack: errorInfo.componentStack,
      metadata: {
        errorBoundary: this.constructor.name,
        errorBoundaryStack: errorInfo.errorBoundaryStack,
      },
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ error, resetError }) => (
  <div style={{ padding: 20, textAlign: 'center' }}>
    <h2>Oops! Algo deu errado</h2>
    <p>Ocorreu um erro inesperado. O problema foi reportado automaticamente.</p>
    <details style={{ marginTop: 20, textAlign: 'left' }}>
      <summary>Detalhes do erro</summary>
      <pre style={{ marginTop: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
        {error.message}
        {error.stack && `\n\n${error.stack}`}
      </pre>
    </details>
    <button onClick={resetError} style={{ marginTop: 20, padding: '10px 20px' }}>
      Tentar Novamente
    </button>
  </div>
);

// Singleton instance
export const crashReporter = CrashReporterService.getInstance();

// React hooks for crash reporting
export const useCrashReporting = () => {
  React.useEffect(() => {
    crashReporter.setEnabled(true);
    
    // Send any stored crash reports on app start
    crashReporter.sendStoredCrashReports();
    
    return () => {
      crashReporter.setEnabled(false);
    };
  }, []);

  return {
    reportCrash: crashReporter.reportCrash.bind(crashReporter),
    addBreadcrumb: crashReporter.addBreadcrumb.bind(crashReporter),
    setUserId: crashReporter.setUserId.bind(crashReporter),
    getCrashStatistics: crashReporter.getCrashStatistics.bind(crashReporter),
  };
};

// Hook for automatic breadcrumb tracking
export const useBreadcrumbTracking = (componentName: string) => {
  React.useEffect(() => {
    crashReporter.addBreadcrumb({
      category: 'navigation',
      message: `Entered ${componentName}`,
      level: 'info',
    });

    return () => {
      crashReporter.addBreadcrumb({
        category: 'navigation',
        message: `Left ${componentName}`,
        level: 'info',
      });
    };
  }, [componentName]);
};

// Network error tracking
export const trackNetworkError = (url: string, error: Error, statusCode?: number) => {
  crashReporter.addBreadcrumb({
    category: 'network',
    message: `Network error: ${url}`,
    level: 'error',
    data: {
      url,
      error: error.message,
      statusCode,
    },
  });
};

// User action tracking
export const trackUserAction = (action: string, target: string, data?: Record<string, any>) => {
  crashReporter.addBreadcrumb({
    category: 'user_action',
    message: `User ${action} on ${target}`,
    level: 'info',
    data,
  });
};

// State change tracking
export const trackStateChange = (stateName: string, oldValue: any, newValue: any) => {
  crashReporter.addBreadcrumb({
    category: 'state_change',
    message: `State ${stateName} changed`,
    level: 'info',
    data: {
      stateName,
      oldValue: JSON.stringify(oldValue),
      newValue: JSON.stringify(newValue),
    },
  });
};