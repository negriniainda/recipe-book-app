import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Appbar,
  List,
  Switch,
  Text,
  Card,
  Button,
  Divider,
  ActivityIndicator,
  Chip,
  TimePicker,
  Dialog,
  Portal,
} from 'react-native-paper';
import { useNotificationSettings } from '../../hooks/useNotifications';
import { EMAIL_FREQUENCIES, NOTIFICATION_CATEGORIES } from '../../types/notifications';

interface NotificationSettingsScreenProps {
  navigation: any;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({
  navigation,
}) => {
  const [showQuietHoursDialog, setShowQuietHoursDialog] = useState(false);
  const [tempStartTime, setTempStartTime] = useState({ hours: 22, minutes: 0 });
  const [tempEndTime, setTempEndTime] = useState({ hours: 8, minutes: 0 });

  const {
    settings,
    isLoading,
    updateSettings,
    disableAllNotifications,
    enableEssentialNotifications,
    isUpdating,
    isDisabling,
    isEnablingEssential,
  } = useNotificationSettings();

  const handleUpdateSetting = useCallback(async (path: string[], value: any) => {
    const updateData: any = {};
    let current = updateData;
    
    // Criar estrutura aninhada
    for (let i = 0; i < path.length - 1; i++) {
      current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;

    const result = await updateSettings(updateData);
    if (!result.success) {
      Alert.alert('Erro', result.error);
    }
  }, [updateSettings]);

  const handleSaveQuietHours = useCallback(async () => {
    const startTime = `${tempStartTime.hours.toString().padStart(2, '0')}:${tempStartTime.minutes.toString().padStart(2, '0')}`;
    const endTime = `${tempEndTime.hours.toString().padStart(2, '0')}:${tempEndTime.minutes.toString().padStart(2, '0')}`;
    
    const result = await updateSettings({
      quietHours: {
        enabled: true,
        startTime,
        endTime,
      },
    });

    if (result.success) {
      setShowQuietHoursDialog(false);
    } else {
      Alert.alert('Erro', result.error);
    }
  }, [tempStartTime, tempEndTime, updateSettings]);

  const getFrequencyLabel = (frequency: string) => {
    const option = EMAIL_FREQUENCIES.find(opt => opt.value === frequency);
    return option?.label || frequency;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Notificações" />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando configurações...</Text>
        </View>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.errorContainer}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Notificações" />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            Erro ao carregar configurações
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Notificações" />
        <Appbar.Action
          icon="help-circle"
          onPress={() => navigation.navigate('NotificationHelp')}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Ações Rápidas */}
        <Card style={styles.quickActionsCard}>
          <Card.Content>
            <Text style={styles.quickActionsTitle}>Ações Rápidas</Text>
            <View style={styles.quickActionsRow}>
              <Button
                mode="outlined"
                onPress={disableAllNotifications}
                disabled={isDisabling}
                loading={isDisabling}
                style={styles.quickActionButton}
              >
                Desabilitar Todas
              </Button>
              <Button
                mode="outlined"
                onPress={enableEssentialNotifications}
                disabled={isEnablingEssential}
                loading={isEnablingEssential}
                style={styles.quickActionButton}
              >
                Apenas Essenciais
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Notificações por Email */}
        <List.Section>
          <List.Subheader>Email</List.Subheader>
          
          <List.Item
            title="Notificações por Email"
            description="Receber notificações no seu email"
            left={(props) => <List.Icon {...props} icon="email" />}
            right={() => (
              <Switch
                value={settings.email.enabled}
                onValueChange={(value) => handleUpdateSetting(['email', 'enabled'], value)}
                disabled={isUpdating}
              />
            )}
          />

