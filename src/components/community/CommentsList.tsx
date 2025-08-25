import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Avatar,
  IconButton,
  TextInput,
  Button,
  Menu,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useCommunityComments, useCommunityModeration } from '../../hooks/useCommunity';
import { Comment } from '../../types/community';

interface CommentsListProps {
  postId: string;
  focusInput?: boolean;
}

const CommentsList: React.FC<CommentsListProps> = ({
  postId,
  focusInput = false,
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const {
    comments,
    isLoading,
    isFetching,
    hasMore,
    loadMore,
    createComment,
    deleteComment,
    toggleLike,
    isCreating,
  } = useCommunityComments(postId);

  const { showReportDialog } = useCommunityModeration();

  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim()) return;

    const result = await createComment(newComment.trim(), replyingTo || undefined);
    
    if (result.success) {
      setNewComment('');
      setReplyingTo(null);
    } else {
      Alert.alert('Erro', result.error);
    }
  }, [newComment, replyingTo, createComment]);

  const handleReply = useCallback((commentId: string, username: string) => {
    setReplyingTo(commentId);
    setNewComment(`@${username} `);
  }, []);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    Alert.alert(
      'Deletar Comentário',
      'Tem certeza que deseja deletar este comentário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteComment(commentId);
            if (!result.success) {
              Alert.alert('Erro', result.error);
            }
          },
        },
      ]
    );
  }, [deleteComment]);

  const handleLikeComment = useCallback(async (commentId: string) => {
    const result = await toggleLike(commentId);
    if (!result.success) {
      Alert.alert('Erro', result.error);
    }
  }, [toggleLike]);

  const handleReportComment = useCallback((commentId: string) => {
    setMenuVisible(null);
    showReportDialog(commentId, 'comment', 'comentário');
  }, [showReportDialog]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const renderComment = useCallback(({ item: comment }: { item: Comment }) => (
    <View style={[
      styles.commentContainer,
      comment.parentId && styles.replyContainer,
    ]}>
      <Avatar.Image
        size={32}
        source={{ uri: comment.user.avatar }}
      />
      
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.username}>
            {comment.user.displayName}
          </Text>
          <Text style={styles.timeAgo}>
            {formatTimeAgo(comment.createdAt)}
          </Text>
          
          <Menu
            visible={menuVisible === comment.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={16}
                onPress={() => setMenuVisible(comment.id)}
              />
            }
          >
            <Menu.Item
              onPress={() => handleReportComment(comment.id)}
              title="Reportar"
              leadingIcon="flag"
            />
            {/* Adicionar opção de deletar se for o próprio comentário */}
            <Divider />
            <Menu.Item
              onPress={() => setMenuVisible(null)}
              title="Cancelar"
            />
          </Menu>
        </View>

        <Text style={styles.commentText}>
          {comment.content}
        </Text>

        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLikeComment(comment.id)}
          >
            <Text style={[
              styles.actionText,
              comment.isLiked && styles.likedText,
            ]}>
              {comment.isLiked ? 'Curtido' : 'Curtir'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleReply(comment.id, comment.user.username)}
          >
            <Text style={styles.actionText}>Responder</Text>
          </TouchableOpacity>

          {comment.likesCount > 0 && (
            <Text style={styles.likesCount}>
              {comment.likesCount} curtida{comment.likesCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>
    </View>
  ), [menuVisible, handleLikeComment, handleReply, handleReportComment]);

  const renderFooter = useCallback(() => {
    if (!isFetching || !hasMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  }, [isFetching, hasMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          Nenhum comentário ainda
        </Text>
        <Text style={styles.emptySubtext}>
          Seja o primeiro a comentar!
        </Text>
      </View>
    );
  }, [isLoading]);

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        style={styles.commentsList}
      />

      {/* Input para novo comentário */}
      <View style={styles.inputContainer}>
        {replyingTo && (
          <View style={styles.replyingIndicator}>
            <Text style={styles.replyingText}>
              Respondendo...
            </Text>
            <IconButton
              icon="close"
              size={16}
              onPress={() => {
                setReplyingTo(null);
                setNewComment('');
              }}
            />
          </View>
        )}
        
        <View style={styles.inputRow}>
          <TextInput
            mode="outlined"
            placeholder="Adicione um comentário..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            style={styles.commentInput}
            autoFocus={focusInput}
          />
          <Button
            mode="contained"
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || isCreating}
            loading={isCreating}
            style={styles.submitButton}
          >
            Enviar
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  replyContainer: {
    marginLeft: 24,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  likedText: {
    color: '#2196f3',
  },
  likesCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 16,
  },
  replyingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingText: {
    fontSize: 12,
    color: '#666',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#fff',
    maxHeight: 100,
  },
  submitButton: {
    alignSelf: 'flex-end',
  },
});

export default CommentsList;