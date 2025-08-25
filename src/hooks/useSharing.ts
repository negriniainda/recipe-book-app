import {useState, useCallback, useMemo} from 'react';
import {Alert, Share, Linking} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  useCreateShareLinkMutation,
  useShareContentMutation,
  useGenerateShareImageMutation,
  useExportToPDFMutation,
  useGetShareTemplatesQuery,
  useGetSharePreferencesQuery,
  useGetSocialIntegrationsQuery,
} from '../services/sharingApi';
import {
  SharePlatform,
  ShareContentType,
  ShareFormat,
  ShareableContent,
  ShareTemplate,
  ShareModalState,
  ShareButtonConfig,
  ShareResult,
} from '../types/sharing';

export interface UseSharingOptions {
  userId: string;
  content: ShareableContent;
}

const PLATFORM_CONFIGS: Record<SharePlatform, ShareButtonConfig> = {
  whatsapp: {
    platform: 'whatsapp',
    label: 'WhatsApp',
    icon: 'logo-whatsapp',
    color: '#25D366',
    backgroundColor: '#25D366',
    isEnabled: true,
    requiresAuth: false,
    supportedFormats: ['text', 'image', 'link'],
  },
  instagram: {
    platform: 'instagram',
    label: 'Instagram',
    icon: 'logo-instagram',
    color: '#E4405F',
    backgroundColor: '#E4405F',
    isEnabled: true,
    requiresAuth: true,
    supportedFormats: ['image', 'story'],
  },
  facebook: {
    platform: 'facebook',
    label: 'Facebook',
    icon: 'logo-facebook',
    color: '#1877F2',
    backgroundColor: '#1877F2',
    isEnabled: true,
    requiresAuth: true,
    supportedFormats: ['text', 'image', 'link', 'post'],
  },
  twitter: {
    platform: 'twitter',
    label: 'Twitter',
    icon: 'logo-twitter',
    color: '#1DA1F2',
    backgroundColor: '#1DA1F2',
    isEnabled: true,
    requiresAuth: true,
    supportedFormats: ['text', 'image', 'link'],
  },
  telegram: {
    platform: 'telegram',
    label: 'Telegram',
    icon: 'paper-plane',
    color: '#0088CC',
    backgroundColor: '#0088CC',
    isEnabled: true,
    requiresAuth: false,
    supportedFormats: ['text', 'image', 'link'],
  },
  email: {
    platform: 'email',
    label: 'Email',
    icon: 'mail',
    color: '#34495E',
    backgroundColor: '#34495E',
    isEnabled: true,
    requiresAuth: false,
    supportedFormats: ['text', 'link', 'pdf'],
  },
  sms: {
    platform: 'sms',
    label: 'SMS',
    icon: 'chatbubble',
    color: '#2ECC71',
    backgroundColor: '#2ECC71',
    isEnabled: true,
    requiresAuth: false,
    supportedFormats: ['text', 'link'],
  },
  'copy-link': {
    platform: 'copy-link',
    label: 'Copiar Link',
    icon: 'copy',
    color: '#95A5A6',
    backgroundColor: '#95A5A6',
    isEnabled: true,
    requiresAuth: false,
    supportedFormats: ['link'],
  },
  more: {
    platform: 'more',
    label: 'Mais',
    icon: 'ellipsis-horizontal',
    color: '#7F8C8D',
    backgroundColor: '#7F8C8D',
    isEnabled: true,
    requiresAuth: false,
    supportedFormats: ['text', 'image', 'link', 'pdf'],
  },
};

