import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import ImageCapture from '../../components/recipe/ImageCapture';
import OCRTextEditor from '../../components/recipe/OCRTextEditor';
import {useOCR} from '../../hooks/useOCR';
import {useAuth} from '../../hooks/useAuth';

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

interface OCRImportScreenProps {
  navigation?: any;
  route?: any;
}

const OCRImportScreen: React.FC<OCRImportScreenProps> = ({
  navigation,
}) => {
  const [currentStep, setCurrentStep] = useState<'capture' | 'extract' | 'edit'>('capture');
  const [selectedImage, setSelectedImage] = useState<{base64: string; uri: string} | null>(null);
  
  const {user} = useAuth();
  const {
    isProcessing,
    isExtracting,
    isStructuring,
    extractedText,
    structuredRecipe,
    confidence,
    error,
    imageQuality,
    processImageForOCR,
    structureRecipeFromText,
    clearState,
    getSuggestions,
  } = useOCR();

  // Limpar estado quando a tela for focada
  useFocusEffect(
    useCallback(() => {
      return () => {
        clearState();
        setCurrentStep('capture');
        setSelectedImage(null);
      };
    }, [clearState])
  );

  const handleImageSelected = useCallback(async (imageBase64: string, imageUri: string) => {
    setSelectedImage({base64: imageBase64, uri: imageUri});
    setCurrentStep('extract');

    // Processar imagem automaticamente
    const result = await processImageForOCR(imageBase64, {
      language: 'pt',
      enhanceImage: true,
      detectStructure: true,
      autoStructure: true,
    });

    if (result) {
      setCurrentStep('edit');
    }
  }, [processImageForOCR]);

  const handleImageCleared = useCallback(() => {
    setSelectedImage(null);
    setCurrentStep('capture');
    clearState();
  }, [clearState]);

  const handleTextChange = useCallback((text: string) => {
    // Texto foi editado pelo usuário
  }, []);

  const handleStructureText = useCallback(async (text: string) => {
    await structureRecipeFromText(text);
  }, [structureRecipeFromText]);

  const handleSaveRecipe = useCallback((recipe: any) => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para salvar receitas');
      return;
    }

    // TODO: Implementar salvamento da receita
    Alert.alert(
      'Receita Salva!',
      `A receita "${recipe.title}" foi salva com sucesso.`,
      [
        {
          text: 'OK',
          onPress: () => {
            clearState();
            setCurrentStep('capture');
            setSelectedImage(null);
            navigation?.goBack();
          },
        },
      ]
    );
  }, [user, clearState, navigation]);

  const handleRetryOCR = useCallback(() => {
    if (selectedImage) {
      setCurrentStep('extract');
      processImageForOCR(selectedImage.base64, {
        language: 'pt',
        enhanceImage: true,
        detectStructure: true,
        autoStructure: false, // Não auto-estruturar no retry
      });
    }
  }, [selectedImage, processImageForOCR]);

  const renderStepIndicator = () => (
    <Card style={styles.stepIndicatorCard}>
      <Card.Content>
        <View style={styles.stepIndicator}>
          <View style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              currentStep === 'capture' && styles.activeStep,
              (currentStep === 'extract' || currentStep === 'edit') && styles.completedStep,
            ]}>
              <Text style={[
                styles.stepNumber,
                (currentStep === 'extract' || currentStep === 'edit') && styles.completedStepText,
              ]}>
                1
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.stepLabel}>
              Capturar
            </Text>
          </View>

          <View style={[
            styles.stepConnector,
            (currentStep === 'extract' || currentStep === 'edit') && styles.completedConnector,
          ]} />

          <View style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              currentStep === 'extract' && styles.activeStep,
              currentStep === 'edit' && styles.completedStep,
            ]}>
              <Text style={[
                styles.stepNumber,
                currentStep === 'edit' && styles.completedStepText,
              ]}>
                2
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.stepLabel}>
              Extrair
            </Text>
          </View>

          <View style={[
            styles.stepConnector,
            currentStep === 'edit' && styles.completedConnector,
          ]} />

          <View style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              currentStep === 'edit' && styles.activeStep,
            ]}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text variant="bodySmall" style={styles.stepLabel}>
              Editar
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCaptureStep = () => (
    <View>
      <ImageCapture
        onImageSelected={handleImageSelected}
        onImageCleared={handleImageCleared}
        loading={isProcessing}
        error={error}
      />
    </View>
  );

  const renderExtractStep = () => (
    <Card style={styles.extractCard}>
      <Card.Content>
        <View style={styles.extractHeader}>
          <Text variant="titleMedium" style={styles.extractTitle}>
            Extraindo Texto da Imagem
          </Text>
          <IconButton
            icon="refresh"
            onPress={handleRetryOCR}
            disabled={isProcessing || isExtracting}
          />
        </View>

        <Text variant="bodyMedium" style={styles.extractDescription}>
          Processando a imagem e extraindo o texto da receita...
        </Text>

        <View style={styles.progressContainer}>
          <ProgressBar
            indeterminate
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <Text variant="bodySmall" style={styles.progressText}>
            {isProcessing ? 'Processando imagem...' : 
             isExtracting ? 'Extraindo texto...' : 
             isStructuring ? 'Estruturando receita...' : 
             'Aguardando...'}
          </Text>
        </View>

        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>
                {error}
              </Text>
              <Button
                mode="outlined"
                onPress={handleRetryOCR}
                style={styles.retryButton}>
                Tentar Novamente
              </Button>
            </Card.Content>
          </Card>
        )}
      </Card.Content>
    </Card>
  );

  const renderEditStep = () => {
    if (!extractedText) return null;

    const suggestions = getSuggestions(confidence, imageQuality);

    return (
      <OCRTextEditor
        extractedText={extractedText}
        confidence={confidence}
        structuredRecipe={structuredRecipe}
        isStructuring={isStructuring}
        onTextChange={handleTextChange}
        onStructureText={handleStructureText}
        onSaveRecipe={handleSaveRecipe}
        suggestions={suggestions}
      />
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'capture':
        return renderCaptureStep();
      case 'extract':
        return renderExtractStep();
      case 'edit':
        return renderEditStep();
      default:
        return renderCaptureStep();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {renderStepIndicator()}
        
        <View style={styles.content}>
          {renderCurrentStep()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  stepIndicatorCard: {
    marginBottom: 16,
    elevation: 2,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 2,
    borderColor: theme.colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  completedStep: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  completedStepText: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  stepConnector: {
    width: 40,
    height: 2,
    backgroundColor: theme.colors.outline,
    marginHorizontal: 8,
  },
  completedConnector: {
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  extractCard: {
    elevation: 2,
  },
  extractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  extractTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  extractDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
  },
  progressText: {
    opacity: 0.7,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    marginTop: 16,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 12,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
});

export default OCRImportScreen;