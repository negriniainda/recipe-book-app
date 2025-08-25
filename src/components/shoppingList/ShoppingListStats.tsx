import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useGetShoppingListStatsQuery} from '../../services/shoppingListApi';
import {colors, typography, spacing} from '../../theme';

interface ShoppingListStatsProps {
  userId: string;
  period?: 'week' | 'month' | 'year';
}

export const ShoppingListStats: React.FC<ShoppingListStatsProps> = ({
  userId,
  period = 'month',
}) => {
  const {data: stats, isLoading} = useGetShoppingListStatsQuery({
    userId,
    period,
  });

  if (isLoading || !stats) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando estatísticas...</Text>
      </View>
    );
  }

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2)}`;
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'week':
        return 'esta semana';
      case 'month':
        return 'este mês';
      case 'year':
        return 'este ano';
      default:
        return period;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Estatísticas de {getPeriodLabel()}</Text>
      </View>

      {/* Main Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="list" size={24} color={colors.primary[600]} />
          </View>
          <Text style={styles.statValue}>{stats.totalLists}</Text>
          <Text style={styles.statLabel}>Listas criadas</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success[600]} />
          </View>
          <Text style={styles.statValue}>{stats.completedLists}</Text>
          <Text style={styles.statLabel}>Listas concluídas</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="basket" size={24} color={colors.warning[600]} />
          </View>
          <Text style={styles.statValue}>{stats.totalItems}</Text>
          <Text style={styles.statLabel}>Itens adicionados</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="card" size={24} color={colors.error[600]} />
          </View>
          <Text style={styles.statValue}>{formatPrice(stats.totalSpent)}</Text>
          <Text style={styles.statLabel}>Total gasto</Text>
        </View>
      </View>

      {/* Completion Rate */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Taxa de Conclusão</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${stats.totalLists > 0 ? (stats.completedLists / stats.totalLists) * 100 : 0}%`,
                  backgroundColor: colors.success[500],
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {stats.totalLists > 0 
              ? Math.round((stats.completedLists / stats.totalLists) * 100)
              : 0}%
          </Text>
        </View>
      </View>

      {/* Most Bought Items */}
      {stats.mostBoughtItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens Mais Comprados</Text>
          {stats.mostBoughtItems.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>
                  {getCategoryLabel(item.category)}
                </Text>
              </View>
              <View style={styles.itemCount}>
                <Text style={styles.countNumber}>{item.count}</Text>
                <Text style={styles.countLabel}>vezes</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Category Breakdown */}
      {stats.categoryBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
          {stats.categoryBreakdown
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 6)
            .map((category, index) => (
              <View key={index} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>
                    {getCategoryLabel(category.category)}
                  </Text>
                  <Text style={styles.categoryItems}>
                    {category.itemCount} itens
                  </Text>
                </View>
                <View style={styles.categorySpent}>
                  <Text style={styles.spentAmount}>
                    {formatPrice(category.totalSpent)}
                  </Text>
                  <View style={styles.categoryBar}>
                    <View
                      style={[
                        styles.categoryBarFill,
                        {
                          width: `${stats.totalSpent > 0 ? (category.totalSpent / stats.totalSpent) * 100 : 0}%`,
                          backgroundColor: getCategoryColor(category.category),
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
        </View>
      )}

      {/* Average List Size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tamanho Médio das Listas</Text>
        <View style={styles.averageContainer}>
          <Text style={styles.averageNumber}>
            {stats.averageListSize.toFixed(1)}
          </Text>
          <Text style={styles.averageLabel}>itens por lista</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    produce: 'Frutas e Vegetais',
    meat: 'Carnes e Peixes',
    dairy: 'Laticínios',
    bakery: 'Padaria',
    pantry: 'Despensa',
    frozen: 'Congelados',
    beverages: 'Bebidas',
    snacks: 'Lanches',
    condiments: 'Condimentos',
    spices: 'Temperos',
    cleaning: 'Limpeza',
    other: 'Outros',
  };
  return labels[category] || category;
};

const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    produce: colors.success[500],
    meat: colors.error[500],
    dairy: colors.blue[500],
    bakery: colors.warning[500],
    pantry: colors.purple[500],
    frozen: colors.cyan[500],
    beverages: colors.orange[500],
    snacks: colors.pink[500],
    condiments: colors.teal[500],
    spices: colors.amber[500],
    cleaning: colors.gray[500],
    other: colors.gray[400],
  };
  return colorMap[category] || colors.gray[400];
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
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.gray[500],
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    ...typography.title,
    color: colors.gray[900],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.title,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray[600],
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.white,
    margin: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginRight: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.gray[700],
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  itemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rankNumber: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[700],
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  itemCategory: {
    ...typography.caption,
    color: colors.gray[500],
  },
  itemCount: {
    alignItems: 'flex-end',
  },
  countNumber: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
  },
  countLabel: {
    ...typography.caption,
    color: colors.gray[500],
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...typography.body,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  categoryItems: {
    ...typography.caption,
    color: colors.gray[500],
  },
  categorySpent: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  spentAmount: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  categoryBar: {
    width: 80,
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  averageContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  averageNumber: {
    ...typography.title,
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  averageLabel: {
    ...typography.body,
    color: colors.gray[600],
  },
});