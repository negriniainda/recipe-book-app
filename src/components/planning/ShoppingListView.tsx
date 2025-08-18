import React, {useState, useCallback} from 'react';
import {View, StyleSheet, FlatList, ListRenderItem} from 'react-native';
import {
  Text,
  Card,
  Checkbox,
  IconButton,
  Button,
  Chip,
  Divider,
  Menu,
  FAB,
} from 'react-native-paper';
import {ShoppingList, ShoppingItem} from '@/types';
import {theme} from '@/utils/theme';

interface ShoppingListViewProps {
  shoppingList: ShoppingList;
  onToggleItem: (itemId: string, completed: boolean) => void;
  onDeleteItem?: (itemId: string) => void;
  onAddItem?: () => void;
  onEditList?: () => void;
  onDeleteList?: () => void;
  onShareList?: () => void;
  style?: any;
}

const CATEGORY_COLORS = {
  produce: '#4CAF50',
  meat: '#F44336',
  dairy: '#2196F3',
  pantry: '#FF9800',
  frozen: '#9C27B0',
  bakery: '#795548',
  beverages: '#607D8B',
  snacks: '#E91E63',
  other: '#757575',
};

const CATEGORY_LABELS = {
  produce: 'Hortifrúti',
  meat: 'Carnes',
  dairy: 'Laticínios',
  pantry: 'Despensa',
  frozen: 'Congelados',
  bakery: 'Padaria',
  beverages: 'Bebidas',
  snacks: 'Lanches',
  other: 'Outros',
};

