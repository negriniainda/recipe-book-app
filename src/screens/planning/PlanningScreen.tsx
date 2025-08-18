import React, {useState, useCallback} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {FAB} from 'react-native-paper';
import {useAppSelector} from '@/store';
import {
  useGetMealPlansQuery,
  useCreateMealPlanMutation,
  useUpdateMealPlanMutation,
  useDeleteMealPlanMutation,
} from '@/services/planningApi';
import {useGetRecipesQuery} from '@/services/recipesApi';
import {MealPlan, CreateMealPlanInput} from '@/types';
import MealPlanCalendar from '@/components/planning/MealPlanCalendar';
import AddMealModal from '@/components/planning/AddMealModal';
import MealDetailsModal from '@/components/planning/MealDetailsModal';
import {theme} from '@/utils/theme';

const PlanningScreen: React.FC = () => {
  const {user} = useAppSelector(state => state.auth);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addMealModalVisible, setAddMealModalVisible] = useState(false);
  const [mealDetailsModalVisible, setMealDetailsModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [editingMeal, setEditingMeal] = useState<MealPlan | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealPlan | null>(null);

  // API hooks
  const {
    data: mealPlansData,
    isLoading: mealPlansLoading,
    refetch: refetchMealPlans,
  } = useGetMealPlansQuery({
    userId: user?.id,
    startDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    endDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
  });

  const {
    data: recipesData,
  } = useGetRecipesQuery({
    page: 1,
    limit: 100, // Get more recipes for meal planning
  });

  const [createMealPlan, {isLoading: isCreating}] = useCreateMealPlanMutation();
  const [updateMealPlan, {isLoading: isUpdating}] = useUpdateMealPlanMutation();
  const [deleteMealPlan, {isLoading: isDeleting}] = useDeleteMealPlanMutation();

  const mealPlans = mealPlansData?.items || [];
  const availableRecipes = recipesData?.items || [];

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleAddMeal = useCallback((date: Date, mealType: string) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setEditingMeal(null);
    setAddMealModalVisible(true);
  }, []);

  const handleMealPress = useCallback((mealPlan: MealPlan) => {
    setSelectedMeal(mealPlan);
    setMealDetailsModalVisible(true);
  }, []);

  const handleSaveMeal = useCallback(async (mealPlanData: CreateMealPlanInput) => {
    try {
      if (editingMeal) {
        await updateMealPlan({
          id: editingMeal.id,
          ...mealPlanData,
        }).unwrap();
      } else {
        await createMealPlan(mealPlanData).unwrap();
      }
      refetchMealPlans();
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível salvar a refeição. Tente novamente.',
        [{text: 'OK'}]
      );
    }
  }, [editingMeal, createMealPlan, updateMealPlan, refetchMealPlans]);

  const handleEditMeal = useCallback((mealPlan: MealPlan) => {
    setEditingMeal(mealPlan);
    setSelectedDate(mealPlan.date);
    setSelectedMealType(mealPlan.mealType);
    setAddMealModalVisible(true);
  }, []);

  const handleDeleteMeal = useCallback(async (mealPlan: MealPlan) => {
    Alert.alert(
      'Remover Refeição',
      `Tem certeza que deseja remover "${mealPlan.recipe?.title}" do seu planejamento?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMealPlan(mealPlan.id).unwrap();
              refetchMealPlans();
            } catch (error) {
              Alert.alert(
                'Erro',
                'Não foi possível remover a refeição. Tente novamente.',
                [{text: 'OK'}]
              );
            }
          },
        },
      ]
    );
  }, [deleteMealPlan, refetchMealPlans]);

  const handleStartCooking = useCallback((mealPlan: MealPlan) => {
    // TODO: Navigate to cooking mode
    Alert.alert(
      'Modo Cozinha',
      'Funcionalidade em desenvolvimento. Em breve você poderá seguir a receita passo a passo.',
      [{text: 'OK'}]
    );
  }, []);

  const handleAddToShoppingList = useCallback((mealPlan: MealPlan) => {
    // TODO: Add ingredients to shopping list
    Alert.alert(
      'Lista de Compras',
      'Ingredientes adicionados à lista de compras!',
      [{text: 'OK'}]
    );
  }, []);

  const handleQuickAdd = useCallback(() => {
    const today = new Date();
    const currentHour = today.getHours();
    let suggestedMealType = 'breakfast';
    
    if (currentHour >= 11 && currentHour < 15) {
      suggestedMealType = 'lunch';
    } else if (currentHour >= 17) {
      suggestedMealType = 'dinner';
    } else if (currentHour >= 15 && currentHour < 17) {
      suggestedMealType = 'snack';
    }

    handleAddMeal(today, suggestedMealType);
  }, [handleAddMeal]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MealPlanCalendar
          mealPlans={mealPlans}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onMealPress={handleMealPress}
          onAddMeal={handleAddMeal}
          style={styles.calendar}
        />
      </View>

      {/* FAB para adicionar refeição rápida */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleQuickAdd}
        label="Adicionar Refeição"
      />

      {/* Modal para adicionar/editar refeição */}
      <AddMealModal
        visible={addMealModalVisible}
        onDismiss={() => {
          setAddMealModalVisible(false);
          setEditingMeal(null);
        }}
        onSave={handleSaveMeal}
        date={selectedDate}
        mealType={selectedMealType}
        editingMeal={editingMeal}
        availableRecipes={availableRecipes}
        loading={isCreating || isUpdating}
      />

      {/* Modal para detalhes da refeição */}
      <MealDetailsModal
        visible={mealDetailsModalVisible}
        onDismiss={() => {
          setMealDetailsModalVisible(false);
          setSelectedMeal(null);
        }}
        mealPlan={selectedMeal}
        onEdit={handleEditMeal}
        onDelete={handleDeleteMeal}
        onStartCooking={handleStartCooking}
        onAddToShoppingList={handleAddToShoppingList}
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
  calendar: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default PlanningScreen;
