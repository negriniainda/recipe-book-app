import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import {FeedPostCard} from './FeedPostCard';
import {CommunityUser, FeedPost} from '../../types/community';
import {spacing} from '../../theme';

interface CommunityFeedProps {
  posts: FeedPost[];
  currentUser: CommunityUser | null;
  onLike: (targetId: string, targetType: 'recipe' | 'comment', action: 'like' | 'unlike') => void;
  onSave: (recipeId: string, action: 'save' | 'unsave', collectionId?: string) => void;
  onComment: (recipeId: string, content: string, parentId?: string) => void;
  onFollow: (userId: string, action: 'follow' | 'unfollow') => void;
  onRecipePress: (recipe: any) => void;
  onUserPress: (userId: string) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  currentUser,
  onLike,
  onSave,
  onComment,
  onFollow,
  onRecipePress,
  onUserPress,
}) => {
  const renderPost = ({item}: {item: FeedPost}) => (
    <FeedPostCard
      post={item}
      currentUser={currentUser}
      onLike={onLike}
      onSave={onSave}
      onComment={onComment}
      onFollow={onFollow}
      onRecipePress={onRecipePress}
      onUserPress={onUserPress}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Parent ScrollView handles scrolling
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: spacing.sm,
  },
});