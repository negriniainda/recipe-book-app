import React, {useCallback} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {
  Card,
  Text,
  IconButton,
  Chip,
  Avatar,
  Menu,
  Divider,
} from 'react-native-paper';
import {CustomList} from '@/types/lists';
import {theme} from '@/utils/theme';

interface ListCardProps {
  list: CustomList;
  onPress: (list: CustomList) => void;
  onEdit?: (list: CustomList) => void;
  onDelete?: (list: CustomList) => void;
  onShare?: (list: CustomList) => void;
  onDuplicate?: (list: CustomList) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  style?: any;
}

const ListCard: React.FC<ListCardProps> = ({
  list,
  onPress,
  onEdit,
  onDelete,
  onShare,
  onDuplicate,
  showActions = true,
  variant = 'default',
  style,
}) => {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const handlePress = useCallback(() => {
    onPress(list);
  }, [list, onPress]);

  const handleEdit = useCallback(() => {
    setMenuVisible(false);
    onEdit?.(list);
  }, [list, onEdit]);

  const handleDelete = useCallback(() => {
    setMenuVisible(false);
    onDelete?.(list);
  }, [list, onDelete]);

  const handleShare = useCallback(() => {
    setMenuVisible(false);
    onShare?.(list);
  }, [list, onShare]);

  const handleDuplicate = useCallback(() => {
    setMenuVisible(false);
    onDuplicate?.(list);
  }, [list, onDuplicate]);

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTimeAgo = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}sem atrás`;
    
    return formatDate(d);
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity onPress={handlePress} style={[styles.compactContainer, style]}>
        <View style={styles.compactContent}>
          <Avatar.Icon
            size={40}
            icon={list.icon}
            style={[styles.compactAvatar, {backgroundColor: list.color}]}
          />
          <View style={styles.compactInfo}>
            <Text variant="titleSmall" numberOfLines={1} style={styles.compactTitle}>
              {list.name}
            </Text>
            <Text variant="bodySmall" style={styles.compactCount}>
              {list.recipesCount} receita{list.recipesCount !== 1 ? 's' : ''}
            </Text>
          </View>
          {list.isPublic && (
            <Chip mode="outlined" compact style={styles.publicChip}>
              Pública
            </Chip>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Card style={[styles.card, style]} onPress={handlePress}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Avatar.Icon
              size={48}
              icon={list.icon}
              style={[styles.avatar, {backgroundColor: list.color}]}
            />
            <View style={styles.titleInfo}>
              <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
                {list.name}
              </Text>
              {list.description && (
                <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
                  {list.description}
                </Text>
              )}
            </View>
          </View>
          
          {showActions && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(true)}
                />
              }>
              {onEdit && (
                <Menu.Item
                  onPress={handleEdit}
                  title="Editar"
                  leadingIcon="pencil"
                />
              )}
              {onShare && (
                <Menu.Item
                  onPress={handleShare}
                  title="Compartilhar"
                  leadingIcon="share"
                />
              )}
              {onDuplicate && (
                <Menu.Item
                  onPress={handleDuplicate}
                  title="Duplicar"
                  leadingIcon="content-copy"
                />
              )}
              {(onEdit || onShare || onDuplicate) && onDelete && <Divider />}
              {onDelete && (
                <Menu.Item
                  onPress={handleDelete}
                  title="Excluir"
                  leadingIcon="delete"
                  titleStyle={{color: theme.colors.error}}
                />
              )}
            </Menu>
          )}
        </View>

        <View style={styles.metadata}>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <IconButton icon="silverware-fork-knife" size={16} style={styles.statIcon} />
              <Text variant="bodySmall" style={styles.statText}>
                {list.recipesCount} receita{list.recipesCount !== 1 ? 's' : ''}
              </Text>
            </View>
            
            <View style={styles.stat}>
              <IconButton icon="clock-outline" size={16} style={styles.statIcon} />
              <Text variant="bodySmall" style={styles.statText}>
                {getTimeAgo(list.lastModified)}
              </Text>
            </View>
          </View>

          <View style={styles.badges}>
            {list.isPublic && (
              <Chip mode="outlined" compact style={styles.badge}>
                Pública
              </Chip>
            )}
            {list.shareCode && (
              <Chip mode="outlined" compact style={styles.badge}>
                Compartilhada
              </Chip>
            )}
          </View>
        </View>

        {variant === 'detailed' && list.tags.length > 0 && (
          <View style={styles.tags}>
            {list.tags.slice(0, 3).map((tag, index) => (
              <Chip key={index} mode="outlined" compact style={styles.tag}>
                {tag}
              </Chip>
            ))}
            {list.tags.length > 3 && (
              <Text variant="bodySmall" style={styles.moreTagsText}>
                +{list.tags.length - 3} mais
              </Text>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.dateText}>
            Criada em {formatDate(list.createdAt)}
          </Text>
          
          {list.collaborators && list.collaborators.length > 0 && (
            <View style={styles.collaborators}>
              <IconButton icon="account-group" size={16} style={styles.collaboratorsIcon} />
              <Text variant="bodySmall" style={styles.collaboratorsText}>
                {list.collaborators.length} colaborador{list.collaborators.length !== 1 ? 'es' : ''}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  content: {
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  titleInfo: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    opacity: 0.7,
    lineHeight: 18,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    margin: 0,
    marginRight: 4,
  },
  statText: {
    opacity: 0.7,
    fontSize: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    height: 24,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    opacity: 0.5,
    fontSize: 11,
  },
  collaborators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collaboratorsIcon: {
    margin: 0,
    marginRight: 2,
  },
  collaboratorsText: {
    opacity: 0.7,
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
  compactAvatar: {
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontWeight: '500',
    marginBottom: 2,
  },
  compactCount: {
    opacity: 0.7,
  },
  publicChip: {
    height: 24,
  },
});

export default ListCard;