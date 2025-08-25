import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useShoppingList} from '../../hooks/useShoppingList';
import {ShoppingListItem as ShoppingListItemComponent} from './ShoppingListItem';
import {ShoppingListHeader} from './ShoppingListHeader';
import {AddItemModal} from './AddItemModal';
import {ShoppingListViewMode, GroceryCategory} from '../../types/shoppingList';
import {colors, typography, spacing} from '../../theme';

interface ShoppingListViewProps {
  userId: string;
  listId?: string;
  onNavigateToMealPlan?: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  userId,
  listId,
  onNavigateToMealPlan,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);

  const {
    activeList,
    filteredItems,
    groupedItems,
    cartState,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedItems,
    isEditing,
    setIsEditing,
    loadingCurrentList,
    addItem,
    updateItemStatus,
    removeItem,
    toggleItemSelection,
    clearSelection,
    markSelectedAsPurchased,
    categoryLabels,
    categoryOrder,
  } = useShoppingList({userId, listId});

  const handleAddItem = async (
    name: string,
    quantity: number,
    unit: string,
    category: GroceryCategory,
    estimatedPrice?: number
  ) => {
    try {
      await addItem(name, quantity, unit, category, estimatedPrice);
      setShowAddModal(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleItemPress = async (itemId: string, currentStatus: string) => {
    if (isEditing) {
      toggleItemSelection(itemId);
    } else {
      const newStatus = currentStatus === 'purchased' ? 'pending' : 'purchased';
      await updateItemStatus(itemId, newStatus as any);
    }
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Remover Itens',
      `Deseja remover ${selectedItems.length} item(s) selecionado(s)?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(selectedItems.map(id => removeItem(id)));
              clearSelection();
              setIsEditing(false);
            } catch (error) {
              // Error handled in hook
            }
          },
        },
      ]
    );
  };

  const renderItem = ({item}: {item: any}) => (
    <ShoppingListItemComponent
      item={item}
      isSelected={selectedItems.includes(item.id)}
      isEditing={isEditing}
      showPrices={viewMode.showPrices}
      onPress={() => handleItemPress(item.id, item.status)}
      onLongPress={() => {
        if (!isEditing) {
          setIsEditing(true);
          toggleItemSelection(item.id);
        }
      }}
    />
  );

  const renderCategorySection = (category: GroceryCategory) => {
    const items = groupedItems[category];
    if (items.length === 0) return null;

    return (
      <View key={category} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>
            {categoryLabels[category]}
          </Text>
          <Text style={styles.categoryCount}>
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </Text>
        </View>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const renderGroupedList = () => {
    return (
      <FlatList
        data={categoryOrder}
        renderItem={({item: category}) => renderCategorySection(category)}
        keyExtractor={category => category}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  const renderFlatList = () => {
    return (
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={64} color={colors.gray[400]} />
            <Text style={styles.emptyTitle}>Lista vazia</Text>
            <Text style={styles.emptySubtitle}>
              Adicione itens à sua lista de compras
            </Text>
            <TouchableOpacity
              style={styles.addFirstItemButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addFirstItemText}>Adicionar primeiro item</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  if (loadingCurrentList) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando lista...</Text>
      </View>
    );
  }

  if (!activeList) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="basket-outline" size={64} color={colors.gray[400]} />
        <Text style={styles.emptyTitle}>Nenhuma lista ativa</Text>
        <Text style={styles.emptySubtitle}>
          Crie uma nova lista de compras para começar
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ShoppingListHeader
        list={activeList}
        cartState={cartState}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isEditing={isEditing}
        selectedCount={selectedItems.length}
        onToggleEdit={() => {
          setIsEditing(!isEditing);
          if (isEditing) clearSelection();
        }}
        onDeleteSelected={handleDeleteSelected}
        onMarkAsPurchased={markSelectedAsPurchased}
        onNavigateToMealPlan={onNavigateToMealPlan}
      />

      {viewMode.groupBy === 'category' ? renderGroupedList() : renderFlatList()}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>

      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  categoryTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[700],
  },
  categoryCount: {
    ...typography.caption,
    color: colors.gray[500],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.gray[600],
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  addFirstItemButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  addFirstItemText: {
    ...typography.button,
    color: colors.white,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});