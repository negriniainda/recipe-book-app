import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Text, IconButton, Chip, Avatar } from 'react-native-paper';
import { Recipe } from '@/types';
import { theme } from '@/utils/theme';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  onFavorite?: (recipeId: string) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  onFavorite,
  showActions = true,
  variant = 'default',
}) => {
  const handleFavoritePress = () => {
    onFavorite?.(recipe.id);
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: Recipe['difficulty']): string => {
    switch (difficulty) {
      case 'easy':
        return '#4caf50';
      case 'medium':
        return '#ff9800';
      case 'hard':
        return '#f44336';
      default:
        return theme.colors.primary;
    }
  };

  const getDifficultyLabel = (difficulty: Recipe['difficulty']): string => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'hard':
        return 'Difícil';
      default:
        return difficulty;
    }
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity onPress={() => onPress(recipe)} style={styles.compactContainer}>
        <View style={styles.compactContent}>
          {recipe.images[0] && (
            <Image source={{ uri: recipe.images[0] }} style={styles.compactImage} />
          )}
          <View style={styles.compactInfo}>
            <Text variant="titleSmall" numberOfLines={2} style={styles.compactTitle}>
              {recipe.title}
            </Text>
            <Text variant="bodySmall" style={styles.compactTime}>
              {formatTime(recipe.prepTime + recipe.cookTime)}
            </Text>
          </View>
          {showActions && (
            <IconButton
              icon={recipe.isFavorite ? 'heart' : 'heart-outline'}
              iconColor={recipe.isFavorite ? '#f44336' : theme.colors.onSurface}
              size={20}
              onPress={handleFavoritePress}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Card style={styles.card} onPress={() => onPress(recipe)}>
      {recipe.images[0] && (
        <Card.Cover 
          source={{ uri: recipe.images[0] }} 
          style={styles.cover}
        />
      )}
      
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text variant="titleMedium" numberOfLines={2} style={styles.title}>
            {recipe.title}
          </Text>
          {showActions && (
            <IconButton
              icon={recipe.isFavorite ? 'heart' : 'heart-outline'}
              iconColor={recipe.isFavorite ? '#f44336' : theme.colors.onSurface}
              size={24}
              onPress={handleFavoritePress}
              style={styles.favoriteButton}
            />
          )}
        </View>

        {recipe.description && (
          <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
            {recipe.description}
          </Text>
        )}

        <View style={styles.metadata}>
          <View style={styles.timeContainer}>
            <IconButton icon="clock-outline" size={16} style={styles.timeIcon} />
            <Text variant="bodySmall" style={styles.timeText}>
              {formatTime(recipe.prepTime + recipe.cookTime)}
            </Text>
          </View>

          <View style={styles.servingsContainer}>
            <IconButton icon="account-group-outline" size={16} style={styles.servingsIcon} />
            <Text variant="bodySmall" style={styles.servingsText}>
              {recipe.servings} {recipe.servings === 1 ? 'porção' : 'porções'}
            </Text>
          </View>

          <Chip
            mode="outlined"
            textStyle={[styles.difficultyText, { color: getDifficultyColor(recipe.difficulty) }]}
            style={[styles.difficultyChip, { borderColor: getDifficultyColor(recipe.difficulty) }]}
          >
            {getDifficultyLabel(recipe.difficulty)}
          </Chip>
        </View>

        {variant === 'detailed' && (
          <>
            <View style={styles.tags}>
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <Chip key={index} mode="outlined" compact style={styles.tag}>
                  {tag}
                </Chip>
              ))}
              {recipe.tags.length > 3 && (
                <Text variant="bodySmall" style={styles.moreTagsText}>
                  +{recipe.tags.length - 3} mais
                </Text>
              )}
            </View>

            {recipe.originalAuthor && (
              <View style={styles.authorContainer}>
                <Avatar.Icon size={24} icon="chef-hat" style={styles.authorAvatar} />
                <Text variant="bodySmall" style={styles.authorText}>
                  Por {recipe.originalAuthor}
                </Text>
              </View>
            )}
          </>
        )}

        <View style={styles.footer}>
          <View style={styles.stats}>
            {recipe.likes > 0 && (
              <View style={styles.stat}>
                <IconButton icon="heart" size={16} iconColor="#f44336" style={styles.statIcon} />
                <Text variant="bodySmall" style={styles.statText}>
                  {recipe.likes}
                </Text>
              </View>
            )}
            {recipe.rating && (
              <View style={styles.stat}>
                <IconButton icon="star" size={16} iconColor="#ffc107" style={styles.statIcon} />
                <Text variant="bodySmall" style={styles.statText}>
                  {recipe.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          <Text variant="bodySmall" style={styles.dateText}>
            {new Date(recipe.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cover: {
    height: 200,
  },
  content: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 8,
  },
  favoriteButton: {
    margin: 0,
    marginTop: -8,
  },
  description: {
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 18,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  timeIcon: {
    margin: 0,
    marginRight: 4,
  },
  timeText: {
    opacity: 0.7,
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  servingsIcon: {
    margin: 0,
    marginRight: 4,
  },
  servingsText: {
    opacity: 0.7,
  },
  difficultyChip: {
    height: 24,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    height: 24,
    marginRight: 0,
  },
  moreTagsText: {
    opacity: 0.7,
    alignSelf: 'center',
    marginLeft: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    backgroundColor: theme.colors.primary,
    marginRight: 8,
  },
  authorText: {
    opacity: 0.7,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statIcon: {
    margin: 0,
    marginRight: 2,
  },
  statText: {
    opacity: 0.7,
    fontSize: 12,
  },
  dateText: {
    opacity: 0.5,
    fontSize: 11,
  },
  // Compact variant styles
  compactContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    marginBottom: 8,
    elevation: 1,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  compactImage: {
    width: 60,
    height: 60,
    borderRadius: theme.roundness,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  compactTime: {
    opacity: 0.7,
  },
});

export default RecipeCard;