import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import {
  Appbar,
  Text,
  Card,
  Button,
  Chip,
  FAB,
  Portal,
  Dialog,
  TextInput,
} from 'react-native-paper';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import { useNotificationsList, useNotificationCreator } from '../../hooks/useNotifications';
import { useShowNotification } from '../../components/notifications/NotificationProvider';
import { Notification, NOTIFICATION_CATEGORIES } from '../../types/notifications';

interface NotificationsScreenProps {
  navigation: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testTitle, setTestTitle] = useState('Notificação de Teste');
  const [testBody, setTestBody] = useState('Esta é uma notificação de teste para verificar o funcionamento do sistema.');
  const [testCategory, setTestCategory] = useState<string>('systemUpdates');

  const { unreadCount } = useNotificationsList();
  const { sendTestNotification, isSendingTest } = useNotificationCreator();
  const { showNotification } = useShowNotification();

  const handleNotificationPress = useCallback((notification: Notification) => {
    // Navegar para detalhes da notificação ou ação específica
    if (notification.actionUrl) {
      // Implementar navegação baseada na URL
      console.log('Navegando para:', notification.actionUrl);
    } else {
      // Ação padrão baseada na categoria
      switch (notification.category) {
        case 'mealReminders':
          navigation.navigate('MealPlanning');
          break;
        case 'timerAlerts':
          navigation.navigate('CookingMode');
          break;
        case 'comments':
        case 'likes':
        case 'mentions':
          navigation.navigate('Community');
          break;
        case 'recipeUpdates':
          navigation.navigate('Recipes');
          break;
        default:
          // Mostrar detalhes da notificação
          navigation.navigate('NotificationDetails', { notificationId: notification.id });
      }
    }
  }, [navigation]);

  const handleSendTest = useCallback(async () => {
    const result = await sendTestNotification({
      type: 'in_app',
      category: testCategory as any,
      title: testTitle,
      body: testBody,
    });

    if (result.success) {
      // Também mostrar como notificação in-app
      showNotification({
        type: 'in_app',
        category: testCategory as any,
        title: testTitle,
        body: testBody,
        priority: 'normal',
      });
      
      setShowTestDialog(false);
      setTestTitle('Notificação de Teste');
      setTestBody('Esta é uma notificação de teste para verificar o funcionamento do sistema.');
    } else {
      console.error('Erro ao enviar teste:', result.error);
    }
  }, [sendTestNotification, showNotification, testTitle, testBody, testCategory]);

  const renderTestDialog = () => (
    <Portal>
      <Dialog
        visible={showTestDialog}
        onDismiss={() => setShowTestDialog(false)}
      >
        <Dialog.Title>Enviar Notificação de Teste</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Título"
            value={testTitle}
            onChangeText={setTestTitle}
            style={styles.testInput}
          />
          
          <TextInput
            label="Mensagem"
            value={testBody}
            onChangeText={setTestBody}
            multiline
            numberOfLines={3}
            style={styles.testInput}
          />

          <Text style={styles.categoryLabel}>Categoria:</Text>
          <View style={styles.categoriesGrid}>
            {NOTIFICATION_CATEGORIES.slice(0, 8).map((category) => (
              <Chip
                key={category.key}
                mode={testCategory === category.key ? 'flat' : 'outlined'}
                onPress={() => setTestCategory(category.key)}
                style={[
                  styles.categoryChip,
                  testCategory === category.key && {
                    backgroundColor: category.color,
                  },
                ]}
                textStyle={[
                  styles.categoryChipText,
                  testCategory === category.key && { color: '#fff' },
                ]}
                icon={category.icon}
              >
                {category.label}
              </Chip>
            ))}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowTestDialog(false)}>
            Cancelar
          </Button>
          <Button
            onPress={handleSendTest}
            loading={isSendingTest}
            disabled={!testTitle.trim() || !testBody.trim()}
          >
            Enviar Teste
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content 
          title="Notificações" 
          subtitle={unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
        />
        <Appbar.Action
          icon="cog"
          onPress={() => navigation.navigate('NotificationSettings')}
        />
      </Appbar.Header>

      {/* Estatísticas rápidas */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{unreadCount}</Text>
              <Text style={styles.statLabel}>Não Lidas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Hoje</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>Esta Semana</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Centro de notificações */}
      <View style={styles.notificationsContainer}>
        <NotificationCenter
          onNotificationPress={handleNotificationPress}
          showActions={true}
        />
      </View>

      {/* FAB para teste */}
      <FAB
        style={styles.fab}
        icon="test-tube"
        label="Teste"
        onPress={() => setShowTestDialog(true)}
      />

      {renderTestDialog()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsCard: {
    margin: 16,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  notificationsContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  testInput: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginBottom: 8,
  },
  categoryChipText: {
    fontSize: 11,
  },
});

export default NotificationsScreen;