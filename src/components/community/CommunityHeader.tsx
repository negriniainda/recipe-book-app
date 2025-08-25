import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Avatar,
  Chip,
} from 'react-native-paper';
import { useGetCommunityStatsQuery } from '../../services/communityApi';

interface CommunityHeaderProps {
  onTrendingPress: () => void;
  onFollowingPress: () => void;
  onStatsPress: () => void;
}

const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  onTrendingPress,
  onFollowingPress,
  onStatsPress,
}) => {
  const { data: stats, isLoading } = useGetCommunityStatsQuery();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Estatísticas da Comunidade */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.statsTitle}>Comunidade RecipeBook</Text>
          {!isLoading && stats && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatNumber(stats.totalUsers)}
                </Text>
                <Text style={styles.statLabel}>Usuários</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatNumber(stats.totalRecipes)}
                </Text>
                <Text style={styles.statLabel}>Receitas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatNumber(stats.totalPosts)}
                </Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatNumber(stats.activeUsers)}
                </Text>
                <Text style={styles.statLabel}>Ativos</Text>
              </View>
            </View>
          )}
          <Button
            mode="text"
            onPress={onStatsPress}
            style={styles.viewStatsButton}
          >
            Ver estatísticas completas
          </Button>
        </Card.Content>
      </Card>

      {/* Filtros Rápidos */}
      <View style={styles.quickFilters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          <Chip
            icon="trending-up"
            onPress={onTrendingPress}
            style={styles.filterChip}
          >
            Em Alta
          </Chip>
          <Chip
            icon="account-heart"
            onPress={onFollowingPress}
            style={styles.filterChip}
          >
            Seguindo
          </Chip>
          <Chip
            icon="clock-outline"
            style={styles.filterChip}
          >
            Recentes
          </Chip>
          <Chip
            icon="star"
            style={styles.filterChip}
          >
            Mais Curtidos
          </Chip>
        </ScrollView>
      </View>

      {/* Categorias Populares */}
      {!isLoading && stats?.topCategories && (
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categorias Populares</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {stats.topCategories.slice(0, 6).map((category) => (
              <TouchableOpacity
                key={category.category}
                style={styles.categoryItem}
              >
                <Avatar.Text
                  size={48}
                  label={category.category.charAt(0).toUpperCase()}
                  style={styles.categoryAvatar}
                />
                <Text style={styles.categoryName}>
                  {category.category}
                </Text>
                <Text style={styles.categoryCount}>
                  {formatNumber(category.count)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tags Populares */}
      {!isLoading && stats?.topTags && (
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Tags em Alta</Text>
          <View style={styles.tagsContainer}>
            {stats.topTags.slice(0, 8).map((tag) => (
              <Chip
                key={tag.tag}
                style={styles.tagChip}
                textStyle={styles.tagText}
              >
                #{tag.tag} ({formatNumber(tag.count)})
              </Chip>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
  },
  statsCard: {
    margin: 16,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  viewStatsButton: {
    marginTop: 8,
  },
  quickFilters: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    elevation: 1,
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#e3f2fd',
  },
  categoriesSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  categoryAvatar: {
    backgroundColor: '#4caf50',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 10,
    color: '#666',
  },
  tagsSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#fff3e0',
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#f57c00',
  },
});

export default CommunityHeader;