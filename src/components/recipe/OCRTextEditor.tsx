import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  IconButton,
  Chip,
  ProgressBar,
  Divider,
  Switch,
  Surface,
} from 'react-native-paper';

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

const {width: screenWidth} = Dimensions.get('window');

interface OCRTextEditorProps {
  extractedText: string;
  confidence: number;
  structuredRecipe?: any;
  isStructuring?: boolean;
  onTextChange: (text: string) => void;
  onStructureText: (text: string) => void;
  onSaveRecipe: (recipe: any) => void;
  suggestions?: string[];
  style?: any;
}

interface EditableRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  metadata: {
    servings?: string;
    prepTime?: string;
    cookTime?: string;
  };
}

const OCRTextEditor: React.FC<OCRTextEditorProps> = ({
  extractedText,
  confidence,
  structuredRecipe,
  isStructuring = false,
  onTextChange,
  onStructureText,
  onSaveRecipe,
  suggestions = [],
  style,
}) => {
  const [editMode, setEditMode] = useState<'text' | 'structured'>('text');
  const [editedText, setEditedText] = useState(extractedText);
  const [editedRecipe, setEditedRecipe] = useState<EditableRecipe | null>(null);
  const [autoStructure, setAutoStructure] = useState(true);

  // Atualizar texto editado quando o texto extraído mudar
  useEffect(() => {
    setEditedText(extractedText);
  }, [extractedText]);

  // Atualizar receita editada quando a receita estruturada mudar
  useEffect(() => {
    if (structuredRecipe) {
      setEditedRecipe({
        title: structuredRecipe.title || '',
        ingredients: structuredRecipe.ingredients?.map((ing: any) => 
          typeof ing === 'string' ? ing : `${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`.trim()
        ) || [],
        instructions: structuredRecipe.instructions?.map((inst: any) => 
          typeof inst === 'string' ? inst : inst.description
        ) || [],
        metadata: {
          servings: structuredRecipe.metadata?.servings?.toString() || '',
          prepTime: structuredRecipe.metadata?.prepTime?.toString() || '',
          cookTime: structuredRecipe.metadata?.cookTime?.toString() || '',
        },
      });
    }
  }, [structuredRecipe]);

  const handleTextChange = useCallback((text: string) => {
    setEditedText(text);
    onTextChange(text);
  }, [onTextChange]);

  const handleStructureText = useCallback(() => {
    onStructureText(editedText);
  }, [editedText, onStructureText]);

  const handleRecipeFieldChange = useCallback((
    field: keyof EditableRecipe,
    value: any,
    index?: number
  ) => {
    if (!editedRecipe) return;

    setEditedRecipe(prev => {
      if (!prev) return null;

      if (field === 'ingredients' || field === 'instructions') {
        const newArray = [...(prev[field] as string[])];
        if (index !== undefined) {
          newArray[index] = value;
        }
        return {...prev, [field]: newArray};
      } else if (field === 'metadata') {
        return {...prev, metadata: {...prev.metadata, ...value}};
      } else {
        return {...prev, [field]: value};
      }
    });
  }, [editedRecipe]);

  const addIngredient = useCallback(() => {
    if (!editedRecipe) return;
    setEditedRecipe(prev => prev ? {
      ...prev,
      ingredients: [...prev.ingredients, '']
    } : null);
  }, [editedRecipe]);

  const removeIngredient = useCallback((index: number) => {
    if (!editedRecipe) return;
    setEditedRecipe(prev => prev ? {
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    } : null);
  }, [editedRecipe]);

  const addInstruction = useCallback(() => {
    if (!editedRecipe) return;
    setEditedRecipe(prev => prev ? {
      ...prev,
      instructions: [...prev.instructions, '']
    } : null);
  }, [editedRecipe]);

  const removeInstruction = useCallback((index: number) => {
    if (!editedRecipe) return;
    setEditedRecipe(prev => prev ? {
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    } : null);
  }, [editedRecipe]);

  const handleSaveRecipe = useCallback(() => {
    if (!editedRecipe) return;

    const recipeToSave = {
      title: editedRecipe.title,
      ingredients: editedRecipe.ingredients
        .filter(ing => ing.trim())
        .map((ing, index) => ({
          id: `ocr-${index}`,
          name: ing.trim(),
          quantity: 0,
          unit: '',
          category: 'other',
          optional: false,
        })),
      instructions: editedRecipe.instructions
        .filter(inst => inst.trim())
        .map((inst, index) => ({
          id: `step-${index + 1}`,
          stepNumber: index + 1,
          description: inst.trim(),
        })),
      servings: parseInt(editedRecipe.metadata.servings || '4') || 4,
      prepTime: parseInt(editedRecipe.metadata.prepTime || '0') || 0,
      cookTime: parseInt(editedRecipe.metadata.cookTime || '0') || 0,
      difficulty: 'medium' as const,
      categories: [],
      tags: ['ocr-import'],
      images: [],
      sourceUrl: undefined,
      originalAuthor: undefined,
    };

    onSaveRecipe(recipeToSave);
  }, [editedRecipe, onSaveRecipe]);

  const getConfidenceColor = useCallback((conf: number) => {
    if (conf >= 0.8) return '#4CAF50';
    if (conf >= 0.6) return '#FF9800';
    return '#F44336';
  }, []);

  const getConfidenceText = useCallback((conf: number) => {
    if (conf >= 0.9) return 'Excelente';
    if (conf >= 0.8) return 'Boa';
    if (conf >= 0.7) return 'Regular';
    if (conf >= 0.6) return 'Baixa';
    return 'Muito Baixa';
  }, []);

  const renderConfidenceIndicator = () => (
    <Surface style={styles.confidenceContainer}>
      <View style={styles.confidenceHeader}>
        <Text variant="titleSmall" style={styles.confidenceTitle}>
          Confiança do OCR
        </Text>
        <Chip
          mode="flat"
          textStyle={{color: getConfidenceColor(confidence)}}
          style={[
            styles.confidenceChip,
            {backgroundColor: getConfidenceColor(confidence) + '20'}
          ]}>
          {Math.round(confidence * 100)}% - {getConfidenceText(confidence)}
        </Chip>
      </View>
      
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text variant="bodySmall" style={styles.suggestionsTitle}>
            Sugestões para melhorar:
          </Text>
          {suggestions.map((suggestion, index) => (
            <Text key={index} variant="bodySmall" style={styles.suggestionItem}>
              • {suggestion}
            </Text>
          ))}
        </View>
      )}
    </Surface>
  );

  const renderTextEditor = () => (
    <Card style={styles.editorCard}>
      <Card.Content>
        <View style={styles.editorHeader}>
          <Text variant="titleMedium" style={styles.editorTitle}>
            Texto Extraído
          </Text>
          <View style={styles.editorActions}>
            <Switch
              value={autoStructure}
              onValueChange={setAutoStructure}
            />
            <Text variant="bodySmall" style={styles.autoStructureLabel}>
              Auto-estruturar
            </Text>
          </View>
        </View>

        <TextInput
          mode="outlined"
          multiline
          numberOfLines={12}
          value={editedText}
          onChangeText={handleTextChange}
          placeholder="O texto extraído da imagem aparecerá aqui..."
          style={styles.textInput}
        />

        <Button
          mode="contained"
          icon="auto-fix"
          onPress={handleStructureText}
          disabled={!editedText.trim() || isStructuring}
          loading={isStructuring}
          style={styles.structureButton}>
          {isStructuring ? 'Estruturando...' : 'Estruturar Receita'}
        </Button>
      </Card.Content>
    </Card>
  );

  const renderStructuredEditor = () => {
    if (!editedRecipe) return null;

    return (
      <Card style={styles.editorCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.editorTitle}>
            Receita Estruturada
          </Text>

          {/* Título */}
          <TextInput
            mode="outlined"
            label="Título da Receita"
            value={editedRecipe.title}
            onChangeText={(text) => handleRecipeFieldChange('title', text)}
            style={styles.fieldInput}
          />

          {/* Metadados */}
          <View style={styles.metadataContainer}>
            <TextInput
              mode="outlined"
              label="Porções"
              value={editedRecipe.metadata.servings}
              onChangeText={(text) => handleRecipeFieldChange('metadata', {servings: text})}
              keyboardType="numeric"
              style={styles.metadataInput}
            />
            <TextInput
              mode="outlined"
              label="Preparo (min)"
              value={editedRecipe.metadata.prepTime}
              onChangeText={(text) => handleRecipeFieldChange('metadata', {prepTime: text})}
              keyboardType="numeric"
              style={styles.metadataInput}
            />
            <TextInput
              mode="outlined"
              label="Cozimento (min)"
              value={editedRecipe.metadata.cookTime}
              onChangeText={(text) => handleRecipeFieldChange('metadata', {cookTime: text})}
              keyboardType="numeric"
              style={styles.metadataInput}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Ingredientes */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Ingredientes ({editedRecipe.ingredients.length})
              </Text>
              <IconButton
                icon="plus"
                size={20}
                onPress={addIngredient}
              />
            </View>

            {editedRecipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listItemContainer}>
                <TextInput
                  mode="outlined"
                  value={ingredient}
                  onChangeText={(text) => handleRecipeFieldChange('ingredients', text, index)}
                  placeholder={`Ingrediente ${index + 1}`}
                  style={styles.listItemInput}
                />
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => removeIngredient(index)}
                />
              </View>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* Instruções */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Modo de Preparo ({editedRecipe.instructions.length})
              </Text>
              <IconButton
                icon="plus"
                size={20}
                onPress={addInstruction}
              />
            </View>

            {editedRecipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.listItemContainer}>
                <TextInput
                  mode="outlined"
                  multiline
                  value={instruction}
                  onChangeText={(text) => handleRecipeFieldChange('instructions', text, index)}
                  placeholder={`Passo ${index + 1}`}
                  style={styles.listItemInput}
                />
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => removeInstruction(index)}
                />
              </View>
            ))}
          </View>

          <Button
            mode="contained"
            icon="content-save"
            onPress={handleSaveRecipe}
            disabled={!editedRecipe.title.trim() || editedRecipe.ingredients.length === 0}
            style={styles.saveButton}>
            Salvar Receita
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {renderConfidenceIndicator()}

      {/* Mode Toggle */}
      <Surface style={styles.modeToggle}>
        <Button
          mode={editMode === 'text' ? 'contained' : 'outlined'}
          onPress={() => setEditMode('text')}
          style={styles.modeButton}>
          Texto
        </Button>
        <Button
          mode={editMode === 'structured' ? 'contained' : 'outlined'}
          onPress={() => setEditMode('structured')}
          disabled={!structuredRecipe}
          style={styles.modeButton}>
          Estruturado
        </Button>
      </Surface>

      {editMode === 'text' ? renderTextEditor() : renderStructuredEditor()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  confidenceContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: theme.roundness,
    elevation: 1,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  confidenceChip: {
    height: 28,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsTitle: {
    fontWeight: '500',
    marginBottom: 6,
    color: theme.colors.primary,
  },
  suggestionItem: {
    opacity: 0.7,
    marginBottom: 2,
  },
  modeToggle: {
    flexDirection: 'row',
    padding: 8,
    marginBottom: 16,
    borderRadius: theme.roundness,
    elevation: 1,
  },
  modeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  editorCard: {
    marginBottom: 16,
    elevation: 2,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editorTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  editorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoStructureLabel: {
    opacity: 0.7,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    marginBottom: 16,
    minHeight: 200,
  },
  structureButton: {
    marginTop: 8,
  },
  fieldInput: {
    backgroundColor: theme.colors.background,
    marginBottom: 16,
  },
  metadataContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metadataInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  divider: {
    marginVertical: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  listItemInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  saveButton: {
    marginTop: 16,
  },
});

export default OCRTextEditor;