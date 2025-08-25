import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  ImageStyle,
  ViewStyle,
  Animated,
  Dimensions,
} from 'react-native';
import { useOptimizedImage, ImageDimensions } from '../../utils/imageOptimizer';
import { useLazyLoad } from '../../utils/lazyLoader';
import { AccessibleText } from '../accessibility/AccessibleText';

interface OptimizedImageProps {
  source: string | { uri: string };
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  width?: number;
  height?: number;
  aspectRatio?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
  placeholder?: React.ReactNode;
  errorComponent?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  fadeInDuration?: number;
  blurRadius?: number;
  tintColor?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  priority?: 'high' | 'normal' | 'low';
  preload?: boolean;
  cache?: boolean;
  progressive?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  containerStyle,
  width,
  height,
  aspectRatio,
  resizeMode = 'cover',
  quality = 85,
  format = 'webp',
  lazy = true,
  placeholder,
  errorComponent,
  onLoad,
  onError,
  onLoadStart,
  onLoadEnd,
  fadeInDuration = 300,
  blurRadius,
  tintColor,
  accessible = true,
  accessibilityLabel,
  testID,
  priority = 'normal',
  preload = false,
  cache = true,
  progressive = true,
}) => {
  const [isVisible, setIsVisible] = useState(!lazy);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  const containerRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const maxRetries = 3;

  // Get image URI
  const imageUri = typeof source === 'string' ? source : source.uri;

  // Calculate container dimensions
  const containerDimensions: ImageDimensions | undefined = React.useMemo(() => {
    if (width && height) {
      return { width, height };
    }
    if (width && aspectRatio) {
      return { width, height: width / aspectRatio };
    }
    if (height && aspectRatio) {
      return { width: height * aspectRatio, height };
    }
    return undefined;
  }, [width, height, aspectRatio]);

  // Get optimized image source
  const { optimizedSource, isLoading: isOptimizing, error: optimizationError } = useOptimizedImage(
    imageUri,
    containerDimensions,
    {
      quality,
      format,
      resize: containerDimensions,
      progressive,
    }
  );

  // Lazy loading
  useLazyLoad(
    containerRef,
    useCallback(() => {
      if (lazy && !isVisible) {
        setIsVisible(true);
      }
    }, [lazy, isVisible]),
    {
      threshold: 0.1,
      rootMargin: '50px',
    }
  );

  // Preload image if requested
  useEffect(() => {
    if (preload && optimizedSource && priority === 'high') {
      const img = new Image();
      img.src = optimizedSource.uri;
    }
  }, [preload, optimizedSource, priority]);

  // Handle image load start
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  }, [onLoadStart]);

  // Handle image load success
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setLoadAttempts(0);
    
    // Fade in animation
    if (fadeInDuration > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: fadeInDuration,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
    
    onLoad?.();
    onLoadEnd?.();
  }, [fadeAnim, fadeInDuration, onLoad, onLoadEnd]);

  // Handle image load error
  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setHasError(true);
    
    // Retry loading with exponential backoff
    if (loadAttempts < maxRetries) {
      const retryDelay = Math.pow(2, loadAttempts) * 1000; // 1s, 2s, 4s
      setTimeout(() => {
        setLoadAttempts(prev => prev + 1);
        setHasError(false);
        setIsLoading(true);
      }, retryDelay);
    } else {
      onError?.(error);
      onLoadEnd?.();
    }
  }, [loadAttempts, maxRetries, onError, onLoadEnd]);

  // Calculate final style
  const finalStyle = React.useMemo(() => {
    const baseStyle: ImageStyle = {
      width: width || '100%',
      height: height || (aspectRatio && width ? width / aspectRatio : undefined),
      ...style,
    };

    if (aspectRatio && !height && !width) {
      baseStyle.aspectRatio = aspectRatio;
    }

    return baseStyle;
  }, [style, width, height, aspectRatio]);

  // Render loading placeholder
  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <View style={[styles.placeholder, finalStyle]}>
        <ActivityIndicator 
          size="small" 
          color="#999" 
          style={styles.loadingIndicator}
        />
        {loadAttempts > 0 && (
          <AccessibleText style={styles.retryText}>
            Tentativa {loadAttempts + 1} de {maxRetries + 1}
          </AccessibleText>
        )}
      </View>
    );
  };

  // Render error component
  const renderError = () => {
    if (errorComponent) {
      return errorComponent;
    }

    return (
      <View style={[styles.errorContainer, finalStyle]}>
        <Text style={styles.errorIcon}>📷</Text>
        <AccessibleText style={styles.errorText}>
          Erro ao carregar imagem
        </AccessibleText>
        {loadAttempts >= maxRetries && (
          <AccessibleText style={styles.retryText}>
            Máximo de tentativas atingido
          </AccessibleText>
        )}
      </View>
    );
  };

  // Don't render anything if lazy loading and not visible
  if (lazy && !isVisible) {
    return (
      <View 
        ref={containerRef} 
        style={[styles.lazyContainer, containerStyle, finalStyle]}
        testID={testID}
      />
    );
  }

  // Show error state
  if (hasError && loadAttempts >= maxRetries) {
    return (
      <View style={[containerStyle, finalStyle]} testID={testID}>
        {renderError()}
      </View>
    );
  }

  // Show loading state
  if (isLoading || isOptimizing || !optimizedSource) {
    return (
      <View 
        ref={containerRef}
        style={[containerStyle, finalStyle]} 
        testID={testID}
      >
        {renderPlaceholder()}
      </View>
    );
  }

  // Show optimization error
  if (optimizationError) {
    console.warn('Image optimization error:', optimizationError);
    // Fall back to original source
  }

  const imageSource = optimizedSource || { uri: imageUri };

  return (
    <View 
      ref={containerRef}
      style={[containerStyle, finalStyle]} 
      testID={testID}
    >
      <Animated.Image
        source={imageSource}
        style={[
          finalStyle,
          {
            opacity: fadeInDuration > 0 ? fadeAnim : 1,
          },
        ]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        blurRadius={blurRadius}
        tintColor={tintColor}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel || 'Imagem'}
        cache={cache ? 'default' : 'reload'}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <View style={[styles.loadingOverlay, finalStyle]}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
    </View>
  );
};

