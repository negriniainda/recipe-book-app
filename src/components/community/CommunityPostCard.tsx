import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Avatar,
  IconButton,
  Chip,
  Menu,
  Divider,
} from 'react-native-paper';
import { CommunityPost } from '../../types/community';
import { useCommunityModeration } from '../../hooks/useCommunity';

interface CommunityPostCardProps {
  post: CommunityPost;
  onPress: () => void;
  onUserPress: () => void;
  onLikePress: () => void;
  onBookmarkPress: () => void;
  onCommentPress: () => void;
  onSharePress: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const imageWidth = screenWidth - 32; // Margem de 16 de cada lado

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  onPress,
  onUserPress,
  onLikePress,
  onBookmarkPress,
  onCommentPress,
  onSharePress,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { showReportDialog } = useCommunityModeration();

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return date.toLocaleDateString('pt-BR');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleReport = () => {
    setMenuVisible(false);
    showReportDialog(post.id, 'post', post.recipe.title);
  };

  return (
    <Card style={styles.card}>
      {/* Header do Post */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={onUserPress}
        >
          <Avatar.Image
            size={40}
            source={{ uri: post.user.avatar }}
          />
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <Text style={styles.username}>
                {post.user.displayName}
              </Text>
              {post.user.isVerified && (
                <IconButton
                  icon="check-decagram"
                  size={16}
                  iconColor="#2196f3"
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <Text style={styles.timeAgo}>
              {formatTimeAgo(post.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={handleMenuPress}
            />
          }
        >
          <Menu.Item
            onPress={handleReport}
            title="Reportar"
            leadingIcon="flag"
          />
          <Divider />
          <Menu.Item
            onPress={() => setMenuVisible(false)}
            title="Cancelar"
          />
        </Menu>
      </View>

      {/* Imagem da Receita */}
      <TouchableOpacity onPress={onPress}>
        <Image
          source={{ uri: post.recipe.mainImage }}
          style={styles.recipeImage}
          resizeMode="cover"
        />
      </TouchableOpacity>

      {/* Informações da Receita */}
      <Card.Content style={styles.content}>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.recipeTitle}>
            {post.recipe.title}
          </Text>
          {post.recipe.description && (
            <Text style={styles.recipeDescription} numberOfLines={2}>
              {post.recipe.description}
            </Text>
          )}
        </TouchableOpacity>

        {/* Caption do Post */}
        {post.caption && (
          <Text style={styles.caption} numberOfLines={3}>
            {post.caption}
          </Text>
        )}

        {/* Informações da Receita */}
        <View style={styles.recipeInfo}>
          <Chip
            icon="clock-outline"
            style={styles.infoChip}
            textStyle={styles.infoChipText}
          >
            {post.recipe.prepTime + post.recipe.cookTime}min
          </Chip>
          <Chip
            icon="account-group"
            style={styles.infoChip}
            textStyle={styles.infoChipText}
          >
            {post.recipe.servings} porções
          </Chip>
          <Chip
            icon={
              post.recipe.difficulty === 'easy'
                ? 'star-outline'
                : post.recipe.difficulty === 'medium'
                ? 'star-half-full'
                : 'star'
            }
            style={[
              styles.infoChip,
              {
                backgroundColor:
                  post.recipe.difficulty === 'easy'
                    ? '#e8f5e8'
                    : post.recipe.difficulty === 'medium'
                    ? '#fff3e0'
                    : '#ffebee',
              },
            ]}
            textStyle={styles.infoChipText}
          >
            {post.recipe.difficulty === 'easy'
              ? 'Fácil'
              : post.recipe.difficulty === 'medium'
              ? 'Médio'
              : 'Difícil'}
          </Chip>
        </View>

        {/* Tags */}
        {post.recipe.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.recipe.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                style={styles.tagChip}
                textStyle={styles.tagText}
              >
                #{tag}
              </Chip>
            ))}
            {post.recipe.tags.length > 3 && (
              <Text style={styles.moreTags}>
                +{post.recipe.tags.length - 3} mais
              </Text>
            )}
          </View>
        )}
      </Card.Content>

      {/* Ações do Post */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <IconButton
            icon={post.isLiked ? 'heart' : 'heart-outline'}
            iconColor={post.isLiked ? '#e91e63' : '#666'}
            size={24}
            onPress={onLikePress}
          />
          <Text style={styles.actionCount}>
            {formatNumber(post.likesCount)}
          </Text>

          <IconButton
            icon="comment-outline"
            iconColor="#666"
            size={24}
            onPress={onCommentPress}
            style={styles.commentButton}
          />
          <Text style={styles.actionCount}>
            {formatNumber(post.commentsCount)}
          </Text>

          <IconButton
            icon="share-variant"
            iconColor="#666"
            size={24}
            onPress={onSharePress}
            style={styles.shareButton}
          />
        </View>

        <IconButton
          icon={post.isBookmarked ? 'bookmark' : 'bookmark-outline'}
          iconColor={post.isBookmarked ? '#ff9800' : '#666'}
          size={24}
          onPress={onBookmarkPress}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  verifiedIcon: {
    margin: 0,
    marginLeft: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recipeImage: {
    width: '100%',
    height: 250,
  },
  content: {
    paddingTop: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  caption: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  recipeInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  infoChip: {
    backgroundColor: '#f5f5f5',
    height: 28,
  },
  infoChipText: {
    fontSize: 12,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  tagChip: {
    backgroundColor: '#e3f2fd',
    height: 24,
  },
  tagText: {
    fontSize: 11,
    color: '#1976d2',
  },
  moreTags: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionCount: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  commentButton: {
    marginLeft: 8,
  },
  shareButton: {
    marginLeft: 8,
  },
});

export default CommunityPostCard;