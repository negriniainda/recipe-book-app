import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  IconButton,
  Card,
  ProgressBar,
  Chip,
  Surface,
} from 'react-native-paper';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
  PhotoQuality,
} from 'react-native-image-picker';

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



interface ImageCaptureProps {
  onImageSelected: (imageBase64: string, imageUri: string) => void;
  onImageCleared: () => void;
  loading?: boolean;
  error?: string | null;
  style?: any;
}

interface CapturedImage {
  uri: string;
  base64: string;
  width: number;
  height: number;
  fileSize: number;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({
  onImageSelected,
  onImageCleared,
  loading = false,
  error,
  style,
}) => {
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageResponse = useCallback((response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    const asset = response.assets?.[0];
    if (!asset || !asset.base64) {
      Alert.alert('Erro', 'Não foi possível processar a imagem selecionada');
      return;
    }

    setIsProcessing(true);

    // Validar tamanho da imagem
    const fileSizeInMB = (asset.fileSize || 0) / (1024 * 1024);
    if (fileSizeInMB > 10) {
      Alert.alert(
        'Imagem muito grande',
        'Por favor, selecione uma imagem menor que 10MB',
        [{ text: 'OK' }]
      );
      setIsProcessing(false);
      return;
    }

    const imageData: CapturedImage = {
      uri: asset.uri || '',
      base64: asset.base64,
      width: asset.width || 0,
      height: asset.height || 0,
      fileSize: asset.fileSize || 0,
    };

    setCapturedImage(imageData);
    onImageSelected(asset.base64, asset.uri || '');
    setIsProcessing(false);
  }, [onImageSelected]);

  const openCamera = useCallback(() => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: true,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as PhotoQuality,
    };

    launchCamera(options, handleImageResponse);
  }, [handleImageResponse]);

  const openGallery = useCallback(() => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: true,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as PhotoQuality,
    };

    launchImageLibrary(options, handleImageResponse);
  }, [handleImageResponse]);

  const handleClearImage = useCallback(() => {
    setCapturedImage(null);
    onImageCleared();
  }, [onImageCleared]);

  const getImageSizeText = useCallback((fileSize: number): string => {
    const sizeInMB = fileSize / (1024 * 1024);
    if (sizeInMB < 1) {
      return `${(fileSize / 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  }, []);

  const getImageQualityIndicator = useCallback((image: CapturedImage) => {
    const megapixels = (image.width * image.height) / 1000000;
    const sizeInMB = image.fileSize / (1024 * 1024);

    if (megapixels >= 2 && sizeInMB >= 0.5) {
      return { color: '#4CAF50', text: 'Boa qualidade' };
    } else if (megapixels >= 1 && sizeInMB >= 0.2) {
      return { color: '#FF9800', text: 'Qualidade regular' };
    } else {
      return { color: '#F44336', text: 'Baixa qualidade' };
    }
  }, []);

  const renderImagePreview = () => {
    if (!capturedImage) return null;

    const quality = getImageQualityIndicator(capturedImage);

    return (
      <Card style={styles.imagePreviewCard}>
        <Card.Content>
          <View style={styles.imagePreviewHeader}>
            <Text variant="titleSmall" style={styles.previewTitle}>
              Imagem Selecionada
            </Text>
            <IconButton
              icon="close"
              size={20}
              onPress={handleClearImage}
              disabled={loading}
            />
          </View>

          <Image
            source={{ uri: capturedImage.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />

          <View style={styles.imageInfo}>
            <View style={styles.imageInfoRow}>
              <Chip
                mode="outlined"
                icon="image"
                style={styles.infoChip}>
                {capturedImage.width} × {capturedImage.height}
              </Chip>
              <Chip
                mode="outlined"
                icon="file"
                style={styles.infoChip}>
                {getImageSizeText(capturedImage.fileSize)}
              </Chip>
            </View>

            <Chip
              mode="flat"
              icon="check-circle"
              textStyle={{ color: quality.color }}
              style={[styles.qualityChip, { backgroundColor: quality.color + '20' }]}>
              {quality.text}
            </Chip>
          </View>

          {loading && (
            <View style={styles.processingContainer}>
              <ProgressBar indeterminate color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.processingText}>
                Processando imagem...
              </Text>
            </View>
          )}

          {error && (
            <Surface style={styles.errorContainer}>
              <Text variant="bodySmall" style={styles.errorText}>
                {error}
              </Text>
            </Surface>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderCaptureButton = () => (
    <Card style={styles.captureCard}>
      <Card.Content style={styles.captureContent}>
        <IconButton
          icon="camera"
          size={48}
          iconColor={theme.colors.primary}
          style={styles.captureIcon}
        />
        <Text variant="titleMedium" style={styles.captureTitle}>
          Adicionar Imagem da Receita
        </Text>
        <Text variant="bodyMedium" style={styles.captureDescription}>
          Tire uma foto ou selecione uma imagem da galeria para extrair o texto da receita
        </Text>

        <View style={styles.captureButtons}>
          <Button
            mode="contained"
            icon="camera"
            onPress={openCamera}
            disabled={isProcessing}
            style={styles.captureButton}>
            Câmera
          </Button>
          <Button
            mode="outlined"
            icon="image"
            onPress={openGallery}
            disabled={isProcessing}
            style={styles.captureButton}>
            Galeria
          </Button>
        </View>

        {isProcessing && (
          <View style={styles.processingContainer}>
            <ProgressBar indeterminate color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.processingText}>
              Carregando imagem...
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, style]}>
      {capturedImage ? renderImagePreview() : renderCaptureButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  captureCard: {
    elevation: 2,
  },
  captureContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  captureIcon: {
    backgroundColor: theme.colors.surfaceVariant,
    marginBottom: 16,
  },
  captureTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  captureDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  captureButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  captureButton: {
    minWidth: 100,
  },
  imagePreviewCard: {
    elevation: 2,
  },
  imagePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.roundness,
    marginBottom: 16,
    backgroundColor: theme.colors.surfaceVariant,
  },
  imageInfo: {
    alignItems: 'center',
  },
  imageInfoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  infoChip: {
    height: 28,
  },
  qualityChip: {
    height: 28,
  },
  processingContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 8,
    opacity: 0.7,
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: theme.roundness,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
  },
});

export default ImageCapture;