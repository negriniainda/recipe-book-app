import React, {useState} from 'react';
import {StyleSheet, ViewStyle} from 'react-native';
import {TextInput, TextInputProps, Text, HelperText} from 'react-native-paper';
import {theme} from '@/utils/theme';

interface InputProps {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: (e: any) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required = false,
  style,
  containerStyle,
  onChangeText,
  onBlur,
  value,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  disabled,
  multiline,
  numberOfLines,
  left,
  right,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const displayLabel = required ? `${label} *` : label;
  const hasError = !!error;

  return (
    <React.Fragment>
      <TextInput
        label={displayLabel}
        value={value}
        error={hasError}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        disabled={disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        left={left}
        right={right}
        style={[styles.input, style]}
        theme={{
          colors: {
            primary: isFocused ? theme.colors.primary : theme.colors.onSurface,
            error: theme.colors.error || '#d32f2f',
          },
        }}
      />
      {(error || helperText) && (
        <HelperText
          type={hasError ? 'error' : 'info'}
          visible={!!(error || helperText)}>
          {error || helperText}
        </HelperText>
      )}
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
});

export default Input;
