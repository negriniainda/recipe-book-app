import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  TextInput,
  Card,
  Chip,
  Divider,
  ProgressBar,
  IconButton,
} from 'react-native-paper';
import {theme} from '../../utils/theme';

interface OCRResult {
  extractedText: string;
  confidence: number;
  structuredRecipe?: {
    title?: string;
    description?: string;
    ingredients: Array<{
      text: string;
      amount?: string;
      unit?: string;
      ingredient?: string;
      preparation?: string;
      category?: string;
    }>;
    instructions: Array<{
      text: string;
      step: number;
      duration?: string;
      temperature?: string;
      technique?: string;
      equipment?: string[];
    }>;
    metadata?: {
      prepTime?: string;
      cookTime?: string;
      totalTime?: string;
      servings?: number;
      difficulty?: string;
      cuisine?: string;
      category?: string;
      tags?: string[];
    };
  };
  warnings?: string[];
}

interface OCRReviewModalProps {
  visible: boolean;
  onDismiss: () => void;
  ocrResult: OCRResult | null;
  onConfirm: (editedResult: OCRResult) => void;
  isProcessing?: boolean;
}

type ReviewStep = 'text' | 'structured' | 'final';

const OCRReviewModal: React.FC<OCRReviewModalProps> = ({
  visible,
  onDismiss,
  ocrResult,
  onConfirm,
  isProcessing = false,
}) => {
  const [step, setStep] = useState<ReviewStep>('text');
  const [editedText, setEditedText] = useState('');
  const [editedRecipe, setEditedRecipe] = useState<OCRResult['structuredRecipe']>(null);

  // Reset state when modal opens or OCR result changes
  React.useEffect(() => {
    if (visible && ocrResult) {
      setStep('text');
      setEditedText(ocrResult.extractedText);
      setEditedRecipe(ocrResult.structuredRecipe || null);
    }
  }, [visible, ocrResult]);

  const handleNextStep = useCallback(() => {
    if (step === 'text') {
      setStep('structured');
    } else if (step === 'structured') {
      setStep('final');
    }
  }, [step]);

  const handlePreviousStep = useCallback(() => {
    if (step === 'structured') {
      setStep('text');
    } else if (step === 'final') {
      setStep('structured');
    }
  }, [step]);

  const handleConfirm = useCallback(() => {
    if (!ocrResult) return;

    const finalResult: OCRResult = {
      ...ocrResult,
      extractedText: editedText,
      structuredRecipe: editedRecipe,
    };

    onConfirm(finalResult);
  }, [ocrResult, editedText, editedRecipe, onConfirm]);

  const updateIngredient = useCallback((index: number, field: string, value: string) => {
    if (!editedRecipe) return;

    const updatedIngredients = [...editedRecipe.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };

    setEditedRecipe({
      ...editedRecipe,
      ingredients: updatedIngredients,
    });
  }, [editedRecipe]);

  const updateInstruction = useCallback((index: number, text: string) => {
    if (!editedRecipe) return;

    const updatedInstructions = [...editedRecipe.instructions];
    updatedInstructions[index] = {
      ...updatedInstructions[index],
      text,
    };

    setEditedRecipe({
      ...editedRecipe,
      instructions: updatedInstructions,
    });
  }, [editedRecipe]);

  const renderTextReviewStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Revisar Texto Extraído
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Verifique e edite o texto extraído da imagem
      </Text>

      {ocrResult && (
        <View style={styles.confidenceContainer}>
          <Text variant="bodySmall" style={styles.confidenceLabel}>
            Confiança do OCR: {Math.round(ocrResult.confidence * 100)}%
          </Text>
          <ProgressBar
            progress={ocrResult.confidence}
            color={ocrResult.confidence > 0.8 ? theme.colors.primary : theme.colors.error}
            style={styles.confidenceBar}
          />
        </View>
      )}

      {ocrResult?.warnings && ocrResult.warnings.length > 0 && (
        <Card style={styles.warningsCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.warningsTitle}>
              ⚠️ Avisos
            </Text>
            {ocrResult.warnings.map((warning, index) => (
              <Text key={index} variant="bodySmall" style={styles.warningItem}>
                • {warning}
              </Text>
            ))}
          </Card.Content>
        </Card>
      )}

      <TextInput
        label="Texto extraído"
        value={editedText}
        onChangeText={setEditedText}
        multiline
        numberOfLines={12}
        style={styles.textInput}
        mode="outlined"
      />
    </View>
  );

  const renderStructuredReviewStep = () => {
    if (!editedRecipe) {
      return (
        <View style={styles.stepContainer}>
          <Text variant="headlineSmall" style={styles.stepTitle}>
            Estrutura da Receita
          </Text>
          <Text variant="bodyMedium" style={styles.noStructureText}>
            Não foi possível estruturar automaticamente a receita.
            Você pode continuar com o texto extraído.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.stepContainer}>
        <Text variant="headlineSmall" style={styles.stepTitle}>
          Revisar Estrutura
        </Text>
        <Text variant="bodyMedium" style={styles.stepDescription}>
          Verifique e edite os ingredientes e instruções
        </Text>

        {/* Title and Description */}
        {(editedRecipe.title || editedRecipe.description) && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Informações Básicas
              </Text>
              {editedRecipe.title && (
                <TextInput
                  label="Título"
                  value={editedRecipe.title}
                  onChangeText={(text) => setEditedRecipe({...editedRecipe, title: text})}
                  style={styles.fieldInput}
                  mode="outlined"
                />
              )}
              {editedRecipe.description && (
                <TextInput
                  label="Descrição"
                  value={editedRecipe.description}
                  onChangeText={(text) => setEditedRecipe({...editedRecipe, description: text})}
                  multiline
                  numberOfLines={3}
                  style={styles.fieldInput}
                  mode="outlined"
                />
              )}
            </Card.Content>
          </Card>
        )}

        {/* Ingredients */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ingredientes ({editedRecipe.ingredients.length})
            </Text>
            {editedRecipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text variant="bodySmall" style={styles.ingredientNumber}>
                  {index + 1}.
                </Text>
                <TextInput
                  value={ingredient.text}
                  onChangeText={(text) => updateIngredient(index, 'text', text)}
                  style={styles.ingredientInput}
                  mode="outlined"
                  dense
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Instructions */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Instruções ({editedRecipe.instructions.length})
            </Text>
            {editedRecipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text variant="bodySmall" style={styles.instructionNumber}>
                  {instruction.step}.
                </Text>
                <TextInput
                  value={instruction.text}
                  onChangeText={(text) => updateInstruction(index, text)}
                  style={styles.instructionInput}
                  mode="outlined"
                  multiline
                  dense
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Metadata */}
        {editedRecipe.metadata && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Informações Adicionais
              </Text>
              <View style={styles.metadataContainer}>
                {editedRecipe.metadata.prepTime && (
                  <Chip icon="clock-outline" mode="outlined">
                    Preparo: {editedRecipe.metadata.prepTime}
                  </Chip>
                )}
                {editedRecipe.metadata.cookTime && (
                  <Chip icon="fire" mode="outlined">
                    Cozimento: {editedRecipe.metadata.cookTime}
                  </Chip>
                )}
                {editedRecipe.metadata.servings && (
                  <Chip icon="account-group" mode="outlined">
                    {editedRecipe.metadata.servings} porções
                  </Chip>
                )}
                {editedRecipe.metadata.difficulty && (
                  <Chip icon="chart-line" mode="outlined">
                    {editedRecipe.metadata.difficulty}
                  </Chip>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    );
  };

  const renderFinalStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Confirmar Importação
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Tudo pronto! A receita será importada com as informações revisadas.
      </Text>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.summaryTitle}>
            Resumo da Importação
          </Text>
          
          <View style={styles.summaryItem}>
            <Text variant="bodyMedium">📝 Texto extraído:</Text>
            <Text variant="bodySmall">{editedText.length} caracteres</Text>
          </View>

          {editedRecipe && (
            <>
              <View style={styles.summaryItem}>
                <Text variant="bodyMedium">🥘 Ingredientes:</Text>
                <Text variant="bodySmall">{editedRecipe.ingredients.length} itens</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text variant="bodyMedium">📋 Instruções:</Text>
                <Text variant="bodySmall">{editedRecipe.instructions.length} passos</Text>
              </View>
            </>
          )}

          {ocrResult && (
            <View style={styles.summaryItem}>
              <Text variant="bodyMedium">🎯 Confiança:</Text>
              <Text variant="bodySmall">{Math.round(ocrResult.confidence * 100)}%</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ProgressBar indeterminate color={theme.colors.primary} />
          <Text variant="bodySmall" style={styles.processingText}>
            Importando receita...
          </Text>
        </View>
      )}
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'text':
        return renderTextReviewStep();
      case 'structured':
        return renderStructuredReviewStep();
      case 'final':
        return renderFinalStep();
      default:
        return renderTextReviewStep();
    }
  };

  const getStepProgress = () => {
    switch (step) {
      case 'text': return 0.33;
      case 'structured': return 0.66;
      case 'final': return 1;
      default: return 0.33;
    }
  };

  if (!ocrResult) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        
        {/* Progress indicator */}
        <View style={styles.progressHeader}>
          <ProgressBar progress={getStepProgress()} color={theme.colors.primary} />
          <Text variant="bodySmall" style={styles.progressText}>
            Passo {step === 'text' ? '1' : step === 'structured' ? '2' : '3'} de 3
          </Text>
        </View>

        {renderCurrentStep()}

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          <Button
            mode="outlined"
            onPress={step === 'text' ? onDismiss : handlePreviousStep}
            style={styles.navButton}>
            {step === 'text' ? 'Cancelar' : 'Voltar'}
          </Button>
          
          <Button
            mode="contained"
            onPress={step === 'final' ? handleConfirm : handleNextStep}
            disabled={isProcessing}
            loading={step === 'final' && isProcessing}
            style={styles.navButton}>
            {step === 'final' ? 'Importar' : 'Próximo'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  progressHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: theme.colors.onSurfaceVariant,
  },
  stepContainer: {
    flex: 1,
    padding: 24,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: theme.colors.onSurface,
  },
  stepDescription: {
    textAlign: 'center',
    marginBottom: 24,
    color: theme.colors.onSurfaceVariant,
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceLabel: {
    marginBottom: 8,
    color: theme.colors.onSurfaceVariant,
  },
  confidenceBar: {
    height: 6,
    borderRadius: 3,
  },
  warningsCard: {
    backgroundColor: theme.colors.errorContainer,
    marginBottom: 16,
  },
  warningsTitle: {
    marginBottom: 8,
    color: theme.colors.onErrorContainer,
  },
  warningItem: {
    marginBottom: 4,
    color: theme.colors.onErrorContainer,
  },
  textInput: {
    marginBottom: 16,
  },
  noStructureText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: theme.colors.onSurfaceVariant,
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 12,
    color: theme.colors.primary,
  },
  fieldInput: {
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientNumber: {
    width: 24,
    color: theme.colors.onSurfaceVariant,
  },
  ingredientInput: {
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    marginTop: 12,
    color: theme.colors.onSurfaceVariant,
  },
  instructionInput: {
    flex: 1,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryCard: {
    backgroundColor: theme.colors.surfaceVariant,
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 12,
    color: theme.colors.onSurfaceVariant,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  processingText: {
    marginTop: 8,
    color: theme.colors.onSurfaceVariant,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
});

export default OCRReviewModal;