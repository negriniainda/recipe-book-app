import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button, Card} from 'react-native-paper';
import {theme} from '@/utils/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  subtitle?: string;
  buttonText?: string;
  buttonIcon?: string;
  onButtonPress?: () => void;
  secondaryButtonText?: string;
  secondaryButtonIcon?: string;
  onSecondaryButtonPress?: () => void;
  style?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  subtitle,
  buttonText,
  buttonIcon,
  onButtonPress,
  secondaryButtonText,
  secondaryButtonIcon,
  onSecondaryButtonPress,
  style,
}) => {
  return (
    <Card style={[styles.card, style]}>
      <Card.Content style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          {title}
        </Text>
        {description && (
          <Text variant="bodyMedium" style={styles.description}>
            {description}
          </Text>
        )}
        {subtitle && (
          <Text variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
        {(buttonText || secondaryButtonText) && (
          <View style={styles.actions}>
            {buttonText && (
              <Button
                mode="contained"
                icon={buttonIcon}
                style={styles.button}
                onPress={onButtonPress}>
                {buttonText}
              </Button>
            )}
            {secondaryButtonText && (
              <Button
                mode="outlined"
                icon={secondaryButtonIcon}
                style={styles.button}
                onPress={onSecondaryButtonPress}>
                {secondaryButtonText}
              </Button>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    minWidth: 120,
  },
});

export default EmptyState;