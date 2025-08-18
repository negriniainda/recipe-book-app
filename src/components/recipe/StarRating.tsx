import React, {useState, useCallback} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text, IconButton} from 'react-native-paper';
import {theme} from '@/utils/theme';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
  showLabel?: boolean;
  showCount?: boolean;
  reviewCount?: number;
  style?: any;
}

const STAR_SIZES = {
  small: 16,
  medium: 20,
  large: 24,
};

const STAR_LABELS = {
  1: 'Ruim',
  2: 'Regular',
  3: 'Bom',
  4: 'Muito Bom',
  5: 'Excelente',
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 'medium',
  readonly = false,
  showLabel = false,
  showCount = false,
  reviewCount = 0,
  style,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const starSize = STAR_SIZES[size];
  const displayRating = hoverRating || rating;
  const isInteractive = !readonly && onRatingChange;

  const handleStarPress = useCallback((starIndex: number) => {
    if (isInteractive) {
      const newRating = starIndex + 1;
      onRatingChange!(newRating === rating ? 0 : newRating);
    }
  }, [isInteractive, onRatingChange, rating]);

  const handleStarPressIn = useCallback((starIndex: number) => {
    if (isInteractive) {
      setHoverRating(starIndex + 1);
    }
  }, [isInteractive]);

  const handleStarPressOut = useCallback(() => {
    if (isInteractive) {
      setHoverRating(0);
    }
  }, [isInteractive]);

  const renderStar = useCallback((index: number) => {
    const isFilled = index < Math.floor(displayRating);
    const isHalfFilled = index === Math.floor(displayRating) && displayRating % 1 >= 0.5;
    
    let iconName = 'star-outline';
    if (isFilled) {
      iconName = 'star';
    } else if (isHalfFilled) {
      iconName = 'star-half-full';
    }

    const StarComponent = isInteractive ? TouchableOpacity : View;
    
    return (
      <StarComponent
        key={index}
        style={styles.starContainer}
        onPress={isInteractive ? () => handleStarPress(index) : undefined}
        onPressIn={isInteractive ? () => handleStarPressIn(index) : undefined}
        onPressOut={isInteractive ? handleStarPressOut : undefined}
        activeOpacity={0.7}>
        <IconButton
          icon={iconName}
          size={starSize}
          iconColor={
            isFilled || isHalfFilled
              ? theme.colors.primary
              : theme.colors.outline
          }
          style={styles.star}
          disabled={!isInteractive}
        />
      </StarComponent>
    );
  }, [displayRating, isInteractive, starSize, handleStarPress, handleStarPressIn, handleStarPressOut]);

  const formatRating = useCallback((value: number) => {
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  }, []);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>
        {Array.from({length: 5}, (_, index) => renderStar(index))}
      </View>
      
      {(showLabel || showCount) && (
        <View style={styles.infoContainer}>
          {showLabel && rating > 0 && (
            <Text variant="bodySmall" style={styles.ratingLabel}>
              {STAR_LABELS[Math.round(rating) as keyof typeof STAR_LABELS]}
            </Text>
          )}
          
          {showCount && (
            <Text variant="bodySmall" style={styles.reviewCount}>
              {rating > 0 && `${formatRating(rating)} • `}
              {reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'}
            </Text>
          )}
          
          {!showLabel && !showCount && rating > 0 && (
            <Text variant="bodySmall" style={styles.ratingValue}>
              {formatRating(rating)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginHorizontal: -4,
  },
  star: {
    margin: 0,
  },
  infoContainer: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    fontWeight: '500',
    color: theme.colors.primary,
  },
  reviewCount: {
    opacity: 0.7,
  },
  ratingValue: {
    fontWeight: '500',
    color: theme.colors.primary,
  },
});

export default StarRating;