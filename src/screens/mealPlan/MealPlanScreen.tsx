import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  FAB,
  Portal,
  Modal,
  Surface,
  Button,
  IconButton,
  Card,
  Divider,
} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import MealPlanCalendar from '../../components/mealPlan/MealPlanCalendar';
import {useAuth} from '../../hooks/useAuth';
import {useGetMealPlanStatsQuery} from '../../services/mealPlanApi';

// Define theme inline
const theme = {
  colors: {
    primary: '#6200EE',
    secondary: '#03DAC6',
    surface: '#FFFFFF',
    background: '#F5F5F5',
    outline: '#79747E',
    error: '#B00020',
    onSurface: '#1C1B1F',
    surfaceVariant: '#E7E0EC',
    primaryContainer: '#EADDFF',
    secondaryContainer: '#B2EBF2',
  },
  roundness: 8,
};

interface MealPlanScreenProps {
  navigation?: any;
  route?: any;
}

const MealPlanScreen: React.FC<MealPlanScreenProps> = ({
  navigation,
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const {user} = useAuth();

  // Get current week stats
  const currentWeekStart = React.useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - daysToMonday);
    return weekStart.toISOString().split('T')[0];
  }, []);

  const currentWeekEnd = React.useMemo(() => {
    const weekStart = new Date(currentWeekStart + 'T00:00:00');
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd.toISOString().split('T')[0];
  }, [currentWeekStart]);

  const {data: weekStats} = useGetMealPlanStatsQuery(
    {
      userId: user?.id || '',
      startDate: currentWeekStart,
      endDate: currentWeekEnd,
    },
    {skip: !user}
  );

  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen is focused
    }, [])
  );

  const handleRecipePress = useCallback((recipeId: string) => {
    navigation?.navigate('RecipeDetails', {recipeId});
  }, [navigation]);

  const handleCreateNewPlan = useCallback(() => {
    // TODO: Navigate to create meal plan screen
    setShowQuickActions(false);
  }, []);

  const handleImportRecipes = useCallback(() => {
    navigation?.navigate('ImportRecipe');
    setShowQuickActions(false);
  }, [navigation]);

  const handleViewPreferences = useCallback(() => {
    // TODO: Navigate to meal plan preferences screen
    setShowQuickActions(false);
  }, []);

  const renderQuickActionsModal = () => (
    <Portal>
      <Modal
        visible={showQuickActions}
        onDismiss={() => setShowQuickActions(false)}
        contentContainerStyle={styles.quickActionsModal}>
        <Surface style={styles.quickActionsContent}>
          <View style={styles.quickActionsHeader}>
            <Text variant="titleLarge" style={styles.quickActionsTitle}>
              Ações Rápidas
            </Text>
            <IconButton
              icon="close"
              onPress={() => setShowQuickActions(false)}
            />
          </View>

          <View style={styles.quickActionsList}>
            <Button
              mode="contained"
              icon="calendar-plus"
              onPress={handleCreateNewPlan}
              style={styles.quickActionButton}
              contentStyle={styles.quickActionButtonContent}>
              Criar Novo Plano
            </Button>

            <Button
              mode="outlined"
              icon="import"
              onPress={handleImportRecipes}
              style={styles.quickActionButton}
              contentStyle={styles.quickActionButtonContent}>
              Importar Receitas
            </Button>

            <Button
              mode="outlined"
              icon="cog"
              onPress={handleViewPreferences}
              style={styles.quickActionButton}
              contentStyle={styles.quickActionButtonContent}>
              Preferências
            </Button>

            <Divider style={styles.quickActionsDivider} />

            <Button
              mode="text"
              icon="chart-line"
              onPress={() => {
                setShowStats(true);
                setShowQuickActions(false);
              }}
              style={styles.quickActionButton}
              contentStyle={styles.quickActionButtonContent}>
              Ver Estatísticas
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  const renderStatsModal = () => (
    <Portal>
      <Modal
        visible={showStats}
        onDismiss={() => setShowStats(false)}
        contentContainerStyle={styles.statsModal}>
        <Surface style={styles.statsContent}>
          <View style={styles.statsHeader}>
            <Text variant="titleLarge" style={styles.statsTitle}>
              Estatísticas da Semana
            </Text>
            <IconButton
              icon="close"
              onPress={() => setShowStats(false)}
            />
          </View>

          <ScrollView style={styles.statsScroll}>
            {weekStats ? (
              <View style={styles.statsContainer}>
                {/* Total meals */}
                <Card style={styles.statCard}>
                  <Card.Content style={styles.statCardContent}>
                    <View style={styles.statInfo}>
                      <Text variant="headlineMedium" style={styles.statNumber}>
                        {weekStats.totalMeals}
                      </Text>
                      <Text variant="bodyMedium" style={styles.statLabel}>
                        Refeições Planejadas
                      </Text>
                    </View>
                    <IconButton
                      icon="food"
                      size={32}
                      iconColor={theme.colors.primary}
                    />
                  </Card.Content>
                </Card>

                {/* Meals by type */}
                <Card style={styles.statCard}>
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.statCardTitle}>
                      Por Tipo de Refeição
                    </Text>
                    <View style={styles.mealTypeStats}>
                      {Object.entries(weekStats.mealsByType).map(([type, count]) => (
                        <View key={type} style={styles.mealTypeStat}>
                          <Text variant="bodyMedium" style={styles.mealTypeLabel}>
                            {type === 'breakfast' ? 'Café' :
                             type === 'lunch' ? 'Almoço' :
                             type === 'dinner' ? 'Jantar' : 'Lanche'}
                          </Text>
                          <Text variant="titleSmall" style={styles.mealTypeCount}>
                            {count}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </Card.Content>
                </Card>

                {/* Variety score */}
                <Card style={styles.statCard}>
                  <Card.Content style={styles.statCardContent}>
                    <View style={styles.statInfo}>
                      <Text variant="headlineMedium" style={styles.statNumber}>
                        {Math.round(weekStats.varietyScore * 100)}%
                      </Text>
                      <Text variant="bodyMedium" style={styles.statLabel}>
                        Variedade
                      </Text>
                    </View>
                    <IconButton
                      icon="star"
                      size={32}
                      iconColor={theme.colors.secondary}
                    />
                  </Card.Content>
                </Card>

                {/* Average cooking time */}
                <Card style={styles.statCard}>
                  <Card.Content style={styles.statCardContent}>
                    <View style={styles.statInfo}>
                      <Text variant="headlineMedium" style={styles.statNumber}>
                        {Math.round(weekStats.averageCookingTime)}min
                      </Text>
                      <Text variant="bodyMedium" style={styles.statLabel}>
                        Tempo Médio de Preparo
                      </Text>
                    </View>
                    <IconButton
                      icon="clock"
                      size={32}
                      iconColor={theme.colors.primary}
                    />
                  </Card.Content>
                </Card>
              </View>
            ) : (
              <View style={styles.noStatsContainer}>
                <Text variant="bodyLarge" style={styles.noStatsText}>
                  Nenhuma estatística disponível para esta semana.
                </Text>
                <Text variant="bodyMedium" style={styles.noStatsSubtext}>
                  Comece planejando suas refeições para ver as estatísticas!
                </Text>
              </View>
            )}
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="bodyLarge">
          Faça login para acessar o planejamento de refeições
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MealPlanCalendar
        userId={user.id}
        onRecipePress={handleRecipePress}
        style={styles.calendar}
      />

      <FAB
        icon="plus"
        label="Ações"
        onPress={() => setShowQuickActions(true)}
        style={styles.fab}
      />

      {renderQuickActionsModal()}
      {renderStatsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.secondary,
  },
  quickActionsModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  quickActionsContent: {
    borderTopLeftRadius: theme.roundness * 2,
    borderTopRightRadius: theme.roundness * 2,
    paddingBottom: 20,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline + '20',
  },
  quickActionsTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  quickActionsList: {
    padding: 16,
    gap: 12,
  },
  quickActionButton: {
    justifyContent: 'flex-start',
  },
  quickActionButtonContent: {
    paddingVertical: 8,
  },
  quickActionsDivider: {
    marginVertical: 8,
  },
  statsModal: {
    margin: 20,
    maxHeight: '80%',
  },
  statsContent: {
    borderRadius: theme.roundness,
    maxHeight: '100%',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline + '20',
  },
  statsTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statsScroll: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
    gap: 16,
  },
  statCard: {
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
  },
  statCardTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.primary,
  },
  mealTypeStats: {
    gap: 8,
  },
  mealTypeStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  mealTypeLabel: {
    flex: 1,
  },
  mealTypeCount: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  noStatsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noStatsText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  noStatsSubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default MealPlanScreen;