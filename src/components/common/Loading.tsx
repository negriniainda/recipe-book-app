import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {theme} from '@/utils/theme';

interface LoadingProps {
  size?: 'small' | 'large';
  text?: string;
  style?: any;
  color?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  text,
  style,
  color = theme.colors.primary,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text variant="bodyMedium" style={styles.text}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  text: {
    marginTop: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default Loading;