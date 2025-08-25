import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Text,
  Modal,
  Portal,
  Card,
  Button,
  IconButton,
  Chip,
  Surface,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import {MealPlanSuggestion, MealType} from '../../types/mealPlanning';

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
    success: '#4CAF50',
    warning: '#FF9800',
  },
  roundness: 8,
};

const {width: screenWidth} = Dimensions.get('window');

interface MealPlanSuggestionsProps {
  visible: boolean;
  onDismiss: () => void;
  selectedDate: Date;
  suggestions: MealPlanSuggestion[];
  onAddMeal: (date: Date, mealType: MealType, recipeId: string, servings?: number) => void;
  userId: string;
}

const MEAL_TYPE_OPTIONS = [
  {value: 'breakfast', label: 'Café da Manhã'},
  {value: 'lunch', label: 'Almoço'},
  {value: 'dinner', label: 'Jantar'},
  {value: 'snack', label: 'Lanche'},
];

const MEAL_TYPE_COLORS = {
  breakfast: '#FFE0B2',
  lunch: '#C8E6C9',
  dinner: '#BBDEFB',
  snack: '#F8BBD9',
};

const MEAL_TYPE_ICONS = {
  breakfast: 'coffee',
  lunch: 'food',
  dinner: 'food-variant',
  snack: 'cookie',
};

