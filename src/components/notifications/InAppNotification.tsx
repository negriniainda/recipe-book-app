import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  PanResponder,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  IconButton,
} from 'react-native-paper';
import {
  Notification,
  getCategoryInfo,
  formatNotificationTime,
} from '../../types/notifications';

interface InAppNotificationProps {
  notification: Notification;
  position?: 'top' | 'bottom' | 'center';
  duration?: number;
  onPress?: (notification: Notification) => void;
  onDismiss?: (notification: Notification) => void;
  onAction?: (notification: Notification, actionId: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const InAppNotification: React.FC<InAppNotificationProps> = ({
  notification,
  position = 'top',
  duration = 5000,
  onPress,
  onDismiss,
  onAction,
}) => {
  const [visible, setVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        slideAnim.setValue(gestureState.dx / screenWidth);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        
        // Se deslizou mais de 50% da largura ou com velocidade alta, dismiss
        if (Math.abs(dx) > screenWidth * 0.5 || Math.abs(vx) > 1000) {
          handleDismiss();
        } else {
          // Voltar para posição original
          Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const categoryInfo = getCategoryInfo(notification.category);

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação da barra de progresso
    if (duration > 0) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      }).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [slideAnim, opacityAnim, progressAnim, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      if (onDismiss) {
        onDismiss(notification);
      }
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress(notification);
    }
    handleDismiss();
  };

  const handleAction = (actionId: string) => {
    if (onAction) {
      onAction(notification, actionId);
    }
    handleDismiss();
  };

  // Removido - agora usando PanResponder

  const getPositionStyle = () => {
    const baseTransform = [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: position === 'top' ? [-100, 0] : position === 'bottom' ? [100, 0] : [0, 0],
        }),
      },
      {
        translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0],
        }),
      },
    ];

    switch (position) {
      case 'top':
        return {
          position: 'absolute' as const,
          top: 50,
          left: 16,
          right: 16,
          transform: baseTransform,
        };
      case 'bottom':
        return {
          position: 'absolute' as const,
          bottom: 50,
          left: 16,
          right: 16,
          transform: baseTransform,
        };
      case 'center':
        return {
          position: 'absolute' as const,
          top: screenHeight / 2 - 50,
          left: 16,
          right: 16,
          transform: baseTransform,
        };
      default:
        return {};
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        getPositionStyle(),
        {
          opacity: opacityAnim,
          zIndex: 9999,
        },
      ]}
      {...panResponder.panHandlers}
    >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.9}
          style={styles.touchable}
        >
          <Card style={styles.card}>
            <Card.Content style={styles.content}>
              {/* Barra de progresso */}
              {duration > 0 && (
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: categoryInfo?.color || '#2196f3',
                    },
                  ]}
                />
              )}

              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Avatar.Icon
                    size={36}
                    icon={categoryInfo?.icon || 'bell'}
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: categoryInfo?.color || '#757575' },
                    ]}
                  />
                  <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={2}>
                      {notification.title}
                    </Text>
                    <Text style={styles.body} numberOfLines={3}>
                      {notification.body}
                    </Text>
                    <Text style={styles.time}>
                      {formatNotificationTime(notification.createdAt)}
                    </Text>
                  </View>
                </View>

                <IconButton
                  icon="close"
                  size={20}
                  onPress={handleDismiss}
                  style={styles.closeButton}
                />
              </View>

              {/* Imagem da notificação */}
              {notification.imageUrl && (
                <View style={styles.imageContainer}>
                  <Avatar.Image
                    size={60}
                    source={{ uri: notification.imageUrl }}
                    style={styles.notificationImage}
                  />
                </View>
              )}

              {/* Ações da notificação */}
              {notification.actions && notification.actions.length > 0 && (
                <View style={styles.actionsContainer}>
                  {notification.actions.slice(0, 2).map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      onPress={() => handleAction(action.id)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionText}>{action.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    elevation: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  categoryIcon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  closeButton: {
    margin: 0,
    marginTop: -8,
    marginRight: -8,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  notificationImage: {
    borderRadius: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2196f3',
  },
});

export default InAppNotification;