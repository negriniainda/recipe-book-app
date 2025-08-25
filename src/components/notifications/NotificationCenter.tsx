import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  IconButton,
  Avatar,
  Divider,
  Menu,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { useNotificationsList } from '../../hooks/useNotifications';
import {
  Notification,
  getCategoryInfo,
  getPriorityInfo,
  formatNotificationTime,
} from '../../types/notifications';

interface NotificationCenterProps {
  onNotificationPress?: (notification: Notification) => void;
  showActions?: boolean;
  maxHeight?: number;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onNotificationPress,
  showActions = true,
  maxHeight = 400,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showRead, setShowRead] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const {
    notifications,
    unreadCount,
    hasMore,
    isLoading,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationsList({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    read: showRead ? undefined : false,
    limit: 20,
  });

  const categories = [
    { key: 'all', label: 'Todas', count: notifications.length },
    { key: 'mealReminders', label: 'Refeições', count: 0 },
    { key: 'timerAlerts', label: 'Timers', count: 0 },
    { key: 'comments', label: 'Comentários', count: 0 },
    { key: 'likes', label: 'Curtidas', count: 0 },
    { key: 'systemUpdates', label: 'Sistema', count: 0 },
  ];

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (selectedCategory !== 'all' && notification.category !== selectedCategory) {
        return false;
      }
      if (!showRead && notification.read) {
        return false;
      }
      return true;
    });
  }, [notifications, selectedCategory, showRead]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    // Marcar como lida se não estiver
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Chamar callback personalizado
    if (onNotificationPress) {
      onNotificationPress(notification);
    }
  }, [markAsRead, onNotificationPress]);

  const handleDeleteNotification = useCallback(async (notificationId: string) => {
    const result = await deleteNotification(notificationId);
    if (!result.success) {
      console.error('Erro ao excluir notificação:', result.error);
    }
  }, [deleteNotification]);

  const handleMarkAllAsRead = useCallback(async () => {
    const result = await markAllAsRead();
    if (!result.success) {
      console.error('Erro ao marcar todas como lidas:', result.error);
    }
  }, [markAllAsRead]);

  const handleClearAll = useCallback(async () => {
    const result = await clearAll();
    if (!result.success) {
      console.error('Erro ao limpar notificações:', result.error);
    }
  }, [clearAll]);

  const renderNotificationCard = (notification: Notification) => {
    const categoryInfo = getCategoryInfo(notification.category);
    const priorityInfo = getPriorityInfo(notification.priority);

    return (
      <TouchableOpacity
        key={notification.id}
        onPress={() => handleNotificationPress(notification)}
        style={styles.notificationTouchable}
      >
        <Card
          style={[
            styles.notificationCard,
            !notification.read && styles.unreadCard,
          ]}
        >
          <Card.Content style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <View style={styles.notificationInfo}>
                <Avatar.Icon
                  size={40}
                  icon={categoryInfo?.icon || 'bell'}
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: categoryInfo?.color || '#757575' },
                  ]}
                />
                <View style={styles.notificationText}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      !notification.read && styles.unreadTitle,
                    ]}
                    numberOfLines={2}
                  >
                    {notification.title}
                  </Text>
                  <Text
                    style={styles.notificationBody}
                    numberOfLines={3}
                  >
                    {notification.body}
                  </Text>
                </View>
              </View>
              
              {showActions && (
                <View style={styles.notificationActions}>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDeleteNotification(notification.id)}
                    style={styles.actionButton}
                  />
                </View>
              )}
            </View>

            <View style={styles.notificationMeta}>
              <View style={styles.metaLeft}>
                <Chip
                  style={[
                    styles.categoryChip,
                    { backgroundColor: categoryInfo?.color || '#757575' },
                  ]}
                  textStyle={styles.categoryChipText}
                >
                  {categoryInfo?.label || notification.category}
                </Chip>
                
                {priorityInfo && priorityInfo.value !== 'normal' && (
                  <Chip
                    style={[
                      styles.priorityChip,
                      { backgroundColor: priorityInfo.color },
                    ]}
                    textStyle={styles.priorityChipText}
                  >
                    {priorityInfo.label}
                  </Chip>
                )}
              </View>
              
              <Text style={styles.notificationTime}>
                {formatNotificationTime(notification.createdAt)}
              </Text>
            </View>

            {notification.actions && notification.actions.length > 0 && (
              <View style={styles.notificationActionsRow}>
                {notification.actions.map((action) => (
                  <Button
                    key={action.id}
                    mode="outlined"
                    onPress={() => {
                      // Implementar ação
                      console.log('Ação:', action.action, action.data);
                    }}
                    style={styles.notificationActionButton}
                  >
                    {action.title}
                  </Button>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { maxHeight }]}>
      {/* Header com filtros */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>
            Notificações {unreadCount > 0 && `(${unreadCount})`}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setShowRead(!showRead);
                setMenuVisible(false);
              }}
              title={showRead ? 'Ocultar lidas' : 'Mostrar lidas'}
              leadingIcon={showRead ? 'eye-off' : 'eye'}
            />
            <Menu.Item
              onPress={() => {
                handleMarkAllAsRead();
                setMenuVisible(false);
              }}
              title="Marcar todas como lidas"
              leadingIcon="check-all"
              disabled={unreadCount === 0}
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                handleClearAll();
                setMenuVisible(false);
              }}
              title="Limpar todas"
              leadingIcon="delete-sweep"
              titleStyle={{ color: '#f44336' }}
            />
          </Menu>
        </View>
      </View>

      {/* Filtros de categoria */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        <View style={styles.categoriesRow}>
          {categories.map((category) => (
            <Chip
              key={category.key}
              mode={selectedCategory === category.key ? 'flat' : 'outlined'}
              onPress={() => setSelectedCategory(category.key)}
              style={styles.categoryFilterChip}
            >
              {category.label}
            </Chip>
          ))}
        </View>
      </ScrollView>

      {/* Lista de notificações */}
      <ScrollView
        style={styles.notificationsList}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
          />
        }
      >
        {isLoading && notifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Carregando notificações...</Text>
          </View>
        ) : filteredNotifications.length > 0 ? (
          <>
            {filteredNotifications.map(renderNotificationCard)}
            {hasMore && (
              <Button
                mode="outlined"
                onPress={() => {
                  // Carregar mais notificações
                  console.log('Carregar mais');
                }}
                style={styles.loadMoreButton}
              >
                Carregar mais
              </Button>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {showRead 
                ? 'Nenhuma notificação encontrada'
                : 'Nenhuma notificação não lida'
              }
            </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryFilterChip: {
    marginRight: 8,
  },
  notificationsList: {
    flex: 1,
    padding: 16,
  },
  notificationTouchable: {
    marginBottom: 12,
  },
  notificationCard: {
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notificationInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  categoryIcon: {
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    height: 24,
  },
  categoryChipText: {
    fontSize: 11,
    color: '#fff',
  },
  priorityChip: {
    height: 24,
  },
  priorityChipText: {
    fontSize: 11,
    color: '#fff',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  notificationActionButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadMoreButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default NotificationCenter;