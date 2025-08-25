import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Modal,
  Portal,
  Appbar,
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { useCommunityPost } from '../../hooks/useCommunity';
import { CreatePostRequest } from '../../types/community';

interface CreatePostModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
  recipeId?: string; // Se fornecido, usa esta receita específica
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
  recipeId,
}) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipeId || '');
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showRecipeSelector, setShowRecipeSelector] = useState(!recipeId);

  const { createPost, isCreating } = useCommunityPost();

  const handleSelectImages = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 5,
      },
      (response) => {
        if (response.assets) {
          const newImages = response.assets
            .map(asset => asset.uri)
            .filter(Boolean) as string[];
          setImages(prev => [...prev, ...newImages].slice(0, 5));
        }
      }
    );
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedRecipeId) {
      Alert.alert('Erro', 'Selecione uma receita para compartilhar');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma imagem');
      return;
    }

    const postData: CreatePostRequest = {
      recipeId: selectedRecipeId,
      caption: caption.trim() || undefined,
      images,
    };

    const result = await createPost(postData);

    if (result.success) {
      // Limpar formulário
      setCaption('');
      setImages([]);
      setSelectedRecipeId(recipeId || '');
      onSuccess();
    } else {
      Alert.alert('Erro', result.error);
    }
  }, [selectedRecipeId, caption, images, createPost, onSuccess, recipeId]);

  const handleCancel = useCallback(() => {
    if (caption || images.length > 0) {
      Alert.alert(
        'Descartar Post',
        'Tem certeza que deseja descartar este post?',
        [
          { text: 'Continuar Editando', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              setCaption('');
              setImages([]);
              setSelectedRecipeId(recipeId || '');
              onDismiss();
            },
          },
        ]
      );
    } else {
      onDismiss();
    }
  }, [caption, images, onDismiss, recipeId]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCancel}
        contentContainerStyle={styles.modal}
      >
        <Appbar.Header>
          <Appbar.Action icon="close" onPress={handleCancel} />
          <Appbar.Content title="Novo Post" />
          <Appbar.Action
            icon="check"
            onPress={handleSubmit}
            disabled={isCreating || !selectedRecipeId || images.length === 0}
          />
        </Appbar.Header>

        <ScrollView style={styles.content}>
          {/* Seletor de Receita */}
          {showRecipeSelector && (
            <Card style={styles.section}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Selecionar Receita</Text>
                <Text style={styles.sectionDescription}>
                  Escolha uma receita para compartilhar com a comunidade
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => {
                    // Navegar para seletor de receitas
                    // Por enquanto, usar uma receita mock
                    setSelectedRecipeId('mock-recipe-id');
                    setShowRecipeSelector(false);
                  }}
                  style={styles.selectButton}
                >
                  {selectedRecipeId ? 'Receita Selecionada' : 'Escolher Receita'}
                </Button>
              </Card.Content>
            </Card>
          )}

          {/* Caption */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Descrição</Text>
              <TextInput
                mode="outlined"
                placeholder="Conte sobre sua experiência com esta receita..."
                value={caption}
                onChangeText={setCaption}
                multiline
                numberOfLines={4}
                style={styles.captionInput}
              />
              <Text style={styles.characterCount}>
                {caption.length}/500
              </Text>
            </Card.Content>
          </Card>

          {/* Imagens */}
          <Card style={styles.section}>
            <Card.Content>
              <View style={styles.imagesHeader}>
                <Text style={styles.sectionTitle}>Fotos</Text>
                <Chip
                  icon="camera"
                  onPress={handleSelectImages}
                  style={styles.addImageChip}
                >
                  Adicionar
                </Chip>
              </View>
              <Text style={styles.sectionDescription}>
                Adicione até 5 fotos do seu prato
              </Text>

              {images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imagesScroll}
                >
                  {images.map((image, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image
                        source={{ uri: image }}
                        style={styles.selectedImage}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Text style={styles.removeImageText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              {images.length === 0 && (
                <TouchableOpacity
                  style={styles.emptyImageContainer}
                  onPress={handleSelectImages}
                >
                  <Text style={styles.emptyImageText}>
                    Toque para adicionar fotos
                  </Text>
                </TouchableOpacity>
              )}
            </Card.Content>
          </Card>

          {/* Dicas */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Dicas para um bom post</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tip}>
                  • Use fotos bem iluminadas e de boa qualidade
                </Text>
                <Text style={styles.tip}>
                  • Conte sua experiência ao fazer a receita
                </Text>
                <Text style={styles.tip}>
                  • Mencione adaptações que você fez
                </Text>
                <Text style={styles.tip}>
                  • Seja respeitoso com outros usuários
                </Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Loading Overlay */}
        {isCreating && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2196f3" />
            <Text style={styles.loadingText}>Publicando...</Text>
          </View>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  selectButton: {
    marginTop: 8,
  },
  captionInput: {
    backgroundColor: '#fff',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  imagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addImageChip: {
    backgroundColor: '#e3f2fd',
  },
  imagesScroll: {
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyImageContainer: {
    height: 120,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  emptyImageText: {
    fontSize: 14,
    color: '#666',
  },
  tipsList: {
    marginTop: 8,
  },
  tip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
});

export default CreatePostModal;