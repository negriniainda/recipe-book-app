import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  Chip,
  List,
  Divider,
  FAB,
  Portal,
  Modal,
  TextInput,
  Switch,
  ProgressBar,
} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {
  useGetImportHistoryQuery,
  useRetryImportMutation,
  useGetSupportedSitesQuery,
} from '../../services/recipeImportApi';
import {useRecipeImport} from '../../hooks/useRecipeImport';
import {useAuth} from '../../hooks/useAuth';
import ImportRecipeModal from '../../components/recipe/ImportRecipeModal';
// Define theme inline to avoid import issues
const theme = {
  colors: {
    primary: '#6200EE',
    secondary: '#03DAC6',
    surface: '#FFFFFF',
    background: '#F5F5F5',
    outline: '#79747E',
    surfaceVariant: '#E7E0EC',
  },
  roundness: 8,
};

interface ImportScreenProps {
  navigation?: any;
}

const ImportScreen: React.FC<ImportScreenProps> = ({ navigation }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [quickImportInput, setQuickImportInput] = useState('');
  const [importOptions, setImportOptions] = useState({
    extractNutrition: true,
    autoCategories: true,
    extractImages: true,
    extractVideo: false,
  });

  const {user} = useAuth();
  const {
    isImporting,
    isSaving,
    importedData,
    error,
    importRecipe,
    saveRecipe,
    clearState,
    validateUrl,
    detectSourceType,
  } = useRecipeImport();

  const {
    data: importHistory,
    isLoading: loadingHistory,
    refetch: refetchHistory,
  } = useGetImportHistoryQuery({page: 1, limit: 20});

  const {data: supportedSites} = useGetSupportedSitesQuery();
  const [retryImport] = useRetryImportMutation();

  useFocusEffect(
    useCallback(() => {
      refetchHistory();
    }, [refetchHistory])
  );

  const handleQuickImport = async () => {
    if (!quickImportInput.trim() || !user) return;

    const result = await importRecipe(quickImportInput, importOptions);
    if (result) {
      const saved = await saveRecipe(result, user.id);
      if (saved) {
        setQuickImportInput('');
        clearState();
        refetchHistory();
        Alert.alert('Sucesso', 'Receita importada e salva com sucesso!');
      }
    }
  };

  const handleRetryImport = async (importId: string) => {
    try {
      await retryImport(importId).unwrap();
      refetchHistory();
      Alert.alert('Sucesso', 'Importação reprocessada com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao reprocessar importação');
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'url': return 'link';
      case 'social': return 'share';
      case 'text': return 'text';
      case 'image': return 'image';
      default: return 'import';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'pending': return '#FF9800';
      default: return theme.colors.outline;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Sucesso';
      case 'failed': return 'Falhou';
      case 'pending': return 'Processando';
      default: return 'Desconhecido';
    }
  };

  const renderImportOptions = () => (
    <Card style={styles.importOptionsCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Métodos de Importação
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Escolha como você quer importar sua receita
        </Text>

        <View style={styles.importMethodsContainer}>
          <Button
            mode="contained"
            icon="camera"
            onPress={() => navigation?.navigate('OCRImport')}
            style={styles.importMethodButton}
            contentStyle={styles.importMethodButtonContent}>
            Foto/OCR
          </Button>
          
          <Button
            mode="outlined"
            icon="link"
            onPress={() => setShowImportModal(true)}
            style={styles.importMethodButton}
            contentStyle={styles.importMethodButtonContent}>
            Link/URL
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickImport = () => (
    <Card style={styles.quickImportCard}>
      <Card.Content>
        <View style={styles.quickImportHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Importação Rápida por Link
          </Text>
          <IconButton
            icon={showAdvancedOptions ? 'chevron-up' : 'chevron-down'}
            onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
          />
        </View>

        <TextInput
          mode="outlined"
          label="Link ou texto da receita"
          placeholder="https://exemplo.com/receita ou texto da receita"
          value={quickImportInput}
          onChangeText={setQuickImportInput}
          multiline={detectSourceType(quickImportInput) === 'text'}
          numberOfLines={detectSourceType(quickImportInput) === 'text' ? 3 : 1}
          style={styles.quickImportInput}
          error={!!error}
        />

        {showAdvancedOptions && (
          <View style={styles.advancedOptions}>
            <Text variant="titleSmall" style={styles.optionsTitle}>
              Opções Avançadas
            </Text>
            
            <View style={styles.optionRow}>
              <Text variant="bodyMedium">Extrair informações nutricionais</Text>
              <Switch
                value={importOptions.extractNutrition}
                onValueChange={(value) =>
                  setImportOptions(prev => ({...prev, extractNutrition: value}))
                }
              />
            </View>
            
            <View style={styles.optionRow}>
              <Text variant="bodyMedium">Categorizar automaticamente</Text>
              <Switch
                value={importOptions.autoCategories}
                onValueChange={(value) =>
                  setImportOptions(prev => ({...prev, autoCategories: value}))
                }
              />
            </View>
            
            <View style={styles.optionRow}>
              <Text variant="bodyMedium">Importar imagens</Text>
              <Switch
                value={importOptions.extractImages}
                onValueChange={(value) =>
                  setImportOptions(prev => ({...prev, extractImages: value}))
                }
              />
            </View>
            
            <View style={styles.optionRow}>
              <Text variant="bodyMedium">Importar vídeos (redes sociais)</Text>
              <Switch
                value={importOptions.extractVideo}
                onValueChange={(value) =>
                  setImportOptions(prev => ({...prev, extractVideo: value}))
                }
              />
            </View>
          </View>
        )}

        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.errorText}>
                {error}
              </Text>
            </Card.Content>
          </Card>
        )}

        {isImporting && (
          <View style={styles.progressContainer}>
            <ProgressBar indeterminate color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.progressText}>
              Importando receita...
            </Text>
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleQuickImport}
          disabled={!quickImportInput.trim() || isImporting || isSaving}
          loading={isImporting || isSaving}
          style={styles.quickImportButton}>
          {isImporting ? 'Importando...' : isSaving ? 'Salvando...' : 'Importar'}
        </Button>
      </Card.Content>
    </Card>
  );

  const renderSupportedSites = () => (
    <Card style={styles.supportedSitesCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Sites Suportados
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Importação otimizada para estes sites populares
        </Text>
        
        <View style={styles.sitesList}>
          {supportedSites
            ?.filter(site => site.popular)
            .slice(0, 8)
            .map(site => (
              <Chip
                key={site.domain}
                mode="outlined"
                icon="web"
                style={styles.siteChip}>
                {site.name}
              </Chip>
            ))}
        </View>
        
        <Button
          mode="text"
          onPress={() => setShowImportModal(true)}
          style={styles.viewAllButton}>
          Ver todos os sites suportados
        </Button>
      </Card.Content>
    </Card>
  );

  const renderImportHistory = () => (
    <Card style={styles.historyCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Histórico de Importações
        </Text>
        
        {loadingHistory ? (
          <View style={styles.loadingContainer}>
            <ProgressBar indeterminate color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.loadingText}>
              Carregando histórico...
            </Text>
          </View>
        ) : importHistory && importHistory.length > 0 ? (
          <View>
            {importHistory.map((item, index) => (
              <View key={item.id}>
                <List.Item
                  title={item.title}
                  description={`${item.source} • ${new Date(item.createdAt).toLocaleDateString()}`}
                  left={() => (
                    <List.Icon
                      icon={getSourceIcon(item.source)}
                      color={theme.colors.primary}
                    />
                  )}
                  right={() => (
                    <View style={styles.historyItemRight}>
                      <Chip
                        mode="flat"
                        textStyle={{
                          color: getStatusColor(item.status),
                          fontSize: 12,
                        }}
                        style={[
                          styles.statusChip,
                          {backgroundColor: getStatusColor(item.status) + '20'}
                        ]}>
                        {getStatusText(item.status)}
                      </Chip>
                      {item.status === 'failed' && (
                        <IconButton
                          icon="refresh"
                          size={20}
                          onPress={() => handleRetryImport(item.id)}
                        />
                      )}
                    </View>
                  )}
                />
                {index < importHistory.length - 1 && <Divider />}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Nenhuma importação realizada ainda
            </Text>
            <Text variant="bodySmall" style={styles.emptySubtext}>
              Comece importando sua primeira receita!
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={loadingHistory}
            onRefresh={refetchHistory}
          />
        }>
        {renderImportOptions()}
        {renderQuickImport()}
        {renderSupportedSites()}
        {renderImportHistory()}
      </ScrollView>

      <FAB
        icon="plus"
        label="Importação Completa"
        onPress={() => setShowImportModal(true)}
        style={styles.fab}
      />

      <ImportRecipeModal
        visible={showImportModal}
        onDismiss={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false);
          refetchHistory();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  importOptionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  importMethodsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  importMethodButton: {
    flex: 1,
  },
  importMethodButtonContent: {
    paddingVertical: 8,
  },
  quickImportCard: {
    marginBottom: 16,
    elevation: 2,
  },
  quickImportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: 12,
  },
  quickImportInput: {
    backgroundColor: theme.colors.background,
    marginBottom: 16,
  },
  advancedOptions: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.colors.surfaceVariant + '40',
    borderRadius: theme.roundness,
  },
  optionsTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.primary,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    marginBottom: 16,
  },
  errorText: {
    color: '#C62828',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  quickImportButton: {
    marginTop: 8,
  },
  supportedSitesCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sitesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  siteChip: {
    marginBottom: 4,
  },
  viewAllButton: {
    alignSelf: 'flex-start',
  },
  historyCard: {
    marginBottom: 100,
    elevation: 2,
  },
  loadingContainer: {
    paddingVertical: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  historyItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusChip: {
    height: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.secondary,
  },
});

export default ImportScreen;