import React, {useState, useCallback} from 'react';
import {View, StyleSheet, Image, Alert, ScrollView} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Button,
  Menu,
  ActivityIndicator,
} from 'react-native-paper';
import {launchImageLibrary, launchCamera, ImagePickerResponse, MediaType} from 'react-native-image-picker';
import {theme} from '@/utils/theme';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  style?: any;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  style,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImagePicker = useCallback((type: 'camera' | 'gallery') => {
    setMenuVisible(false);
    
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as any,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    const callback = (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          // Simular upload (em produção, fazer upload real para servidor)
          setUploading(true);
          setTimeout(() => {
            onImagesChange([...images, asset.uri!]);
            setUploading(false);
          }, 1500);
        }
      }
    };

    if (type === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  }, [images, onImagesChange]);

  const removeImage = useCallback((index: number) => {
    Alert.alert(
      'Remover Imagem',
      'Tem certeza que deseja remover esta imagem?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const updatedImages = images.filter((_, i) => i !== index);
            onImagesChange(updatedImages);
          },
        },
      ]
    );
  }, [images, onImagesChange]);

  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const [movedItem] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedItem);
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  const canAddMore = images.length < maxImages;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          Fotos da Receita
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          {images.length}/{maxImages} imagens
        </Text>
      </View>

      {/* Botão para adicionar imagem */}
      {canAddMore && (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Card style={styles.addCard} onPress={() => setMenuVisible(true)}>
              <Card.Content style={styles.addContent}>
                {uploading ? (
                  <>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text variant="bodyMedium" style={styles.uploadingText}>
                      Enviando imagem...
                    </Text>
                  </>
                ) : (
                  <>
                    <IconButton
                      icon="camera-plus"
                      size={48}
                      iconColor={theme.colors.primary}
                    />
                    <Text variant="bodyMedium" style={styles.addText}>
                      Adicionar Foto
                    </Text>
                    <Text variant="bodySmall" style={styles.addSubtext}>
                      Toque para escolher uma opção
                    </Text>
                  </>
                )}
              </Card.Content>
            </Card>
          }>
          <Menu.Item
            onPress={() => handleImagePicker('camera')}
            title="Tirar Foto"
            leadingIcon="camera"
          />
          <Menu.Item
            onPress={() => handleImagePicker('gallery')}
            title="Escolher da Galeria"
            leadingIcon="image"
          />
        </Menu>
      )}

      {/* Lista de imagens */}
      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesList}
          contentContainerStyle={styles.imagesContainer}>
          {images.map((imageUri, index) => (
            <Card key={index} style={styles.imageCard}>
              <View style={styles.imageContainer}>
                <Image source={{uri: imageUri}} style={styles.image} />
                
                {/* Badge de posição */}
                <View style={styles.positionBadge}>
                  <Text variant="bodySmall" style={styles.positionText}>
                    {index + 1}
                  </Text>
                </View>

                {/* Ações da imagem */}
                <View style={styles.imageActions}>
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="white"
                    style={styles.actionButton}
                    onPress={() => removeImage(index)}
                  />
                  {index > 0 && (
                    <IconButton
                      icon="arrow-left"
                      size={20}
                      iconColor="white"
                      style={styles.actionButton}
                      onPress={() => moveImage(index, index - 1)}
                    />
                  )}
                  {index < images.length - 1 && (
                    <IconButton
                      icon="arrow-right"
                      size={20}
                      iconColor="white"
                      style={styles.actionButton}
                      onPress={() => moveImage(index, index + 1)}
                    />
                  )}
                </View>

                {/* Indicador de imagem principal */}
                {index === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text variant="bodySmall" style={styles.primaryText}>
                      Principal
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* Dicas */}
      <Card style={styles.tipsCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.tipsTitle}>
            💡 Dicas para boas fotos:
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • A primeira imagem será a foto principal da receita
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Use boa iluminação natural sempre que possível
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Mostre o prato finalizado e etapas importantes
          </Text>
          <Text variant="bodySmall" style={styles.tipText}>
            • Mantenha o fundo limpo e organizado
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  subtitle: {
    opacity: 0.7,
  },
  addCard: {
    marginBottom: 16,
    elevation: 2,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  addContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  addText: {
    fontWeight: '500',
    marginTop: 8,
  },
  addSubtext: {
    opacity: 0.7,
    marginTop: 4,
  },
  uploadingText: {
    marginTop: 16,
    opacity: 0.8,
  },
  imagesList: {
    marginBottom: 16,
  },
  imagesContainer: {
    paddingRight: 16,
  },
  imageCard: {
    marginRight: 12,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: theme.roundness,
  },
  positionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  imageActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    margin: 2,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  tipsCard: {
    backgroundColor: theme.colors.surface,
    elevation: 1,
  },
  tipsTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.primary,
  },
  tipText: {
    opacity: 0.8,
    marginBottom: 4,
    lineHeight: 16,
  },
});

export default ImageUpload;