import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Image, Alert} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  TextInput,
  IconButton,
  Card,
  Chip,
  ProgressBar,
  Divider,
  List,
  Switch,
} from 'react-native-paper';
import {
  useImportFromUrlMutation,
  useImportFromTextMutation,
  useImportFromImageMutation,
  useImportFromSocialMutation,
  useValidateUrlQuery,
  useGetSupportedSitesQuery,
  useSaveImportedRecipeMutation,
  useValidateImageMutation,
  usePreviewOCRMutation,
} from '../../services/recipeImportApi';
import ImageCaptureModal from './ImageCaptureModal';
import OCRReviewModal from './OCRReviewModal';
import {ImportRecipeResponse, CreateRecipeInput} from '../../types';
import {theme} from '../../utils/theme';

interface ImportRecipeModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: (recipe: any) => void;
}

type ImportStep = 'input' | 'importing' | 'preview' | 'saving';
type ImportSource = 'url' | 'text' | 'social' | 'ocr';

const ImportRecipeModal: React.FC<ImportRecipeModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
}) => {
  const [step, setStep] = useState<ImportStep>('input');
  const [source, setSource] = useState<ImportSource>('url');
  const [showImageCapture, setShowImageCapture] = useState(false);
  const [showOCRReview, setShowOCRReview] = useState(false);
  const [ocrResult, setOCRResult] = useState<any>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [importedData, setImportedData] = useState<ImportRecipeResponse | null>(null);
  const [importOptions, setImportOptions] = useState({
    extractNutrition: true,
    autoCategories: true,
    extractImages: true,
    extractVideo: false,
  });

  // API hooks
  const {data: supportedSites} = useGetSupportedSitesQuery();
  const {data: urlValidation, isLoading: validatingUrl} = useValidateUrlQuery(
    inputValue,
    {skip: source !== 'url' || !inputValue || inputValue.length < 10}
  );

  const [importFromUrl, {isLoading: importingFromUrl}] = useImportFromUrlMutation();
  const [importFromText, {isLoading: importingFromText}] = useImportFromTextMutation();
  const [importFromImage, {isLoading: importingFromImage}] = useImportFromImageMutation();
  const [importFromSocial, {isLoading: importingFromSocial}] = useImportFromSocialMutation();
  const [saveImportedRecipe, {isLoading: savingRecipe}] = useSaveImportedRecipeMutation();
  const [validateImage] = useValidateImageMutation();
  const [previewOCR] = usePreviewOCRMutation();

  const isImporting = importingFromUrl || importingFromText || importingFromImage || importingFromSocial;
  const isSaving = savingRecipe;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setStep('input');
      setSource('url');
      setInputValue('');
      setImportedData(null);
      setShowImageCapture(false);
      setShowOCRReview(false);
      setOCRResult(null);
      setSelectedImageFile(null);
    }
  }, [visible]);

  const handleImport = useCallback(async () => {
    if (!inputValue.trim()) return;

    setStep('importing');

    try {
      let result: ImportRecipeResponse;

      if (source === 'url') {
        result = await importFromUrl({
          url: inputValue.trim(),
          options: importOptions,
        }).unwrap();
      } else if (source === 'social') {
        const platform = getSocialPlatform(inputValue);
        if (!platform) {
          throw new Error('Plataforma social não suportada');
        }
        result = await importFromSocial({
          platform,
          url: inputValue.trim(),
          options: importOptions,
        }).unwrap();
      } else {
        result = await importFromText({
          text: inputValue.trim(),
          options: importOptions,
        }).unwrap();
      }

      setImportedData(result);
      setStep('preview');
    } catch (error: any) {
      Alert.alert(
        'Erro na Importação',
        error.message || 'Não foi possível importar a receita. Verifique o link ou texto.',
        [{text: 'OK'}]
      );
      setStep('input');
    }
  }, [source, inputValue, importOptions, importFromUrl, importFromText, importFromSocial]);

  const handleSave = useCallback(async () => {
    if (!importedData) return;

    setStep('saving');

    try {
      const recipeData: CreateRecipeInput = {
        title: importedData.recipe.title,
        description: importedData.recipe.description,
        ingredients: importedData.recipe.ingredients.map((ing, index) => ({
          id: `imported-${index}`,
          name: ing.name,
          quantity: ing.quantity || 0,
          unit: ing.unit || '',
          category: 'other' as const,
          optional: false,
        })),
        instructions: importedData.recipe.instructions.map(inst => ({
          id: `step-${inst.stepNumber}`,
          stepNumber: inst.stepNumber,
          description: inst.description,
          duration: inst.duration,
        })),
        prepTime: importedData.recipe.prepTime || 0,
        cookTime: importedData.recipe.cookTime || 0,
        servings: importedData.recipe.servings || 4,
        difficulty: 'medium' as const,
        categories: importedData.recipe.categories || [],
        tags: importedData.recipe.tags || [],
        images: importedData.recipe.images || [],
        sourceUrl: importedData.recipe.sourceUrl,
        originalAuthor: importedData.recipe.originalAuthor,
        userId: 'current-user', // TODO: Get from auth state
        isPublic: true,
        isFavorite: false,
        rating: 0,
        notes: `Importado de: ${source === 'url' ? inputValue : 'texto'}`,
      };

      const savedRecipe = await saveImportedRecipe(recipeData).unwrap();
      onSuccess(savedRecipe);
      onDismiss();
    } catch (error: any) {
      Alert.alert(
        'Erro ao Salvar',
        error.message || 'Não foi possível salvar a receita.',
        [{text: 'OK'}]
      );
      setStep('preview');
    }
  }, [importedData, source, inputValue, saveImportedRecipe, onSuccess, onDismiss]);

  const getSocialPlatform = (url: string): 'instagram' | 'tiktok' | 'youtube' | null => {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    return null;
  };

  const handleImageSelected = (file: File) => {
    setSelectedImageFile(file);
    setShowImageCapture(false);
  };

  const handleOCRPreview = async (file: File) => {
    try {
      const result = await previewOCR(file).unwrap();
      setOCRResult(result);
      setShowOCRReview(true);
    } catch (error: any) {
      Alert.alert(
        'Erro no OCR',
        error.message || 'Não foi possível processar a imagem.',
        [{text: 'OK'}]
      );
    }
  };

  const handleOCRImport = async (file: File) => {
    setStep('importing');

    try {
      const result = await importFromImage({
        image: file,
        options: importOptions,
      }).unwrap();

      setImportedData(result);
      setStep('preview');
      setShowOCRReview(false);
    } catch (error: any) {
      Alert.alert(
        'Erro na Importação',
        error.message || 'Não foi possível importar receita da imagem.',
        [{text: 'OK'}]
      );
      setStep('input');
      setShowOCRReview(false);
    }
  };

  const getSourceIcon = () => {
    switch (source) {
      case 'url': return 'link';
      case 'text': return 'text';
      case 'social': return 'share';
      case 'ocr': return 'camera';
      default: return 'import';
    }
  };

  const renderInputStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Importar Receita
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Escolha como você quer importar sua receita
      </Text>

      {/* Source Selection */}
      <View style={styles.sourceSelection}>
        <Button
          mode={source === 'url' ? 'contained' : 'outlined'}
          icon="link"
          onPress={() => setSource('url')}
          style={styles.sourceButton}>
          Link/URL
        </Button>
        <Button
          mode={source === 'social' ? 'contained' : 'outlined'}
          icon="share"
          onPress={() => setSource('social')}
          style={styles.sourceButton}>
          Redes Sociais
        </Button>
        <Button
          mode={source === 'text' ? 'contained' : 'outlined'}
          icon="text"
          onPress={() => setSource('text')}
          style={styles.sourceButton}>
          Texto
        </Button>
        <Button
          mode={source === 'ocr' ? 'contained' : 'outlined'}
          icon="camera"
          onPress={() => {
            setSource('ocr');
            setShowImageCapture(true);
          }}
          style={styles.sourceButton}>
          Foto/OCR
        </Button>
      </View>

      {/* Input Field */}
      {source !== 'ocr' && (
        <TextInput
          mode="outlined"
          label={
            source === 'url' 
              ? 'Cole o link da receita' 
              : source === 'social'
              ? 'Link do Instagram, TikTok ou YouTube'
              : 'Cole o texto da receita'
          }
          placeholder={
            source === 'url'
              ? 'https://exemplo.com/receita'
              : source === 'social'
              ? 'https://instagram.com/p/...'
              : 'Ingredientes:\n- 2 ovos\n- 1 xícara de farinha...'
          }
          value={inputValue}
          onChangeText={setInputValue}
          multiline={source === 'text'}
          numberOfLines={source === 'text' ? 6 : 1}
          style={styles.input}
          right={
            source === 'url' && validatingUrl ? (
              <TextInput.Icon icon="loading" />
            ) : undefined
          }
        />
      )}

      {/* OCR Info */}
      {source === 'ocr' && (
        <Card style={styles.ocrInfoCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.ocrInfoTitle}>
              📸 Importação por OCR
            </Text>
            <Text variant="bodySmall" style={styles.ocrInfoText}>
              Fotografe ou selecione uma imagem da receita. O texto será extraído automaticamente e você poderá revisar antes de importar.
            </Text>
            {selectedImageFile && (
              <Chip icon="check" mode="outlined" style={styles.selectedImageChip}>
                Imagem selecionada: {selectedImageFile.name}
              </Chip>
            )}
          </Card.Content>
        </Card>
      )}

      {/* URL Validation */}
      {source === 'url' && urlValidation && inputValue.length > 10 && (
        <Card style={[
          styles.validationCard,
          urlValidation.isValid ? styles.validCard : styles.invalidCard
        ]}>
          <Card.Content style={styles.validationContent}>
            <View style={styles.validationHeader}>
              <IconButton
                icon={urlValidation.isValid ? 'check-circle' : 'alert-circle'}
                iconColor={urlValidation.isValid ? '#4CAF50' : '#F44336'}
                size={20}
              />
              <Text variant="bodyMedium" style={styles.validationText}>
                {urlValidation.isValid 
                  ? urlValidation.isSupported 
                    ? 'Site suportado!' 
                    : 'Site válido, mas pode ter limitações'
                  : 'URL inválida ou não acessível'
                }
              </Text>
            </View>
            {urlValidation.title && (
              <Text variant="bodySmall" style={styles.validationTitle}>
                {urlValidation.title}
              </Text>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Supported Sites */}
      {source === 'url' && supportedSites && (
        <Card style={styles.supportedSitesCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.supportedSitesTitle}>
              Sites Populares Suportados
            </Text>
            <View style={styles.supportedSitesList}>
              {supportedSites
                .filter(site => site.popular)
                .slice(0, 6)
                .map(site => (
                  <Chip
                    key={site.domain}
                    mode="outlined"
                    icon="web"
                    style={styles.siteChip}>
                    {site.name}
                  </Chip>
                ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Import Options */}
      <Card style={styles.optionsCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.optionsTitle}>
            Opções de Importação
          </Text>
          
          <View style={styles.optionItem}>
            <Text variant="bodyMedium">Extrair informações nutricionais</Text>
            <Switch
              value={importOptions.extractNutrition}
              onValueChange={(value) => 
                setImportOptions(prev => ({...prev, extractNutrition: value}))
              }
            />
          </View>
          
          <View style={styles.optionItem}>
            <Text variant="bodyMedium">Categorizar automaticamente</Text>
            <Switch
              value={importOptions.autoCategories}
              onValueChange={(value) => 
                setImportOptions(prev => ({...prev, autoCategories: value}))
              }
            />
          </View>
          
          <View style={styles.optionItem}>
            <Text variant="bodyMedium">Importar imagens</Text>
            <Switch
              value={importOptions.extractImages}
              onValueChange={(value) => 
                setImportOptions(prev => ({...prev, extractImages: value}))
              }
            />
          </View>
        </Card.Content>
      </Card>

      {/* Import Button */}
      <Button
        mode="contained"
        icon={getSourceIcon()}
        onPress={source === 'ocr' ? () => setShowImageCapture(true) : handleImport}
        disabled={(source !== 'ocr' && !inputValue.trim()) || validatingUrl}
        style={styles.importButton}>
        {source === 'ocr' ? 'Capturar Imagem' : 'Importar Receita'}
      </Button>
    </View>
  );

  const renderImportingStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Importando Receita...
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Extraindo informações da receita
      </Text>
      
      <View style={styles.progressContainer}>
        <ProgressBar indeterminate color={theme.colors.primary} />
        <Text variant="bodySmall" style={styles.progressText}>
          Isso pode levar alguns segundos
        </Text>
      </View>
    </View>
  );

  const renderPreviewStep = () => {
    if (!importedData) return null;

    const recipe = importedData.recipe;

    return (
      <ScrollView style={styles.previewContainer} showsVerticalScrollIndicator={false}>
        <Text variant="headlineSmall" style={styles.stepTitle}>
          Preview da Receita
        </Text>
        
        {importedData.confidence < 0.8 && (
          <Card style={styles.warningCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.warningText}>
                ⚠️ Confiança da extração: {Math.round(importedData.confidence * 100)}%
              </Text>
              <Text variant="bodySmall" style={styles.warningSubtext}>
                Verifique se as informações estão corretas antes de salvar
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Recipe Image */}
        {recipe.images && recipe.images.length > 0 && (
          <Image source={{uri: recipe.images[0]}} style={styles.previewImage} />
        )}

        {/* Basic Info */}
        <Card style={styles.previewCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.previewTitle}>
              {recipe.title}
            </Text>
            {recipe.description && (
              <Text variant="bodyMedium" style={styles.previewDescription}>
                {recipe.description}
              </Text>
            )}
            
            <View style={styles.previewMeta}>
              {recipe.prepTime && (
                <Chip icon="clock" mode="outlined" style={styles.metaChip}>
                  Preparo: {recipe.prepTime}min
                </Chip>
              )}
              {recipe.cookTime && (
                <Chip icon="fire" mode="outlined" style={styles.metaChip}>
                  Cozimento: {recipe.cookTime}min
                </Chip>
              )}
              {recipe.servings && (
                <Chip icon="account-group" mode="outlined" style={styles.metaChip}>
                  {recipe.servings} porções
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Ingredients */}
        <Card style={styles.previewCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ingredientes ({recipe.ingredients.length})
            </Text>
            {recipe.ingredients.map((ingredient, index) => (
              <Text key={index} variant="bodyMedium" style={styles.ingredientItem}>
                • {ingredient.quantity && ingredient.unit 
                    ? `${ingredient.quantity} ${ingredient.unit} de ` 
                    : ''
                  }{ingredient.name}
              </Text>
            ))}
          </Card.Content>
        </Card>

        {/* Instructions */}
        <Card style={styles.previewCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Modo de Preparo ({recipe.instructions.length} passos)
            </Text>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text variant="titleSmall" style={styles.stepNumber}>
                  {instruction.stepNumber}.
                </Text>
                <Text variant="bodyMedium" style={styles.instructionText}>
                  {instruction.description}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Categories and Tags */}
        {(recipe.categories?.length || recipe.tags?.length) && (
          <Card style={styles.previewCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Categorias e Tags
              </Text>
              <View style={styles.tagsContainer}>
                {recipe.categories?.map((category, index) => (
                  <Chip key={`cat-${index}`} mode="flat" style={styles.categoryChip}>
                    {category}
                  </Chip>
                ))}
                {recipe.tags?.map((tag, index) => (
                  <Chip key={`tag-${index}`} mode="outlined" style={styles.tagChip}>
                    #{tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Warnings */}
        {importedData.warnings && importedData.warnings.length > 0 && (
          <Card style={styles.warningsCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.warningsTitle}>
                Avisos da Importação
              </Text>
              {importedData.warnings.map((warning, index) => (
                <Text key={index} variant="bodySmall" style={styles.warningItem}>
                  • {warning}
                </Text>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.previewActions}>
          <Button
            mode="outlined"
            onPress={() => setStep('input')}
            style={styles.actionButton}>
            Voltar
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={isSaving}
            loading={isSaving}
            style={styles.actionButton}>
            Salvar Receita
          </Button>
        </View>
      </ScrollView>
    );
  };

  const renderSavingStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Salvando Receita...
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Adicionando a receita ao seu livro
      </Text>
      
      <View style={styles.progressContainer}>
        <ProgressBar indeterminate color={theme.colors.primary} />
        <Text variant="bodySmall" style={styles.progressText}>
          Quase pronto!
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'input': return renderInputStep();
      case 'importing': return renderImportingStep();
      case 'preview': return renderPreviewStep();
      case 'saving': return renderSavingStep();
      default: return renderInputStep();
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <IconButton icon="close" onPress={onDismiss} />
          <View style={styles.headerContent}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Importar Receita
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {renderCurrentStep()}
        </View>

        {/* Image Capture Modal */}
        <ImageCaptureModal
          visible={showImageCapture}
          onDismiss={() => setShowImageCapture(false)}
          onImageSelected={handleImageSelected}
          onPreviewOCR={handleOCRPreview}
        />

        {/* OCR Review Modal */}
        <OCRReviewModal
          visible={showOCRReview}
          onDismiss={() => setShowOCRReview(false)}
          ocrResult={ocrResult}
          onImport={handleOCRImport}
          selectedImage={selectedImageFile}
        />
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
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline + '20',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 16,
    flex: 1,
  },
  stepTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  sourceSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  sourceButton: {
    flex: 1,
  },
  input: {
    backgroundColor: theme.colors.background,
    marginBottom: 16,
  },
  validationCard: {
    marginBottom: 16,
    elevation: 1,
  },
  validCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  invalidCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  validationContent: {
    paddingVertical: 8,
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validationText: {
    flex: 1,
    marginLeft: 8,
  },
  validationTitle: {
    marginTop: 4,
    marginLeft: 36,
    opacity: 0.7,
  },
  supportedSitesCard: {
    marginBottom: 16,
    elevation: 1,
  },
  supportedSitesTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  supportedSitesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  siteChip: {
    marginBottom: 4,
  },
  optionsCard: {
    marginBottom: 16,
    elevation: 1,
  },
  optionsTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ocrInfoCard: {
    marginBottom: 16,
    elevation: 1,
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  ocrInfoTitle: {
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  ocrInfoText: {
    color: '#1976D2',
    lineHeight: 18,
    marginBottom: 12,
  },
  selectedImageChip: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
  },
  importButton: {
    marginTop: 8,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  progressText: {
    marginTop: 16,
    opacity: 0.7,
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  warningCard: {
    marginBottom: 16,
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    color: '#E65100',
    fontWeight: '500',
  },
  warningSubtext: {
    color: '#E65100',
    opacity: 0.7,
    marginTop: 4,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.roundness,
    marginBottom: 16,
  },
  previewCard: {
    marginBottom: 16,
    elevation: 1,
  },
  previewTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  previewDescription: {
    lineHeight: 20,
    marginBottom: 12,
  },
  previewMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaChip: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  ingredientItem: {
    marginBottom: 6,
    lineHeight: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    minWidth: 24,
  },
  instructionText: {
    flex: 1,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    backgroundColor: theme.colors.primaryContainer || theme.colors.surface,
    marginBottom: 4,
  },
  tagChip: {
    marginBottom: 4,
  },
  warningsCard: {
    marginBottom: 16,
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  warningsTitle: {
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 8,
  },
  warningItem: {
    color: '#C62828',
    marginBottom: 4,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
  },
});

export default ImportRecipeModal;