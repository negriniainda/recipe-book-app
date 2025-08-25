import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Appbar,
  FAB,
  Searchbar,
  Chip,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCommunityFeed, useCommunityPost } from '../../hooks/useCommunity';
import { CommunityFeedFilters } from '../../types/community';
import CommunityPostCard from '../../components/community/CommunityPostCard';
import CommunityHeader from '../../components/community/CommunityHeader';
import CreatePostModal from '../../components/community/CreatePostModal';
import FilterModal from '../../components/community/FilterModal';

interface CommunityScreenProps {
  navigation: any;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<CommunityFeedFilters>({});

  const {
    posts,
    isLoading,
    isFetching,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    resetFeed,
  } = useCommunityFeed(filters);

  const { toggleLike, toggleBookmark } = useCommunityPost();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Implementar busca quando necessário
  }, []);

  const handleApplyFilters = useCallback((newFilters: CommunityFeedFilters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
    resetFeed();
  }, [resetFeed]);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setShowFilterModal(false);
    resetFeed();
  }, [resetFeed]);

  const handlePostPress = useCallback((postId: string) => {
    navigation.navigate('PostDetail', { postId });
  }, [navigation]);

  const handleUserPress = useCallback((userId: string) => {
    navigation.navigate('UserProfile', { userId });
  }, [navigation]);

  const handleLikePress = useCallback(async (postId: string) => {
    const result = await toggleLike(postId);
    if (!result.success) {
      Alert.alert('Erro', result.error);
    }
  }, [toggleLike]);

  const handleBookmarkPress = useCallback(async (postId: string) => {
    const result = await toggleBookmark(postId);
    if (!result.success) {
      Alert.alert('Erro', result.error);
    }
  }, [toggleBookmark]);

  const handleCommentPress = useCallback((postId: string) => {
    navigation.navigate('PostDetail', { postId, focusComment: true });
  }, [navigation]);

  const handleSharePress = useCallback((postId: string) => {
    // Implementar compartilhamento
    navigation.navigate('SharePost', { postId });
  }, [navigation]);

  const renderPost = useCallback(({ item }: { item: any }) => (
    <CommunityPostCard
      post={item}
      onPress={() => handlePostPress(item.id)}
      onUserPress={() => handleUserPress(item.userId)}
      onLikePress={() => handleLikePress(item.id)}
      onBookmarkPress={() => handleBookmarkPress(item.id)}
      onCommentPress={() => handleCommentPress(item.id)}
      onSharePress={() => handleSharePress(item.id)}
    />
  ), [
    handlePostPress,
    handleUserPress,
    handleLikePress,
    handleBookmarkPress,
    handleCommentPress,
    handleSharePress,
  ]);

  const renderHeader = useCallback(() => (
    <CommunityHeader
      onTrendingPress={() => navigation.navigate('TrendingPosts')}
      onFollowingPress={() => setFilters({ ...filters, following: true })}
      onStatsPress={() => navigation.navigate('CommunityStats')}
    />
  ), [navigation, filters]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando posts...</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          Nenhum post encontrado
        </Text>
        <Text style={styles.emptySubtext}>
          Seja o primeiro a compartilhar uma receita!
        </Text>
      </View>
    );
  }, [isLoading]);

  const renderFooter = useCallback(() => {
    if (!isFetching || !hasMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  }, [isFetching, hasMore]);

  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key as keyof CommunityFeedFilters] !== undefined
  ).length;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Comunidade" />
        <Appbar.Action
          icon="filter-variant"
          onPress={() => setShowFilterModal(true)}
        />
        <Appbar.Action
          icon="account-search"
          onPress={() => navigation.navigate('SearchUsers')}
        />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar posts..."
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchbar}
        />
        {activeFiltersCount > 0 && (
          <Chip
            icon="filter"
            onPress={() => setShowFilterModal(true)}
            style={styles.filterChip}
          >
            {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''}
          </Chip>
        )}
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => setShowCreateModal(true)}
      />

      <CreatePostModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          refresh();
        }}
      />

      <FilterModal
        visible={showFilterModal}
        filters={filters}
        onDismiss={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  filterChip: {
    backgroundColor: '#e3f2fd',
  },
  listContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#2196f3',
  },
});

export default CommunityScreen;