import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {SharePlatform, ShareFormat, ShareableContent} from '../../types/sharing';
import {useSharing} from '../../hooks/useSharing';
import {colors, typography, spacing} from '../../theme';

interface ShareModalProps {
  visible: boolean;
  content: ShareableContent;
  userId: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  content,
  userId,
  onClose,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ShareFormat>('link');
  const [customMessage, setCustomMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const {
    availablePlatforms,
    modalState,
    createLink,
    generateImage,
    generatePDF,
    shareToPlatform,
    platformConfigs,
  } = useSharing({userId, content});

  const handleShare = async (platform: SharePlatform) => {
    setIsSharing(true);
    try {
      const result = await shareToPlatform(platform, selectedFormat, customMessage);
      
      if (result.success) {
        // Show success feedback
        onClose();
      } else {
        // Show error
        console.error('Share failed:', result.errorMessage);
      }
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleFormatChange = (format: ShareFormat) => {
    setSelectedFormat(format);
    
    // Pre-generate content based on format
    switch (format) {
      case 'link':
        if (!modalState.shareLink) {
          createLink();
        }
        break;
      case 'image':
        if (!modalState.generatedImageUrl) {
          generateImage();
        }
        break;
      case 'pdf':
        if (!modalState.generatedPDFUrl) {
          generatePDF();
        }
        break;
    }
  };

  const getFormatIcon = (format: ShareFormat) => {
    switch (format) {
      case 'text':
        return 'text';
      case 'image':
        return 'image';
      case 'pdf':
        return 'document';
      case 'link':
        return 'link';
      default:
        return 'share';
    }
  };

  const renderFormatSelector = () => {
    const formats: ShareFormat[] = ['link', 'text', 'image', 'pdf'];
    
    return (
      <View style={styles.formatSelector}>
        <Text style={styles.sectionTitle}>Formato</Text>
        <View style={styles.formatOptions}>
          {formats.map(format => (
            <TouchableOpacity
              key={format}
              style={[
                styles.formatOption,
                selectedFormat === format && styles.selectedFormatOption,
              ]}
              onPress={() => handleFormatChange(format)}
            >
              <Ionicons
                name={getFormatIcon(format) as any}
                size={20}
                color={selectedFormat === format ? colors.white : colors.gray[600]}
              />
              <Text
                style={[
                  styles.formatOptionText,
                  selectedFormat === format && styles.selectedFormatOptionText,
                ]}
              >
                {format.charAt(0).toUpperCase() + format.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderContentPreview = () => {
    return (
      <View style={styles.contentPreview}>
        <Text style={styles.sectionTitle}>Prévia</Text>
        <View style={styles.previewCard}>
          {content.imageUrl && (
            <Image source={{uri: content.imageUrl}} style={styles.previewImage} />
          )}
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle} numberOfLines={2}>
              {content.title}
            </Text>
            {content.description && (
              <Text style={styles.previewDescription} numberOfLines={3}>
                {content.description}
              </Text>
            )}
          </View>
        </View>

        {/* Show generated content based on format */}
        {selectedFormat === 'link' && modalState.shareLink && (
          <View style={styles.generatedContent}>
            <Text style={styles.generatedLabel}>Link gerado:</Text>
            <Text style={styles.generatedLink}>{modalState.shareLink.shortUrl}</Text>
          </View>
        )}

        {selectedFormat === 'image' && modalState.generatedImageUrl && (
          <View style={styles.generatedContent}>
            <Text style={styles.generatedLabel}>Imagem gerada:</Text>
            <Image
              source={{uri: modalState.generatedImageUrl}}
              style={styles.generatedImage}
            />
          </View>
        )}

        {selectedFormat === 'pdf' && modalState.generatedPDFUrl && (
          <View style={styles.generatedContent}>
            <Text style={styles.generatedLabel}>PDF gerado:</Text>
            <View style={styles.pdfIndicator}>
              <Ionicons name="document" size={24} color={colors.primary[600]} />
              <Text style={styles.pdfText}>Receita.pdf</Text>
            </View>
          </View>
        )}

        {/* Loading indicators */}
        {modalState.isCreatingLink && selectedFormat === 'link' && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Gerando link...</Text>
          </View>
        )}

        {modalState.isGeneratingImage && selectedFormat === 'image' && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Gerando imagem...</Text>
          </View>
        )}

        {modalState.isGeneratingPDF && selectedFormat === 'pdf' && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Gerando PDF...</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCustomMessage = () => {
    return (
      <View style={styles.messageSection}>
        <Text style={styles.sectionTitle}>Mensagem personalizada (opcional)</Text>
        <TextInput
          style={styles.messageInput}
          value={customMessage}
          onChangeText={setCustomMessage}
          placeholder="Adicione uma mensagem personalizada..."
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    );
  };

  const renderPlatformButtons = () => {
    return (
      <View style={styles.platformsSection}>
        <Text style={styles.sectionTitle}>Compartilhar em</Text>
        <View style={styles.platformGrid}>
          {availablePlatforms.map(platform => {
            const config = platformConfigs[platform.platform];
            const isSupported = config.supportedFormats.includes(selectedFormat);
            
            return (
              <TouchableOpacity
                key={platform.platform}
                style={[
                  styles.platformButton,
                  {backgroundColor: config.backgroundColor},
                  !isSupported && styles.disabledPlatformButton,
                ]}
                onPress={() => handleShare(platform.platform)}
                disabled={!isSupported || isSharing}
              >
                <Ionicons
                  name={config.icon as any}
                  size={24}
                  color={isSupported ? colors.white : colors.gray[400]}
                />
                <Text
                  style={[
                    styles.platformButtonText,
                    !isSupported && styles.disabledPlatformButtonText,
                  ]}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.gray[700]} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Compartilhar</Text>
          
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderFormatSelector()}
          {renderContentPreview()}
          {renderCustomMessage()}
          {renderPlatformButtons()}
        </ScrollView>

        {isSharing && (
          <View style={styles.sharingOverlay}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.sharingText}>Compartilhando...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    ...typography.title,
    color: colors.gray[900],
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  formatSelector: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  formatOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  formatOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    gap: spacing.xs,
  },
  selectedFormatOption: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  formatOptionText: {
    ...typography.caption,
    color: colors.gray[600],
    fontWeight: '500',
  },
  selectedFormatOptionText: {
    color: colors.white,
  },
  contentPreview: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  previewDescription: {
    ...typography.body,
    color: colors.gray[600],
    lineHeight: 20,
  },
  generatedContent: {
    backgroundColor: colors.blue[50],
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  generatedLabel: {
    ...typography.caption,
    color: colors.blue[700],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  generatedLink: {
    ...typography.body,
    color: colors.blue[600],
    fontFamily: 'monospace',
  },
  generatedImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  pdfIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pdfText: {
    ...typography.body,
    color: colors.primary[600],
    fontWeight: '500',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.body,
    color: colors.gray[600],
  },
  messageSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  messageInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 80,
    ...typography.body,
    color: colors.gray[900],
    textAlignVertical: 'top',
  },
  platformsSection: {
    padding: spacing.lg,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  platformButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  disabledPlatformButton: {
    backgroundColor: colors.gray[200],
  },
  platformButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledPlatformButtonText: {
    color: colors.gray[400],
  },
  sharingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  sharingText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '500',
  },
});