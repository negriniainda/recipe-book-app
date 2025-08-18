import React from 'react';
import {StyleSheet, ViewStyle} from 'react-native';
import {Card as PaperCard} from 'react-native-paper';
import {theme} from '@/utils/theme';

interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  style,
  children,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.roundness,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outline || '#e0e0e0',
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceVariant || '#f5f5f5',
        };
      default:
        return baseStyle;
    }
  };

  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return {};
      case 'small':
        return {padding: 8};
      case 'large':
        return {padding: 24};
      default:
        return {padding: 16};
    }
  };

  const cardStyle: ViewStyle = {
    ...getCardStyle(),
    ...getPaddingStyle(),
    ...style,
  };

  return <PaperCard style={cardStyle}>{children}</PaperCard>;
};

// Subcomponentes para facilitar o uso
const CardContent: React.FC<{children: React.ReactNode; style?: ViewStyle}> = ({
  children,
  style,
}) => <PaperCard.Content style={style}>{children}</PaperCard.Content>;

const CardActions: React.FC<{children: React.ReactNode; style?: ViewStyle}> = ({
  children,
  style,
}) => <PaperCard.Actions style={style}>{children}</PaperCard.Actions>;

const CardTitle: React.FC<any> = props => <PaperCard.Title {...props} />;

const CardCover: React.FC<any> = props => <PaperCard.Cover {...props} />;

// Extend Card component with subcomponents
const ExtendedCard = Card as typeof Card & {
  Content: typeof CardContent;
  Actions: typeof CardActions;
  Title: typeof CardTitle;
  Cover: typeof CardCover;
};

ExtendedCard.Content = CardContent;
ExtendedCard.Actions = CardActions;
ExtendedCard.Title = CardTitle;
ExtendedCard.Cover = CardCover;

export default ExtendedCard;