const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  shoppingList,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onEditList,
  onDeleteList,
  onShareList,
  style,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(true);

  // Agrupar itens por categoria
  const groupedItems = React.useMemo(() => {
    if (!groupByCategory) {
      return [{category: 'all', items: shoppingList.items}];
    }

    const groups = shoppingList.items.reduce((acc, item) => {
      const category = item.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ShoppingItem[]>);

    return Object.entries(groups)
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => {
          // Itens não completados primeiro
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          return a.name.localeCompare(b.name);
        }),
      }))
      .sort((a, b) => {
        // Categorias com itens não completados primeiro
        const aHasIncomplete = a.items.some(item => !item.completed);
        const bHasIncomplete = b.items.some(item => !item.completed);
        
        if (aHasIncomplete !== bHasIncomplete) {
          return aHasIncomplete ? -1 : 1;
        }
        
        return a.category.localeCompare(b.category);
      });
  }, [shoppingList.items, groupByCategory]);

  // Estatísticas da lista
  const stats = React.useMemo(() => {
    const total = shoppingList.items.length;
    const completed = shoppingList.items.filter(item => item.completed).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    return {total, completed, progress};
  }, [shoppingList.items]);

  const handleToggleItem = useCallback((item: ShoppingItem) => {
    onToggleItem(item.id, !item.completed);
  }, [onToggleItem]);

  const handleDeleteItem = useCallback((item: ShoppingItem) => {
    if (onDeleteItem) {
      onDeleteItem(item.id);
    }
  }, [onDeleteItem]);

  const renderItem: ListRenderItem<ShoppingItem> = useCallback(
    ({item}) => (
      <Card style={[styles.itemCard, item.completed && styles.itemCardCompleted]}>
        <Card.Content style={styles.itemContent}>
          <View style={styles.itemMain}>
            <Checkbox
              status={item.completed ? 'checked' : 'unchecked'}
              onPress={() => handleToggleItem(item)}
            />
            <View style={styles.itemInfo}>
              <Text
                variant="bodyMedium"
                style={[
                  styles.itemName,
                  item.completed && styles.itemNameCompleted,
                ]}>
                {item.name}
              </Text>
              <View style={styles.itemDetails}>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.itemQuantity,
                    item.completed && styles.itemQuantityCompleted,
                  ]}>
                  {item.quantity > 0 && `${item.quantity} ${item.unit}`}
                </Text>
                {item.notes && (
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.itemNotes,
                      item.completed && styles.itemNotesCompleted,
                    ]}>
                    {item.notes}
                  </Text>
                )}
              </View>
            </View>
          </View>
          
          {onDeleteItem && (
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteItem(item)}
              style={styles.deleteButton}
            />
          )}
        </Card.Content>
      </Card>
    ),
    [handleToggleItem, handleDeleteItem, onDeleteItem],
  );

  const renderCategoryHeader = useCallback(
    (category: string, itemCount: number, completedCount: number) => {
      if (category === 'all') return null;

      const categoryLabel = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category;
      const categoryColor = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.other;

      return (
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <View
              style={[
                styles.categoryIndicator,
                {backgroundColor: categoryColor},
              ]}
            />
            <Text variant="titleMedium" style={styles.categoryTitle}>
              {categoryLabel}
            </Text>
            <Chip
              mode="outlined"
              compact
              style={styles.categoryChip}>
              {completedCount}/{itemCount}
            </Chip>
          </View>
        </View>
      );
    },
    [],
  );

  const renderGroup = useCallback(
    ({item: group}: {item: {category: string; items: ShoppingItem[]}}) => {
      const completedCount = group.items.filter(item => item.completed).length;
      
      return (
        <View style={styles.categoryGroup}>
          {renderCategoryHeader(group.category, group.items.length, completedCount)}
          <FlatList
            data={group.items}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      );
    },
    [renderItem, renderCategoryHeader],
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header da lista */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text variant="headlineSmall" style={styles.listTitle}>
                {shoppingList.name}
              </Text>
              <Text variant="bodyMedium" style={styles.listStats}>
                {stats.completed} de {stats.total} itens • {Math.round(stats.progress)}% completo
              </Text>
            </View>
            
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  onPress={() => setMenuVisible(true)}
                />
              }>
              <Menu.Item
                onPress={() => {
                  setGroupByCategory(!groupByCategory);
                  setMenuVisible(false);
                }}
                title={groupByCategory ? 'Visualização simples' : 'Agrupar por categoria'}
                leadingIcon={groupByCategory ? 'view-list' : 'view-module'}
              />
              {onEditList && (
                <Menu.Item
                  onPress={() => {
                    onEditList();
                    setMenuVisible(false);
                  }}
                  title="Editar lista"
                  leadingIcon="pencil"
                />
              )}
              {onShareList && (
                <Menu.Item
                  onPress={() => {
                    onShareList();
                    setMenuVisible(false);
                  }}
                  title="Compartilhar"
                  leadingIcon="share"
                />
              )}
              <Divider />
              {onDeleteList && (
                <Menu.Item
                  onPress={() => {
                    onDeleteList();
                    setMenuVisible(false);
                  }}
                  title="Excluir lista"
                  leadingIcon="delete"
                  titleStyle={{color: theme.colors.error}}
                />
              )}
            </Menu>
          </View>

          {/* Barra de progresso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {width: `${stats.progress}%`},
                ]}
              />
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Lista de itens */}
      <FlatList
        data={groupedItems}
        renderItem={renderGroup}
        keyExtractor={item => item.category}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Esta lista está vazia
              </Text>
              <Text variant="bodySmall" style={styles.emptySubtext}>
                Adicione itens para começar suas compras
              </Text>
            </Card.Content>
          </Card>
        }
      />

      {/* FAB para adicionar item */}
      {onAddItem && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={onAddItem}
          label="Adicionar Item"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  listTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  listStats: {
    opacity: 0.7,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.outline + '20',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  listContent: {
    paddingBottom: 80, // Space for FAB
  },
  categoryGroup: {
    marginBottom: 16,
  },
  categoryHeader: {
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryTitle: {
    flex: 1,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  categoryChip: {
    height: 24,
  },
  itemCard: {
    marginBottom: 8,
    elevation: 1,
  },
  itemCardCompleted: {
    opacity: 0.6,
  },
  itemContent: {
    paddingVertical: 12,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 8,
  },
  itemName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemQuantity: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  itemQuantityCompleted: {
    opacity: 0.5,
  },
  itemNotes: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  itemNotesCompleted: {
    opacity: 0.5,
  },
  deleteButton: {
    margin: 0,
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.7,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default ShoppingListView;