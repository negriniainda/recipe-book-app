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
} from 'react-native-paper';
import { usePrivacySettings, usePrivacyReport } from '../../hooks/usePrivacy';
import {
  PRIVACY_VISIBILITY_OPTIONS,
  MESSAGE_PERMISSION_OPTIONS,
} from '../../types/privacy';

interface PrivacySettingsScreenProps {
  navigation: any;
}

const PrivacySettingsScreen: React.FC<PrivacySettingsScreenProps> = ({
  navigation,
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const {
    settings,
    isLoading,
    updateSettings,
    isUpdating,
  } = usePrivacySettings();

  const {
    report,
    isLoading: reportLoading,
  } = usePrivacyReport();

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, []);

  const handleUpdateSetting = useCallback(async (
    key: string,
    value: any
  ) => {
    const result = await updateSettings({ [key]: value });
    if (!result.success) {
      Alert.alert('Erro', result.error);
    }
  }, [updateSettings]);

  const getVisibilityLabel = (value: string) => {
    const option = PRIVACY_VISIBILITY_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  };

  const getMessagePermissionLabel = (value: string) => {
    const option = MESSAGE_PERMISSION_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Privacidade" />
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
          <Appbar.Content title="Privacidade" />
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
        <Appbar.Content title="Privacidade" />
        <Appbar.Action
          icon="help-circle"
          onPress={() => navigation.navigate('PrivacyHelp')}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Resumo de Privacidade */}
        {!reportLoading && report && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Resumo da Privacidade</Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{report.publicRecipes}</Text>
                  <Text style={styles.statLabel}>Receitas Públicas</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{report.privateRecipes}</Text>
                  <Text style={styles.statLabel}>Receitas Privadas</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{report.blockedUsers}</Text>
                  <Text style={styles.statLabel}>Usuários Bloqueados</Text>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('PrivacyReport')}
                style={styles.viewReportButton}
              >
                Ver Relatório Completo
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Configurações de Perfil */}
        <List.Section>
          <List.Subheader>Perfil</List.Subheader>
          
          <List.Item
            title="Visibilidade do Perfil"
            description={`Seu perfil está ${getVisibilityLabel(settings.profileVisibility).toLowerCase()}`}
            left={(props) => <List.Icon {...props} icon="account" />}
            right={() => (
              <Chip mode="outlined">
                {getVisibilityLabel(settings.profileVisibility)}
              </Chip>
            )}
            onPress={() => navigation.navigate('ProfileVisibilitySettings')}
          />

          <List.Item
            title="Mostrar Email"
            description="Exibir seu email no perfil público"
            left={(props) => <List.Icon {...props} icon="email" />}
            right={() => (
              <Switch
                value={settings.showEmail}
                onValueChange={(value) => handleUpdateSetting('showEmail', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Mostrar Nome Real"
            description="Exibir seu nome real no perfil"
            left={(props) => <List.Icon {...props} icon="card-account-details" />}
            right={() => (
              <Switch
                value={settings.showRealName}
                onValueChange={(value) => handleUpdateSetting('showRealName', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Mostrar Localização"
            description="Exibir sua localização no perfil"
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            right={() => (
              <Switch
                value={settings.showLocation}
                onValueChange={(value) => handleUpdateSetting('showLocation', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Mostrar Estatísticas"
            description="Exibir contadores de receitas, seguidores, etc."
            left={(props) => <List.Icon {...props} icon="chart-line" />}
            right={() => (
              <Switch
                value={settings.showStats}
                onValueChange={(value) => handleUpdateSetting('showStats', value)}
                disabled={isUpdating}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* Configurações de Receitas */}
        <List.Section>
          <List.Subheader>Receitas</List.Subheader>
          
          <List.Item
            title="Visibilidade Padrão"
            description={`Novas receitas serão ${getVisibilityLabel(settings.defaultRecipeVisibility).toLowerCase()}`}
            left={(props) => <List.Icon {...props} icon="book-open" />}
            right={() => (
              <Chip mode="outlined">
                {getVisibilityLabel(settings.defaultRecipeVisibility)}
              </Chip>
            )}
            onPress={() => navigation.navigate('RecipeVisibilitySettings')}
          />

          <List.Item
            title="Gerenciar Receitas"
            description="Alterar visibilidade de receitas existentes"
            left={(props) => <List.Icon {...props} icon="cog" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ManageRecipePrivacy')}
          />

          <List.Item
            title="Permitir Comentários"
            description="Outros usuários podem comentar suas receitas"
            left={(props) => <List.Icon {...props} icon="comment" />}
            right={() => (
              <Switch
                value={settings.allowRecipeComments}
                onValueChange={(value) => handleUpdateSetting('allowRecipeComments', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Permitir Avaliações"
            description="Outros usuários podem avaliar suas receitas"
            left={(props) => <List.Icon {...props} icon="star" />}
            right={() => (
              <Switch
                value={settings.allowRecipeRatings}
                onValueChange={(value) => handleUpdateSetting('allowRecipeRatings', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Permitir Salvamentos"
            description="Outros usuários podem salvar suas receitas"
            left={(props) => <List.Icon {...props} icon="bookmark" />}
            right={() => (
              <Switch
                value={settings.allowRecipeSaves}
                onValueChange={(value) => handleUpdateSetting('allowRecipeSaves', value)}
                disabled={isUpdating}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* Configurações de Atividade */}
        <List.Section>
          <List.Subheader>Atividade</List.Subheader>
          
          <List.Item
            title="Mostrar Atividade"
            description="Exibir suas curtidas e comentários recentes"
            left={(props) => <List.Icon {...props} icon="timeline" />}
            right={() => (
              <Switch
                value={settings.showActivity}
                onValueChange={(value) => handleUpdateSetting('showActivity', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Mostrar Seguindo"
            description="Exibir lista de pessoas que você segue"
            left={(props) => <List.Icon {...props} icon="account-plus" />}
            right={() => (
              <Switch
                value={settings.showFollowing}
                onValueChange={(value) => handleUpdateSetting('showFollowing', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Mostrar Seguidores"
            description="Exibir lista de seus seguidores"
            left={(props) => <List.Icon {...props} icon="account-group" />}
            right={() => (
              <Switch
                value={settings.showFollowers}
                onValueChange={(value) => handleUpdateSetting('showFollowers', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Mostrar Posts Curtidos"
            description="Exibir posts que você curtiu"
            left={(props) => <List.Icon {...props} icon="heart" />}
            right={() => (
              <Switch
                value={settings.showLikedPosts}
                onValueChange={(value) => handleUpdateSetting('showLikedPosts', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Mostrar Receitas Salvas"
            description="Exibir receitas que você salvou"
            left={(props) => <List.Icon {...props} icon="bookmark-multiple" />}
            right={() => (
              <Switch
                value={settings.showSavedRecipes}
                onValueChange={(value) => handleUpdateSetting('showSavedRecipes', value)}
                disabled={isUpdating}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* Configurações de Comunicação */}
        <List.Section>
          <List.Subheader>Comunicação</List.Subheader>
          
          <List.Item
            title="Mensagens Diretas"
            description={`${getMessagePermissionLabel(settings.allowDirectMessages)} pode enviar mensagens`}
            left={(props) => <List.Icon {...props} icon="message" />}
            right={() => (
              <Chip mode="outlined">
                {getMessagePermissionLabel(settings.allowDirectMessages)}
              </Chip>
            )}
            onPress={() => navigation.navigate('MessagePermissionSettings')}
          />

          <List.Item
            title="Permitir Marcações"
            description="Outros usuários podem te marcar em posts"
            left={(props) => <List.Icon {...props} icon="at" />}
            right={() => (
              <Switch
                value={settings.allowTagging}
                onValueChange={(value) => handleUpdateSetting('allowTagging', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Permitir Compartilhamento"
            description="Outros usuários podem compartilhar suas receitas"
            left={(props) => <List.Icon {...props} icon="share" />}
            right={() => (
              <Switch
                value={settings.allowSharing}
                onValueChange={(value) => handleUpdateSetting('allowSharing', value)}
                disabled={isUpdating}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* Configurações Avançadas */}
        <List.Section>
          <List.Subheader>Configurações Avançadas</List.Subheader>
          
          <List.Item
            title="Usuários Bloqueados"
            description="Gerenciar usuários bloqueados"
            left={(props) => <List.Icon {...props} icon="block-helper" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('BlockedUsers')}
          />

          <List.Item
            title="Notificações"
            description="Configurar notificações de privacidade"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('NotificationSettings')}
          />

          <List.Item
            title="Dados e Privacidade"
            description="Exportar ou deletar seus dados"
            left={(props) => <List.Icon {...props} icon="database" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('DataPrivacy')}
          />

          <List.Item
            title="Coleta de Dados"
            description="Controlar coleta de dados para melhorias"
            left={(props) => <List.Icon {...props} icon="chart-box" />}
            right={() => (
              <Switch
                value={settings.dataCollection}
                onValueChange={(value) => handleUpdateSetting('dataCollection', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Rastreamento de Analytics"
            description="Permitir analytics para melhorar o app"
            left={(props) => <List.Icon {...props} icon="google-analytics" />}
            right={() => (
              <Switch
                value={settings.analyticsTracking}
                onValueChange={(value) => handleUpdateSetting('analyticsTracking', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Anúncios Personalizados"
            description="Receber anúncios baseados em seus interesses"
            left={(props) => <List.Icon {...props} icon="target" />}
            right={() => (
              <Switch
                value={settings.personalizedAds}
                onValueChange={(value) => handleUpdateSetting('personalizedAds', value)}
                disabled={isUpdating}
              />
            )}
          />
        </List.Section>

        {/* Espaçamento final */}
        <View style={styles.bottomSpacing} />
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
  summaryCard: {
    margin: 16,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  viewReportButton: {
    marginTop: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default PrivacySettingsScreen;