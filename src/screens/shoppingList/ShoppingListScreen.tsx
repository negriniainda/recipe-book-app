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
import {useNavigation} from '@react-navigation/native';
import {ShoppingListView} from '../../components/shoppingList/ShoppingListView';
import {CreateListModal} from '../../components/shoppingList/CreateListModal';
import {useShoppingList} from '../../hooks/useShoppingList';
import {useAuth} from '../../hooks/useAuth';
import {ShoppingListSummary} from '../../types/shoppingList';
import {colors, typography, spacing} from '../../theme';

export const ShoppingListScreen: React.FC = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | undefined>();

  const {
    shoppingLists,
    activeList,
    loadingLists,
    createNewList,
    generateListFromMealPlan,
  } = useShoppingList({
    userId: user?.id || '',
    listId: selectedListId,
  });

  const handleCreateList = async (name: string, description?: string) => {
    try {
      const newList = await createNewList(name, description);
      setSelectedListId(newList.id);
      setShowCreateModal(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleGenerateFromMealPlan = () => {
    Alert.alert(
      'Gerar Lista do Meal Plan',
      'Deseja gerar uma nova lista de compras baseada no seu meal plan atual?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Gerar',
          onPress: async () => {
            try {
              // This would need meal plan IDs from the current meal plan
              // For now, we'll show a placeholder
              Alert.alert('Em breve', 'Esta funcionalidade será implementada em breve!');
            } catch (error) {
              // Error handled in hook
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.primary[500];
      case 'completed':
        return colors.success[500];
      case 'draft':
        return colors.gray[500];
      case 'archived':
        return colors.gray[400];
      default:
        return colors.gray[500];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'completed':
        return 'Concluída';
      case 'draft':
        return 'Rascunho';
      case 'archived':
        return 'Arquivada';
      default:
        return status;
    }
  };

  const renderListItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        item.id === selectedListId && styles.selectedListItem,
      ]}
      onPress={() => setSelectedListId(item.id)}
    >
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.listItemStats}>
        <View style={styles.stat}>
          <Ionicons name="list" size={14} color={colors.gray[500]} />
          <Text style={styles.statText}>
            {item.itemCount || 0} itens
          </Text>
        </View>
        
        {item.completedItems > 0 && (
          <View style={styles.stat}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success[500]} />
            <Text style={styles.statText}>
              {item.completedItems} comprados
            </Text>
          </View>
        )}
        
        {item.estimatedTotal > 0 && (
          <View style={styles.stat}>
            <Ionicons name="card" size={14} color={colors.gray[500]} />
            <Text style={styles.statText}>
              R$ {item.estimatedTotal.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.listItemDate}>
        Criada em {formatDate(item.createdAt)}
      </Text>
    </TouchableOpacity>
  );

  if (selectedListId && activeList) {
    return (
      <View style={styles.container}>
        <View style={styles.backHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedListId(undefined)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.gray[700]} />
            <Text style={styles.backText}>Listas</Text>
          </TouchableOpacity>
        </View>
        
        <ShoppingListView
          userId={user?.id || ''}
          listId={selectedListId}
          onNavigateToMealPlan={() => {
            // Navigate to meal plan screen
            navigation.navigate('MealPlanning' as never);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Listas de Compras</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleGenerateFromMealPlan}
          >
            <Ionicons name="calendar" size={20} color={colors.primary[600]} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lists */}
      {shoppingLists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={64} color={colors.gray[400]} />
          <Text style={styles.emptyTitle}>Nenhuma lista criada</Text>
          <Text style={styles.emptySubtitle}>
            Crie sua primeira lista de compras para começar
          </Text>
          
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.primaryButtonText}>Criar Lista</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGenerateFromMealPlan}
            >
              <Ionicons name="calendar" size={20} color={colors.primary[600]} />
              <Text style={styles.secondaryButtonText}>Do Meal Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={shoppingLists}
          renderItem={renderListItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loadingLists}
          onRefresh={() => {
            // Refresh lists
          }}
        />
      )}

      <CreateListModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    ...typography.title,
    color: colors.gray[900],
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  backHeader: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  backText: {
    ...typography.body,
    color: colors.gray[700],
    marginLeft: spacing.sm,
  },
  listContainer: {
    padding: spacing.md,
  },
  listItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedListItem: {
    borderColor: colors.primary[300],
    borderWidth: 2,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  listItemName: {
    ...typography.subtitle,
    color: colors.gray[900],
    flex: 1,
    marginRight: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  listItemStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.gray[600],
    marginLeft: spacing.xs,
  },
  listItemDate: {
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
    marginBottom: spacing.xl,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary[300],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary[600],
    marginLeft: spacing.sm,
  },
});