export const useSharing = ({userId, content}: UseSharingOptions) => {
  const [modalState, setModalState] = useState<ShareModalState>({
    isVisible: false,
    content: null,
    selectedPlatforms: [],
    selectedFormat: 'link',
    customMessage: '',
    isGeneratingImage: false,
    isGeneratingPDF: false,
    isCreatingLink: false,
  });

  // API hooks
  const {data: templates = []} = useGetShareTemplatesQuery({
    contentType: content.type,
  });

  const {data: preferences} = useGetSharePreferencesQuery(userId);

  const {data: socialIntegrations = []} = useGetSocialIntegrationsQuery(userId);

  // Mutations
  const [createShareLink] = useCreateShareLinkMutation();
  const [shareContent] = useShareContentMutation();
  const [generateShareImage] = useGenerateShareImageMutation();
  const [exportToPDF] = useExportToPDFMutation();

  // Computed values
  const availablePlatforms = useMemo(() => {
    return Object.values(PLATFORM_CONFIGS).filter(config => {
      if (!config.isEnabled) return false;
      
      // Check if platform requires auth and is connected
      if (config.requiresAuth) {
        const integration = socialIntegrations.find(
          int => int.platform === config.platform && int.isConnected
        );
        return !!integration;
      }
      
      return true;
    });
  }, [socialIntegrations]);

  const defaultTemplate = useMemo(() => {
    return templates.find(t => t.isDefault && t.contentType === content.type);
  }, [templates, content.type]);

  // Actions
  const openShareModal = useCallback((shareContent: ShareableContent) => {
    setModalState({
      isVisible: true,
      content: shareContent,
      selectedPlatforms: preferences?.defaultPlatforms || ['whatsapp', 'copy-link'],
      selectedFormat: preferences?.defaultFormat || 'link',
      customMessage: '',
      isGeneratingImage: false,
      isGeneratingPDF: false,
      isCreatingLink: false,
    });
  }, [preferences]);

  const closeShareModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isVisible: false,
      content: null,
      generatedImageUrl: undefined,
      generatedPDFUrl: undefined,
      shareLink: undefined,
    }));
  }, []);

  const createLink = useCallback(async () => {
    if (!content) return null;

    setModalState(prev => ({...prev, isCreatingLink: true}));

    try {
      const result = await createShareLink({
        userId,
        contentId: content.id,
        contentType: content.type,
        expirationDays: preferences?.linkExpirationDays || 30,
        isPublic: preferences?.allowPublicSharing || false,
      }).unwrap();

      setModalState(prev => ({...prev, shareLink: result}));
      return result;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o link de compartilhamento');
      throw error;
    } finally {
      setModalState(prev => ({...prev, isCreatingLink: false}));
    }
  }, [content, userId, preferences, createShareLink]);

  const generateImage = useCallback(async (templateId?: string) => {
    if (!content) return null;

    setModalState(prev => ({...prev, isGeneratingImage: true}));

    try {
      const result = await generateShareImage({
        contentId: content.id,
        contentType: content.type,
        templateId: templateId || defaultTemplate?.id || '',
      }).unwrap();

      setModalState(prev => ({...prev, generatedImageUrl: result.imageUrl}));
      return result;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar a imagem');
      throw error;
    } finally {
      setModalState(prev => ({...prev, isGeneratingImage: false}));
    }
  }, [content, defaultTemplate, generateShareImage]);

  const generatePDF = useCallback(async () => {
    if (!content) return null;

    setModalState(prev => ({...prev, isGeneratingPDF: true}));

    try {
      const result = await exportToPDF({
        contentId: content.id,
        contentType: content.type,
        includeImages: true,
        includeNutrition: true,
        includeNotes: false,
        format: 'standard',
        language: 'pt-BR',
      }).unwrap();

      setModalState(prev => ({...prev, generatedPDFUrl: result.pdfUrl}));
      return result;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF');
      throw error;
    } finally {
      setModalState(prev => ({...prev, isGeneratingPDF: false}));
    }
  }, [content, exportToPDF]);

  const shareToWhatsApp = useCallback(async (message: string, imageUrl?: string) => {
    try {
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        return {success: true, platform: 'whatsapp' as SharePlatform, format: 'text' as ShareFormat};
      } else {
        throw new Error('WhatsApp não está instalado');
      }
    } catch (error) {
      return {
        success: false,
        platform: 'whatsapp' as SharePlatform,
        format: 'text' as ShareFormat,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }, []);

  const shareToTelegram = useCallback(async (message: string) => {
    try {
      const telegramUrl = `tg://msg?text=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(telegramUrl);
      if (canOpen) {
        await Linking.openURL(telegramUrl);
        return {success: true, platform: 'telegram' as SharePlatform, format: 'text' as ShareFormat};
      } else {
        // Fallback to web version
        const webUrl = `https://t.me/share/url?url=${encodeURIComponent(message)}`;
        await Linking.openURL(webUrl);
        return {success: true, platform: 'telegram' as SharePlatform, format: 'text' as ShareFormat};
      }
    } catch (error) {
      return {
        success: false,
        platform: 'telegram' as SharePlatform,
        format: 'text' as ShareFormat,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }, []);

  const shareViaEmail = useCallback(async (subject: string, body: string, attachmentUrl?: string) => {
    try {
      let emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      await Linking.openURL(emailUrl);
      return {success: true, platform: 'email' as SharePlatform, format: 'text' as ShareFormat};
    } catch (error) {
      return {
        success: false,
        platform: 'email' as SharePlatform,
        format: 'text' as ShareFormat,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }, []);

  const shareViaSMS = useCallback(async (message: string) => {
    try {
      const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
      
      await Linking.openURL(smsUrl);
      return {success: true, platform: 'sms' as SharePlatform, format: 'text' as ShareFormat};
    } catch (error) {
      return {
        success: false,
        platform: 'sms' as SharePlatform,
        format: 'text' as ShareFormat,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Sucesso', 'Link copiado para a área de transferência');
      return {success: true, platform: 'copy-link' as SharePlatform, format: 'link' as ShareFormat};
    } catch (error) {
      return {
        success: false,
        platform: 'copy-link' as SharePlatform,
        format: 'link' as ShareFormat,
        errorMessage: 'Não foi possível copiar o link',
      };
    }
  }, []);

  const shareViaSystemShare = useCallback(async (message: string, url?: string, imageUrl?: string) => {
    try {
      const shareOptions: any = {
        message,
      };

      if (url) {
        shareOptions.url = url;
      }

      // For images, we need to download and share the file
      if (imageUrl) {
        const fileUri = FileSystem.documentDirectory + 'share_image.jpg';
        const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
        
        if (downloadResult.status === 200) {
          shareOptions.url = downloadResult.uri;
        }
      }

      const result = await Share.share(shareOptions);
      
      return {
        success: result.action === Share.sharedAction,
        platform: 'more' as SharePlatform,
        format: imageUrl ? 'image' as ShareFormat : 'text' as ShareFormat,
      };
    } catch (error) {
      return {
        success: false,
        platform: 'more' as SharePlatform,
        format: 'text' as ShareFormat,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }, []);

  const shareToPlatform = useCallback(async (
    platform: SharePlatform,
    format: ShareFormat,
    customMessage?: string
  ): Promise<ShareResult> => {
    if (!content) {
      return {
        success: false,
        platform,
        format,
        errorMessage: 'Conteúdo não encontrado',
      };
    }

    // Create share link if needed
    let shareLink = modalState.shareLink;
    if (!shareLink && (format === 'link' || platform === 'copy-link')) {
      shareLink = await createLink();
    }

    // Generate image if needed
    let imageUrl = modalState.generatedImageUrl;
    if (!imageUrl && format === 'image') {
      const imageResult = await generateImage();
      imageUrl = imageResult?.imageUrl;
    }

    // Generate PDF if needed
    let pdfUrl = modalState.generatedPDFUrl;
    if (!pdfUrl && format === 'pdf') {
      const pdfResult = await generatePDF();
      pdfUrl = pdfResult?.pdfUrl;
    }

    // Prepare message
    const message = customMessage || 
      `Confira esta receita: ${content.title}\n${shareLink?.shortUrl || content.url || ''}`;

    // Share based on platform
    switch (platform) {
      case 'whatsapp':
        return shareToWhatsApp(message, imageUrl);
      
      case 'telegram':
        return shareToTelegram(message);
      
      case 'email':
        return shareViaEmail(
          `Receita: ${content.title}`,
          message,
          pdfUrl || imageUrl
        );
      
      case 'sms':
        return shareViaSMS(message);
      
      case 'copy-link':
        return copyToClipboard(shareLink?.shortUrl || content.url || message);
      
      case 'more':
        return shareViaSystemShare(message, shareLink?.shortUrl, imageUrl);
      
      default:
        // For social platforms that require API integration
        try {
          const result = await shareContent({
            contentId: content.id,
            contentType: content.type,
            platform,
            format,
            customMessage,
          }).unwrap();
          
          return {
            success: result.success,
            platform,
            format,
            shareId: result.shareId,
          };
        } catch (error) {
          return {
            success: false,
            platform,
            format,
            errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
          };
        }
    }
  }, [
    content,
    modalState,
    createLink,
    generateImage,
    generatePDF,
    shareToWhatsApp,
    shareToTelegram,
    shareViaEmail,
    shareViaSMS,
    copyToClipboard,
    shareViaSystemShare,
    shareContent,
  ]);

  const quickShare = useCallback(async (platform: SharePlatform) => {
    const config = PLATFORM_CONFIGS[platform];
    const defaultFormat = config.supportedFormats[0];
    
    return shareToPlatform(platform, defaultFormat);
  }, [shareToPlatform]);

  const bulkShare = useCallback(async (platforms: SharePlatform[]) => {
    const results: ShareResult[] = [];
    
    for (const platform of platforms) {
      const result = await quickShare(platform);
      results.push(result);
    }
    
    return results;
  }, [quickShare]);

  return {
    // State
    modalState,
    setModalState,
    
    // Data
    availablePlatforms,
    templates,
    preferences,
    socialIntegrations,
    platformConfigs: PLATFORM_CONFIGS,
    
    // Actions
    openShareModal,
    closeShareModal,
    createLink,
    generateImage,
    generatePDF,
    shareToPlatform,
    quickShare,
    bulkShare,
    
    // Platform-specific actions
    shareToWhatsApp,
    shareToTelegram,
    shareViaEmail,
    shareViaSMS,
    copyToClipboard,
    shareViaSystemShare,
  };
};