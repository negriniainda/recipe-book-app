import React, { Suspense, ComponentType, lazy } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AccessibleText } from '../components/accessibility/AccessibleText';

// Loading component
interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Carregando...', 
  size = 'large' 
}) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size={size} color="#FF6B35" />
    <AccessibleText style={styles.loadingText}>{message}</AccessibleText>
  </View>
);

// Error boundary for lazy loaded components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error?: Error }> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <View style={styles.errorContainer}>
    <AccessibleText style={styles.errorTitle}>
      Erro ao carregar componente
    </AccessibleText>
    <AccessibleText style={styles.errorMessage}>
      {error?.message || 'Ocorreu um erro inesperado'}
    </AccessibleText>
  </View>
);

// Lazy loader with enhanced features
interface LazyLoaderOptions {
  loading?: React.ComponentType<LoadingProps>;
  error?: React.ComponentType<{ error?: Error }>;
  delay?: number;
  timeout?: number;
  retry?: boolean;
  preload?: boolean;
}

export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoaderOptions = {}
) => {
  const {
    loading: LoadingComponent = Loading,
    error: ErrorComponent,
    delay = 200,
    timeout = 10000,
    retry = true,
    preload = false,
  } = options;

  // Create lazy component with timeout
  const LazyComponent = lazy(() => {
    const importPromise = importFn();
    
    if (timeout > 0) {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Component loading timeout')), timeout);
      });
      
      return Promise.race([importPromise, timeoutPromise]);
    }
    
    return importPromise;
  });

  // Preload component if requested
  if (preload) {
    importFn().catch(console.error);
  }

  const WrappedComponent: React.FC<any> = (props) => {
    const [retryCount, setRetryCount] = React.useState(0);
    const [showLoading, setShowLoading] = React.useState(false);

    React.useEffect(() => {
      const timer = setTimeout(() => setShowLoading(true), delay);
      return () => clearTimeout(timer);
    }, []);

    const handleRetry = React.useCallback(() => {
      if (retry && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        // Force re-render to retry loading
        window.location.reload?.();
      }
    }, [retry, retryCount]);

    return (
      <LazyErrorBoundary fallback={ErrorComponent}>
        <Suspense
          fallback={
            showLoading ? (
              <LoadingComponent message="Carregando componente..." />
            ) : (
              <View style={styles.placeholder} />
            )
          }
        >
          <LazyComponent {...props} />
        </Suspense>
      </LazyErrorBoundary>
    );
  };

  // Add preload method to component
  (WrappedComponent as any).preload = () => importFn();

  return WrappedComponent;
};

// Preloader utility
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();

  static preload(componentName: string, importFn: () => Promise<any>) {
    if (this.preloadedComponents.has(componentName)) {
      return Promise.resolve();
    }

    this.preloadedComponents.add(componentName);
    return importFn().catch(error => {
      console.error(`Failed to preload ${componentName}:`, error);
      this.preloadedComponents.delete(componentName);
    });
  }

  static preloadMultiple(components: Array<{ name: string; importFn: () => Promise<any> }>) {
    return Promise.allSettled(
      components.map(({ name, importFn }) => this.preload(name, importFn))
    );
  }

  static isPreloaded(componentName: string): boolean {
    return this.preloadedComponents.has(componentName);
  }

  static clear() {
    this.preloadedComponents.clear();
  }
}

// Route-based preloader
export const useRoutePreloader = (routes: string[]) => {
  React.useEffect(() => {
    const preloadRoutes = async () => {
      const routeImports = routes.map(route => ({
        name: route,
        importFn: () => import(`../screens/${route}`),
      }));

      await ComponentPreloader.preloadMultiple(routeImports);
    };

    // Preload after a short delay to not block initial render
    const timer = setTimeout(preloadRoutes, 1000);
    return () => clearTimeout(timer);
  }, [routes]);
};

// Intersection observer for lazy loading
export const useLazyLoad = (
  ref: React.RefObject<any>,
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, callback, options]);
};

// Memory-aware lazy loading
export const useMemoryAwareLazyLoad = () => {
  const [canLoad, setCanLoad] = React.useState(true);

  React.useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        // Don't lazy load if memory usage is above 80%
        setCanLoad(memoryUsage < 0.8);
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000);

    return () => clearInterval(interval);
  }, []);

  return canLoad;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  placeholder: {
    height: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});