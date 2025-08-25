import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Appbar,
  List,
  Text,
  Card,
  Button,
  Chip,
  ActivityIndicator,
  Searchbar,
  Menu,
  FAB,
  Checkbox,
} from 'react-native-paper';
import { useRecipePrivacy } from '../../hooks/usePrivacy';
import { RecipePrivacySettings } from '../../types/privacy';
import { PRIVACY_VISIBILITY_OPTIONS } from '../../types/privacy';

interface ManageRecipePrivacyScreenProps {
  navigation: any;
}

const ManageRecipePrivacyScreen: React.FC<ManageRecipePrivacyScreenProps> = ({
  navigation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [bulkMenuVisible, setBulkMenuVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const {
    recipes,
    isLoading,
    isFetching,
    updateRecipe,
    bulkUpdate,
    makeAllPrivate,
    makeAllPublic,
    isUpdatingRecipe,
    isBulkUpdating,
    isMakingPrivate,
    isMakingPublic,
    refetch,
  } = useRecipePrivacy();

  const filteredRecipes = recipes.filter(recipe =>
    recipe.recipeId.toLowerCase().includes(searchQuery.toLowerCase()) // Assumindo que temos título
  );

  const handleUpdateRecipeVisibility = useCallback(async (
    recipeId: string,
    visibility: 'public' | 'private' | 'friends'
  ) => {
    const result = await updateRecipe({ recipeId, visibility });
    if (!result.success) {
      // Error já é tratado no hook
    }
  }, [updateRecipe]);

  const handleToggleSelection = useCallback((recipeId: string) => {
    setSelectedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedRecipes.length === filteredRecipes.length) {
      setSelectedRecipes([]);
    } else {
      setSelectedRecipes(filteredRecipes.map(recipe => recipe.recipeId));
    }
  }, [selectedRecipes, filteredRecipes]);

  const handleBulkAction = useCallback(async (
    action: 'public' | 'private' | 'friends',
    additionalSettings?: any
  ) => {
    if (selectedRecipes.length === 0) return;

    const settings = {
      visibility: action,
      ...additionalSettings,
    };

    const result = await bulkUpdate(selectedRecipes, settings);
    if (result.success) {
      setSelectedRecipes([]);
      setSelectionMode(false);
    }
    setBulkMenuVisible(false);
  }, [selectedRecipes, bulkUpdate]);

  const handleExitSelectionMode = useCallback(() => {
    setSelectedRecipes([]);
    setSelectionMode(false);
  }, []);

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return '#4caf50';
      case 'private':
        return '#f44336';
      case 'friends':
        return '#ff9800';
      default:
        return '#2196f3';
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    const option = PRIVACY_VISIBILITY_OPTIONS.find(opt => opt.value === visibility);
    return option?.label || visibility;
  };

  const renderRecipe = useCallback(({ item }: { item: RecipePrivacySettings }) => (
    <Card style={styles.recipeCard}>
      <List.Item
        title={`Receita ${item.recipeId}`} // Idealmente seria o título real da receita
        description={`Atualizado em ${new Date(item.updatedAt).toLocaleDateString('pt-BR')}`}
        left={() => (
          selectionMode ? (
            <Checkbox
              status={selectedRecipes.includes(item.recipeId) ? 'checked' : 'unchecked'}
              onPress={() => handleToggleSelection(item.recipeId)}
            />
          ) : null
        )}
        right={() => (
          <View style={styles.recipeActions}>
            <Chip
              style={[
                styles.visibilityChip,
                { backgroundColor: getVisibilityColor(item.visibility) },
              ]}
              textStyle={styles.visibilityChipText}
            >
              {getVisibilityLabel(item.visibility)}
            </Chip>
            {!selectionMode && (
              <Menu
                visible={false}
                onDismiss={() => {}}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => {
                      // Implementar menu de ações individuais
                    }}
                    style={styles.actionButton}
                  >
                    Alterar
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => handleUpdateRecipeVisibility(item.recipeId, 'public')}
                  title="Público"
                  leadingIcon="earth"
                />
                <Menu.Item
                  onPress={() => handleUpdateRecipeVisibility(item.recipeId, 'friends')}
                  title="Amigos"
                  leadingIcon="account-group"
                />
                <Menu.Item
                  onPress={() => handleUpdateRecipeVisibility(item.recipeId, 'private')}
                  title="Privado"
                  leadingIcon="lock"
                />
              </Menu>
            )}
          </View>
        )}
        onPress={() => {
          if (selectionMode) {
            handleToggleSelection(item.recipeId);
          } else {
            navigation.navigate('RecipeDetail', { recipeId: item.recipeId });
          }
        }}
        onLongPress={() => {
          if (!selectionMode) {
            setSelectionMode(true);
            handleToggleSelection(item.recipeId);
          }
        }}
      />
      
      {/* Configurações adicionais */}
      <Card.Content style={styles.additionalSettings}>
        <View style={styles.settingsRow}>
          <Text style={styles.settingLabel}>Comentários:</Text>
          <Text style={[
            styles.settingValue,
            { color: item.allowComments ? '#4caf50' : '#f44336' }
          ]}>
            {item.allowComments ? 'Permitidos' : 'Bloqueados'}
          </Text>
        </View>
        <View style={styles.settingsRow}>
          <Text style={styles.settingLabel}>Avaliações:</Text>
          <Text style={[
            styles.settingValue,
            { color: item.allowRatings ? '#4caf50' : '#f44336' }
          ]}>
            {item.allowRatings ? 'Permitidas' : 'Bloqueadas'}
          </Text>
        </View>
        <View style={styles.settingsRow}>
          <Text style={styles.settingLabel}>Salvamentos:</Text>
          <Text style={[
            styles.settingValue,
            { color: item.allowSaves ? '#4caf50' : '#f44336' }
          ]}>
            {item.allowSaves ? 'Permitidos' : 'Bloqueados'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  ), [
    selectionMode,
    selectedRecipes,
    handleToggleSelection,
    handleUpdateRecipeVisibility,
    navigation,
  ]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando receitas...</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Nenhuma receita encontrada</Text>
        <Text style={styles.emptyDescription}>
          {searchQuery
            ? 'Tente ajustar sua busca'
            : 'Você ainda não tem receitas para gerenciar'
          }
        </Text>
      </View>
    );
  }, [isLoading, searchQuery]);

  const renderHeader = useCallback(() => (
    <View style={styles.headerContainer}>
      <Searchbar
        placeholder="Buscar receitas..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
      />
      
      {/* Ações rápidas */}
      <Card style={styles.quickActionsCard}>
        <Card.Content>
          <Text style={styles.quickActionsTitle}>Ações Rápidas</Text>
          <View style={styles.quickActionsRow}>
            <Button
              mode="outlined"
              onPress={makeAllPublic}
              disabled={isMakingPublic}
              loading={isMakingPublic}
              style={styles.quickActionButton}
            >
              Todas Públicas
            </Button>
            <Button
              mode="outlined"
              onPress={makeAllPrivate}
              disabled={isMakingPrivate}
              loading={isMakingPrivate}
              style={styles.quickActionButton}
            >
              Todas Privadas
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Modo de seleção */}
      {selectionMode && (
        <Card style={styles.selectionCard}>
          <Card.Content>
            <View style={styles.selectionHeader}>
              <Text style={styles.selectionTitle}>
                {selectedRecipes.length} receita{selectedRecipes.length !== 1 ? 's' : ''} selecionada{selectedRecipes.length !== 1 ? 's' : ''}
              </Text>
              <Button
                mode="text"
                onPress={handleExitSelectionMode}
              >
                Cancelar
              </Button>
            </View>
            <View style={styles.selectionActions}>
              <Button
                mode="outlined"
                onPress={handleSelectAll}
                style={styles.selectionButton}
              >
                {selectedRecipes.length === filteredRecipes.length ? 'Desmarcar' : 'Selecionar'} Todas
              </Button>
              <Menu
                visible={bulkMenuVisible}
                onDismiss={() => setBulkMenuVisible(false)}
                anchor={
                  <Button
                    mode="contained"
                    onPress={() => setBulkMenuVisible(true)}
                    disabled={selectedRecipes.length === 0 || isBulkUpdating}
                    loading={isBulkUpdating}
                    style={styles.selectionButton}
                  >
                    Alterar Visibilidade
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => handleBulkAction('public')}
                  title="Tornar Públicas"
                  leadingIcon="earth"
                />
                <Menu.Item
                  onPress={() => handleBulkAction('friends')}
                  title="Tornar para Amigos"
                  leadingIcon="account-group"
                />
                <Menu.Item
                  onPress={() => handleBulkAction('private')}
                  title="Tornar Privadas"
                  leadingIcon="lock"
                />
              </Menu>
            </View>
          </Card.Content>
        </Card>
      )}
    </View>
  ), [
    searchQuery,
    selectionMode,
    selectedRecipes,
    filteredRecipes,
    bulkMenuVisible,
    isMakingPublic,
    isMakingPrivate,
    isBulkUpdating,
    makeAllPublic,
    makeAllPrivate,
    handleSelectAll,
    handleExitSelectionMode,
    handleBulkAction,
  ]);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Privacidade das Receitas" />
        <Appbar.Action
          icon="help-circle"
          onPress={() => navigation.navigate('RecipePrivacyHelp')}
        />
      </Appbar.Header>

      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.recipeId}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {!selectionMode && (
        <FAB
          icon="select-multiple"
          label="Selecionar"
          style={styles.fab}
          onPress={() => setSelectionMode(true)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  headerContainer: {
    padding: 16,
  },
  searchbar: {
    marginBottom: 16,
  },
  quickActionsCard: {
    elevation: 2,
    marginBottom: 16,
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
  selectionCard: {
    elevation: 2,
    backgroundColor: '#e3f2fd',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  selectionButton: {
    flex: 1,
  },
  recipeCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 1,
  },
  recipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visibilityChip: {
    height: 28,
  },
  visibilityChipText: {
    fontSize: 12,
    color: '#fff',
  },
  actionButton: {
    height: 32,
  },
  additionalSettings: {
    paddingTop: 0,
    paddingBottom: 12,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingLabel: {
    fontSize: 12,
    color: '#666',
  },
  settingValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2196f3',
  },
});

export default ManageRecipePrivacyScreen;