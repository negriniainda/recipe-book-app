import React, {useCallback, useState} from 'react';
import {View, StyleSheet, FlatList, ListRenderItem, Alert} from 'react-native';
import {
  Text,
  Card,
  Button,
  Searchbar,
  FAB,
  Menu,
  IconButton,
  Chip,
} from 'react-native-paper';
import {useAppSelector, useAppDispatch} from '@/store';
import {
  useGetUserListsQuery,
  useDeleteListMutation,
  useDuplicateListMutation,
} from '@/services/listsApi';
import {
  setSelectedList,
  setCreating,
  setEditing,
} from '@/store/slices/listsSlice';
import {CustomList, LIST_TEMPLATES} from '@/types/lists';
import ListCard from '@/components/lists/ListCard';
import CreateListModal from '@/components/lists/CreateListModal';
import {theme} from '@/utils/theme';

type SortOption = 'name' | 'createdAt' | 'recipesCount' | 'lastModified';
type FilterOption = 'all' | 'public' | 'private' | 'withRecipes' | 'empty';

const ListsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.auth);
  const {isCreating, isEditing, selectedListId} = useAppSelector(state => state.lists);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('lastModified');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [templateMenuVisible, setTemplateMenuVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();

  // API hooks
  const {
    data: listsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetUserListsQuery({
    userId: user?.id,
    page: 1,
    limit: 50,
  });

  const [deleteList] = useDeleteListMutation();
  const [duplicateList] = useDuplicateListMutation();

  const lists = listsData?.items || [];

  // Filtrar e ordenar listas
  const filteredAndSortedLists = React.useMemo(() => {
    let filtered = lists;

    // Filtrar por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = lists.filter(list =>
        list.name.toLowerCase().includes(query) ||
        list.description?.toLowerCase().includes(query) ||
        list.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtrar por tipo
    switch (filterBy) {
      case 'public':
        filtered = filtered.filter(list => list.isPublic);
        break;
      case 'private':
        filtered = filtered.filter(list => !list.isPublic);
        break;
      case 'withRecipes':
        filtered = filtered.filter(list => list.recipesCount > 0);
        break;
      case 'empty':
        filtered = filtered.filter(list => list.recipesCount === 0);
        break;
      case 'all':
      default:
        break;
    }

    // Ordenar
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'recipesCount':
          return b.recipesCount - a.recipesCount;
        case 'lastModified':
        default:
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
    });

    return sorted;
  }, [lists, searchQuery, sortBy, filterBy]);

  const handleListPress = useCallback((list: CustomList) => {
    dispatch(setSelectedList(list.id));
    // TODO: Navegar para tela de detalhes da lista
    // navigation.navigate('ListDetails', { listId: list.id });
  }, [dispatch]);

  const handleEditList = useCallback((list: CustomList) => {
    dispatch(setSelectedList(list.id));
    dispatch(setEditing(true));
  }, [dispatch]);

  const handleDeleteList = useCallback(async (list: CustomList) => {
    Alert.alert(
      'Excluir Lista',
      `Tem certeza que deseja excluir a lista "${list.name}"? Esta ação não pode ser desfeita.`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteList(list.id).unwrap();
              // TODO: Mostrar toast de sucesso
            } catch (error) {
              // TODO: Mostrar toast de erro
            }
          },
        },
      ]
    );
  }, [deleteList]);

  const handleShareList = useCallback((list: CustomList) => {
    // TODO: Implementar compartilhamento
    console.log('Share list:', list.id);
  }, []);

  const handleDuplicateList = useCallback(async (list: CustomList) => {
    try {
      await duplicateList({
        listId: list.id,
        name: `${list.name} (Cópia)`,
      }).unwrap();
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      // TODO: Mostrar toast de erro
    }
  }, [duplicateList]);

  const handleCreateList = useCallback((template?: string) => {
    setSelectedTemplate(template);
    dispatch(setCreating(true));
    setTemplateMenuVisible(false);
  }, [dispatch]);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option);
    setSortMenuVisible(false);
  }, []);

  const handleFilterChange = useCallback((option: FilterOption) => {
    setFilterBy(option);
    setFilterMenuVisible(false);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'name': return 'Nome';
      case 'createdAt': return 'Data de Criação';
      case 'recipesCount': return 'Número de Receitas';
      case 'lastModified': return 'Última Modificação';
      default: return 'Ordenar';
    }
  };

  const getFilterLabel = (option: FilterOption) => {
    switch (option) {
      case 'public': return 'Públicas';
      case 'private': return 'Privadas';
      case 'withRecipes': return 'Com Receitas';
      case 'empty': return 'Vazias';
      case 'all': return 'Todas';
      default: return 'Filtrar';
    }
  };

  const renderList: ListRenderItem<CustomList> = useCallback(
    ({item}) => (
      <ListCard
        list={item}
        onPress={handleListPress}
        onEdit={handleEditList}
        onDelete={handleDeleteList}
        onShare={handleShareList}
        onDuplicate={handleDuplicateList}
        variant="default"
      />
    ),
    [
      handleListPress,
      handleEditList,
      handleDeleteList,
      handleShareList,
      handleDuplicateList,
    ],
  );

  const renderHeader = useCallback(() => {
    if (filteredAndSortedLists.length === 0) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text variant="titleMedium" style={styles.headerTitle}>
            {searchQuery ? (
              <>
                {filteredAndSortedLists.length} resultado{filteredAndSortedLists.length !== 1 ? 's' : ''} 
                {' '}para "{searchQuery}"
              </>
            ) : (
              <>
                {filteredAndSortedLists.length} lista{filteredAndSortedLists.length !== 1 ? 's' : ''}
                {filterBy !== 'all' && ` (${getFilterLabel(filterBy).toLowerCase()})`}
              </>
            )}
          </Text>
          
          {searchQuery && (
            <Chip
              mode="outlined"
              icon="close"
              onPress={handleClearSearch}
              style={styles.clearSearchChip}>
              Limpar busca
            </Chip>
          )}
        </View>

        <View style={styles.headerActions}>
          {/* Filtros */}
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                icon="filter"
                onPress={() => setFilterMenuVisible(true)}
                compact>
                {getFilterLabel(filterBy)}
              </Button>
            }>
            <Menu.Item
              onPress={() => handleFilterChange('all')}
              title="Todas"
              leadingIcon={filterBy === 'all' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => handleFilterChange('withRecipes')}
              title="Com Receitas"
              leadingIcon={filterBy === 'withRecipes' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => handleFilterChange('empty')}
              title="Vazias"
              leadingIcon={filterBy === 'empty' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => handleFilterChange('public')}
              title="Públicas"
              leadingIcon={filterBy === 'public' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => handleFilterChange('private')}
              title="Privadas"
              leadingIcon={filterBy === 'private' ? 'check' : undefined}
            />
          </Menu>

          {/* Ordenação */}
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                icon="sort"
                onPress={() => setSortMenuVisible(true)}
                compact>
                {getSortLabel(sortBy)}
              </Button>
            }>
            <Menu.Item
              onPress={() => handleSortChange('lastModified')}
              title="Última Modificação"
              leadingIcon={sortBy === 'lastModified' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => handleSortChange('name')}
              title="Nome"
              leadingIcon={sortBy === 'name' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => handleSortChange('recipesCount')}
              title="Número de Receitas"
              leadingIcon={sortBy === 'recipesCount' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => handleSortChange('createdAt')}
              title="Data de Criação"
              leadingIcon={sortBy === 'createdAt' ? 'check' : undefined}
            />
          </Menu>
        </View>
      </View>
    );
  }, [
    filteredAndSortedLists.length,
    searchQuery,
    filterBy,
    sortBy,
    sortMenuVisible,
    filterMenuVisible,
    handleClearSearch,
    handleSortChange,
    handleFilterChange,
  ]);

  const renderEmptyState = useCallback(() => {
    if (isLoading) return null;

    if (searchQuery || filterBy !== 'all') {
      return (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              Nenhuma lista encontrada
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {searchQuery 
                ? `Não encontramos listas para "${searchQuery}"`
                : `Nenhuma lista ${getFilterLabel(filterBy).toLowerCase()} encontrada`
              }
            </Text>
            <View style={styles.emptyActions}>
              {searchQuery && (
                <Button
                  mode="outlined"
                  onPress={handleClearSearch}
                  style={styles.emptyButton}>
                  Limpar Busca
                </Button>
              )}
              {filterBy !== 'all' && (
                <Button
                  mode="outlined"
                  onPress={() => handleFilterChange('all')}
                  style={styles.emptyButton}>
                  Ver Todas
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.emptyCard}>
        <Card.Content style={styles.emptyContent}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Nenhuma lista criada
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Organize suas receitas criando listas personalizadas
          </Text>
          <Text variant="bodySmall" style={styles.emptySubtext}>
            Use templates prontos ou crie do zero
          </Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => handleCreateList()}
            style={styles.emptyButton}>
            Criar Lista
          </Button>
        </Card.Content>
      </Card>
    );
  }, [
    isLoading,
    searchQuery,
    filterBy,
    handleClearSearch,
    handleFilterChange,
    handleCreateList,
  ]);

  const selectedList = selectedListId ? lists.find(l => l.id === selectedListId) : null;

  return (
    <View style={styles.container}>
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
          data={filteredAndSortedLists}
          renderItem={renderList}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            filteredAndSortedLists.length === 0 ? styles.emptyContainer : undefined
          }
        />
      </View>

      {/* FAB com menu de templates */}
      <Menu
        visible={templateMenuVisible}
        onDismiss={() => setTemplateMenuVisible(false)}
        anchor={
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => setTemplateMenuVisible(true)}
          />
        }>
        <Menu.Item
          onPress={() => handleCreateList()}
          title="Lista Personalizada"
          leadingIcon="plus"
        />
        {LIST_TEMPLATES.slice(0, 5).map(template => (
          <Menu.Item
            key={template.id}
            onPress={() => handleCreateList(template.id)}
            title={template.name}
            leadingIcon={template.icon}
          />
        ))}
      </Menu>

      {/* Modal de criação/edição */}
      <CreateListModal
        visible={isCreating || isEditing}
        onDismiss={() => {
          dispatch(setCreating(false));
          dispatch(setEditing(false));
          dispatch(setSelectedList(null));
          setSelectedTemplate(undefined);
        }}
        onSave={(listData) => {
          // TODO: Implementar save
          console.log('Save list:', listData);
        }}
        editingList={isEditing ? selectedList : null}
        initialTemplate={selectedTemplate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchbar: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitle: {
    fontWeight: '500',
    opacity: 0.8,
    flex: 1,
  },
  clearSearchChip: {
    height: 32,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 120,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default ListsScreen;