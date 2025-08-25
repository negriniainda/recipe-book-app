import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Appbar,
  Text,
  Avatar,
  Button,
  Chip,
  Card,
  IconButton,
  Menu,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCommunityProfile } from '../../hooks/useCommunity';
import { useGetUserPostsQuery } from '../../services/communityApi';
import CommunityPostCard from '../../components/community/CommunityPostCard';

interface UserProfileScreenProps {
  navigation: any;
  route: {
    params: {
      userId: string;
    };
  };
}

const { width: screenWidth } = Dimensions.get('window');

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'recipes'>('posts');

  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
    toggleFollow,
    confirmBlockUser,
    isFollowing,
    isBlocking,
  } = useCommunityProfile(userId);

  const {
    data: postsData,
    isLoading: postsLoading,
    isFetching: postsFetching,
    refetch: refetchPosts,
  } = useGetUserPostsQuery(
    { userId, page: 1, limit: 20 },
    { skip: !userId }
  );

  const posts = postsData?.posts || [];

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchProfile(),
      refetchPosts(),
    ]);
  }, [refetchProfile, refetchPosts]);

  const handleFollowPress = useCallback(async () => {
    if (!profile) return;

    const result = await toggleFollow(userId);
    if (!result.success) {
      // Error já é tratado no hook
    }
  }, [profile, toggleFollow, userId]);

  const handleBlockUser = useCallback(() => {
    if (!profile) return;
    
    setMenuVisible(false);
    confirmBlockUser(userId, profile.username, () => {
      navigation.goBack();
    });
  }, [profile, confirmBlockUser, userId, navigation]);

  const handleReportUser = useCallback(() => {
    setMenuVisible(false);
    // Implementar report de usuário
    navigation.navigate('ReportUser', { userId });
  }, [navigation, userId]);

  const handlePostPress = useCallback((postId: string) => {
    navigation.navigate('PostDetail', { postId });
  }, [navigation]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Perfil" />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </View>
    );
  }

  if (profileError || !profile) {
    return (
      <View style={styles.errorContainer}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Perfil" />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            Erro ao carregar perfil
          </Text>
          <Button onPress={handleRefresh}>
            Tentar novamente
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={profile.displayName} />
        {!profile.isOwnProfile && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Appbar.Action
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={handleReportUser}
              title="Reportar usuário"
              leadingIcon="flag"
            />
            <Menu.Item
              onPress={handleBlockUser}
              title="Bloquear usuário"
              leadingIcon="block-helper"
            />
            <Divider />
            <Menu.Item
              onPress={() => setMenuVisible(false)}
              title="Cancelar"
            />
          </Menu>
        )}
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Header do Perfil */}
        <View style={styles.profileHeader}>
          {profile.coverImage && (
            <View style={styles.coverImageContainer}>
              {/* Implementar imagem de capa */}
            </View>
          )}
          
          <View style={styles.profileInfo}>
            <Avatar.Image
              size={80}
              source={{ uri: profile.avatar }}
              style={styles.avatar}
            />
            
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>
                  {profile.displayName}
                </Text>
                {profile.isVerified && (
                  <IconButton
                    icon="check-decagram"
                    size={20}
                    iconColor="#2196f3"
                    style={styles.verifiedIcon}
                  />
                )}
              </View>
              
              <Text style={styles.username}>
                @{profile.username}
              </Text>
              
              {profile.bio && (
                <Text style={styles.bio}>
                  {profile.bio}
                </Text>
              )}
              
              <View style={styles.metadata}>
                {profile.location && (
                  <View style={styles.metadataItem}>
                    <IconButton
                      icon="map-marker"
                      size={16}
                      iconColor="#666"
                      style={styles.metadataIcon}
                    />
                    <Text style={styles.metadataText}>
                      {profile.location}
                    </Text>
                  </View>
                )}
                
                <View style={styles.metadataItem}>
                  <IconButton
                    icon="calendar"
                    size={16}
                    iconColor="#666"
                    style={styles.metadataIcon}
                  />
                  <Text style={styles.metadataText}>
                    Entrou em {formatJoinDate(profile.joinedDate)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Estatísticas */}
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>
                {formatNumber(profile.recipesCount)}
              </Text>
              <Text style={styles.statLabel}>Receitas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('UserFollowers', { userId })}
            >
              <Text style={styles.statNumber}>
                {formatNumber(profile.followersCount)}
              </Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('UserFollowing', { userId })}
            >
              <Text style={styles.statNumber}>
                {formatNumber(profile.followingCount)}
              </Text>
              <Text style={styles.statLabel}>Seguindo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>
                {formatNumber(profile.likesReceived)}
              </Text>
              <Text style={styles.statLabel}>Curtidas</Text>
            </TouchableOpacity>
          </View>

          {/* Botões de Ação */}
          {!profile.isOwnProfile && (
            <View style={styles.actionButtons}>
              <Button
                mode={profile.isFollowing ? 'outlined' : 'contained'}
                onPress={handleFollowPress}
                loading={isFollowing}
                disabled={isFollowing || isBlocking}
                style={styles.followButton}
              >
                {profile.isFollowing ? 'Seguindo' : 'Seguir'}
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Chat', { userId })}
                style={styles.messageButton}
              >
                Mensagem
              </Button>
            </View>
          )}

          {profile.isOwnProfile && (
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('EditProfile')}
                style={styles.editButton}
              >
                Editar Perfil
              </Button>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'posts' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'posts' && styles.activeTabText,
            ]}>
              Posts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'recipes' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('recipes')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'recipes' && styles.activeTabText,
            ]}>
              Receitas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo das Tabs */}
        {activeTab === 'posts' && (
          <View style={styles.postsContainer}>
            {postsLoading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" />
              </View>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  onPress={() => handlePostPress(post.id)}
                  onUserPress={() => {}} // Já estamos no perfil
                  onLikePress={() => {}}
                  onBookmarkPress={() => {}}
                  onCommentPress={() => handlePostPress(post.id)}
                  onSharePress={() => {}}
                />
              ))
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>
                  Nenhum post ainda
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'recipes' && (
          <View style={styles.recipesContainer}>
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                Em breve: lista de receitas
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 16,
  },
  profileHeader: {
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  coverImageContainer: {
    height: 120,
    backgroundColor: '#e0e0e0',
  },
  profileInfo: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  avatar: {
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  verifiedIcon: {
    margin: 0,
    marginLeft: 4,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'column',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metadataIcon: {
    margin: 0,
    marginRight: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  followButton: {
    flex: 1,
  },
  messageButton: {
    flex: 1,
  },
  editButton: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196f3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#2196f3',
  },
  postsContainer: {
    paddingBottom: 16,
  },
  recipesContainer: {
    paddingBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default UserProfileScreen;