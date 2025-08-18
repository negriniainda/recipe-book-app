import React from 'react';
import {StyleSheet, ViewStyle, Dimensions} from 'react-native';
import {
  Modal as PaperModal,
  Portal,
  Text,
  IconButton,
} from 'react-native-paper';
import {theme} from '@/utils/theme';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  dismissable?: boolean;
  showCloseButton?: boolean;
  contentContainerStyle?: ViewStyle;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onDismiss,
  title,
  children,
  size = 'medium',
  dismissable = true,
  showCloseButton = true,
  contentContainerStyle,
}) => {
  const getModalSize = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          width: Math.min(screenWidth * 0.8, 400),
          maxHeight: screenHeight * 0.6,
        };
      case 'large':
        return {
          width: Math.min(screenWidth * 0.95, 600),
          maxHeight: screenHeight * 0.9,
        };
      case 'fullscreen':
        return {
          width: screenWidth,
          height: screenHeight,
          margin: 0,
          borderRadius: 0,
        };
      default: // medium
        return {
          width: Math.min(screenWidth * 0.9, 500),
          maxHeight: screenHeight * 0.8,
        };
    }
  };

  const modalStyle: ViewStyle = {
    ...styles.modal,
    ...getModalSize(),
    ...contentContainerStyle,
  };

  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={dismissable ? onDismiss : undefined}
        contentContainerStyle={modalStyle}>
        {(title || showCloseButton) && (
          <div style={styles.header}>
            {title && (
              <Text variant="headlineSmall" style={styles.title}>
                {title}
              </Text>
            )}
            {showCloseButton && (
              <IconButton
                icon="close"
                size={24}
                onPress={onDismiss}
                style={styles.closeButton}
              />
            )}
          </div>
        )}
        <div style={styles.content}>{children}</div>
      </PaperModal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    margin: 20,
    maxWidth: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline || '#e0e0e0',
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 0,
  },
  content: {
    padding: 24,
    flex: 1,
  },
});

export default Modal;
