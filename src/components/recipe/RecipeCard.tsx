import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Recipe } from '../../types/recipe';
import { AccessibilityWrapper } from '../accessibility/AccessibilityWrapper';

interface RecipeCardProps {
  recipe: Recipe;
  onFavorite?: (recipe: Recipe) => void;
  onShare?: (recipe: Recipe) => void;
  style?: any;
  compact?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onFavorite,
  onShare,
  style,
  compact = false,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('RecipeDetails' as never, { recipeId: recipe.id } as never);
  };

  const handleFavorite = () => {
    onFavorite?.(recipe);
  };

  const handleShare = () => {
    onShare?.(recipe);
  };

  const getDifficultyLabel = (difficulty: string) => {
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

  const getServingsLabel = (servings: number) => {
    return servings === 1 ? '1 porção' : `${servings} porções`;
  };

  return (
    <AccessibilityWrapper
      accessibilityRole="button"
      accessibilityLabel={`Receita ${recipe.title}`}
      accessibilityHint="Toque para ver os detalhes da receita"
    >
      <TouchableOpacity
        style={[styles.container, compact && styles.compactContainer, style]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {recipe.images && recipe.images.length > 0 && (
          <Image
            source={{ uri: recipe.images[0] }}
            style={[styles.image, compact && styles.compactImage]}
            resizeMode="cover"
          />
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, compact && styles.compactTitle]} numberOfLines={2}>
              {recipe.title}
            </Text>

            <View style={styles.actions}>
              {onFavorite && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleFavorite}
                  accessibilityLabel="Adicionar aos favoritos"
                  accessibilityRole="button"
                >
                  <Icon name="heart-outline" size={20} color="#666" />
                </TouchableOpacity>
              )}

              {onShare && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShare}
                  accessibilityLabel="Compartilhar receita"
                  accessibilityRole="button"
                >
                  <Icon name="share-outline" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {!compact && recipe.description && (
            <Text style={styles.description} numberOfLines={2}>
              {recipe.description}
            </Text>
          )}

          <View style={styles.metadata}>
            <View style={styles.timeInfo}>
              <Icon name="clock-outline" size={14} color="#666" />
              <Text style={styles.timeText}>{recipe.prepTime} min</Text>
              
              <Icon name="fire" size={14} color="#666" style={styles.cookIcon} />
              <Text style={styles.timeText}>{recipe.cookTime} min</Text>
            </View>

            <View style={styles.servingsInfo}>
              <Icon name="account-group-outline" size={14} color="#666" />
              <Text style={styles.servingsText}>
                {getServingsLabel(recipe.servings)}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.difficulty}>
              <Text style={styles.difficultyText}>
                {getDifficultyLabel(recipe.difficulty)}
              </Text>
            </View>

            <View style={styles.rating}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{recipe.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({recipe.reviewCount})</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </AccessibilityWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  compactContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  compactImage: {
    width: 80,
    height: 80,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  compactTitle: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    marginRight: 12,
  },
  cookIcon: {
    marginLeft: 8,
  },
  servingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servingsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficulty: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});