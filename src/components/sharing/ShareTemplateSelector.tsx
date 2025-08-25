import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ShareTemplate, SharePlatform, ShareContentType} from '../../types/sharing';
import {colors, typography, spacing} from '../../theme';

interface ShareTemplateSelectorProps {
  templates: ShareTemplate[];
  selectedTemplate?: ShareTemplate;
  platform?: SharePlatform;
  contentType: ShareContentType;
  onSelectTemplate: (template: ShareTemplate) => void;
  onCreateCustomTemplate?: () => void;
}

export const ShareTemplateSelector: React.FC<ShareTemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  platform,
  contentType,
  onSelectTemplate,
  onCreateCustomTemplate,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ShareTemplate | null>(null);

  const filteredTemplates = templates.filter(template => {
    if (platform && template.platform !== platform) return false;
    if (template.contentType !== contentType) return false;
    return true;
  });

  const handlePreview = (template: ShareTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const getLayoutIcon = (layout: string) => {
    switch (layout) {
      case 'card':
        return 'card';
      case 'story':
        return 'phone-portrait';
      case 'post':
        return 'square';
      case 'minimal':
        return 'remove';
      default:
        return 'image';
    }
  };

  const renderTemplate = (template: ShareTemplate) => {
    const isSelected = selectedTemplate?.id === template.id;
    
    return (
      <TouchableOpacity
        key={template.id}
        style={[
          styles.templateCard,
          isSelected && styles.selectedTemplateCard,
        ]}
        onPress={() => onSelectTemplate(template)}
      >
        <View style={styles.templatePreview}>
          <View
            style={[
              styles.templateMockup,
              {
                backgroundColor: template.template.backgroundColor,
                aspectRatio: template.dimensions.width / template.dimensions.height,
              },
            ]}
          >
            <Ionicons
              name={getLayoutIcon(template.template.layout) as any}
              size={24}
              color={template.template.textColor}
            />
          </View>
          
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => handlePreview(template)}
          >
            <Ionicons name="eye" size={16} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.templateInfo}>
          <Text style={styles.templateName} numberOfLines={1}>
            {template.name}
          </Text>
          
          <View style={styles.templateMeta}>
            <Text style={styles.templateDimensions}>
              {template.dimensions.width}x{template.dimensions.height}
            </Text>
            
            {template.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Padrão</Text>
              </View>
            )}
          </View>
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary[500]} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escolher Template</Text>
        
        {onCreateCustomTemplate && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={onCreateCustomTemplate}
          >
            <Ionicons name="add" size={16} color={colors.primary[600]} />
            <Text style={styles.createButtonText}>Criar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.templatesContainer}
      >
        {filteredTemplates.map(renderTemplate)}
      </ScrollView>

      {/* Template Preview Modal */}
      <Modal
        visible={showPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.previewModal}>
          <TouchableOpacity
            style={styles.previewOverlay}
            onPress={() => setShowPreview(false)}
          />
          
          {previewTemplate && (
            <View style={styles.previewContent}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>{previewTemplate.name}</Text>
                <TouchableOpacity onPress={() => setShowPreview(false)}>
                  <Ionicons name="close" size={24} color={colors.gray[700]} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.previewImageContainer}>
                <View
                  style={[
                    styles.previewMockup,
                    {
                      backgroundColor: previewTemplate.template.backgroundColor,
                      aspectRatio: previewTemplate.dimensions.width / previewTemplate.dimensions.height,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.mockupTitle,
                      {color: previewTemplate.template.textColor},
                    ]}
                  >
                    Título da Receita
                  </Text>
                  
                  {previewTemplate.template.showIngredients && (
                    <View style={styles.mockupSection}>
                      <Text
                        style={[
                          styles.mockupSectionTitle,
                          {color: previewTemplate.template.textColor},
                        ]}
                      >
                        Ingredientes
                      </Text>
                      <Text
                        style={[
                          styles.mockupText,
                          {color: previewTemplate.template.textColor},
                        ]}
                      >
                        • 2 xícaras de farinha{'\n'}• 1 xícara de açúcar{'\n'}• 3 ovos
                      </Text>
                    </View>
                  )}
                  
                  {previewTemplate.template.showCookTime && (
                    <View style={styles.mockupMeta}>
                      <Ionicons
                        name="time"
                        size={16}
                        color={previewTemplate.template.accentColor}
                      />
                      <Text
                        style={[
                          styles.mockupMetaText,
                          {color: previewTemplate.template.textColor},
                        ]}
                      >
                        30 min
                      </Text>
                    </View>
                  )}
                  
                  {previewTemplate.template.showQRCode && (
                    <View style={styles.mockupQR}>
                      <View style={styles.qrPlaceholder} />
                      <Text
                        style={[
                          styles.qrText,
                          {color: previewTemplate.template.textColor},
                        ]}
                      >
                        Escaneie para ver a receita
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={styles.useTemplateButton}
                  onPress={() => {
                    onSelectTemplate(previewTemplate);
                    setShowPreview(false);
                  }}
                >
                  <Text style={styles.useTemplateButtonText}>Usar Template</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  createButtonText: {
    ...typography.body,
    color: colors.primary[600],
    fontWeight: '500',
  },
  templatesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  templateCard: {
    width: 120,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  selectedTemplateCard: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  templatePreview: {
    position: 'relative',
  },
  templateMockup: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.sm,
    borderRadius: 8,
  },
  previewButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  templateInfo: {
    padding: spacing.sm,
  },
  templateName: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateDimensions: {
    ...typography.caption,
    color: colors.gray[500],
    fontSize: 10,
  },
  defaultBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    ...typography.caption,
    color: colors.primary[700],
    fontSize: 10,
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
  },
  previewModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  previewContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    margin: spacing.xl,
    maxWidth: 400,
    maxHeight: '80%',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  previewTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
  },
  previewImageContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  previewMockup: {
    width: 250,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  mockupTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  mockupSection: {
    width: '100%',
    marginBottom: spacing.md,
  },
  mockupSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  mockupText: {
    fontSize: 12,
    lineHeight: 16,
  },
  mockupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  mockupMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  mockupQR: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  qrPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
  },
  qrText: {
    fontSize: 10,
    textAlign: 'center',
  },
  previewActions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  useTemplateButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  useTemplateButtonText: {
    ...typography.button,
    color: colors.white,
  },
});