import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, FlatList, ListRenderItem} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  Searchbar,
  Checkbox,
  IconButton,
  Divider,
  FAB,
} from 'react-native-paper';
import {CustomList} from '@/types/lists';
import {Recipe} from '@/types';
import ListCard from './ListCard';
import {theme} from '@/utils/theme';

interface AddToListModalProps {
  visible: boolean;
  onDismiss: () => void;
  recipe: Recipe | null;
  userLists: CustomList[];
  onAddToLists: (listIds: string[]) => void;
  onCreateNewList: () => void;
  loading?: boolean;
}

const AddToListModal: React.FC<AddToListModalProps> = ({
  visible,
  onDismiss,
  recipe,
  userLists,
  onAddToLists,
  onCreateNewList,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);

  // Resetar seleções quando o modal abrir
  useEffect(() => {
    if (visible && recipe) {
      // Pré-selecionar listas que já contêm a receita
      const listsWithRecipe = userLists
        .filter(list => list.recipeIds.includes(recipe.id))
        .map(list => list.id);
      setSelectedListIds(listsWithRecipe);
    } else {
      setSelectedListIds([]);
    }
    setSearchQuery('');
  }, [visible, recipe, userLists]);

  const filteredLists = React.useMemo(() => {
    if (!searchQuery.trim()) return userLists;
    
    const query = searchQuery.toLowerCase();
    return userLists.filter(list =>
      list.name.toLowerCase().includes(query) ||
      list.description?.toLowerCase().includes(query) ||
      list.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [userLists, searchQuery]);

  const handleToggleList = useCallback((listId: string) => {
    setSelectedListIds(prev => {
      if (prev.includes(listId)) {
        return prev.filter(id => id !== listId);
      } else {
        return [...prev, listId];
      }
    });
  }, []);

  const handleSave = useCallback(() => {
    if (selectedListIds.length > 0) {
      onAddToLists(selectedListIds);
    }
    onDismiss();
  }, [selectedListIds, onAddToLists, onDismiss]);

  const handleCreateNewList = useCallback(() => {
    onCreateNewList();
    onDismiss();
  }, [onCreateNewList, onDismiss]);

  const renderListItem: ListRenderItem<CustomList> = useCallback(
    ({item}) => {
      const isSelected = selectedListIds.includes(item.id);
      const hasRecipe = recipe ? item.recipeIds.includes(recipe.id) : false;

      return (
        <View style={styles.listItem}>
          <View style={styles.listContent}>
            <ListCard
              list={item}
              onPress={() => handleToggleList(item.id)}
              showActions={false}
              variant="compact"
              style={[
                styles.listCard,
                isSelected && styles.selectedListCard,
              ]}
            />
          </View>
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={() => handleToggleList(item.id)}
              color={theme.colors.primary}
            />
            {hasRecipe && (
              <Text variant="bodySmall" style={styles.hasRecipeText}>
                Já contém
              </Text>
            )}
          </View>
        </View>
      );
    },
    [selectedListIds, recipe, handleToggleList],
  );

  const renderEmptyState = useCallback(() => {
    if (searchQuery.trim()) {
      return (
        <View style={styles.emptyState}>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Nenhuma lista encontrada para "{searchQuery}"
          </Text>
          <Button
            mode="outlined"
            onPress={() => setSearchQuery('')}
            style={styles.emptyButton}>
            Limpar Busca
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          Nenhuma lista criada
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Crie sua primeira lista para organizar suas receitas
        </Text>
        <Button
          mode="contained"
          icon="plus"
          onPress={handleCreateNewList}
          style={styles.emptyButton}>
          Criar Lista
        </Button>
      </View>
    );
  }, [searchQuery, handleCreateNewList]);

  const getSelectedCount = () => {
    if (!recipe) return 0;
    
    const newSelections = selectedListIds.filter(
      listId => !userLists.find(list => 
        list.id === listId && list.recipeIds.includes(recipe.id)
      )
    );
    
    return newSelections.length;
  };

  const getButtonText = () => {
    const selectedCount = getSelectedCount();
    if (selectedCount === 0) return 'Nenhuma alteração';
    return `Adicionar a ${selectedCount} lista${selectedCount !== 1 ? 's' : ''}`;
  };

  if (!recipe) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text variant="headlineSmall" style={styles.title}>
              Adicionar à Lista
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {recipe.title}
            </Text>
          </View>
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
          />
        </View>

        <View style={styles.content}>
          {/* Barra de busca */}
          <Searchbar
            placeholder="Buscar listas..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />

          {/* Lista de listas */}
          <FlatList
            data={filteredLists}
            renderItem={renderListItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            style={styles.listContainer}
            contentContainerStyle={
              filteredLists.length === 0 ? styles.emptyContainer : undefined
            }
          />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.button}>
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={getSelectedCount() === 0 || loading}
            loading={loading}
            style={styles.button}>
            {getButtonText()}
          </Button>
        </View>

        {/* FAB para criar nova lista */}
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreateNewList}
          label="Nova Lista"
          variant="tertiary"
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    borderRadius: theme.roundness,
    maxHeight: '80%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchbar: {
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listContent: {
    flex: 1,
  },
  listCard: {
    marginBottom: 0,
  },
  selectedListCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  checkboxContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  hasRecipeText: {
    opacity: 0.6,
    fontSize: 10,
    marginTop: 2,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyButton: {
    minWidth: 140,
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
  },
});

export default AddToListModal;