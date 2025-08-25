import React, {useState} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {ShareModal} from './ShareModal';
import {ShareableContent} from '../../types/sharing';
import {colors, typography, spacing} from '../../theme';

interface ShareButtonProps {
  content: ShareableContent;
  userId: string;
  variant?: 'icon' | 'button' | 'fab';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  style?: any;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  content,
  userId,
  variant = 'icon',
  size = 'medium',
  color = colors.gray[600],
  backgroundColor = 'transparent',
  showLabel = false,
  style,
}) => {
  const [showModal, setShowModal] = useState(false);

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 28;
      default:
        return 20;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {width: 32, height: 32};
      case 'large':
        return {width: 56, height: 56};
      default:
        return {width: 40, height: 40};
    }
  };

  const renderIcon = () => (
    <TouchableOpacity
      style={[
        styles.iconButton,
        getButtonSize(),
        {backgroundColor},
        style,
      ]}
      onPress={() => setShowModal(true)}
    >
      <Ionicons name="share-outline" size={getIconSize()} color={color} />
    </TouchableOpacity>
  );

  const renderButton = () => (
    <TouchableOpacity
      style={[
        styles.button,
        {backgroundColor: backgroundColor || colors.primary[500]},
        style,
      ]}
      onPress={() => setShowModal(true)}
    >
      <Ionicons
        name="share-outline"
        size={getIconSize()}
        color={color || colors.white}
      />
      {showLabel && (
        <Text style={[styles.buttonText, {color: color || colors.white}]}>
          Compartilhar
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderFAB = () => (
    <TouchableOpacity
      style={[
        styles.fab,
        {backgroundColor: backgroundColor || colors.primary[500]},
        style,
      ]}
      onPress={() => setShowModal(true)}
    >
      <Ionicons
        name="share"
        size={getIconSize()}
        color={color || colors.white}
      />
    </TouchableOpacity>
  );

  const renderButton_variant = () => {
    switch (variant) {
      case 'button':
        return renderButton();
      case 'fab':
        return renderFAB();
      default:
        return renderIcon();
    }
  };

  return (
    <View>
      {renderButton_variant()}
      
      <ShareModal
        visible={showModal}
        content={content}
        userId={userId}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  buttonText: {
    ...typography.button,
    fontWeight: '500',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});