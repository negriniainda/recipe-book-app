import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Button,
  Chip,
  Surface,
  Modal,
  Portal,
} from 'react-native-paper';
import {useGetMealSuggestionsQuery} from '../../services/mealPlanApi';
import {MealType, MealSuggestion} from '../../types/mealPlan';

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

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface MealSuggestionsProps {
  userId: string;
  date: string;
  selectedMealType?: MealType;
  onSuggestionPress: (recipeId: string, mealType: MealType) => void;
  onClose: () => void;
  style?: any;
}

const MEAL_TYPES: {type: MealType; label: string; icon: string; color: string}[] = [
  {type: 'breakfast', label: 'Café da Manhã', icon: 'coffee', color: '#FF9800'},
  {type: 'lunch', label: 'Almoço', icon: 'food', color: '#4CAF50'},
  {type: 'dinner', label: 'Jantar', icon: 'food-variant', color: '#2196F3'},
  {type: 'snack', label: 'Lanche', icon: 'cookie', color: '#9C27B0'},
];

const MealSuggestions: React.FC<MealSuggestionsProps> = ({
  userId,
  date,
  selectedMealType,
  onSuggestionPress,
  onClose,
  style,
}) => {
  const [activeMealType, setActiveMealType] = useState<MealType>(
    selectedMealType || 'lunch'
  );

  const {data: suggestions, isLoading} = useGetMealSuggestionsQuery({
    userId,
    date,
    mealType: activeMealType,
    limit: 10,
  });

  const handleSuggestionPress = useCallback((suggestion: MealSuggestion) => {
    onSuggestionPress(suggestion.recipeId, suggestion.mealType);
  }, [onSuggestionPress]);

  const getScoreColor = useCallback((score: number): string => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FF9800';
    return '#F44336';
  }, []);

  const getScoreLabel = useCallback((score: number): string => {
    if (score >= 0.8) return 'Ótima';
    if (score >= 0.6) return 'Boa';
    return 'Regular';
  }, []);

  const renderMealTypeSelector = () => (
    <View style={styles.mealTypeSelector}>
      <Text variant="titleSmall" style={styles.selectorTitle}>
        Tipo de Refeição
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mealTypeScroll}
        contentContainerStyle={styles.mealTypeScrollContent}>
        {MEAL_TYPES.map(mealType => (
          <Button
            key={mealType.type}
            mode={activeMealType === mealType.type ? 'contained' : 'outlined'}
            icon={mealType.icon}
            onPress={() => setActiveMealType(mealType.type)}
            style={[
              styles.mealTypeButton,
              activeMealType === mealType.type && {
                backgroundColor: mealType.color,
              },
            ]}
            labelStyle={styles.mealTypeButtonLabel}>
            {mealType.label}
          </Button>
        ))}
      </ScrollView>
    </View>
  );

  const renderSuggestionCard = (suggestion: MealSuggestion, index: number) => (
    <Card
      key={`${suggestion.recipeId}-${index}`}
      style={styles.suggestionCard}
      onPress={() => handleSuggestionPress(suggestion)}>
      <Card.Content style={styles.suggestionContent}>
        <View style={styles.suggestionHeader}>
          <View style={styles.suggestionInfo}>
            <Text variant="titleSmall" style={styles.suggestionTitle}>
              {/* TODO: Get recipe name from recipe ID */}
              Receita {suggestion.recipeId.slice(-6)}
            </Text>
            
            <View style={styles.suggestionMeta}>
              <Chip
                mode="flat"
                style={[
                  styles.scoreChip,
                  {backgroundColor: getScoreColor(suggestion.score) + '20'},
                ]}
                textStyle={{color: getScoreColor(suggestion.score), fontSize: 10}}>
                {getScoreLabel(suggestion.score)}
              </Chip>
              
              <Text variant="bodySmall" style={styles.scoreText}>
                {Math.round(suggestion.score * 100)}% compatível
              </Text>
            </View>
          </View>

          <IconButton
            icon="plus-circle"
            size={24}
            iconColor={theme.colors.primary}
            onPress={() => handleSuggestionPress(suggestion)}
          />
        </View>

        {/* Reasons for suggestion */}
        {suggestion.reasons.length > 0 && (
          <View style={styles.reasonsContainer}>
            <Text variant="bodySmall" style={styles.reasonsTitle}>
              Por que sugerimos:
            </Text>
            <View style={styles.reasonsList}>
              {suggestion.reasons.slice(0, 3).map((reason, reasonIndex) => (
                <Chip
                  key={reasonIndex}
                  mode="outlined"
                  style={styles.reasonChip}
                  textStyle={styles.reasonText}>
                  {reason}
                </Chip>
              ))}
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconButton
        icon="lightbulb-outline"
        size={48}
        iconColor={theme.colors.outline}
      />
      <Text variant="titleMedium" style={styles.emptyTitle}>
        Nenhuma sugestão encontrada
      </Text>
      <Text variant="bodyMedium" style={styles.emptyDescription}>
        Tente selecionar um tipo de refeição diferente ou adicione mais receitas aos seus favoritos.
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <Text variant="bodyMedium">Buscando sugestões...</Text>
    </View>
  );

  return (
    <Portal>
      <Modal
        visible={true}
        onDismiss={onClose}
        contentContainerStyle={styles.modal}>
        <Surface style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text variant="titleLarge" style={styles.title}>
                Sugestões de Refeições
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
            </View>
            <IconButton
              icon="close"
              onPress={onClose}
            />
          </View>

          {/* Meal type selector */}
          {renderMealTypeSelector()}

          {/* Suggestions list */}
          <View style={styles.suggestionsContainer}>
            {isLoading ? (
              renderLoadingState()
            ) : suggestions && suggestions.length > 0 ? (
              <ScrollView
                style={styles.suggestionsList}
                showsVerticalScrollIndicator={false}>
                {suggestions.map((suggestion, index) =>
                  renderSuggestionCard(suggestion, index)
                )}
              </ScrollView>
            ) : (
              renderEmptyState()
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={styles.footerButton}>
              Fechar
            </Button>
            <Button
              mode="contained"
              icon="auto-fix"
              onPress={() => {
                // TODO: Implement smart suggestion generation
                onClose();
              }}
              style={styles.footerButton}>
              Gerar Mais
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    margin: 20,
  },
  modalContent: {
    maxHeight: screenHeight * 0.8,
    borderRadius: theme.roundness,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline + '20',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  mealTypeSelector: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline + '20',
  },
  selectorTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.primary,
  },
  mealTypeScroll: {
    flexGrow: 0,
  },
  mealTypeScrollContent: {
    gap: 8,
  },
  mealTypeButton: {
    minWidth: 120,
  },
  mealTypeButtonLabel: {
    fontSize: 12,
  },
  suggestionsContainer: {
    flex: 1,
    padding: 16,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionCard: {
    marginBottom: 12,
    elevation: 2,
  },
  suggestionContent: {
    padding: 16,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreChip: {
    height: 24,
  },
  scoreText: {
    opacity: 0.7,
  },
  reasonsContainer: {
    marginTop: 8,
  },
  reasonsTitle: {
    fontWeight: '500',
    marginBottom: 8,
    color: theme.colors.primary,
  },
  reasonsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reasonChip: {
    height: 24,
  },
  reasonText: {
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline + '20',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});

export default MealSuggestions;