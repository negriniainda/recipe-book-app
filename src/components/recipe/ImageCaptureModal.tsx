import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  IconButton,
  Card,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import {launchImageLibrary, launchCamera, ImagePickerResponse, MediaType} from 'react-native-image-picker';
import {theme} from '../../utils/theme';

interface ImageCaptureModalProps {
  visible: boolean;
  onDismiss: () => void;
  onImageSelected: (imageUri: string, imageBase64: string) => void;
}

type CaptureStep = 'selection' | 'preview' | 'processing';

const {width: screenWidth} = Dimensions.get('window');

const ImageCaptureModal: React.FC<ImageCaptureModalProps> = ({
  visible,
  onDismiss,
  onImageSelected,
}) => {
  const [step, setStep] = useState<CaptureStep>('selection');
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    base64: string;
    width?: number;
    height?: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      setStep('selection');
      setSelectedImage(null);
      setIsProcessing(false);
    }
  }, [visible]);

  const handleImagePicker = useCallback((source: 'camera' | 'library') => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: true,
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 0.8,
    };

    const callback = (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      const asset = response.assets?.[0];
      if (!asset || !asset.uri || !asset.base64) {
        Alert.alert('Erro', 'Não foi possível processar a imagem selecionada.');
        return;
      }

      setSelectedImage({
        uri: asset.uri,
        base64: asset.base64,
        width: asset.width,
        height: asset.height,
      });
      setStep('preview');
    };

    if (source === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  }, []);

  const handleConfirmImage = useCallback(() => {
    if (!selectedImage) return;

    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      onImageSelected(selectedImage.uri, selectedImage.base64);
      setIsProcessing(false);
      onDismiss();
    }, 500);
  }, [selectedImage, onImageSelected, onDismiss]);

  const renderSelectionStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Capturar Receita
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Fotografe ou selecione uma imagem da receita
      </Text>

      <View style={styles.captureOptions}>
        <Card style={styles.optionCard}>
          <Card.Content style={styles.optionContent}>
            <IconButton
              icon="camera"
              size={48}
              iconColor={theme.colors.primary}
              onPress={() => handleImagePicker('camera')}
            />
            <Text variant="titleMedium" style={styles.optionTitle}>
              Fotografar
            </Text>
            <Text variant="bodySmall" style={styles.optionDescription}>
              Tire uma foto da receita
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.optionCard}>
          <Card.Content style={styles.optionContent}>
            <IconButton
              icon="image"
              size={48}
              iconColor={theme.colors.primary}
              onPress={() => handleImagePicker('library')}
            />
            <Text variant="titleMedium" style={styles.optionTitle}>
              Galeria
            </Text>
            <Text variant="bodySmall" style={styles.optionDescription}>
              Escolher da galeria
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.tipsCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.tipsTitle}>
            💡 Dicas para melhor resultado
          </Text>
          <Text variant="bodySmall" style={styles.tipItem}>
            • Certifique-se de que o texto está bem iluminado
          </Text>
          <Text variant="bodySmall" style={styles.tipItem}>
            • Mantenha a câmera estável e paralela ao texto
          </Text>
          <Text variant="bodySmall" style={styles.tipItem}>
            • Evite sombras sobre o texto
          </Text>
          <Text variant="bodySmall" style={styles.tipItem}>
            • Use boa resolução para textos pequenos
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderPreviewStep = () => {
    if (!selectedImage) return null;

    return (
      <View style={styles.stepContainer}>
        <Text variant="headlineSmall" style={styles.stepTitle}>
          Confirmar Imagem
        </Text>
        <Text variant="bodyMedium" style={styles.stepDescription}>
          Verifique se a imagem está clara e legível
        </Text>

        <Card style={styles.previewCard}>
          <Image
            source={{uri: selectedImage.uri}}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </Card>

        <View style={styles.imageInfo}>
          {selectedImage.width && selectedImage.height && (
            <Chip icon="image-size-select-actual" mode="outlined">
              {selectedImage.width} × {selectedImage.height}
            </Chip>
          )}
          <Chip icon="file-image" mode="outlined">
            Imagem selecionada
          </Chip>
        </View>

        <View style={styles.previewActions}>
          <Button
            mode="outlined"
            onPress={() => setStep('selection')}
            style={styles.actionButton}>
            Trocar Imagem
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirmImage}
            disabled={isProcessing}
            loading={isProcessing}
            style={styles.actionButton}>
            Processar OCR
          </Button>
        </View>
      </View>
    );
  };

  const renderProcessingStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Processando Imagem...
      </Text>
      <Text variant="bodyMedium" style={styles.stepDescription}>
        Extraindo texto da imagem
      </Text>
      
      <View style={styles.progressContainer}>
        <ProgressBar indeterminate color={theme.colors.primary} />
        <Text variant="bodySmall" style={styles.progressText}>
          Isso pode levar alguns segundos
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'selection':
        return renderSelectionStep();
      case 'preview':
        return renderPreviewStep();
      case 'processing':
        return renderProcessingStep();
      default:
        return renderSelectionStep();
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        {renderCurrentStep()}
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
  stepContainer: {
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
  captureOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  optionCard: {
    flex: 1,
    elevation: 2,
  },
  optionContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionTitle: {
    marginTop: 8,
    marginBottom: 4,
  },
  optionDescription: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
  },
  tipsCard: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  tipsTitle: {
    marginBottom: 12,
    color: theme.colors.onSurfaceVariant,
  },
  tipItem: {
    marginBottom: 4,
    color: theme.colors.onSurfaceVariant,
  },
  previewCard: {
    marginBottom: 16,
    elevation: 2,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  imageInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  progressText: {
    marginTop: 16,
    color: theme.colors.onSurfaceVariant,
  },
});

export default ImageCaptureModal;