// Progressive image component for multiple sizes
interface ProgressiveImageProps extends Omit<OptimizedImageProps, 'source'> {
  sources: Array<{ uri: string; width: number; height: number }>;
  containerWidth: number;
  containerHeight: number;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  sources,
  containerWidth,
  containerHeight,
  ...props
}) => {
  // Select best source based on container size and device pixel ratio
  const bestSource = React.useMemo(() => {
    const pixelRatio = Dimensions.get('window').scale;
    const targetWidth = containerWidth * pixelRatio;
    const targetHeight = containerHeight * pixelRatio;

    // Sort sources by size and find the best match
    const sortedSources = sources.sort((a, b) => a.width - b.width);
    
    // Find the smallest source that's larger than target
    const bestMatch = sortedSources.find(
      source => source.width >= targetWidth && source.height >= targetHeight
    );

    // If no source is large enough, use the largest available
    return bestMatch || sortedSources[sortedSources.length - 1];
  }, [sources, containerWidth, containerHeight]);

  return (
    <OptimizedImage
      source={bestSource}
      width={containerWidth}
      height={containerHeight}
      {...props}
    />
  );
};

// Image gallery component with optimized loading
interface ImageGalleryProps {
  images: string[];
  itemWidth: number;
  itemHeight: number;
  spacing?: number;
  lazy?: boolean;
  onImagePress?: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  itemWidth,
  itemHeight,
  spacing = 8,
  lazy = true,
  onImagePress,
}) => {
  return (
    <View style={styles.gallery}>
      {images.map((image, index) => (
        <View
          key={index}
          style={[
            styles.galleryItem,
            {
              width: itemWidth,
              height: itemHeight,
              marginRight: index < images.length - 1 ? spacing : 0,
            },
          ]}
        >
          <OptimizedImage
            source={image}
            width={itemWidth}
            height={itemHeight}
            lazy={lazy}
            onLoad={() => console.log(`Image ${index} loaded`)}
            style={styles.galleryImage}
            containerStyle={styles.galleryImageContainer}
            priority={index < 3 ? 'high' : 'normal'} // Prioritize first 3 images
            preload={index < 2} // Preload first 2 images
          />
          {onImagePress && (
            <View style={styles.galleryOverlay}>
              <Text 
                style={styles.galleryIndex}
                onPress={() => onImagePress(index)}
              >
                {index + 1}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  lazyContainer: {
    backgroundColor: '#f5f5f5',
  },
  placeholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginBottom: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorContainer: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  gallery: {
    flexDirection: 'row',
  },
  galleryItem: {
    position: 'relative',
  },
  galleryImage: {
    borderRadius: 8,
  },
  galleryImageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  galleryOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryIndex: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});