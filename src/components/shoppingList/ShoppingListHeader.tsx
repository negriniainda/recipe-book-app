import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {
  ShoppingList,
  ShoppingCartState,
  ShoppingListViewMode,
} from '../../types/shoppingList';
import {colors, typography, spacing} from '../../theme';

interface ShoppingListHeaderProps {
  list: ShoppingList;
  cartState: ShoppingCartState;
  viewMode: ShoppingListViewMode;
  onViewModeChange: (viewMode: ShoppingListViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isEditing: boolean;
  selectedCount: number;
  onToggleEdit: () => void;
  onDeleteSelected: () => void;
  onMarkAsPurchased: () => void;
  onNavigateToMealPlan?: () => void;
}

export const ShoppingListHeader: React.FC<ShoppingListHeaderProps> = ({
  list,
  cartState,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  isEditing,
  selectedCount,
  onToggleEdit,
  onDeleteSelected,
  onMarkAsPurchased,
  onNavigateToMealPlan,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2)}`;
  };

  const getProgressColor = () => {
    if (cartState.completionPercentage >= 80) return colors.success[500];
    if (cartState.completionPercentage >= 50) return colors.warning[500];
    return colors.primary[500];
  };

  return (
    <View style={styles.container}>
      {/* Title and Progress */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={styles.listName} numberOfLines={1}>
            {list.name}
          </Text>
          
          <View style={styles.headerActions}>
            {!isEditing && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowSearch(!showSearch)}
                >
                  <Ionicons name="search" size={20} color={colors.gray[600]} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowViewOptions(true)}
                >
                  <Ionicons name="options" size={20} color={colors.gray[600]} />
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onToggleEdit}
            >
              <Ionicons 
                name={isEditing ? "checkmark" : "create"} 
                size={20} 
                color={isEditing ? colors.success[600] : colors.gray[600]} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${cartState.completionPercentage}%`,
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
          
          <Text style={styles.progressText}>
            {Math.round(cartState.completionPercentage)}% completo
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{cartState.totalItems}</Text>
            <Text style={styles.statLabel}>itens</Text>
          </View>
          
          {viewMode.showPrices && (
            <>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {formatPrice(cartState.estimatedTotal)}
                </Text>
                <Text style={styles.statLabel}>estimado</Text>
              </View>
              
              {cartState.totalPrice > 0 && (
                <View style={styles.stat}>
                  <Text style={[styles.statValue, {color: colors.success[600]}]}>
                    {formatPrice(cartState.totalPrice)}
                  </Text>
                  <Text style={styles.statLabel}>gasto</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={colors.gray[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar itens..."
              value={searchQuery}
              onChangeText={onSearchChange}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange('')}>
                <Ionicons name="close-circle" size={16} color={colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Edit Mode Actions */}
      {isEditing && selectedCount > 0 && (
        <View style={styles.editActions}>
          <Text style={styles.selectedText}>
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selecionado{selectedCount > 1 ? 's' : ''}
          </Text>
          
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={[styles.editButton, styles.purchaseButton]}
              onPress={onMarkAsPurchased}
            >
              <Ionicons name="checkmark" size={16} color={colors.white} />
              <Text style={styles.editButtonText}>Comprar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.editButton, styles.deleteButton]}
              onPress={onDeleteSelected}
            >
              <Ionicons name="trash" size={16} color={colors.white} />
              <Text style={styles.editButtonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Meal Plan Link */}
      {list.mealPlanIds.length > 0 && onNavigateToMealPlan && (
        <TouchableOpacity
          style={styles.mealPlanLink}
          onPress={onNavigateToMealPlan}
        >
          <Ionicons name="calendar" size={16} color={colors.primary[600]} />
          <Text style={styles.mealPlanText}>
            Baseado em {list.mealPlanIds.length} meal plan{list.mealPlanIds.length > 1 ? 's' : ''}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary[600]} />
        </TouchableOpacity>
      )}

      {/* View Options Modal */}
      <Modal
        visible={showViewOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowViewOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowViewOptions(false)}
        >
          <View style={styles.viewOptionsModal}>
            <Text style={styles.modalTitle}>Opções de Visualização</Text>
            
            <View style={styles.optionGroup}>
              <Text style={styles.optionGroupTitle}>Agrupar por:</Text>
              {[
                {key: 'category', label: 'Categoria'},
                {key: 'recipe', label: 'Receita'},
                {key: 'status', label: 'Status'},
                {key: 'none', label: 'Sem agrupamento'},
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.optionItem}
                  onPress={() => {
                    onViewModeChange({...viewMode, groupBy: option.key as any});
                    setShowViewOptions(false);
                  }}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {viewMode.groupBy === option.key && (
                    <Ionicons name="checkmark" size={16} color={colors.primary[600]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.optionGroup}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  onViewModeChange({...viewMode, showCompleted: !viewMode.showCompleted});
                }}
              >
                <Text style={styles.optionText}>Mostrar itens comprados</Text>
                <Ionicons 
                  name={viewMode.showCompleted ? "checkbox" : "square-outline"} 
                  size={16} 
                  color={colors.primary[600]} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  onViewModeChange({...viewMode, showPrices: !viewMode.showPrices});
                }}
              >
                <Text style={styles.optionText}>Mostrar preços</Text>
                <Ionicons 
                  name={viewMode.showPrices ? "checkbox" : "square-outline"} 
                  size={16} 
                  color={colors.primary[600]} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  titleSection: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  listName: {
    ...typography.title,
    color: colors.gray[900],
    flex: 1,
    marginRight: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    marginRight: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.gray[600],
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray[500],
  },
  searchSection: {
    paddingBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
    color: colors.gray[900],
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  selectedText: {
    ...typography.body,
    color: colors.gray[700],
  },
  editButtons: {
    flexDirection: 'row',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginLeft: spacing.sm,
  },
  purchaseButton: {
    backgroundColor: colors.success[500],
  },
  deleteButton: {
    backgroundColor: colors.error[500],
  },
  editButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  mealPlanLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  mealPlanText: {
    ...typography.caption,
    color: colors.primary[600],
    flex: 1,
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewOptionsModal: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    margin: spacing.xl,
    minWidth: 280,
  },
  modalTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  optionGroup: {
    marginBottom: spacing.md,
  },
  optionGroupTitle: {
    ...typography.caption,
    color: colors.gray[600],
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  optionText: {
    ...typography.body,
    color: colors.gray[700],
  },
});