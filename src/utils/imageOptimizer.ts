import { Dimensions, PixelRatio } from 'react-native';

// Image optimization utilities
export interface ImageDimensions {
  width: number;
  height: number;
}

export interface OptimizedImageSource {
  uri: string;
  width?: number;
  height?: number;
  cache?: 'default' | 'reload' | 'force-cache' | 'only-if-cached';
}

export interface ImageOptimizationOptions {
  quality?: number; // 0-100
  format?: 'webp' | 'jpeg' | 'png';
  resize?: ImageDimensions;
  crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  blur?: number;
  grayscale?: boolean;
  progressive?: boolean;
}

class ImageOptimizerService {
  private static instance: ImageOptimizerService;
  private cache = new Map<string, OptimizedImageSource>();
  private readonly baseUrl = 'https://your-image-cdn.com'; // Replace with your CDN
  
  static getInstance(): ImageOptimizerService {
    if (!ImageOptimizerService.instance) {
      ImageOptimizerService.instance = new ImageOptimizerService();
    }
    return ImageOptimizerService.instance;
  }

  // Get device-specific image dimensions
  getOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number
  ): ImageDimensions {
    const screenData = Dimensions.get('window');
    const pixelRatio = PixelRatio.get();
    
    const screenWidth = screenData.width * pixelRatio;
    const screenHeight = screenData.height * pixelRatio;
    
    const targetMaxWidth = maxWidth ? maxWidth * pixelRatio : screenWidth;
    const targetMaxHeight = maxHeight ? maxHeight * pixelRatio : screenHeight;
    
    // Calculate aspect ratio
    const aspectRatio = originalWidth / originalHeight;
    
    let optimizedWidth = Math.min(originalWidth, targetMaxWidth);
    let optimizedHeight = optimizedWidth / aspectRatio;
    
    if (optimizedHeight > targetMaxHeight) {
      optimizedHeight = targetMaxHeight;
      optimizedWidth = optimizedHeight * aspectRatio;
    }
    
    return {
      width: Math.round(optimizedWidth),
      height: Math.round(optimizedHeight),
    };
  }

  // Generate optimized image URL
  generateOptimizedUrl(
    originalUrl: string,
    options: ImageOptimizationOptions = {}
  ): string {
    if (!originalUrl || originalUrl.startsWith('data:')) {
      return originalUrl;
    }

    const {
      quality = 85,
      format = 'webp',
      resize,
      crop = 'center',
      blur,
      grayscale,
      progressive = true,
    } = options;

    const params = new URLSearchParams();
    
    // Quality
    params.append('q', quality.toString());
    
    // Format
    params.append('f', format);
    
    // Resize
    if (resize) {
      params.append('w', resize.width.toString());
      params.append('h', resize.height.toString());
      params.append('c', crop);
    }
    
    // Effects
    if (blur) params.append('blur', blur.toString());
    if (grayscale) params.append('grayscale', '1');
    if (progressive) params.append('progressive', '1');
    
    // Auto-optimize for device
    params.append('auto', 'compress,format');
    
    // Use CDN if available, otherwise return original
    if (this.baseUrl && !originalUrl.startsWith(this.baseUrl)) {
      return `${this.baseUrl}/optimize?url=${encodeURIComponent(originalUrl)}&${params.toString()}`;
    }
    
    return `${originalUrl}${originalUrl.includes('?') ? '&' : '?'}${params.toString()}`;
  }

  // Get optimized image source with caching
  getOptimizedSource(
    originalUrl: string,
    containerDimensions?: ImageDimensions,
    options: ImageOptimizationOptions = {}
  ): OptimizedImageSource {
    const cacheKey = `${originalUrl}_${JSON.stringify({ containerDimensions, options })}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let optimizedOptions = { ...options };
    
    // Auto-resize based on container dimensions
    if (containerDimensions && !options.resize) {
      optimizedOptions.resize = this.getOptimalDimensions(
        containerDimensions.width * 2, // Assume 2x for retina
        containerDimensions.height * 2,
        containerDimensions.width,
        containerDimensions.height
      );
    }

    const optimizedSource: OptimizedImageSource = {
      uri: this.generateOptimizedUrl(originalUrl, optimizedOptions),
      width: optimizedOptions.resize?.width,
      height: optimizedOptions.resize?.height,
      cache: 'default',
    };

    this.cache.set(cacheKey, optimizedSource);
    return optimizedSource;
  }

  // Generate multiple sizes for responsive images
  generateResponsiveSources(
    originalUrl: string,
    sizes: number[],
    options: Omit<ImageOptimizationOptions, 'resize'> = {}
  ): OptimizedImageSource[] {
    return sizes.map(size => {
      const dimensions = { width: size, height: size };
      return this.getOptimizedSource(originalUrl, dimensions, options);
    });
  }

  // Preload images
  async preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = reject;
      image.src = url;
    });
  }

  // Preload multiple images with priority
  async preloadImages(
    urls: string[],
    options: { priority?: 'high' | 'low'; timeout?: number } = {}
  ): Promise<void> {
    const { priority = 'low', timeout = 10000 } = options;
    
    const preloadPromises = urls.map(url => {
      const preloadPromise = this.preloadImage(url);
      
      if (timeout > 0) {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Image preload timeout')), timeout);
        });
        
        return Promise.race([preloadPromise, timeoutPromise]);
      }
      
      return preloadPromise;
    });

    if (priority === 'high') {
      await Promise.all(preloadPromises);
    } else {
      // Low priority - don't wait for all to complete
      Promise.allSettled(preloadPromises);
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize(): number {
    return this.cache.size;
  }

  // Remove old cache entries
  cleanupCache(maxAge: number = 3600000): void { // 1 hour default
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((value, key) => {
      // This is a simplified cleanup - in a real app, you'd store timestamps
      if (Math.random() < 0.1) { // Randomly clean 10% of entries
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Singleton instance
export const imageOptimizer = ImageOptimizerService.getInstance();

// React hooks for image optimization
export const useOptimizedImage = (
  url: string,
  containerDimensions?: ImageDimensions,
  options: ImageOptimizationOptions = {}
) => {
  const [optimizedSource, setOptimizedSource] = React.useState<OptimizedImageSource | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!url) {
      setOptimizedSource(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const source = imageOptimizer.getOptimizedSource(url, containerDimensions, options);
      setOptimizedSource(source);
      
      // Preload the optimized image
      imageOptimizer.preloadImage(source.uri)
        .then(() => setIsLoading(false))
        .catch(err => {
          setError(err);
          setIsLoading(false);
        });
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, [url, containerDimensions, options]);

  return { optimizedSource, isLoading, error };
};

// Hook for responsive images
export const useResponsiveImage = (
  url: string,
  sizes: number[] = [300, 600, 900, 1200],
  options: Omit<ImageOptimizationOptions, 'resize'> = {}
) => {
  const [sources, setSources] = React.useState<OptimizedImageSource[]>([]);

  React.useEffect(() => {
    if (!url) {
      setSources([]);
      return;
    }

    const responsiveSources = imageOptimizer.generateResponsiveSources(url, sizes, options);
    setSources(responsiveSources);
  }, [url, sizes, options]);

  return sources;
};

// Image preloader hook
export const useImagePreloader = () => {
  const preloadImages = React.useCallback(
    (urls: string[], options?: { priority?: 'high' | 'low'; timeout?: number }) => {
      return imageOptimizer.preloadImages(urls, options);
    },
    []
  );

  return { preloadImages };
};

// Utility functions
export const getImageDimensions = async (url: string): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = reject;
    image.src = url;
  });
};

export const isWebPSupported = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
};

export const getOptimalFormat = (): 'webp' | 'jpeg' => {
  return isWebPSupported() ? 'webp' : 'jpeg';
};

// Image compression for uploads
export const compressImage = (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string;
  } = {}
): Promise<Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();

    image.onload = () => {
      const { width, height } = imageOptimizer.getOptimalDimensions(
        image.width,
        image.height,
        maxWidth,
        maxHeight
      );

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        format,
        quality
      );
    };

    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
};