          {settings.email.enabled && (
            <>
              <List.Item
                title="Frequência"
                description={`Receber emails ${getFrequencyLabel(settings.email.frequency).toLowerCase()}`}
                left={(props) => <List.Icon {...props} icon="clock" />}
                right={() => (
                  <Chip mode="outlined">
                    {getFrequencyLabel(settings.email.frequency)}
                  </Chip>
                )}
                onPress={() => navigation.navigate('EmailFrequencySettings')}
              />

              <List.Item
                title="Novos Seguidores"
                description="Quando alguém começar a te seguir"
                left={(props) => <List.Icon {...props} icon="account-plus" />}
                right={() => (
                  <Switch
                    value={settings.email.categories?.newFollowers || false}
                    onValueChange={(value) => handleUpdateSetting(['email', 'categories', 'newFollowers'], value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Comentários"
                description="Quando comentarem em suas receitas"
                left={(props) => <List.Icon {...props} icon="comment" />}
                right={() => (
                  <Switch
                    value={settings.email.categories?.comments || false}
                    onValueChange={(value) => handleUpdateSetting(['email', 'categories', 'comments'], value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Curtidas"
                description="Quando curtirem suas receitas ou posts"
                left={(props) => <List.Icon {...props} icon="heart" />}
                right={() => (
                  <Switch
                    value={settings.email.categories?.likes || false}
                    onValueChange={(value) => handleUpdateSetting(['email', 'categories', 'likes'], value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Menções"
                description="Quando te marcarem em posts ou comentários"
                left={(props) => <List.Icon {...props} icon="at" />}
                right={() => (
                  <Switch
                    value={settings.email.categories?.mentions || false}
                    onValueChange={(value) => handleUpdateSetting(['email', 'categories', 'mentions'], value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Receitas"
                description="Atualizações sobre suas receitas"
                left={(props) => <List.Icon {...props} icon="book-open" />}
                right={() => (
                  <Switch
                    value={settings.email.categories?.recipeUpdates || false}
                    onValueChange={(value) => handleUpdateSetting(['email', 'categories', 'recipeUpdates'], value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Comunidade"
                description="Novidades da comunidade"
                left={(props) => <List.Icon {...props} icon="account-group" />}
                right={() => (
                  <Switch
                    value={settings.email.categories?.communityUpdates || false}
                    onValueChange={(value) => handleUpdateSetting(['email', 'categories', 'communityUpdates'], value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Marketing"
                description="Promoções e novidades do app"
                left={(props) => <List.Icon {...props} icon="bullhorn" />}
                right={() => (
                  <Switch
                    value={settings.email.categories?.promotions || false}
                    onValueChange={(value) => handleUpdateSetting(['email', 'categories', 'promotions'], value)}
                    disabled={isUpdating}
                  />
                )}
              />
            </>
          )}
        </List.Section>

        <Divider />

        {/* Notificações Push */}
        <List.Section>
          <List.Subheader>Push (Celular)</List.Subheader>
          
          <List.Item
            title="Notificações Push"
            description="Receber notificações no seu celular"
            left={(props) => <List.Icon {...props} icon="cellphone" />}
            right={() => (
              <Switch
                value={settings.push.enabled}
                onValueChange={(value) => handleUpdateSetting(['push', 'enabled'], value)}
                disabled={isUpdating}
              />
            )}
          />

          {settings.push.enabled && (
            <>
              <List.Item
                title="Novos Seguidores"
                description="Quando alguém começar a te seguir"
                left={(props) => <List.Icon {...props} icon="account-plus" />}
                right={() => (
                  <Switch
                    value={settings.push.categories?.newFollowers || false}
                    onValueChange={(value) => handleUpdateSetting(['push', 'categories', 'newFollowers'], value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Comentários"
                description="Quando comentarem em suas receitas"
                left={(props) => <List.Icon {...props} icon="comment" />}
                right={() => (
                  <Switch
                    value={settings.push.categories?.comments || false}
                    onValueChange={(value) => handleUpdateSetting(['push', 'categories', 'comments'], value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Curtidas"
                description="Quando curtirem suas receitas ou posts"
                left={(props) => <List.Icon {...props} icon="heart" />}
                right={() => (
                  <Switch
                    value={settings.push.categories?.likes || false}
                    onValueChange={(value) => handleUpdateSetting(['push', 'categories', 'likes'], value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Menções"
                description="Quando te marcarem em posts ou comentários"
                left={(props) => <List.Icon {...props} icon="at" />}
                right={() => (
                  <Switch
                    value={settings.push.categories?.mentions || false}
                    onValueChange={(value) => handleUpdateSetting(['push', 'categories', 'mentions'], value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Receitas"
                description="Atualizações sobre suas receitas"
                left={(props) => <List.Icon {...props} icon="book-open" />}
                right={() => (
                  <Switch
                    value={settings.push.categories?.recipeUpdates || false}
                    onValueChange={(value) => handleUpdateSetting(['push', 'categories', 'recipeUpdates'], value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Comunidade"
                description="Novidades da comunidade"
                left={(props) => <List.Icon {...props} icon="account-group" />}
                right={() => (
                  <Switch
                    value={settings.push.categories?.communityUpdates || false}
                    onValueChange={(value) => handleUpdateSetting(['push', 'categories', 'communityUpdates'], value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Lembretes"
                description="Lembretes de refeições e timers"
                left={(props) => <List.Icon {...props} icon="alarm" />}
                right={() => (
                  <Switch
                    value={settings.push.categories?.mealReminders || false}
                    onValueChange={(value) => handleUpdateSetting(['push', 'categories', 'mealReminders'], value)}
                    disabled={isUpdating}
                  />
                )}
              />
            </>
          )}
        </List.Section>

        <Divider />

        {/* Horário Silencioso */}
        <List.Section>
          <List.Subheader>Horário Silencioso</List.Subheader>
          
          <List.Item
            title="Ativar Horário Silencioso"
            description="Não receber notificações em horários específicos"
            left={(props) => <List.Icon {...props} icon="sleep" />}
            right={() => (
              <Switch
                value={settings.quietHours.enabled}
                onValueChange={(value) => handleUpdateSetting(['quietHours', 'enabled'], value)}
                disabled={isUpdating}
              />
            )}
          />

          {settings.quietHours.enabled && (
            <List.Item
              title="Configurar Horários"
              description={`Das ${formatTime(settings.quietHours.startTime)} às ${formatTime(settings.quietHours.endTime)}`}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                const [startHours, startMinutes] = settings.quietHours.startTime.split(':').map(Number);
                const [endHours, endMinutes] = settings.quietHours.endTime.split(':').map(Number);
                setTempStartTime({ hours: startHours, minutes: startMinutes });
                setTempEndTime({ hours: endHours, minutes: endMinutes });
                setShowQuietHoursDialog(true);
              }}
            />
          )}
        </List.Section>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Dialog de Horário Silencioso */}
      <Portal>
        <Dialog
          visible={showQuietHoursDialog}
          onDismiss={() => setShowQuietHoursDialog(false)}
        >
          <Dialog.Title>Configurar Horário Silencioso</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.timePickerLabel}>Início:</Text>
            <TimePicker
              hours={tempStartTime.hours}
              minutes={tempStartTime.minutes}
              onTimeChange={setTempStartTime}
            />
            
            <Text style={styles.timePickerLabel}>Fim:</Text>
            <TimePicker
              hours={tempEndTime.hours}
              minutes={tempEndTime.minutes}
              onTimeChange={setTempEndTime}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowQuietHoursDialog(false)}>
              Cancelar
            </Button>
            <Button onPress={handleSaveQuietHours}>
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  quickActionsCard: {
    margin: 16,
    elevation: 2,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default NotificationSettingsScreen;