const MealPlanSuggestions: React.FC<MealPlanSuggestionsProps> = ({
  visible,
  onDismiss,
  selectedDate,
  suggestions,
  onAddMeal,
  userId,
}) => {
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [servings, setServings] = useState(4);

  const handleAddMeal = useCallback((suggestion: MealPlanSuggestion) => {
    onAddMeal(selectedDate, selectedMealType, suggestion.recipeId, servings);
    onDismiss();
  }, [onAddMeal, selectedDate, selectedMealType, servings, onDismiss]);

  const formatDate = useCallback(() => {
    return selectedDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [selectedDate]);

  const filteredSuggestions = suggestions.filter(
    suggestion => suggestion.mealType === selectedMealType
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return theme.colors.success;
    if (confidence >= 0.6) return theme.colors.warning;
    return theme.colors.outline;
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Média';
    return 'Baixa';
  };

  const renderSuggestionCard = (suggestion: MealPlanSuggestion) => (
    <Card key={suggestion.id} style={styles.suggestionCard}>
      <Card.Content>
        <View style={styles.suggestionHeader}>
          <View style={styles.suggestionInfo}>
            <Text variant="titleSmall" style={styles.suggestionTitle}>
              {suggestion.recipeId} {/* TODO: Get recipe name */}
            </Text>
            <Text variant="bodySmall" style={styles.suggestionReason}>
              {suggestion.reason}
            </Text>
          </View>
          
          <View style={styles.suggestionMeta}>
            <Chip
              mode="flat"
              compact
              style={[
                styles.confidenceChip,
                {backgroundColor: getConfidenceColor(suggestion.confidence) + '20'}
              ]}
              textStyle={{
                color: getConfidenceColor(suggestion.confidence),
                fontSize: 11,
              }}>
              {getConfidenceText(suggestion.confidence)}
            </Chip>
            <Text variant="bodySmall" style={styles.suggestionScore}>
              {Math.round(suggestion.score * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.suggestionActions}>
          <Button
            mode="contained"
            onPress={() => handleAddMeal(suggestion)}
            style={styles.addButton}
            compact>
            Adicionar
          </Button>
          <Button
            mode="outlined"
            onPress={() => {/* TODO: Navigate to recipe details */}}
            style={styles.viewButton}
            compact>
            Ver Receita
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <IconButton
        icon="food-off"
        size={48}
        iconColor={theme.colors.outline}
      />
      <Text variant="titleMedium" style={styles.emptyTitle}>
        Nenhuma sugestão encontrada
      </Text>
      <Text variant="bodyMedium" style={styles.emptyDescription}>
        Não encontramos sugestões para {MEAL_TYPE_OPTIONS.find(opt => opt.value === selectedMealType)?.label.toLowerCase()} nesta data.
      </Text>
      <Text variant="bodySmall" style={styles.emptyHint}>
        Tente selecionar outro tipo de refeição ou adicione mais receitas aos seus favoritos.
      </Text>
    </Surface>
  );

  const renderServingsSelector = () => (
    <Surface style={styles.servingsSelector}>
      <Text variant="titleSmall" style={styles.servingsTitle}>
        Número de porções
      </Text>
      <View style={styles.servingsControls}>
        <IconButton
          icon="minus"
          size={20}
          onPress={() => setServings(Math.max(1, servings - 1))}
          disabled={servings <= 1}
        />
        <Text variant="titleMedium" style={styles.servingsValue}>
          {servings}
        </Text>
        <IconButton
          icon="plus"
          size={20}
          onPress={() => setServings(Math.min(12, servings + 1))}
          disabled={servings >= 12}
        />
      </View>
    </Surface>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        
        <View style={styles.modalHeader}>
          <View style={styles.headerInfo}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Sugestões de Refeições
            </Text>
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              {formatDate()}
            </Text>
          </View>
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
          />
        </View>

        <Divider />

        <View style={styles.modalContent}>
          {/* Meal Type Selector */}
          <View style={styles.mealTypeSelector}>
            <Text variant="titleSmall" style={styles.selectorTitle}>
              Tipo de Refeição
            </Text>
            <SegmentedButtons
              value={selectedMealType}
              onValueChange={(value) => setSelectedMealType(value as MealType)}
              buttons={MEAL_TYPE_OPTIONS.map(option => ({
                value: option.value,
                label: option.label,
                icon: MEAL_TYPE_ICONS[option.value as MealType],
                style: {
                  backgroundColor: selectedMealType === option.value 
                    ? MEAL_TYPE_COLORS[option.value as MealType] 
                    : undefined
                }
              }))}
              style={styles.segmentedButtons}
            />
          </View>

          {renderServingsSelector()}

          <Divider style={styles.divider} />

          {/* Suggestions List */}
          <ScrollView
            style={styles.suggestionsScroll}
            showsVerticalScrollIndicator={false}>
            
            {filteredSuggestions.length > 0 ? (
              <View style={styles.suggestionsList}>
                <Text variant="titleSmall" style={styles.suggestionsTitle}>
                  Sugestões Recomendadas ({filteredSuggestions.length})
                </Text>
                
                {filteredSuggestions.map(renderSuggestionCard)}
              </View>
            ) : (
              renderEmptyState()
            )}
          </ScrollView>
        </View>

        <Divider />

        <View style={styles.modalFooter}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.footerButton}>
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={() => {/* TODO: Navigate to recipe search */}}
            style={styles.footerButton}>
            Buscar Receitas
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    borderRadius: theme.roundness,
    maxHeight: '90%',
    width: screenWidth - 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerInfo: {
    flex: 1,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  modalSubtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  mealTypeSelector: {
    marginBottom: 16,
  },
  selectorTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.primary,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  servingsSelector: {
    padding: 16,
    borderRadius: theme.roundness,
    marginBottom: 16,
    elevation: 1,
  },
  servingsTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  servingsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  servingsValue: {
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
    color: theme.colors.primary,
  },
  divider: {
    marginVertical: 16,
  },
  suggestionsScroll: {
    flex: 1,
  },
  suggestionsList: {
    paddingBottom: 16,
  },
  suggestionsTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  suggestionCard: {
    marginBottom: 12,
    elevation: 2,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  suggestionInfo: {
    flex: 1,
    marginRight: 12,
  },
  suggestionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionReason: {
    opacity: 0.7,
    lineHeight: 18,
  },
  suggestionMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  confidenceChip: {
    height: 24,
  },
  suggestionScore: {
    fontWeight: '600',
    opacity: 0.7,
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  addButton: {
    minWidth: 80,
  },
  viewButton: {
    minWidth: 80,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: theme.roundness,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
    lineHeight: 20,
  },
  emptyHint: {
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});

export default MealPlanSuggestions;