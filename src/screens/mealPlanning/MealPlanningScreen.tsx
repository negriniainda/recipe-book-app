import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import {
  Text,
  FAB,
  Portal,
  Modal,
  Card,
  Button,
  IconButton,
  Divider,
} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import MealPlanningCalendar from '../../components/mealPlanning/MealPlanningCalendar';
import {useAuth} from '../../hooks/useAuth';
import {MealType} from '../../types/mealPlanning';

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
  },
  roundness: 8,
};

interface MealPlanningScreenProps {
  navigation?: any;
  route?: any;
}

const MealPlanningScreen: React.FC<MealPlanningScreenProps> = ({
  navigation,
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);

  const {user} = useAuth();

  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen is focused
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const handleRecipePress = useCallback((recipeId: string) => {
    navigation?.navigate('RecipeDetails', {recipeId});
  }, [navigation]);

  const handleAddMealPress = useCallback((date: Date, mealType: MealType) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setShowQuickActions(true);
  }, []);

  const handleQuickActionPress = useCallback((action: string) => {
    setShowQuickActions(false);
    
    switch (action) {
      case 'search-recipes':
        navigation?.navigate('RecipeSearch', {
          returnTo: 'MealPlanning',
          date: selectedDate,
          mealType: selectedMealType,
        });
        break;
      case 'add-recipe':
        navigation?.navigate('AddRecipe', {
          returnTo: 'MealPlanning',
          date: selectedDate,
          mealType: selectedMealType,
        });
        break;
      case 'favorites':
        navigation?.navigate('Favorites', {
          returnTo: 'MealPlanning',
          date: selectedDate,
          mealType: selectedMealType,
        });
        break;
      case 'generate-plan':
        // TODO: Implement generate meal plan
        break;
      default:
        break;
    }
  }, [navigation, selectedDate, selectedMealType]);

  const renderQuickActionsModal = () => (
    <Portal>
      <Modal
        visible={showQuickActions}
        onDismiss={() => setShowQuickActions(false)}
        contentContainerStyle={styles.quickActionsModal}>
        
        <View style={styles.modalHeader}>
          <Text variant="titleLarge" style={styles.modalTitle}>
            Adicionar Refeição
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={() => setShowQuickActions(false)}
          />
        </View>

        <Divider />

        <View style={styles.modalContent}>
          {selectedDate && selectedMealType && (
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              {selectedDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })} - {getMealTypeLabel(selectedMealType)}
            </Text>
          )}

          <View style={styles.quickActions}>
            <Card style={styles.actionCard}>
              <Card.Content style={styles.actionContent}>
                <IconButton
                  icon="magnify"
                  size={32}
                  iconColor={theme.colors.primary}
                />
                <Text variant="titleSmall" style={styles.actionTitle}>
                  Buscar Receitas
                </Text>
                <Text variant="bodySmall" style={styles.actionDescription}>
                  Encontre receitas por ingredientes, categoria ou nome
                </Text>
                <Button
                  mode="contained"
                  onPress={() => handleQuickActionPress('search-recipes')}
                  style={styles.actionButton}>
                  Buscar
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard}>
              <Card.Content style={styles.actionContent}>
                <IconButton
                  icon="heart"
                  size={32}
                  iconColor={theme.colors.secondary}
                />
                <Text variant="titleSmall" style={styles.actionTitle}>
                  Receitas Favoritas
                </Text>
                <Text variant="bodySmall" style={styles.actionDescription}>
                  Escolha entre suas receitas favoritas
                </Text>
                <Button
                  mode="contained"
                  onPress={() => handleQuickActionPress('favorites')}
                  style={styles.actionButton}>
                  Ver Favoritas
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard}>
              <Card.Content style={styles.actionContent}>
                <IconButton
                  icon="plus"
                  size={32}
                  iconColor={theme.colors.primary}
                />
                <Text variant="titleSmall" style={styles.actionTitle}>
                  Nova Receita
                </Text>
                <Text variant="bodySmall" style={styles.actionDescription}>
                  Crie uma nova receita do zero
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => handleQuickActionPress('add-recipe')}
                  style={styles.actionButton}>
                  Criar
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard}>
              <Card.Content style={styles.actionContent}>
                <IconButton
                  icon="auto-fix"
                  size={32}
                  iconColor={theme.colors.secondary}
                />
                <Text variant="titleSmall" style={styles.actionTitle}>
                  Gerar Plano
                </Text>
                <Text variant="bodySmall" style={styles.actionDescription}>
                  Deixe a IA sugerir um plano completo
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => handleQuickActionPress('generate-plan')}
                  style={styles.actionButton}>
                  Gerar
                </Button>
              </Card.Content>
            </Card>
          </View>
        </View>
      </Modal>
    </Portal>
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="titleMedium" style={styles.errorText}>
          Você precisa estar logado para acessar o planejamento de refeições
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation?.navigate('Auth')}
          style={styles.loginButton}>
          Fazer Login
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MealPlanningCalendar
        userId={user.id}
        onRecipePress={handleRecipePress}
        onAddMealPress={handleAddMealPress}
        style={styles.calendar}
      />

      <FAB
        icon="plus"
        label="Adicionar"
        onPress={() => setShowQuickActions(true)}
        style={styles.fab}
      />

      {renderQuickActionsModal()}
    </View>
  );
};

function getMealTypeLabel(mealType: MealType): string {
  const labels = {
    breakfast: 'Café da Manhã',
    lunch: 'Almoço',
    dinner: 'Jantar',
    snack: 'Lanche',
  };
  return labels[mealType];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
    color: theme.colors.error,
  },
  loginButton: {
    minWidth: 120,
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
    backgroundColor: theme.colors.surface,
    margin: 20,
    borderRadius: theme.roundness,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  modalContent: {
    padding: 16,
  },
  modalSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  quickActions: {
    gap: 16,
  },
  actionCard: {
    elevation: 2,
  },
  actionContent: {
    alignItems: 'center',
    padding: 16,
  },
  actionTitle: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 18,
  },
  actionButton: {
    minWidth: 100,
  },
});

export default MealPlanningScreen;